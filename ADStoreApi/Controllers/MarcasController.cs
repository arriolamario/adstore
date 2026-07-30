using ADStoreApi.DTOs;
using ADStoreApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ADStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MarcasController : ControllerBase
    {
        private readonly IMarcaService _service;
        private readonly ILogger<MarcasController> _logger;

        public MarcasController(IMarcaService service, ILogger<MarcasController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<MarcaDto>>> GetAll()
        {
            var marcas = await _service.GetAllAsync();
            return Ok(marcas);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<MarcaDto>> GetById(int id)
        {
            var marca = await _service.GetByIdAsync(id);
            if (marca == null)
                return NotFound(new { message = $"Marca con ID {id} no encontrada" });

            return Ok(marca);
        }

        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<MarcaDto>> Create([FromBody] CreateMarcaDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<MarcaDto>> Update(int id, [FromBody] UpdateMarcaDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound(new { message = $"Marca con ID {id} no encontrada" });

            return Ok(updated);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result)
                return NotFound(new { message = $"Marca con ID {id} no encontrada" });

            return NoContent();
        }
    }
}
