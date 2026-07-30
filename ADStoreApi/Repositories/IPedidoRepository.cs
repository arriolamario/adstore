using ADStoreApi.Models;

namespace ADStoreApi.Repositories
{
    public interface IPedidoRepository
    {
        Task<IEnumerable<Pedido>> GetAllAsync();
        Task<IEnumerable<Pedido>> GetByUsuarioIdAsync(int usuarioId);
        Task<Pedido?> GetByIdAsync(int id);
        Task<Pedido> CreateAsync(Pedido pedido);
        Task<Pedido> UpdateAsync(Pedido pedido);
        Task<bool> DeleteAsync(int id);
    }
}
