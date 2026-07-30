using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class CreateDetalleEntradaStockDto
    {
        [Required(ErrorMessage = "El ProductoTalleId es requerido")]
        public int ProductoTalleId { get; set; }

        [Required(ErrorMessage = "La cantidad es requerida")]
        [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser mayor a 0")]
        public int Cantidad { get; set; }

        [Required(ErrorMessage = "El precio unitario es requerido")]
        [Range(0.01, double.MaxValue, ErrorMessage = "El precio unitario debe ser mayor a 0")]
        public decimal PrecioUnitario { get; set; }
    }
}
