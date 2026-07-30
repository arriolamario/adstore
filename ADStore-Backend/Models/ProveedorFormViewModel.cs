using System.ComponentModel.DataAnnotations;

namespace ADStoreBackend.Models
{
    public class ProveedorFormViewModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre es obligatorio")]
        [MaxLength(200, ErrorMessage = "Máximo 200 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(50, ErrorMessage = "Máximo 50 caracteres")]
        public string? Telefono { get; set; }

        [MaxLength(500, ErrorMessage = "Máximo 500 caracteres")]
        public string? Direccion { get; set; }

        public bool Activo { get; set; } = true;
    }
}