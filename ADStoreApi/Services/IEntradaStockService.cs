using ADStoreApi.DTOs;

namespace ADStoreApi.Services
{
    public interface IEntradaStockService
    {
        Task<IEnumerable<EntradaStockDto>> GetAllAsync();
        Task<EntradaStockDto?> GetByIdAsync(int id);
        Task<EntradaStockDto> CreateAsync(CreateEntradaStockDto createDto);
    }
}
