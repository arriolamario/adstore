using ADStoreApi.DTOs;
using ADStoreApi.Models;
using ADStoreApi.Repositories;

namespace ADStoreApi.Services
{
    public class ProductoImagenService : IProductoImagenService
    {
        private readonly IProductoImagenRepository _repository;
        private readonly IProductoRepository _productoRepository;

        public ProductoImagenService(
            IProductoImagenRepository repository,
            IProductoRepository productoRepository)
        {
            _repository = repository;
            _productoRepository = productoRepository;
        }

        public async Task<IEnumerable<ProductoImagenDto>> GetAllAsync()
        {
            var imagenes = await _repository.GetAllAsync();
            return imagenes.Select(MapToDto);
        }

        public async Task<IEnumerable<ProductoImagenDto>> GetByProductoIdAsync(int productoId)
        {
            var imagenes = await _repository.GetByProductoIdAsync(productoId);
            return imagenes.Select(MapToDto);
        }

        public async Task<ProductoImagenDto?> GetByIdAsync(int id)
        {
            var imagen = await _repository.GetByIdAsync(id);
            return imagen != null ? MapToDto(imagen) : null;
        }

        public async Task<ProductoImagenDto> CreateAsync(CreateProductoImagenDto dto)
        {
            if (await _productoRepository.GetByIdAsync(dto.ProductoId) == null)
                throw new InvalidOperationException("Producto no encontrado");

            var productoImagen = new ProductoImagen
            {
                ProductoId = dto.ProductoId,
                RutaImagen = dto.RutaImagen,
                EsPrincipal = dto.EsPrincipal
            };

            var created = await _repository.CreateAsync(productoImagen);
            var withNav = await _repository.GetByIdAsync(created.Id) ?? created;
            return MapToDto(withNav);
        }

        public async Task<ProductoImagenDto?> UpdateAsync(int id, UpdateProductoImagenDto dto)
        {
            var productoImagen = await _repository.GetByIdAsync(id);
            if (productoImagen == null)
                return null;

            if (!string.IsNullOrWhiteSpace(dto.RutaImagen))
                productoImagen.RutaImagen = dto.RutaImagen;

            if (dto.EsPrincipal.HasValue && dto.EsPrincipal.Value)
            {
                // Si se marca como principal, desmarcar las demás imágenes del mismo producto
                var imagenesDelProducto = await _repository.GetByProductoIdAsync(productoImagen.ProductoId);
                foreach (var img in imagenesDelProducto.Where(i => i.Id != id && i.EsPrincipal))
                {
                    img.EsPrincipal = false;
                    await _repository.UpdateAsync(img);
                }
                
                productoImagen.EsPrincipal = true;
            }
            else if (dto.EsPrincipal.HasValue)
            {
                productoImagen.EsPrincipal = dto.EsPrincipal.Value;
            }

            var updated = await _repository.UpdateAsync(productoImagen);
            var withNav = await _repository.GetByIdAsync(updated.Id) ?? updated;
            return MapToDto(withNav);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        private static ProductoImagenDto MapToDto(ProductoImagen productoImagen)
        {
            return new ProductoImagenDto
            {
                Id = productoImagen.Id,
                ProductoId = productoImagen.ProductoId,
                RutaImagen = productoImagen.RutaImagen,
                EsPrincipal = productoImagen.EsPrincipal
            };
        }
    }
}
