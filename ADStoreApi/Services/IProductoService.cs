using ADStoreApi.DTOs;

namespace ADStoreApi.Services
{
    public interface IProductoService
    {
        Task<IEnumerable<ProductoDto>> GetAllAsync();
        Task<ProductoDto?> GetByIdAsync(int id);
        Task<ProductoDto?> GetByIdWithTallesAsync(int id);
        Task<ProductoDto> CreateAsync(CreateProductoDto dto);
        Task<ProductoDto?> UpdateAsync(int id, UpdateProductoDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
