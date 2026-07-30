using ADStoreApi.DTOs;

namespace ADStoreApi.Services
{
    public interface ICategoriaService
    {
        Task<IEnumerable<CategoriaDto>> GetAllAsync();
        Task<CategoriaDto?> GetByIdAsync(int id);
        Task<CategoriaDto> CreateAsync(CreateCategoriaDto dto);
        Task<CategoriaDto?> UpdateAsync(int id, UpdateCategoriaDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
