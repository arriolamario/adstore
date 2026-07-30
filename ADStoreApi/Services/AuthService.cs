using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ADStoreApi.Data;
using ADStoreApi.DTOs;
using ADStoreApi.Models;
using ADStoreApi.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace ADStoreApi.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly ADStoreDbContext _context;

        public AuthService(
            IUsuarioRepository usuarioRepository,
            IConfiguration configuration,
            IEmailService emailService,
            ADStoreDbContext context)
        {
            _usuarioRepository = usuarioRepository;
            _configuration = configuration;
            _emailService = emailService;
            _context = context;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            // Buscar usuario por email
            var usuario = await _usuarioRepository.GetByEmailAsync(loginDto.Email);

            if (usuario == null)
                return null;

            // Verificar contraseña
            var passwordHash = HashPassword(loginDto.Password);
            if (usuario.PasswordHash != passwordHash)
                return null;

            // Verificar si el usuario está activo
            if (!usuario.Activo)
                throw new InvalidOperationException("Usuario inactivo");

            // Generar token JWT
            var token = GenerateJwtToken(usuario.Email, usuario.Nombre, usuario.Rol, usuario.Id);
            var expiration = DateTime.UtcNow.AddHours(
                double.Parse(_configuration["Jwt:ExpirationHours"] ?? "24")
            );

            var baseUrl = _configuration["App:BaseUrl"] ?? "";
            var avatarUrl = !string.IsNullOrEmpty(usuario.AvatarPath)
                ? $"{baseUrl}{usuario.AvatarPath}"
                : null;

            return new AuthResponseDto
            {
                Token = token,
                Email = usuario.Email,
                Nombre = usuario.Nombre,
                Rol = usuario.Rol,
                UsuarioId = usuario.Id,
                AvatarUrl = avatarUrl,
                Expiration = expiration
            };
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            // Validar que el email no exista
            if (await _usuarioRepository.ExistsEmailAsync(registerDto.Email))
            {
                throw new InvalidOperationException("El email ya está registrado");
            }

            // Crear nuevo usuario con rol especificado o Cliente por defecto
            var passwordHash = HashPassword(registerDto.Password);

            var nuevoUsuario = new Usuario
            {
                Nombre = registerDto.Nombre,
                Email = registerDto.Email,
                PasswordHash = passwordHash,
                Rol = string.IsNullOrEmpty(registerDto.Rol) ? "Cliente" : registerDto.Rol,
                Activo = true,
                AvatarPath = "/uploads/avatars/user.png"
            };

            var usuario = await _usuarioRepository.CreateAsync(nuevoUsuario);

            // Generar token JWT
            var token = GenerateJwtToken(usuario.Email, usuario.Nombre, usuario.Rol, usuario.Id);
            var expiration = DateTime.UtcNow.AddHours(
                double.Parse(_configuration["Jwt:ExpirationHours"] ?? "24")
            );

            var baseUrl = _configuration["App:BaseUrl"] ?? "";
            var avatarUrl = !string.IsNullOrEmpty(usuario.AvatarPath)
                ? $"{baseUrl}{usuario.AvatarPath}"
                : null;

            return new AuthResponseDto
            {
                Token = token,
                Email = usuario.Email,
                Nombre = usuario.Nombre,
                Rol = usuario.Rol,
                UsuarioId = usuario.Id,
                AvatarUrl = avatarUrl,
                Expiration = expiration
            };
        }

        public string GenerateJwtToken(string email, string nombre, string rol, int userId)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Name, nombre),
                new Claim(ClaimTypes.Role, rol),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret no configurado"))
            );
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiration = DateTime.UtcNow.AddHours(
                double.Parse(_configuration["Jwt:ExpirationHours"] ?? "24")
            );

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expiration,
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string HashPassword(string password)
        {
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var usuario = await _usuarioRepository.GetByEmailAsync(dto.Email);
            if (usuario == null || !usuario.Activo) return;

            var tokensAnteriores = await _context.PasswordResetTokens
                .Where(t => t.UsuarioId == usuario.Id && !t.Used && t.Expiration > DateTime.UtcNow)
                .ToListAsync();
            tokensAnteriores.ForEach(t => t.Used = true);

            // Crear nuevo token seguro
            var tokenValue = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(48));
            // Hacer el token URL-safe
            tokenValue = tokenValue.Replace("+", "-").Replace("/", "_").Replace("=", "");

            var resetToken = new PasswordResetToken
            {
                UsuarioId = usuario.Id,
                Token = tokenValue,
                Expiration = DateTime.UtcNow.AddHours(1),
                Used = false
            };
            _context.PasswordResetTokens.Add(resetToken);
            await _context.SaveChangesAsync();

            var frontendUrl = _configuration["App:FrontendUrl"] ?? "http://localhost:5173";
            var resetLink = $"{frontendUrl}/reset-password?token={tokenValue}";

            await _emailService.SendPasswordResetEmailAsync(usuario.Email, usuario.Nombre, resetLink);
        }

        public async Task ResetPasswordWithTokenAsync(ResetPasswordWithTokenDto dto)
        {
            var resetToken = await _context.PasswordResetTokens
                .Include(t => t.Usuario)
                .FirstOrDefaultAsync(t => t.Token == dto.Token && !t.Used);

            if (resetToken == null)
                throw new InvalidOperationException("Token inválido o ya utilizado");

            if (resetToken.Expiration < DateTime.UtcNow)
                throw new InvalidOperationException("El token ha expirado. Solicitá un nuevo enlace de recuperación");

            if (resetToken.Usuario == null || !resetToken.Usuario.Activo)
                throw new InvalidOperationException("La cuenta no está disponible");

            resetToken.Usuario.PasswordHash = HashPassword(dto.NewPassword);
            resetToken.Used = true;

            await _context.SaveChangesAsync();
        }
    }
}
