using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace ADStoreBackend.Models
{
    public class EntradaStockFormViewModel
    {
        [Required(ErrorMessage = "El proveedor es obligatorio")]
        public int ProveedorId { get; set; }

        [Required(ErrorMessage = "La fecha es obligatoria")]
        public DateTime Fecha { get; set; } = DateTime.Today;

        [Required(ErrorMessage = "El número de documento es obligatorio")]
        [MaxLength(50)]
        public string NumeroDocumento { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Observaciones { get; set; }

        public List<DetalleEntradaStockFormItem> Detalles { get; set; } = new();

        // Listas para selects
        public List<SelectListItem> Proveedores { get; set; } = new();
        public List<SelectListItem> Productos { get; set; } = new();
    }

    public class DetalleEntradaStockFormItem
    {
        public int ProductoTalleId { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
    }
}