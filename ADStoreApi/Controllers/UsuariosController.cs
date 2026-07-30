using ADStoreApi.DTOs;
using ADStoreApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ADStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Requiere autenticación para todos los endpoints
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;
        private readonly IFileService _fileService;
        private readonly ILogger<UsuariosController> _logger;

        public UsuariosController(IUsuarioService usuarioService, IFileService fileService, ILogger<UsuariosController> logger)
        {
            _usuarioService = usuarioService;
            _fileService = fileService;
            _logger = logger;
        }

        /// <summary>
        /// Obtiene todos los usuarios (Solo Administrador)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetAll()
        {
            try
            {
                var usuarios = await _usuarioService.GetAllUsuariosAsync();
                return Ok(usuarios);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener usuarios");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Obtiene un usuario por ID (Administrador o el mismo usuario)
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<UsuarioDto>> GetById(int id)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

                // Solo Administrador o el mismo usuario pueden ver el perfil
                if (currentUserRole != "Administrador" && currentUserId != id)
                    return Forbid();

                var usuario = await _usuarioService.GetUsuarioByIdAsync(id);
                
                if (usuario == null)
                    return NotFound(new { message = $"Usuario con ID {id} no encontrado" });

                return Ok(usuario);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener usuario con ID {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Crea un nuevo usuario (Solo Administrador)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<UsuarioDto>> Create([FromBody] CreateUsuarioDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var usuario = await _usuarioService.CreateUsuarioAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = usuario.Id }, usuario);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear usuario");
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Actualiza un usuario existente (Administrador o el mismo usuario)
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<UsuarioDto>> Update(int id, [FromBody] UpdateUsuarioDto updateDto)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

                // Solo Administrador o el mismo usuario pueden actualizar el perfil
                if (currentUserRole != "Administrador" && currentUserId != id)
                    return Forbid();

                // Si no es Administrador, no puede cambiar el rol ni el estado activo
                if (currentUserRole != "Administrador")
                {
                    updateDto.Rol = null;
                    updateDto.Activo = null;
                }

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var usuario = await _usuarioService.UpdateUsuarioAsync(id, updateDto);
                
                if (usuario == null)
                    return NotFound(new { message = $"Usuario con ID {id} no encontrado" });

                return Ok(usuario);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar usuario con ID {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Elimina un usuario (Solo Administrador)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await _usuarioService.DeleteUsuarioAsync(id);
                
                if (!result)
                    return NotFound(new { message = $"Usuario con ID {id} no encontrado" });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar usuario con ID {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Sube o actualiza el avatar de un usuario (Administrador o el mismo usuario)
        /// </summary>
        [HttpPost("{id}/avatar")]
        public async Task<ActionResult<UsuarioDto>> UploadAvatar(int id, IFormFile file)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

                // Solo Administrador o el mismo usuario pueden subir avatar
                if (currentUserRole != "Administrador" && currentUserId != id)
                    return Forbid();

                // Verificar que el usuario existe
                var usuario = await _usuarioService.GetUsuarioByIdAsync(id);
                if (usuario == null)
                    return NotFound(new { message = $"Usuario con ID {id} no encontrado" });

                // Validar archivo
                if (!_fileService.ValidateImageFile(file, out string errorMessage))
                    return BadRequest(new { message = errorMessage });

                // Eliminar avatar anterior si existe
                if (!string.IsNullOrEmpty(usuario.AvatarPath))
                {
                    await _fileService.DeleteFileAsync(usuario.AvatarPath);
                }

                // Guardar nuevo avatar
                var avatarPath = await _fileService.SaveFileAsync(file, "avatars");

                // Actualizar usuario
                var updatedUsuario = await _usuarioService.UpdateAvatarAsync(id, avatarPath);

                return Ok(updatedUsuario);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al subir avatar para usuario con ID {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }

        /// <summary>
        /// Elimina el avatar de un usuario (Administrador o el mismo usuario)
        /// </summary>
        [HttpDelete("{id}/avatar")]
        public async Task<ActionResult<UsuarioDto>> DeleteAvatar(int id)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value;

                // Solo Administrador o el mismo usuario pueden eliminar avatar
                if (currentUserRole != "Administrador" && currentUserId != id)
                    return Forbid();

                // Verificar que el usuario existe
                var usuario = await _usuarioService.GetUsuarioByIdAsync(id);
                if (usuario == null)
                    return NotFound(new { message = $"Usuario con ID {id} no encontrado" });

                // Eliminar avatar si existe
                if (!string.IsNullOrEmpty(usuario.AvatarPath))
                {
                    await _fileService.DeleteFileAsync(usuario.AvatarPath);
                }

                // Actualizar usuario
                var updatedUsuario = await _usuarioService.UpdateAvatarAsync(id, "/uploads/avatars/user.png");

                return Ok(updatedUsuario);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar avatar para usuario con ID {Id}", id);
                return StatusCode(500, "Error interno del servidor");
            }
        }
    }
}
