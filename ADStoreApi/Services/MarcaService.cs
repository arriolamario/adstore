using ADStoreApi.DTOs;
using ADStoreApi.Models;
using ADStoreApi.Repositories;

namespace ADStoreApi.Services
{
    public class MarcaService : IMarcaService
    {
        private readonly IMarcaRepository _repository;

        public MarcaService(IMarcaRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<MarcaDto>> GetAllAsync()
        {
            var marcas = await _repository.GetAllAsync();
            return marcas.Select(MapToDto);
        }

        public async Task<MarcaDto?> GetByIdAsync(int id)
        {
            var marca = await _repository.GetByIdAsync(id);
            return marca != null ? MapToDto(marca) : null;
        }

        public async Task<MarcaDto> CreateAsync(CreateMarcaDto dto)
        {
            var marca = new Marca
            {
                Nombre = dto.Nombre,
                Activo = dto.Activo
            };

            var created = await _repository.CreateAsync(marca);
            return MapToDto(created);
        }

        public async Task<MarcaDto?> UpdateAsync(int id, UpdateMarcaDto dto)
        {
            var marca = await _repository.GetByIdAsync(id);
            if (marca == null)
                return null;

            if (!string.IsNullOrWhiteSpace(dto.Nombre))
                marca.Nombre = dto.Nombre;

            if (dto.Activo.HasValue)
                marca.Activo = dto.Activo.Value;

            var updated = await _repository.UpdateAsync(marca);
            return MapToDto(updated);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        private static MarcaDto MapToDto(Marca marca)
        {
            return new MarcaDto
            {
                Id = marca.Id,
                Nombre = marca.Nombre,
                Activo = marca.Activo
            };
        }
    }
}
