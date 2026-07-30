using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class ProductoImagenDto
    {
        public int Id { get; set; }
        public int ProductoId { get; set; }
        public string RutaImagen { get; set; } = string.Empty;
        public string UrlImagen { get; set; } = string.Empty;
        public bool EsPrincipal { get; set; }
    }
}
