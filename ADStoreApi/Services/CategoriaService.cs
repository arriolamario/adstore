using ADStoreApi.DTOs;
using ADStoreApi.Models;
using ADStoreApi.Repositories;

namespace ADStoreApi.Services
{
    public class CategoriaService : ICategoriaService
    {
        private readonly ICategoriaRepository _repository;

        public CategoriaService(ICategoriaRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<CategoriaDto>> GetAllAsync()
        {
            var categorias = await _repository.GetAllAsync();
            return categorias.Select(MapToDto);
        }

        public async Task<CategoriaDto?> GetByIdAsync(int id)
        {
            var categoria = await _repository.GetByIdAsync(id);
            return categoria != null ? MapToDto(categoria) : null;
        }

        public async Task<CategoriaDto> CreateAsync(CreateCategoriaDto dto)
        {
            var categoria = new Categoria
            {
                Nombre = dto.Nombre,
                Activo = dto.Activo
            };

            var created = await _repository.CreateAsync(categoria);
            return MapToDto(created);
        }

        public async Task<CategoriaDto?> UpdateAsync(int id, UpdateCategoriaDto dto)
        {
            var categoria = await _repository.GetByIdAsync(id);
            if (categoria == null)
                return null;

            if (!string.IsNullOrWhiteSpace(dto.Nombre))
                categoria.Nombre = dto.Nombre;

            if (dto.Activo.HasValue)
                categoria.Activo = dto.Activo.Value;

            var updated = await _repository.UpdateAsync(categoria);
            return MapToDto(updated);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        private static CategoriaDto MapToDto(Categoria categoria)
        {
            return new CategoriaDto
            {
                Id = categoria.Id,
                Nombre = categoria.Nombre,
                Activo = categoria.Activo
            };
        }
    }
}
