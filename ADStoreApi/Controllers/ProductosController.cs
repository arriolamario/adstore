using ADStoreApi.DTOs;
using ADStoreApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ADStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductosController : ControllerBase
    {
        private readonly IProductoService _service;
        private readonly IFileService _fileService;
        private readonly ILogger<ProductosController> _logger;

        public ProductosController(
            IProductoService service, 
            IFileService fileService,
            ILogger<ProductosController> logger)
        {
            _service = service;
            _fileService = fileService;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ProductoDto>>> GetAll()
        {
            var productos = await _service.GetAllAsync();
            return Ok(productos);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProductoDto>> GetById(int id)
        {
            var producto = await _service.GetByIdAsync(id);
            if (producto == null)
                return NotFound(new { message = $"Producto con ID {id} no encontrado" });

            return Ok(producto);
        }

        [HttpGet("{id}/talles")]
        [AllowAnonymous]
        public async Task<ActionResult<ProductoDto>> GetByIdWithTalles(int id)
        {
            var producto = await _service.GetByIdWithTallesAsync(id);
            if (producto == null)
                return NotFound(new { message = $"Producto con ID {id} no encontrado" });

            return Ok(producto);
        }

        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<ProductoDto>> Create([FromBody] CreateProductoDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<ProductoDto>> Update(int id, [FromBody] UpdateProductoDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _service.UpdateAsync(id, dto);
                if (updated == null)
                    return NotFound(new { message = $"Producto con ID {id} no encontrado" });

                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result)
                return NotFound(new { message = $"Producto con ID {id} no encontrado" });

            return NoContent();
        }

        [HttpPost("{id}/imagen")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<ProductoImagenDto>> UploadImagen(int id, [FromForm] IFormFile imagen)
        {
            if (imagen == null || imagen.Length == 0)
                return BadRequest(new { message = "No se proporcionó ninguna imagen" });

            try
            {
                var imagenDto = await _fileService.UploadProductoImagenAsync(id, imagen);

                return Ok(imagenDto);
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message.Contains("no encontrado"))
                    return NotFound(new { message = ex.Message });
                
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al subir imagen para producto {ProductoId}", id);
                return StatusCode(500, new { message = "Error al guardar la imagen", error = ex.Message });
            }
        }

        [HttpDelete("{id}/imagen/{imagenId}")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult> DeleteImagen(int id, int imagenId)
        {
            try
            {
                var deleted = await _fileService.DeleteProductoImagenAsync(id, imagenId);
                
                if (!deleted)
                    return NotFound(new { message = $"No se pudo eliminar la imagen {imagenId}" });

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message.Contains("no encontrada") || ex.Message.Contains("no pertenece"))
                    return NotFound(new { message = ex.Message });
                
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar imagen {ImagenId} del producto {ProductoId}", imagenId, id);
                return StatusCode(500, new { message = "Error al eliminar la imagen", error = ex.Message });
            }
        }

        [HttpPut("{id}/imagen/{imagenId}/principal")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<ProductoImagenDto>> SetImagenPrincipal(int id, int imagenId)
        {
            try
            {
                var imagenDto = await _fileService.SetImagenPrincipalAsync(id, imagenId);
                
                if (imagenDto == null)
                    return NotFound(new { message = $"No se pudo actualizar la imagen {imagenId}" });

                return Ok(imagenDto);
            }
            catch (InvalidOperationException ex)
            {
                if (ex.Message.Contains("no encontrada") || ex.Message.Contains("no pertenece"))
                    return NotFound(new { message = ex.Message });
                
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al marcar imagen {ImagenId} como principal del producto {ProductoId}", imagenId, id);
                return StatusCode(500, new { message = "Error al actualizar la imagen", error = ex.Message });
            }
        }
    }
}
