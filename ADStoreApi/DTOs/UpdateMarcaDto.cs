using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class UpdateMarcaDto
    {
        [MaxLength(100)]
        public string? Nombre { get; set; }
        public bool? Activo { get; set; }
    }
}
