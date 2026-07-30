using ADStoreApi.Models;

namespace ADStoreApi.Repositories
{
    public interface IMarcaRepository
    {
        Task<IEnumerable<Marca>> GetAllAsync();
        Task<Marca?> GetByIdAsync(int id);
        Task<Marca> CreateAsync(Marca marca);
        Task<Marca> UpdateAsync(Marca marca);
        Task<bool> DeleteAsync(int id);
    }
}
