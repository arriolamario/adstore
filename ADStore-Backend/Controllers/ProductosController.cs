using ADStoreBackend.Models;
using ADStoreBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace ADStoreBackend.Controllers
{
    [Authorize]
    public class ProductosController : Controller
    {
        private readonly ApiService _api;

        public ProductosController(ApiService api)
        {
            _api = api;
        }

        private async Task CargarListas(ProductoFormViewModel model)
        {
            var marcas = await _api.GetAsync<List<MarcaDto>>("marcas") ?? new();
            var categorias = await _api.GetAsync<List<CategoriaDto>>("categorias") ?? new();
            var proveedores = await _api.GetAsync<List<ProveedorDto>>("proveedores") ?? new();

            model.Marcas = marcas
                .Where(m => m.Activo)
                .Select(m => new SelectListItem(m.Nombre, m.Id.ToString()))
                .ToList();

            model.Categorias = categorias
                .Where(c => c.Activo)
                .Select(c => new SelectListItem(c.Nombre, c.Id.ToString()))
                .ToList();

            model.Proveedores = proveedores
                .Where(p => p.Activo)
                .Select(p => new SelectListItem(p.Nombre, p.Id.ToString()))
                .Prepend(new SelectListItem("— Sin proveedor —", ""))
                .ToList();
        }

        public async Task<IActionResult> Index(int page = 1)
        {
            var productos = await _api.GetAsync<List<ProductoDto>>("productos");
            var modelo = PaginatedViewModel<ProductoDto>.Crear(productos ?? new(), page);
            return View(modelo);
        }

        [HttpGet]
        public async Task<IActionResult> Create()
        {

            var model = new ProductoFormViewModel();
            await CargarListas(model);
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Create(ProductoFormViewModel model)
        {
            if (!ModelState.IsValid)
            {
                await CargarListas(model);
                return View(model);
            }

            var result = await _api.PostAsync<ProductoDto>("productos", new
            {
                nombre = model.Nombre,
                descripcion = model.Descripcion,
                precio = model.Precio,
                marcaId = model.MarcaId,
                categoriaId = model.CategoriaId,
                proveedorId = model.ProveedorId,
                activo = model.Activo
            });

            if (result == null)
            {
                ModelState.AddModelError(string.Empty, "Error al crear el producto");
                await CargarListas(model);
                return View(model);
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {

            var producto = await _api.GetAsync<ProductoDto>($"productos/{id}");
            if (producto == null) return NotFound();

            var model = new ProductoFormViewModel
            {
                Id = producto.Id,
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Precio = producto.Precio,
                MarcaId = producto.MarcaId,
                CategoriaId = producto.CategoriaId,
                ProveedorId = producto.ProveedorId,
                Activo = producto.Activo
            };

            await CargarListas(model);
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Edit(ProductoFormViewModel model)
        {
            if (!ModelState.IsValid)
            {
                await CargarListas(model);
                return View(model);
            }

            var ok = await _api.PutAsync($"productos/{model.Id}", new
            {
                nombre = model.Nombre,
                descripcion = model.Descripcion,
                precio = model.Precio,
                marcaId = model.MarcaId,
                categoriaId = model.CategoriaId,
                proveedorId = model.ProveedorId,
                activo = model.Activo
            });

            if (!ok)
            {
                ModelState.AddModelError(string.Empty, "Error al actualizar el producto");
                await CargarListas(model);
                return View(model);
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {
            await _api.DeleteAsync($"productos/{id}");
            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public async Task<IActionResult> Imagenes(int id)
        {

            var producto = await _api.GetAsync<ProductoDto>($"productos/{id}");
            if (producto == null) return NotFound();

            return View(producto);
        }

        [HttpPost]
        public async Task<IActionResult> SubirImagen(int id, IFormFile imagen)
        {
            if (imagen != null && imagen.Length > 0)
                await _api.PostFileAsync<ProductoImagenDto>($"productos/{id}/imagen", imagen);

            return RedirectToAction(nameof(Imagenes), new { id });
        }

        [HttpPost]
        public async Task<IActionResult> EliminarImagen(int id, int imagenId)
        {
            await _api.DeleteAsync($"productos/{id}/imagen/{imagenId}");
            return RedirectToAction(nameof(Imagenes), new { id });
        }

        [HttpPost]
        public async Task<IActionResult> MarcarPrincipal(int id, int imagenId)
        {
            await _api.PutEmptyAsync($"productos/{id}/imagen/{imagenId}/principal");
            return RedirectToAction(nameof(Imagenes), new { id });
        }

        [HttpGet]
        public async Task<IActionResult> Talles(int id)
        {

            var producto = await _api.GetAsync<ProductoDto>($"productos/{id}");
            if (producto == null) return NotFound();

            var talles = await _api.GetAsync<List<ProductoTalleDto>>($"productoTalles/producto/{id}");

            ViewBag.Producto = producto;
            return View(talles ?? new List<ProductoTalleDto>());
        }

        [HttpPost]
        public async Task<IActionResult> AgregarTalle(int id, string talle, int stock)
        {
            await _api.PostAsync<ProductoTalleDto>("productoTalles", new
            {
                productoId = id,
                talle,
                stock
            });

            return RedirectToAction(nameof(Talles), new { id });
        }

        [HttpPost]
        public async Task<IActionResult> EditarTalle(int id, int talleId, string talle, int stock)
        {
            await _api.PutAsync($"productoTalles/{talleId}", new { talle, stock });
            return RedirectToAction(nameof(Talles), new { id });
        }

        [HttpPost]
        public async Task<IActionResult> EliminarTalle(int id, int talleId)
        {
            await _api.DeleteAsync($"productoTalles/{talleId}");
            return RedirectToAction(nameof(Talles), new { id });
        }
    }
}