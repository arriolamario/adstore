using ADStoreApi.DTOs;
using ADStoreApi.Models;
using ADStoreApi.Repositories;

namespace ADStoreApi.Services
{
    public class EntradaStockService : IEntradaStockService
    {
        private readonly IEntradaStockRepository _entradaStockRepository;
        private readonly IProveedorRepository _proveedorRepository;
        private readonly IProductoTalleRepository _productoTalleRepository;

        public EntradaStockService(
            IEntradaStockRepository entradaStockRepository,
            IProveedorRepository proveedorRepository,
            IProductoTalleRepository productoTalleRepository)
        {
            _entradaStockRepository = entradaStockRepository;
            _proveedorRepository = proveedorRepository;
            _productoTalleRepository = productoTalleRepository;
        }

        public async Task<IEnumerable<EntradaStockDto>> GetAllAsync()
        {
            var entradas = await _entradaStockRepository.GetAllAsync();
            return entradas.Select(MapToDto);
        }

        public async Task<EntradaStockDto?> GetByIdAsync(int id)
        {
            var entrada = await _entradaStockRepository.GetByIdAsync(id);
            return entrada != null ? MapToDto(entrada) : null;
        }

        public async Task<EntradaStockDto> CreateAsync(CreateEntradaStockDto createDto)
        {
            // Validar que existe el proveedor
            var proveedor = await _proveedorRepository.GetByIdAsync(createDto.ProveedorId);
            if (proveedor == null)
            {
                throw new Exception("El proveedor no existe");
            }

            // Validar que todos los ProductoTalle existen
            foreach (var detalle in createDto.Detalles)
            {
                var productoTalle = await _productoTalleRepository.GetByIdAsync(detalle.ProductoTalleId);
                if (productoTalle == null)
                {
                    throw new Exception($"El ProductoTalle con ID {detalle.ProductoTalleId} no existe");
                }
            }

            // Calcular monto total
            var montoTotal = createDto.Detalles.Sum(d => d.Cantidad * d.PrecioUnitario);

            // Crear la entrada de stock
            var entradaStock = new EntradaStock
            {
                ProveedorId = createDto.ProveedorId,
                Fecha = createDto.Fecha,
                NumeroDocumento = createDto.NumeroDocumento,
                Observaciones = createDto.Observaciones,
                MontoTotal = montoTotal,
                Detalles = createDto.Detalles.Select(d => new DetalleEntradaStock
                {
                    ProductoTalleId = d.ProductoTalleId,
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario,
                    Subtotal = d.Cantidad * d.PrecioUnitario
                }).ToList()
            };

            // Guardar entrada de stock
            var entradaCreada = await _entradaStockRepository.CreateAsync(entradaStock);

            // Actualizar stock de cada ProductoTalle
            foreach (var detalle in entradaCreada.Detalles)
            {
                var productoTalle = await _productoTalleRepository.GetByIdAsync(detalle.ProductoTalleId);
                if (productoTalle != null)
                {
                    productoTalle.Stock += detalle.Cantidad;
                    await _productoTalleRepository.UpdateAsync(productoTalle);
                }
            }

            // Recargar la entrada con todos los includes para el mapeo
            var entradaCompleta = await _entradaStockRepository.GetByIdAsync(entradaCreada.Id);
            return MapToDto(entradaCompleta!);
        }

        private EntradaStockDto MapToDto(EntradaStock entradaStock)
        {
            return new EntradaStockDto
            {
                EntradaStockId = entradaStock.Id,
                ProveedorId = entradaStock.ProveedorId,
                ProveedorNombre = entradaStock.Proveedor?.Nombre ?? string.Empty,
                Fecha = entradaStock.Fecha,
                NumeroDocumento = entradaStock.NumeroDocumento,
                Observaciones = entradaStock.Observaciones,
                MontoTotal = entradaStock.MontoTotal,
                Detalles = entradaStock.Detalles?.Select(d => new DetalleEntradaStockDto
                {
                    DetalleEntradaStockId = d.Id,
                    EntradaStockId = d.EntradaStockId,
                    ProductoTalleId = d.ProductoTalleId,
                    ProductoNombre = d.ProductoTalle?.Producto?.Nombre ?? string.Empty,
                    Talle = d.ProductoTalle?.Talle ?? string.Empty,
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario,
                    Subtotal = d.Subtotal
                }).ToList() ?? new List<DetalleEntradaStockDto>()
            };
        }
    }
}
