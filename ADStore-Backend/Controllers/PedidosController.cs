using ADStoreBackend.Models;
using ADStoreBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ADStoreBackend.Controllers
{
    [Authorize]
    public class PedidosController : Controller
    {
        private readonly ApiService _api;

        public PedidosController(ApiService api)
        {
            _api = api;
        }

        public async Task<IActionResult> Index(int page = 1)
        {
            var pedidos = await _api.GetAsync<List<PedidoDto>>("pedidos");
            var ordenados = (pedidos ?? new()).OrderByDescending(p => p.Fecha).ToList();
            var modelo = PaginatedViewModel<PedidoDto>.Crear(ordenados, page);
            return View(modelo);
        }

        public async Task<IActionResult> Details(int id)
        {

            var pedido = await _api.GetAsync<PedidoDto>($"pedidos/{id}");
            if (pedido == null) return NotFound();
            return View(pedido);
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {

            var pedido = await _api.GetAsync<PedidoDto>($"pedidos/{id}");
            if (pedido == null) return NotFound();

            var model = new PedidoEditViewModel
            {
                Id = pedido.Id,
                UsuarioId = pedido.UsuarioId,
                UsuarioNombre = pedido.UsuarioNombre,
                Fecha = pedido.Fecha,
                Total = pedido.Total,
                Estado = pedido.Estado,
                Detalles = pedido.Detalles
            };
            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> Edit(PedidoEditViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var ok = await _api.PutAsync($"pedidos/{model.Id}", new { estado = model.Estado });
            if (!ok)
            {
                ModelState.AddModelError(string.Empty, "Error al actualizar el pedido");
                return View(model);
            }

            return RedirectToAction(nameof(Index));
        }
    }
}