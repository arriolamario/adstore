using ADStoreBackend.Models;
using ADStoreBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ADStoreBackend.Controllers
{
    [Authorize]
    public class MarcasController : Controller
    {
        private readonly ApiService _api;

        public MarcasController(ApiService api)
        {
            _api = api;
        }

        public IActionResult Index() => View();


        [HttpGet]
        public async Task<IActionResult> Lista(int page = 1, int pageSize = 10)
        {
            var marcas = await _api.GetAsync<List<MarcaDto>>("marcas");
            var modelo = PaginatedViewModel<MarcaDto>.Crear(marcas ?? new(), page, pageSize);
            return Json(new
            {
                items = modelo.Items,
                paginaActual = modelo.PaginaActual,
                totalPaginas = modelo.TotalPaginas,
                totalItems = modelo.TotalItems
            });
        }

        [HttpPost]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> Guardar([FromBody] MarcaFormViewModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (model.Id == 0)
            {
                var created = await _api.PostAsync<MarcaDto>("marcas", new { nombre = model.Nombre, activo = model.Activo });
                if (created == null) return StatusCode(500, new { mensaje = "Error al crear la marca" });
                return Json(created);
            }
            else
            {
                var ok = await _api.PutAsync($"marcas/{model.Id}", new { nombre = model.Nombre, activo = model.Activo });
                if (!ok) return StatusCode(500, new { mensaje = "Error al actualizar la marca" });
                return Json(new { id = model.Id, nombre = model.Nombre, activo = model.Activo });
            }
        }

        [HttpDelete]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> Eliminar(int id)
        {
            var ok = await _api.DeleteAsync($"marcas/{id}");
            if (!ok) return StatusCode(500, new { mensaje = "Error al eliminar la marca" });
            return Ok();
        }
    }
}