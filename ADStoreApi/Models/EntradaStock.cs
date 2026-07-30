namespace ADStoreApi.Models
{
    public class EntradaStock
    {
        public int Id { get; set; }
        public int ProveedorId { get; set; }
        public Proveedor Proveedor { get; set; } = null!;
        public DateTime Fecha { get; set; }
        public string NumeroDocumento { get; set; } = string.Empty;
        public string? Observaciones { get; set; }
        public decimal MontoTotal { get; set; }
        public ICollection<DetalleEntradaStock> Detalles { get; set; } = new List<DetalleEntradaStock>();
    }
}
