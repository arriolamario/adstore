using System.ComponentModel.DataAnnotations;

namespace ADStoreApi.DTOs
{
    public class AjustarStockDto
    {
        [Required]
        public int ProductoTalleId { get; set; }
        
        [Required]
        public int Cantidad { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string Motivo { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(20)]
        public string TipoMovimiento { get; set; } = "Entrada"; // Entrada, Salida, Ajuste
    }
}
