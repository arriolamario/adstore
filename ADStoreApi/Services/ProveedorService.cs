using ADStoreApi.DTOs;
using ADStoreApi.Models;
using ADStoreApi.Repositories;

namespace ADStoreApi.Services
{
    public class ProveedorService : IProveedorService
    {
        private readonly IProveedorRepository _proveedorRepository;

        public ProveedorService(IProveedorRepository proveedorRepository)
        {
            _proveedorRepository = proveedorRepository;
        }

        public async Task<IEnumerable<ProveedorDto>> GetAllAsync()
        {
            var proveedores = await _proveedorRepository.GetAllAsync();
            return proveedores.Select(p => new ProveedorDto
            {
                Id = p.Id,
                Nombre = p.Nombre,
                Telefono = p.Telefono,
                Direccion = p.Direccion,
                Activo = p.Activo
            });
        }

        public async Task<ProveedorDto?> GetByIdAsync(int id)
        {
            var proveedor = await _proveedorRepository.GetByIdAsync(id);
            if (proveedor == null)
                return null;

            return new ProveedorDto
            {
                Id = proveedor.Id,
                Nombre = proveedor.Nombre,
                Telefono = proveedor.Telefono,
                Direccion = proveedor.Direccion,
                Activo = proveedor.Activo
            };
        }

        public async Task<ProveedorDto> CreateAsync(CreateProveedorDto createDto)
        {
            // Validar nombre único
            if (await _proveedorRepository.ExistsNombreAsync(createDto.Nombre))
                throw new InvalidOperationException("Ya existe un proveedor con ese nombre");

            var proveedor = new Proveedor
            {
                Nombre = createDto.Nombre,
                Telefono = createDto.Telefono,
                Direccion = createDto.Direccion,
                Activo = true
            };

            var created = await _proveedorRepository.CreateAsync(proveedor);

            return new ProveedorDto
            {
                Id = created.Id,
                Nombre = created.Nombre,
                Telefono = created.Telefono,
                Direccion = created.Direccion,
                Activo = created.Activo
            };
        }

        public async Task<ProveedorDto> UpdateAsync(int id, UpdateProveedorDto updateDto)
        {
            var proveedor = await _proveedorRepository.GetByIdAsync(id);
            if (proveedor == null)
                throw new InvalidOperationException("Proveedor no encontrado");

            // Validar nombre único si se cambió
            if (await _proveedorRepository.ExistsNombreAsync(updateDto.Nombre, id))
                throw new InvalidOperationException("Ya existe un proveedor con ese nombre");

            proveedor.Nombre = updateDto.Nombre;
            proveedor.Telefono = updateDto.Telefono;
            proveedor.Direccion = updateDto.Direccion;
            proveedor.Activo = updateDto.Activo;

            var updated = await _proveedorRepository.UpdateAsync(proveedor);

            return new ProveedorDto
            {
                Id = updated.Id,
                Nombre = updated.Nombre,
                Telefono = updated.Telefono,
                Direccion = updated.Direccion,
                Activo = updated.Activo
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _proveedorRepository.ExistsAsync(id))
                throw new InvalidOperationException("Proveedor no encontrado");

            return await _proveedorRepository.DeleteAsync(id);
        }
    }
}
