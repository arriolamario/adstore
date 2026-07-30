using ADStoreApi.DTOs;
using ADStoreApi.Models;
using ADStoreApi.Repositories;

namespace ADStoreApi.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IUsuarioRepository _repository;
        private readonly IConfiguration _configuration;

        public UsuarioService(IUsuarioRepository repository, IConfiguration configuration)
        {
            _repository = repository;
            _configuration = configuration;
        }

        public async Task<IEnumerable<UsuarioDto>> GetAllUsuariosAsync()
        {
            var usuarios = await _repository.GetAllAsync();
            return usuarios.Select(MapToDto);
        }

        public async Task<UsuarioDto?> GetUsuarioByIdAsync(int id)
        {
            var usuario = await _repository.GetByIdAsync(id);
            return usuario != null ? MapToDto(usuario) : null;
        }

        public async Task<UsuarioDto> CreateUsuarioAsync(CreateUsuarioDto createDto)
        {
            // Validar que el email no exista
            if (await _repository.ExistsEmailAsync(createDto.Email))
            {
                throw new InvalidOperationException("El email ya está registrado");
            }

            // Hashear la contraseña (en producción usar BCrypt o similar)
            var passwordHash = HashPassword(createDto.Password);

            var usuario = new Usuario
            {
                Nombre = createDto.Nombre,
                Email = createDto.Email,
                PasswordHash = passwordHash,
                Rol = createDto.Rol,
                AvatarPath = "/uploads/avatars/user.png",
                Activo = true
            };

            var createdUsuario = await _repository.CreateAsync(usuario);
            return MapToDto(createdUsuario);
        }

        public async Task<UsuarioDto?> UpdateUsuarioAsync(int id, UpdateUsuarioDto updateDto)
        {
            var usuario = await _repository.GetByIdAsync(id);
            if (usuario == null)
                return null;

            // Validar email si se está actualizando
            if (!string.IsNullOrEmpty(updateDto.Email) && updateDto.Email != usuario.Email)
            {
                if (await _repository.ExistsEmailAsync(updateDto.Email, id))
                {
                    throw new InvalidOperationException("El email ya está en uso por otro usuario");
                }
                usuario.Email = updateDto.Email;
            }

            // Actualizar solo los campos proporcionados
            if (!string.IsNullOrEmpty(updateDto.Nombre))
                usuario.Nombre = updateDto.Nombre;

            if (!string.IsNullOrEmpty(updateDto.Password))
                usuario.PasswordHash = HashPassword(updateDto.Password);

            if (!string.IsNullOrEmpty(updateDto.Rol))
                usuario.Rol = updateDto.Rol;

            if (updateDto.AvatarPath != null)
                usuario.AvatarPath = updateDto.AvatarPath;

            if (updateDto.Activo.HasValue)
                usuario.Activo = updateDto.Activo.Value;

            var updatedUsuario = await _repository.UpdateAsync(usuario);
            return MapToDto(updatedUsuario);
        }

        public async Task<bool> DeleteUsuarioAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        public async Task<UsuarioDto?> UpdateAvatarAsync(int id, string? avatarPath)
        {
            var usuario = await _repository.GetByIdAsync(id);
            if (usuario == null)
                return null;

            usuario.AvatarPath = avatarPath;
            var updatedUsuario = await _repository.UpdateAsync(usuario);
            return MapToDto(updatedUsuario);
        }

        // Métodos auxiliares
        private UsuarioDto MapToDto(Usuario usuario)
        {
            var baseUrl = _configuration["App:BaseUrl"] ?? "";
            var avatarUrl = !string.IsNullOrEmpty(usuario.AvatarPath) 
                ? $"{baseUrl}{usuario.AvatarPath}" 
                : null;

            return new UsuarioDto
            {
                Id = usuario.Id,
                Nombre = usuario.Nombre,
                Email = usuario.Email,
                Rol = usuario.Rol,
                AvatarPath = usuario.AvatarPath,
                AvatarUrl = avatarUrl,
                Activo = usuario.Activo
            };
        }

        private static string HashPassword(string password)
        {
            // NOTA: En producción usar BCrypt.Net-Next o ASP.NET Core Identity
            // Este es solo un ejemplo simple
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var bytes = System.Text.Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }
    }
}
