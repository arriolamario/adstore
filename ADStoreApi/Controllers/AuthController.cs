using ADStoreApi.DTOs;
using ADStoreApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace ADStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// Iniciar sesión con email y contraseña
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _authService.LoginAsync(loginDto);

                if (result == null)
                    return Unauthorized(new { message = "Email o contraseña incorrectos" });

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en login");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }

        /// <summary>
        /// Registrar un nuevo usuario (Cliente)
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _authService.RegisterAsync(registerDto);

                return CreatedAtAction(nameof(Login), result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en registro");
                return StatusCode(500, new { message = "Error interno del servidor" });
            }
        }
        [HttpPost("forgot-password")]
        public async Task<ActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            try
            {
                await _authService.ForgotPasswordAsync(dto);
                // Siempre responder con éxito para no revelar si el email existe
                return Ok(new { message = "Si el email está registrado, recibirás un enlace para restablecer tu contraseña." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error en forgot-password para {Email}", dto.Email);
                return Ok(new { message = "Si el email está registrado, recibirás un enlace para restablecer tu contraseña." });
            }
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult> ResetPasswordWithToken([FromBody] ResetPasswordWithTokenDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            try
            {
                await _authService.ResetPasswordWithTokenAsync(dto);
                return Ok(new { message = "Contraseña actualizada correctamente. Ya podés iniciar sesión." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
