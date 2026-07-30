namespace ADStoreApi.DTOs
{
    public class DetalleEntradaStockDto
    {
        public int DetalleEntradaStockId { get; set; }
        public int EntradaStockId { get; set; }
        public int ProductoTalleId { get; set; }
        public string ProductoNombre { get; set; } = string.Empty;
        public string Talle { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Subtotal { get; set; }
    }
}
