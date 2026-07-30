using ADStoreApi.Models;

namespace ADStoreApi.Repositories
{
    public interface IEntradaStockRepository
    {
        Task<IEnumerable<EntradaStock>> GetAllAsync();
        Task<EntradaStock?> GetByIdAsync(int id);
        Task<EntradaStock> CreateAsync(EntradaStock entradaStock);
    }
}
