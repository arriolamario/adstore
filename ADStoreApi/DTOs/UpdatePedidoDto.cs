using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class UpdatePedidoDto
    {
        [MaxLength(50)]
        public string? Estado { get; set; }
    }
}
