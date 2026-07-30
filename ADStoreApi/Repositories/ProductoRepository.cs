using ADStoreApi.Data;
using ADStoreApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ADStoreApi.Repositories
{
    public class ProductoRepository : IProductoRepository
    {
        private readonly ADStoreDbContext _context;

        public ProductoRepository(ADStoreDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Producto>> GetAllAsync()
        {
            return await _context.Productos
                .Include(p => p.Marca)
                .Include(p => p.Categoria)
                .Include(p => p.Proveedor)
                .Include(p => p.ProductoImagenes)
                .Include(p => p.ProductoTalles)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Producto?> GetByIdAsync(int id)
        {
            return await _context.Productos
                .Include(p => p.Marca)
                .Include(p => p.Categoria)
                .Include(p => p.Proveedor)
                .Include(p => p.ProductoImagenes)
                .Include(p => p.ProductoTalles)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Producto?> GetByIdWithTallesAsync(int id)
        {
            return await _context.Productos
                .Include(p => p.Marca)
                .Include(p => p.Categoria)
                .Include(p => p.Proveedor)
                .Include(p => p.ProductoTalles)
                .Include(p => p.ProductoImagenes)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Producto> CreateAsync(Producto producto)
        {
            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();
            return producto;
        }

        public async Task<Producto> UpdateAsync(Producto producto)
        {
            _context.Productos.Update(producto);
            await _context.SaveChangesAsync();
            return producto;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null)
                return false;

            _context.Productos.Remove(producto);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
