using ADStoreApi.Models;

namespace ADStoreApi.Repositories
{
    public interface IProductoImagenRepository
    {
        Task<IEnumerable<ProductoImagen>> GetAllAsync();
        Task<IEnumerable<ProductoImagen>> GetByProductoIdAsync(int productoId);
        Task<ProductoImagen?> GetByIdAsync(int id);
        Task<ProductoImagen> CreateAsync(ProductoImagen productoImagen);
        Task<ProductoImagen> UpdateAsync(ProductoImagen productoImagen);
        Task<bool> DeleteAsync(int id);
    }
}
