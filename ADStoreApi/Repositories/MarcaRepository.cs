using ADStoreApi.Data;
using ADStoreApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ADStoreApi.Repositories
{
    public class MarcaRepository : IMarcaRepository
    {
        private readonly ADStoreDbContext _context;

        public MarcaRepository(ADStoreDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Marca>> GetAllAsync()
        {
            return await _context.Marcas.AsNoTracking().ToListAsync();
        }

        public async Task<Marca?> GetByIdAsync(int id)
        {
            return await _context.Marcas.FindAsync(id);
        }

        public async Task<Marca> CreateAsync(Marca marca)
        {
            _context.Marcas.Add(marca);
            await _context.SaveChangesAsync();
            return marca;
        }

        public async Task<Marca> UpdateAsync(Marca marca)
        {
            _context.Marcas.Update(marca);
            await _context.SaveChangesAsync();
            return marca;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var marca = await GetByIdAsync(id);
            if (marca == null)
                return false;

            _context.Marcas.Remove(marca);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
