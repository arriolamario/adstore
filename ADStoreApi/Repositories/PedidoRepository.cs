using ADStoreApi.Data;
using ADStoreApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ADStoreApi.Repositories
{
    public class PedidoRepository : IPedidoRepository
    {
        private readonly ADStoreDbContext _context;

        public PedidoRepository(ADStoreDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Pedido>> GetAllAsync()
        {
            return await _context.Pedidos
                .Include(p => p.Usuario)
                .Include(p => p.PedidoDetalles)
                .ThenInclude(pd => pd.ProductoTalle)
                .ThenInclude(pt => pt.Producto)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Pedido>> GetByUsuarioIdAsync(int usuarioId)
        {
            return await _context.Pedidos
                .Include(p => p.Usuario)
                .Include(p => p.PedidoDetalles)
                .ThenInclude(pd => pd.ProductoTalle)
                .ThenInclude(pt => pt.Producto)
                .Where(p => p.UsuarioId == usuarioId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Pedido?> GetByIdAsync(int id)
        {
            return await _context.Pedidos
                .Include(p => p.Usuario)
                .Include(p => p.PedidoDetalles)
                .ThenInclude(pd => pd.ProductoTalle)
                .ThenInclude(pt => pt.Producto)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Pedido> CreateAsync(Pedido pedido)
        {
            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();
            return pedido;
        }

        public async Task<Pedido> UpdateAsync(Pedido pedido)
        {
            _context.Pedidos.Update(pedido);
            await _context.SaveChangesAsync();
            return pedido;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var pedido = await _context.Pedidos.FindAsync(id);
            if (pedido == null)
                return false;

            _context.Pedidos.Remove(pedido);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
