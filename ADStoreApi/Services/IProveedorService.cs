using ADStoreApi.DTOs;

namespace ADStoreApi.Services
{
    public interface IProveedorService
    {
        Task<IEnumerable<ProveedorDto>> GetAllAsync();
        Task<ProveedorDto?> GetByIdAsync(int id);
        Task<ProveedorDto> CreateAsync(CreateProveedorDto createDto);
        Task<ProveedorDto> UpdateAsync(int id, UpdateProveedorDto updateDto);
        Task<bool> DeleteAsync(int id);
    }
}
