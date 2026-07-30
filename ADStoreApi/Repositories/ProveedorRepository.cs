using ADStoreApi.Data;
using ADStoreApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ADStoreApi.Repositories
{
    public class ProveedorRepository : IProveedorRepository
    {
        private readonly ADStoreDbContext _context;

        public ProveedorRepository(ADStoreDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Proveedor>> GetAllAsync()
        {
            return await _context.Proveedores
                .OrderBy(p => p.Nombre)
                .ToListAsync();
        }

        public async Task<Proveedor?> GetByIdAsync(int id)
        {
            return await _context.Proveedores
                .Include(p => p.Productos)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Proveedor> CreateAsync(Proveedor proveedor)
        {
            _context.Proveedores.Add(proveedor);
            await _context.SaveChangesAsync();
            return proveedor;
        }

        public async Task<Proveedor> UpdateAsync(Proveedor proveedor)
        {
            _context.Entry(proveedor).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return proveedor;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var proveedor = await _context.Proveedores.FindAsync(id);
            if (proveedor == null)
                return false;

            _context.Proveedores.Remove(proveedor);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Proveedores.AnyAsync(p => p.Id == id);
        }

        public async Task<bool> ExistsNombreAsync(string nombre, int? excludeId = null)
        {
            if (excludeId.HasValue)
                return await _context.Proveedores.AnyAsync(p => p.Nombre == nombre && p.Id != excludeId.Value);
            
            return await _context.Proveedores.AnyAsync(p => p.Nombre == nombre);
        }
    }
}
