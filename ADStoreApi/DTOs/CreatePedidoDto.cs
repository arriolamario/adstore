using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class CreatePedidoDto
    {
        [Required]
        public int UsuarioId { get; set; }

        [MaxLength(50)]
        public string Estado { get; set; } = "Pendiente";

        [Required]
        [MinLength(1)]
        public List<CreatePedidoDetalleDto> Detalles { get; set; } = new();
    }
}
