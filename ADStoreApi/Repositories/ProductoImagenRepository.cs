using ADStoreApi.Data;
using ADStoreApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ADStoreApi.Repositories
{
    public class ProductoImagenRepository : IProductoImagenRepository
    {
        private readonly ADStoreDbContext _context;

        public ProductoImagenRepository(ADStoreDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductoImagen>> GetAllAsync()
        {
            return await _context.ProductoImagenes
                .Include(i => i.Producto)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<ProductoImagen>> GetByProductoIdAsync(int productoId)
        {
            return await _context.ProductoImagenes
                .Where(i => i.ProductoId == productoId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<ProductoImagen?> GetByIdAsync(int id)
        {
            return await _context.ProductoImagenes
                .Include(i => i.Producto)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task<ProductoImagen> CreateAsync(ProductoImagen productoImagen)
        {
            _context.ProductoImagenes.Add(productoImagen);
            await _context.SaveChangesAsync();
            return productoImagen;
        }

        public async Task<ProductoImagen> UpdateAsync(ProductoImagen productoImagen)
        {
            _context.ProductoImagenes.Update(productoImagen);
            await _context.SaveChangesAsync();
            return productoImagen;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var productoImagen = await _context.ProductoImagenes.FindAsync(id);
            if (productoImagen == null)
                return false;

            _context.ProductoImagenes.Remove(productoImagen);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
