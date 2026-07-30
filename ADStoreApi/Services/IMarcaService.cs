using ADStoreApi.DTOs;

namespace ADStoreApi.Services
{
    public interface IMarcaService
    {
        Task<IEnumerable<MarcaDto>> GetAllAsync();
        Task<MarcaDto?> GetByIdAsync(int id);
        Task<MarcaDto> CreateAsync(CreateMarcaDto dto);
        Task<MarcaDto?> UpdateAsync(int id, UpdateMarcaDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
