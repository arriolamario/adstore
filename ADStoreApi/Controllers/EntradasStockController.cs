using ADStoreApi.DTOs;
using ADStoreApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ADStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EntradasStockController : ControllerBase
    {
        private readonly IEntradaStockService _entradaStockService;

        public EntradasStockController(IEntradaStockService entradaStockService)
        {
            _entradaStockService = entradaStockService;
        }

        [HttpGet]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<IEnumerable<EntradaStockDto>>> GetAll()
        {
            try
            {
                var entradas = await _entradaStockService.GetAllAsync();
                return Ok(entradas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener las entradas de stock", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<EntradaStockDto>> GetById(int id)
        {
            try
            {
                var entrada = await _entradaStockService.GetByIdAsync(id);
                if (entrada == null)
                {
                    return NotFound(new { message = "Entrada de stock no encontrada" });
                }
                return Ok(entrada);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al obtener la entrada de stock", error = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public async Task<ActionResult<EntradaStockDto>> Create([FromBody] CreateEntradaStockDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var entrada = await _entradaStockService.CreateAsync(createDto);
                return Ok(entrada);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al crear la entrada de stock", error = ex.Message });
            }
        }
    }
}
