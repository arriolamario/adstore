using System.ComponentModel.DataAnnotations;

namespace ADStoreBackend.Models
{
    public class UsuarioFormViewModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre es obligatorio")]
        [StringLength(100, MinimumLength = 2)]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "El email es obligatorio")]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [MinLength(6, ErrorMessage = "Mínimo 6 caracteres")]
        [DataType(DataType.Password)]
        public string? Password { get; set; }

        [Required(ErrorMessage = "El rol es obligatorio")]
        public string Rol { get; set; } = "Cliente";

        public bool Activo { get; set; } = true;

        public bool EsEdicion => Id > 0;
        public string? AvatarUrl { get; set; }
    }
}