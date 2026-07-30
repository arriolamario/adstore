using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class UpdateProductoImagenDto
    {
        [MaxLength(300)]
        public string? RutaImagen { get; set; }


        public bool? EsPrincipal { get; set; }
    }
}
