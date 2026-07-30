using ADStoreApi.DTOs;

namespace ADStoreApi.Services
{
    public interface IProductoImagenService
    {
        Task<IEnumerable<ProductoImagenDto>> GetAllAsync();
        Task<IEnumerable<ProductoImagenDto>> GetByProductoIdAsync(int productoId);
        Task<ProductoImagenDto?> GetByIdAsync(int id);
        Task<ProductoImagenDto> CreateAsync(CreateProductoImagenDto dto);
        Task<ProductoImagenDto?> UpdateAsync(int id, UpdateProductoImagenDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
