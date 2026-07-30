namespace ADStoreBackend.Models
{
    public class ProductoDto
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public decimal Precio { get; set; }
        public int MarcaId { get; set; }
        public string? MarcaNombre { get; set; }
        public int CategoriaId { get; set; }
        public string? CategoriaNombre { get; set; }
        public int? ProveedorId { get; set; }
        public string? ProveedorNombre { get; set; }
        public bool Activo { get; set; }
        public string? ImagenPrincipal { get; set; }
        public List<ProductoImagenDto> Imagenes { get; set; } = new();
    }
}