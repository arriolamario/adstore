using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class ProductoTalleDto
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }
        public string Talle { get; set; } = string.Empty;
        public int Stock { get; set; }
    }
}
