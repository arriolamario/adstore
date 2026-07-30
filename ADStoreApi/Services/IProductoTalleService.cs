using ADStoreApi.DTOs;

namespace ADStoreApi.Services
{
    public interface IProductoTalleService
    {
        Task<IEnumerable<ProductoTalleDto>> GetByProductoIdAsync(int productoId);
        Task<ProductoTalleDto?> GetByIdAsync(int id);
        Task<ProductoTalleDto> CreateAsync(CreateProductoTalleDto dto);
        Task<ProductoTalleDto?> UpdateAsync(int id, UpdateProductoTalleDto dto);
        Task<bool> DeleteAsync(int id);
        Task<ProductoTalleDto?> AjustarStockAsync(AjustarStockDto dto);
    }
}
