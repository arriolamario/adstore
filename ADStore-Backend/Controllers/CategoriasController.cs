using ADStoreBackend.Models;
using ADStoreBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ADStoreBackend.Controllers
{
    [Authorize]
    public class CategoriasController : Controller
    {
        private readonly ApiService _api;

        public CategoriasController(ApiService api)
        {
            _api = api;
        }

        public async Task<IActionResult> Index(int page = 1)
        {
            var categorias = await _api.GetAsync<List<CategoriaDto>>("categorias");
            var modelo = PaginatedViewModel<CategoriaDto>.Crear(categorias ?? new(), page);
            return View(modelo);
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View(new CategoriaFormViewModel());
        }

        [HttpPost]
        public async Task<IActionResult> Create(CategoriaFormViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var result = await _api.PostAsync<CategoriaDto>("categorias", new
            {
                nombre = model.Nombre,
                activo = model.Activo
            });

            if (result == null)
            {
                ModelState.AddModelError(string.Empty, "Error al crear la categoría");
                return View(model);
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {

            var categoria = await _api.GetAsync<CategoriaDto>($"categorias/{id}");
            if (categoria == null) return NotFound();

            return View(new CategoriaFormViewModel
            {
                Id = categoria.Id,
                Nombre = categoria.Nombre,
                Activo = categoria.Activo
            });
        }

        [HttpPost]
        public async Task<IActionResult> Edit(CategoriaFormViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var ok = await _api.PutAsync($"categorias/{model.Id}", new
            {
                nombre = model.Nombre,
                activo = model.Activo
            });

            if (!ok)
            {
                ModelState.AddModelError(string.Empty, "Error al actualizar la categoría");
                return View(model);
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {

            await _api.DeleteAsync($"categorias/{id}");
            return RedirectToAction(nameof(Index));
        }
    }
}