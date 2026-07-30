using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ADStoreApi.Models
{
    [Table("ProductoTalles")]
    public class ProductoTalle
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProductoId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Talle { get; set; } = string.Empty;

        [Required]
        public int Stock { get; set; }

        public Producto? Producto { get; set; }
    }
}
