namespace ADStoreApi.DTOs
{
    public class EntradaStockDto
    {
        public int EntradaStockId { get; set; }
        public int ProveedorId { get; set; }
        public string ProveedorNombre { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public string NumeroDocumento { get; set; } = string.Empty;
        public string? Observaciones { get; set; }
        public decimal MontoTotal { get; set; }
        public List<DetalleEntradaStockDto> Detalles { get; set; } = new();
    }
}
