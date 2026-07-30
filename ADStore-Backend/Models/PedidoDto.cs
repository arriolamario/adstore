namespace ADStoreBackend.Models
{
    public class PedidoDto
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public PedidosUsuariosDto Usuario { get; set; } = new();
        public string? UsuarioNombre { get; set; }
        public DateTime Fecha { get; set; }
        public decimal Total { get; set; }
        public string Estado { get; set; } = string.Empty;
        public List<PedidoDetalleDto> Detalles { get; set; } = new();
    }


    public class PedidosUsuariosDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
    }
}