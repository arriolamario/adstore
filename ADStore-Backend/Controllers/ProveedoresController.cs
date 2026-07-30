using ADStoreBackend.Models;
using ADStoreBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ADStoreBackend.Controllers
{
    [Authorize]
    public class ProveedoresController : Controller
    {
        private readonly ApiService _api;

        public ProveedoresController(ApiService api)
        {
            _api = api;
        }

        public async Task<IActionResult> Index(int page = 1)
        {
            var proveedores = await _api.GetAsync<List<ProveedorDto>>("proveedores");
            var modelo = PaginatedViewModel<ProveedorDto>.Crear(proveedores ?? new(), page);
            return View(modelo);
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View(new ProveedorFormViewModel());
        }

        [HttpPost]
        public async Task<IActionResult> Create(ProveedorFormViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var result = await _api.PostAsync<ProveedorDto>("proveedores", new
            {
                nombre = model.Nombre,
                telefono = model.Telefono,
                direccion = model.Direccion
            });

            if (result == null)
            {
                ModelState.AddModelError(string.Empty, "Error al crear el proveedor. El nombre puede estar en uso.");
                return View(model);
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {

            var proveedor = await _api.GetAsync<ProveedorDto>($"proveedores/{id}");
            if (proveedor == null) return NotFound();

            return View(new ProveedorFormViewModel
            {
                Id = proveedor.Id,
                Nombre = proveedor.Nombre,
                Telefono = proveedor.Telefono,
                Direccion = proveedor.Direccion,
                Activo = proveedor.Activo
            });
        }

        [HttpPost]
        public async Task<IActionResult> Edit(ProveedorFormViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var ok = await _api.PutAsync($"proveedores/{model.Id}", new
            {
                nombre = model.Nombre,
                telefono = model.Telefono,
                direccion = model.Direccion,
                activo = model.Activo
            });

            if (!ok)
            {
                ModelState.AddModelError(string.Empty, "Error al actualizar el proveedor");
                return View(model);
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {

            await _api.DeleteAsync($"proveedores/{id}");
            return RedirectToAction(nameof(Index));
        }
    }
}