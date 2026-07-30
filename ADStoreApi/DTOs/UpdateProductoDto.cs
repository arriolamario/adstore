using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class UpdateProductoDto
    {
        [MaxLength(150)]
        public string? Nombre { get; set; }

        [MaxLength(1000)]
        public string? Descripcion { get; set; }

        public decimal? Precio { get; set; }
        public int? MarcaId { get; set; }
        public int? CategoriaId { get; set; }
        public int? ProveedorId { get; set; }

        public bool? Activo { get; set; }
    }
}
