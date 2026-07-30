using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class CreateUsuarioDto
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 100 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "El email es requerido")]
        [EmailAddress(ErrorMessage = "El email no es válido")]
        [StringLength(100, ErrorMessage = "El email no puede exceder 100 caracteres")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contraseña es requerida")]
        [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
        [StringLength(100, ErrorMessage = "La contraseña no puede exceder 100 caracteres")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "El rol es requerido")]
        [RegularExpression("^(Administrador|Cliente|Vendedor)$", ErrorMessage = "El rol debe ser 'Administrador', 'Cliente' o 'Vendedor'")]
        public string Rol { get; set; } = string.Empty;

        //public string? AvatarPath { get; set; }
    }
}
