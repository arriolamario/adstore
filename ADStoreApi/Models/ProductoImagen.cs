using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ADStoreApi.Models
{
    [Table("ProductoImagenes")]
    public class ProductoImagen
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProductoId { get; set; }

        [Required]
        [MaxLength(300)]
        public string RutaImagen { get; set; } = string.Empty;

        [Required]
        public bool EsPrincipal { get; set; } = false;

        public Producto? Producto { get; set; }
    }
}
