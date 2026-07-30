using ADStoreApi.Data;
using ADStoreApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ADStoreApi.Repositories
{
    public class EntradaStockRepository : IEntradaStockRepository
    {
        private readonly ADStoreDbContext _context;

        public EntradaStockRepository(ADStoreDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EntradaStock>> GetAllAsync()
        {
            return await _context.EntradasStock
                .Include(e => e.Proveedor)
                .Include(e => e.Detalles)
                    .ThenInclude(d => d.ProductoTalle)
                        .ThenInclude(pt => pt.Producto)
                .OrderByDescending(e => e.Fecha)
                .ToListAsync();
        }

        public async Task<EntradaStock?> GetByIdAsync(int id)
        {
            return await _context.EntradasStock
                .Include(e => e.Proveedor)
                .Include(e => e.Detalles)
                    .ThenInclude(d => d.ProductoTalle)
                        .ThenInclude(pt => pt.Producto)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<EntradaStock> CreateAsync(EntradaStock entradaStock)
        {
            _context.EntradasStock.Add(entradaStock);
            await _context.SaveChangesAsync();
            return entradaStock;
        }
    }
}
