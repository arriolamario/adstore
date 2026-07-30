using Microsoft.AspNetCore.Mvc.Rendering;
using System.ComponentModel.DataAnnotations;

namespace ADStoreBackend.Models
{
    public class PedidoEditViewModel
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public string? UsuarioNombre { get; set; }
        public DateTime Fecha { get; set; }
        public decimal Total { get; set; }
        public List<PedidoDetalleDto> Detalles { get; set; } = new();

        [Required(ErrorMessage = "El estado es obligatorio")]
        public string Estado { get; set; } = string.Empty;

        public List<SelectListItem> Estados { get; set; } = new()
        {
            new("Pendiente",   "Pendiente"),
            new("Pagado",      "Pagado"),
            new("Enviado",     "Enviado"),
            new("Entregado",   "Entregado"),
            new("Rechazado",   "Rechazado"),
        };
    }
}