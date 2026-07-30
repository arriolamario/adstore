using ADStoreApi.Data;
using ADStoreApi.DTOs;
using ADStoreApi.Models;
using ADStoreApi.Repositories;

namespace ADStoreApi.Services
{
    public class PedidoService : IPedidoService
    {
        private readonly IPedidoRepository _repository;
        private readonly IProductoTalleRepository _productoTalleRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly ADStoreDbContext _context;

        public PedidoService(
            IPedidoRepository repository,
            IProductoTalleRepository productoTalleRepository,
            IUsuarioRepository usuarioRepository,
            ADStoreDbContext context)
        {
            _repository = repository;
            _productoTalleRepository = productoTalleRepository;
            _usuarioRepository = usuarioRepository;
            _context = context;
        }

        public async Task<IEnumerable<PedidoDto>> GetAllAsync()
        {
            var pedidos = await _repository.GetAllAsync();
            return pedidos.Select(MapToDto);
        }

        public async Task<IEnumerable<PedidoDto>> GetByUsuarioIdAsync(int usuarioId)
        {
            var pedidos = await _repository.GetByUsuarioIdAsync(usuarioId);
            return pedidos.Select(MapToDto);
        }

        public async Task<PedidoDto?> GetByIdAsync(int id)
        {
            var pedido = await _repository.GetByIdAsync(id);
            return pedido != null ? MapToDto(pedido) : null;
        }

        public async Task<PedidoDto> CreateAsync(CreatePedidoDto dto)
        {
            if (await _usuarioRepository.GetByIdAsync(dto.UsuarioId) == null)
                throw new InvalidOperationException("Usuario no encontrado");

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var detalles = new List<PedidoDetalle>();

                foreach (var item in dto.Detalles)
                {
                    var productoTalle = await _productoTalleRepository.GetByIdAsync(item.ProductoTalleId);
                    if (productoTalle == null)
                        throw new InvalidOperationException("Talle de producto no encontrado");

                    if (productoTalle.Stock < item.Cantidad)
                        throw new InvalidOperationException($"Stock insuficiente para el talle {productoTalle.Talle}");

                    productoTalle.Stock -= item.Cantidad;
                    await _productoTalleRepository.UpdateAsync(productoTalle);

                    detalles.Add(new PedidoDetalle
                    {
                        ProductoTalleId = item.ProductoTalleId,
                        Cantidad = item.Cantidad,
                        PrecioUnitario = item.PrecioUnitario
                    });
                }

                var pedido = new Pedido
                {
                    UsuarioId = dto.UsuarioId,
                    Fecha = DateTime.UtcNow,
                    Estado = dto.Estado,
                    Total = detalles.Sum(d => d.Cantidad * d.PrecioUnitario),
                    PedidoDetalles = detalles
                };

                var created = await _repository.CreateAsync(pedido);
                await transaction.CommitAsync();

                var withNav = await _repository.GetByIdAsync(created.Id) ?? created;
                return MapToDto(withNav);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<PedidoDto?> UpdateAsync(int id, UpdatePedidoDto dto)
        {
            var pedido = await _repository.GetByIdAsync(id);
            if (pedido == null)
                return null;

            var estadoAnterior = pedido.Estado;

            if (!string.IsNullOrWhiteSpace(dto.Estado))
                pedido.Estado = dto.Estado;

            if (pedido.Estado == "Rechazado" && estadoAnterior != "Rechazado")
            {
                await using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    foreach (var detalle in pedido.PedidoDetalles)
                    {
                        var productoTalle = await _productoTalleRepository.GetByIdAsync(detalle.ProductoTalleId);
                        if (productoTalle != null)
                        {
                            productoTalle.Stock += detalle.Cantidad;
                            await _productoTalleRepository.UpdateAsync(productoTalle);
                        }
                    }

                    var updated = await _repository.UpdateAsync(pedido);
                    await transaction.CommitAsync();

                    var withNav = await _repository.GetByIdAsync(updated.Id) ?? updated;
                    return MapToDto(withNav);
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }

            var result = await _repository.UpdateAsync(pedido);
            var resultWithNav = await _repository.GetByIdAsync(result.Id) ?? result;
            return MapToDto(resultWithNav);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        private static PedidoDto MapToDto(Pedido pedido)
        {
            return new PedidoDto
            {
                Id = pedido.Id,
                UsuarioId = pedido.UsuarioId,
                Usuario = new PedidoUsuarioDto
                {
                    Id = pedido.UsuarioId,
                    Nombre = pedido.Usuario?.Nombre ?? string.Empty,
                    Email = pedido.Usuario?.Email ?? string.Empty,
                    Rol = pedido.Usuario?.Rol ?? string.Empty
                },
                Fecha = pedido.Fecha,
                Total = pedido.Total,
                Estado = pedido.Estado,
                Detalles = pedido.PedidoDetalles.Select(d => new PedidoDetalleDto
                {
                    Id = d.Id,
                    ProductoTalleId = d.ProductoTalleId,
                    ProductoNombre = d.ProductoTalle?.Producto?.Nombre,
                    Cantidad = d.Cantidad,
                    PrecioUnitario = d.PrecioUnitario
                }).ToList()
            };
        }
    }
}
