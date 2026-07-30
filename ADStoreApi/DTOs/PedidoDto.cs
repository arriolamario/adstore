using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class PedidoDto
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public PedidoUsuarioDto Usuario { get; set; } = new();
        public DateTime Fecha { get; set; }
        public decimal Total { get; set; }
        public string Estado { get; set; } = string.Empty;
        public List<PedidoDetalleDto> Detalles { get; set; } = new();
    }
}
