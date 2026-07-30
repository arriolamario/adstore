using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class UpdateUsuarioDto
    {
        [StringLength(100, MinimumLength = 2, ErrorMessage = "El nombre debe tener entre 2 y 100 caracteres")]
        public string? Nombre { get; set; }

        [EmailAddress(ErrorMessage = "El email no es válido")]
        [StringLength(100, ErrorMessage = "El email no puede exceder 100 caracteres")]
        public string? Email { get; set; }

        [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
        [StringLength(100, ErrorMessage = "La contraseña no puede exceder 100 caracteres")]
        public string? Password { get; set; }

        [RegularExpression("^(Administrador|Cliente|Vendedor)$", ErrorMessage = "El rol debe ser 'Administrador', 'Cliente' o 'Vendedor'")]
        public string? Rol { get; set; }

        public string? AvatarPath { get; set; }

        public bool? Activo { get; set; }
    }
}
