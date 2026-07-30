using ADStoreApi.DTOs;
using ADStoreApi.Models;
using ADStoreApi.Repositories;

namespace ADStoreApi.Services
{
    public class ProductoTalleService : IProductoTalleService
    {
        private readonly IProductoTalleRepository _repository;
        private readonly IProductoRepository _productoRepository;

        public ProductoTalleService(IProductoTalleRepository repository, IProductoRepository productoRepository)
        {
            _repository = repository;
            _productoRepository = productoRepository;
        }

        public async Task<IEnumerable<ProductoTalleDto>> GetByProductoIdAsync(int productoId)
        {
            var talles = await _repository.GetByProductoIdAsync(productoId);
            return talles.Select(MapToDto);
        }

        public async Task<ProductoTalleDto?> GetByIdAsync(int id)
        {
            var talle = await _repository.GetByIdAsync(id);
            return talle != null ? MapToDto(talle) : null;
        }

        public async Task<ProductoTalleDto> CreateAsync(CreateProductoTalleDto dto)
        {
            if (await _productoRepository.GetByIdAsync(dto.ProductoId) == null)
                throw new InvalidOperationException("Producto no encontrado");

            var talle = new ProductoTalle
            {
                ProductoId = dto.ProductoId,
                Talle = dto.Talle,
                Stock = dto.Stock
            };

            var created = await _repository.CreateAsync(talle);
            return MapToDto(created);
        }

        public async Task<ProductoTalleDto?> UpdateAsync(int id, UpdateProductoTalleDto dto)
        {
            var talle = await _repository.GetByIdAsync(id);
            if (talle == null)
                return null;

            if (!string.IsNullOrWhiteSpace(dto.Talle))
                talle.Talle = dto.Talle;

            if (dto.Stock.HasValue)
                talle.Stock = dto.Stock.Value;

            var updated = await _repository.UpdateAsync(talle);
            return MapToDto(updated);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        public async Task<ProductoTalleDto?> AjustarStockAsync(AjustarStockDto dto)
        {
            var talle = await _repository.GetByIdAsync(dto.ProductoTalleId);
            if (talle == null)
                throw new InvalidOperationException($"Talle con ID {dto.ProductoTalleId} no encontrado");

            // Calcular el nuevo stock según el tipo de movimiento
            int nuevoStock = talle.Stock;
            
            switch (dto.TipoMovimiento.ToUpper())
            {
                case "ENTRADA":
                    nuevoStock += dto.Cantidad;
                    break;
                case "SALIDA":
                    nuevoStock -= dto.Cantidad;
                    if (nuevoStock < 0)
                        throw new InvalidOperationException("El stock no puede ser negativo");
                    break;
                case "AJUSTE":
                    nuevoStock = dto.Cantidad;
                    break;
                default:
                    throw new InvalidOperationException("Tipo de movimiento no válido. Use: Entrada, Salida o Ajuste");
            }

            talle.Stock = nuevoStock;
            var updated = await _repository.UpdateAsync(talle);
            return MapToDto(updated);
        }

        private static ProductoTalleDto MapToDto(ProductoTalle talle)
        {
            return new ProductoTalleDto
            {
                Id = talle.Id,
                ProductoId = talle.ProductoId,
                Talle = talle.Talle,
                Stock = talle.Stock
            };
        }
    }
}
