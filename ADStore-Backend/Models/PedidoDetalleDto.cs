namespace ADStoreBackend.Models
{
    public class PedidoDetalleDto
    {
        public int Id { get; set; }
        public int ProductoTalleId { get; set; }
        public string? ProductoNombre { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
    }
}