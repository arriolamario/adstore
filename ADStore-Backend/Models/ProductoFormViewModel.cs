using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace ADStoreBackend.Models
{
    public class ProductoFormViewModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre es obligatorio")]
        [MaxLength(150)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Descripcion { get; set; }

        [Required(ErrorMessage = "El precio es obligatorio")]
        [Range(0.01, 999999.99, ErrorMessage = "El precio debe ser mayor a 0")]
        public decimal Precio { get; set; }

        [Required(ErrorMessage = "La marca es obligatoria")]
        public int MarcaId { get; set; }

        [Required(ErrorMessage = "La categoría es obligatoria")]
        public int CategoriaId { get; set; }

        public int? ProveedorId { get; set; }

        public bool Activo { get; set; } = true;

        // Listas para los selects
        public List<SelectListItem> Marcas { get; set; } = new();
        public List<SelectListItem> Categorias { get; set; } = new();
        public List<SelectListItem> Proveedores { get; set; } = new();
    }
}