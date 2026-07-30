using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ADStoreApi.Models
{
    [Table("Productos")]
    public class Producto
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Descripcion { get; set; }

        [Required]
        public decimal Precio { get; set; }

        [Required]
        public int MarcaId { get; set; }

        [Required]
        public int CategoriaId { get; set; }

        public int? ProveedorId { get; set; }

        public bool Activo { get; set; } = true;

        public Marca? Marca { get; set; }
        public Categoria? Categoria { get; set; }
        public Proveedor? Proveedor { get; set; }
        public ICollection<ProductoTalle> ProductoTalles { get; set; } = new List<ProductoTalle>();
        public ICollection<ProductoImagen> ProductoImagenes { get; set; } = new List<ProductoImagen>();
    }
}
