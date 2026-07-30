using ADStoreApi.Data;
using ADStoreApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ADStoreApi.Repositories
{
    public class ProductoTalleRepository : IProductoTalleRepository
    {
        private readonly ADStoreDbContext _context;

        public ProductoTalleRepository(ADStoreDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductoTalle>> GetByProductoIdAsync(int productoId)
        {
            return await _context.ProductoTalles
                .Where(t => t.ProductoId == productoId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<ProductoTalle?> GetByIdAsync(int id)
        {
            return await _context.ProductoTalles.FindAsync(id);
        }

        public async Task<ProductoTalle> CreateAsync(ProductoTalle talle)
        {
            _context.ProductoTalles.Add(talle);
            await _context.SaveChangesAsync();
            return talle;
        }

        public async Task<ProductoTalle> UpdateAsync(ProductoTalle talle)
        {
            _context.ProductoTalles.Update(talle);
            await _context.SaveChangesAsync();
            return talle;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var talle = await _context.ProductoTalles.FindAsync(id);
            if (talle == null)
                return false;

            _context.ProductoTalles.Remove(talle);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
