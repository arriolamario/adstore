using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class CreateEntradaStockDto
    {
        [Required(ErrorMessage = "El ProveedorId es requerido")]
        public int ProveedorId { get; set; }

        [Required(ErrorMessage = "La fecha es requerida")]
        public DateTime Fecha { get; set; }

        [Required(ErrorMessage = "El número de documento es requerido")]
        [StringLength(50, ErrorMessage = "El número de documento no puede exceder 50 caracteres")]
        public string NumeroDocumento { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Las observaciones no pueden exceder 1000 caracteres")]
        public string? Observaciones { get; set; }

        [Required(ErrorMessage = "Los detalles son requeridos")]
        [MinLength(1, ErrorMessage = "Debe incluir al menos un detalle")]
        public List<CreateDetalleEntradaStockDto> Detalles { get; set; } = new();
    }
}
