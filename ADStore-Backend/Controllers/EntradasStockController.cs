using ADStoreBackend.Models;
using ADStoreBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace ADStoreBackend.Controllers
{
    [Authorize]
    public class EntradasStockController : Controller
    {
        private readonly ApiService _api;

        public EntradasStockController(ApiService api)
        {
            _api = api;
        }

        public async Task<IActionResult> Index(int page = 1)
        {
            var entradas = await _api.GetAsync<List<EntradaStockDto>>("entradasstock");
            var ordenadas = (entradas ?? new()).OrderByDescending(e => e.Fecha).ToList();
            var modelo = PaginatedViewModel<EntradaStockDto>.Crear(ordenadas, page);
            return View(modelo);
        }

        public async Task<IActionResult> Detalle(int id)
        {

            var entrada = await _api.GetAsync<EntradaStockDto>($"entradasstock/{id}");
            if (entrada == null) return NotFound();
            return View(entrada);
        }

        [HttpGet]
        public async Task<IActionResult> Create()
        {

            var model = new EntradaStockFormViewModel();
            await CargarListas(model);
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Create(EntradaStockFormViewModel model)
        {

            // Filtrar filas vacías
            model.Detalles = model.Detalles
                .Where(d => d.ProductoTalleId > 0 && d.Cantidad > 0 && d.PrecioUnitario > 0)
                .ToList();

            if (model.Detalles.Count == 0)
                ModelState.AddModelError(string.Empty, "Debe agregar al menos un detalle");

            if (!ModelState.IsValid)
            {
                await CargarListas(model);
                return View(model);
            }

            var result = await _api.PostAsync<EntradaStockDto>("entradasstock", new
            {
                proveedorId = model.ProveedorId,
                fecha = model.Fecha,
                numeroDocumento = model.NumeroDocumento,
                observaciones = model.Observaciones,
                detalles = model.Detalles.Select(d => new
                {
                    productoTalleId = d.ProductoTalleId,
                    cantidad = d.Cantidad,
                    precioUnitario = d.PrecioUnitario
                })
            });

            if (result == null)
            {
                ModelState.AddModelError(string.Empty, "Error al registrar la entrada de stock");
                await CargarListas(model);
                return View(model);
            }

            return RedirectToAction(nameof(Index));
        }

        // API auxiliar: devuelve talles de un producto como JSON
        public async Task<IActionResult> GetTalles(int productoId)
        {
            var talles = await _api.GetAsync<List<ProductoTalleDto>>($"productoTalles/producto/{productoId}");
            return Json(talles ?? new List<ProductoTalleDto>());
        }

        private async Task CargarListas(EntradaStockFormViewModel model)
        {
            var proveedores = await _api.GetAsync<List<ProveedorDto>>("proveedores") ?? new();
            var productos = await _api.GetAsync<List<ProductoDto>>("productos") ?? new();

            model.Proveedores = proveedores
                .Where(p => p.Activo)
                .Select(p => new SelectListItem(p.Nombre, p.Id.ToString()))
                .ToList();

            model.Productos = productos
                .Where(p => p.Activo)
                .Select(p => new SelectListItem(p.Nombre, p.Id.ToString()))
                .Prepend(new SelectListItem("— Seleccionar producto —", ""))
                .ToList();
        }
    }
}