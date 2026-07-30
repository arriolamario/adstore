using ADStoreApi.DTOs;
using ADStoreApi.Models;
using ADStoreApi.Repositories;

namespace ADStoreApi.Services
{
    public class ProductoService : IProductoService
    {
        private readonly IProductoRepository _repository;
        private readonly IMarcaRepository _marcaRepository;
        private readonly ICategoriaRepository _categoriaRepository;
        private readonly IProveedorRepository _proveedorRepository;
        private readonly IConfiguration _configuration;

        public ProductoService(
            IProductoRepository repository,
            IMarcaRepository marcaRepository,
            ICategoriaRepository categoriaRepository,
            IProveedorRepository proveedorRepository,
            IConfiguration configuration)
        {
            _repository = repository;
            _marcaRepository = marcaRepository;
            _categoriaRepository = categoriaRepository;
            _proveedorRepository = proveedorRepository;
            _configuration = configuration;
        }

        public async Task<IEnumerable<ProductoDto>> GetAllAsync()
        {
            var productos = await _repository.GetAllAsync();
            return productos.Select(MapToDto);
        }

        public async Task<ProductoDto?> GetByIdAsync(int id)
        {
            var producto = await _repository.GetByIdAsync(id);
            return producto != null ? MapToDto(producto) : null;
        }

        public async Task<ProductoDto?> GetByIdWithTallesAsync(int id)
        {
            var producto = await _repository.GetByIdWithTallesAsync(id);
            return producto != null ? MapToDto(producto) : null;
        }

        public async Task<ProductoDto> CreateAsync(CreateProductoDto dto)
        {
            await ValidateMarcaCategoriaProveedor(dto.MarcaId, dto.CategoriaId, dto.ProveedorId);

            var producto = new Producto
            {
                Nombre = dto.Nombre,
                Descripcion = dto.Descripcion,
                Precio = dto.Precio,
                MarcaId = dto.MarcaId,
                CategoriaId = dto.CategoriaId,
                ProveedorId = dto.ProveedorId,
                Activo = dto.Activo
            };

            var created = await _repository.CreateAsync(producto);
            var withNav = await _repository.GetByIdAsync(created.Id) ?? created;
            return MapToDto(withNav);
        }

        public async Task<ProductoDto?> UpdateAsync(int id, UpdateProductoDto dto)
        {
            var producto = await _repository.GetByIdAsync(id);
            if (producto == null)
                return null;

            if (!string.IsNullOrWhiteSpace(dto.Nombre))
                producto.Nombre = dto.Nombre;

            if (dto.Descripcion != null)
                producto.Descripcion = dto.Descripcion;

            if (dto.Precio.HasValue)
                producto.Precio = dto.Precio.Value;

            if (dto.MarcaId.HasValue)
            {
                await ValidateMarcaCategoriaProveedor(dto.MarcaId.Value, producto.CategoriaId, producto.ProveedorId);
                producto.MarcaId = dto.MarcaId.Value;
            }

            if (dto.CategoriaId.HasValue)
            {
                await ValidateMarcaCategoriaProveedor(producto.MarcaId, dto.CategoriaId.Value, producto.ProveedorId);
                producto.CategoriaId = dto.CategoriaId.Value;
            }

            if (dto.ProveedorId.HasValue)
            {
                await ValidateMarcaCategoriaProveedor(producto.MarcaId, producto.CategoriaId, dto.ProveedorId.Value);
                producto.ProveedorId = dto.ProveedorId.Value;
            }

            if (dto.Activo.HasValue)
                producto.Activo = dto.Activo.Value;

            var updated = await _repository.UpdateAsync(producto);
            var withNav = await _repository.GetByIdAsync(updated.Id) ?? updated;
            return MapToDto(withNav);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        private async Task ValidateMarcaCategoriaProveedor(int marcaId, int categoriaId, int? proveedorId)
        {
            if (await _marcaRepository.GetByIdAsync(marcaId) == null)
                throw new InvalidOperationException("Marca no encontrada");

            if (await _categoriaRepository.GetByIdAsync(categoriaId) == null)
                throw new InvalidOperationException("Categoria no encontrada");

            if (proveedorId.HasValue && await _proveedorRepository.GetByIdAsync(proveedorId.Value) == null)
                throw new InvalidOperationException("Proveedor no encontrado");
        }

        private ProductoDto MapToDto(Producto producto)
        {
            var baseUrl = _configuration["App:BaseUrl"] ?? "";

            var imagenes = producto.ProductoImagenes.Select(i =>
            {
                return new ProductoImagenDto
                {
                    Id = i.Id,
                    ProductoId = i.ProductoId,
                    RutaImagen = i.RutaImagen,
                    UrlImagen = !string.IsNullOrEmpty(i.RutaImagen) ? $"{baseUrl}{i.RutaImagen}" : string.Empty,
                    EsPrincipal = i.EsPrincipal
                };
            }).ToList();

            var imagenPrincipal = imagenes.FirstOrDefault(i => i.EsPrincipal)?.UrlImagen
                                  ?? imagenes.FirstOrDefault()?.UrlImagen;

            return new ProductoDto
            {
                Id = producto.Id,
                Nombre = producto.Nombre,
                Descripcion = producto.Descripcion,
                Precio = producto.Precio,
                MarcaId = producto.MarcaId,
                MarcaNombre = producto.Marca?.Nombre,
                CategoriaId = producto.CategoriaId,
                CategoriaNombre = producto.Categoria?.Nombre,
                ProveedorId = producto.ProveedorId,
                ProveedorNombre = producto.Proveedor?.Nombre,
                Activo = producto.Activo,
                ImagenPrincipal = imagenPrincipal,
                StockTotal = producto.ProductoTalles?.Sum(t => t.Stock) ?? 0,
                Imagenes = imagenes
            };
        }
    }
}
