using ADStoreApi.DTOs;

namespace ADStoreApi.Services
{
    public interface IPedidoService
    {
        Task<IEnumerable<PedidoDto>> GetAllAsync();
        Task<IEnumerable<PedidoDto>> GetByUsuarioIdAsync(int usuarioId);
        Task<PedidoDto?> GetByIdAsync(int id);
        Task<PedidoDto> CreateAsync(CreatePedidoDto dto);
        Task<PedidoDto?> UpdateAsync(int id, UpdatePedidoDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
