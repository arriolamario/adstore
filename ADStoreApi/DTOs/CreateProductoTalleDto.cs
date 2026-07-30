using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class CreateProductoTalleDto
    {
        [Required]
        public int ProductoId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Talle { get; set; } = string.Empty;

        [Required]
        public int Stock { get; set; }
    }
}
