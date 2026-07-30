using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class CreateProveedorDto
    {
        [Required(ErrorMessage = "El nombre es requerido")]
        [MaxLength(200, ErrorMessage = "El nombre no puede exceder los 200 caracteres")]
        public string Nombre { get; set; } = string.Empty;


        [MaxLength(50, ErrorMessage = "El teléfono no puede exceder los 50 caracteres")]
        public string? Telefono { get; set; }

        [MaxLength(500, ErrorMessage = "La dirección no puede exceder los 500 caracteres")]
        public string? Direccion { get; set; }
    }
}
