using ADStoreApi.DTOs;
using ADStoreApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ADStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProductoTallesController : ControllerBase
    {
        private readonly IProductoTalleService _service;

        public ProductoTallesController(IProductoTalleService service)
        {
            _service = service;
        }

        [HttpGet("producto/{productoId}")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ProductoTalleDto>>> GetByProducto(int productoId)
        {
            var talles = await _service.GetByProductoIdAsync(productoId);
            return Ok(talles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductoTalleDto>> GetById(int id)
        {
            var talle = await _service.GetByIdAsync(id);
            if (talle == null)
                return NotFound(new { message = $"Talle con ID {id} no encontrado" });

            return Ok(talle);
        }

        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<ProductoTalleDto>> Create([FromBody] CreateProductoTalleDto dto)
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
        public async Task<ActionResult<ProductoTalleDto>> Update(int id, [FromBody] UpdateProductoTalleDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound(new { message = $"Talle con ID {id} no encontrado" });

            return Ok(updated);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result)
                return NotFound(new { message = $"Talle con ID {id} no encontrado" });

            return NoContent();
        }

        [HttpPost("ajustar-stock")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<ProductoTalleDto>> AjustarStock([FromBody] AjustarStockDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _service.AjustarStockAsync(dto);
                if (updated == null)
                    return NotFound(new { message = $"No se pudo ajustar el stock" });

                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
