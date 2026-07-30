using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class CreateCategoriaDto
    {
        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;
        public bool Activo { get; set; } = true;
    }
}
