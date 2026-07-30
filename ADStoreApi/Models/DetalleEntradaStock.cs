namespace ADStoreApi.Models
{
    public class DetalleEntradaStock
    {
        public int Id { get; set; }
        public int EntradaStockId { get; set; }
        public EntradaStock EntradaStock { get; set; } = null!;
        public int ProductoTalleId { get; set; }
        public ProductoTalle ProductoTalle { get; set; } = null!;
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Subtotal { get; set; }
    }
}
