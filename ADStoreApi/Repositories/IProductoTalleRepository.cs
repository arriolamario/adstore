using ADStoreApi.Models;

namespace ADStoreApi.Repositories
{
    public interface IProductoTalleRepository
    {
        Task<IEnumerable<ProductoTalle>> GetByProductoIdAsync(int productoId);
        Task<ProductoTalle?> GetByIdAsync(int id);
        Task<ProductoTalle> CreateAsync(ProductoTalle talle);
        Task<ProductoTalle> UpdateAsync(ProductoTalle talle);
        Task<bool> DeleteAsync(int id);
    }
}
