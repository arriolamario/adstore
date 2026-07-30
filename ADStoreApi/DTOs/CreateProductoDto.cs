using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class CreateProductoDto
    {
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

        [Required]
        public int ProveedorId { get; set; }

        public bool Activo { get; set; } = true;
    }
}
