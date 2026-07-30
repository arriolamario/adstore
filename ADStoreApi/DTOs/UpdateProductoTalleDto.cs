using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class UpdateProductoTalleDto
    {
        [MaxLength(20)]
        public string? Talle { get; set; }
        public int? Stock { get; set; }
    }
}
