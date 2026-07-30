using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class CreatePedidoDetalleDto
    {
        [Required]
        public int ProductoTalleId { get; set; }

        [Required]
        public int Cantidad { get; set; }

        [Required]
        public decimal PrecioUnitario { get; set; }
    }
}
