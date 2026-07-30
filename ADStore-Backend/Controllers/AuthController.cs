using ADStoreBackend.Models;
using ADStoreBackend.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ADStoreBackend.Controllers
{
    public class AuthController : Controller
    {
        private readonly ApiService _api;

        public AuthController(ApiService api)
        {
            _api = api;
        }

        [HttpGet]
        public IActionResult Login()
        {
            if (HttpContext.Session.GetString("JwtToken") != null)
                return RedirectToAction("Index", "Home");
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (!ModelState.IsValid)
                return View(model);

            var response = await _api.PostAsync<AuthResponseDto>("auth/login", new
            {
                email = model.Email,
                password = model.Password
            });

            if (response == null)
            {
                ModelState.AddModelError(string.Empty, "Email o contraseña incorrectos");
                return View(model);
            }

            HttpContext.Session.SetString("JwtToken", response.Token);
            HttpContext.Session.SetString("UsuarioNombre", response.Nombre);
            HttpContext.Session.SetString("UsuarioRol", response.Rol);

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, response.UsuarioId.ToString()),
                new(ClaimTypes.Name, response.Nombre),
                new(ClaimTypes.Email, response.Email),
                new(ClaimTypes.Role, response.Rol),
            };
            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(identity),
                new AuthenticationProperties { IsPersistent = true, ExpiresUtc = response.Expiration });

            return RedirectToAction("Index", "Home");
        }

        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            HttpContext.Session.Clear();
            return RedirectToAction("Login");
        }
    }
}