using ADStoreBackend.Models;
using ADStoreBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ADStoreBackend.Controllers
{
    [Authorize]
    public class UsuariosController : Controller
    {
        private readonly ApiService _api;

        public UsuariosController(ApiService api)
        {
            _api = api;
        }

        public async Task<IActionResult> Index(int page = 1)
        {
            var usuarios = await _api.GetAsync<List<UsuarioDto>>("usuarios");
            var modelo = PaginatedViewModel<UsuarioDto>.Crear(usuarios ?? new(), page);
            return View(modelo);
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View(new UsuarioFormViewModel());
        }

        [HttpPost]
        public async Task<IActionResult> Create(UsuarioFormViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var result = await _api.PostAsync<UsuarioDto>("usuarios", new
            {
                nombre = model.Nombre,
                email = model.Email,
                password = model.Password,
                rol = model.Rol
            });

            if (result == null)
            {
                ModelState.AddModelError(string.Empty, "Error al crear el usuario. El email puede estar en uso.");
                return View(model);
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {

            var usuario = await _api.GetAsync<UsuarioDto>($"usuarios/{id}");
            if (usuario == null) return NotFound();

            return View(new UsuarioFormViewModel
            {
                Id = usuario.Id,
                Nombre = usuario.Nombre,
                Email = usuario.Email,
                Rol = usuario.Rol,
                Activo = usuario.Activo,
                AvatarUrl = usuario.AvatarUrl
            });
        }

        [HttpPost]
        public async Task<IActionResult> Edit(UsuarioFormViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            var ok = await _api.PutAsync($"usuarios/{model.Id}", new
            {
                nombre = model.Nombre,
                email = model.Email,
                password = string.IsNullOrEmpty(model.Password) ? null : model.Password,
                rol = model.Rol,
                activo = model.Activo
            });

            if (!ok)
            {
                ModelState.AddModelError(string.Empty, "Error al actualizar el usuario");
                return View(model);
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> Delete(int id)
        {
            await _api.DeleteAsync($"usuarios/{id}");
            return RedirectToAction(nameof(Index));
        }
        [HttpPost]
        public async Task<IActionResult> SubirAvatar(int id, IFormFile avatar)
        {
            if (avatar != null && avatar.Length > 0)
                await _api.PostFileAsync<UsuarioDto>($"usuarios/{id}/avatar", avatar, "file");

            return RedirectToAction(nameof(Edit), new { id });
        }

        [HttpPost]
        public async Task<IActionResult> EliminarAvatar(int id)
        {
            await _api.DeleteAsync($"usuarios/{id}/avatar");
            return RedirectToAction(nameof(Edit), new { id });
        }
    }
}