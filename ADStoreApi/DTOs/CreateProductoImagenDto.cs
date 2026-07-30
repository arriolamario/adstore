using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class CreateProductoImagenDto
    {
        [Required]
        public int ProductoId { get; set; }

        [Required]
        [MaxLength(300)]
        public string RutaImagen { get; set; } = string.Empty;

        public bool EsPrincipal { get; set; } = false;
    }
}
