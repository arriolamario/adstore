using Microsoft.EntityFrameworkCore;
using ADStoreApi.Models;

namespace ADStoreApi.Data
{
    public class ADStoreDbContext : DbContext
    {
        public ADStoreDbContext(DbContextOptions<ADStoreDbContext> options)
            : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Marca> Marcas { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Proveedor> Proveedores { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<ProductoTalle> ProductoTalles { get; set; }
        public DbSet<ProductoImagen> ProductoImagenes { get; set; }
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<PedidoDetalle> PedidoDetalles { get; set; }
        public DbSet<EntradaStock> EntradasStock { get; set; }
        public DbSet<DetalleEntradaStock> DetallesEntradaStock { get; set; }
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Producto>()
                .Property(p => p.Precio)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<Pedido>()
                .Property(p => p.Total)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<PedidoDetalle>()
                .Property(d => d.PrecioUnitario)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<EntradaStock>()
                .Property(e => e.MontoTotal)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<DetalleEntradaStock>()
                .Property(d => d.PrecioUnitario)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<DetalleEntradaStock>()
                .Property(d => d.Subtotal)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<Marca>()
                .HasMany(m => m.Productos)
                .WithOne(p => p.Marca)
                .HasForeignKey(p => p.MarcaId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Categoria>()
                .HasMany(c => c.Productos)
                .WithOne(p => p.Categoria)
                .HasForeignKey(p => p.CategoriaId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Proveedor>()
                .HasIndex(pr => pr.Nombre)
                .IsUnique();

            modelBuilder.Entity<Proveedor>()
                .HasMany(pr => pr.Productos)
                .WithOne(p => p.Proveedor)
                .HasForeignKey(p => p.ProveedorId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Producto>()
                .HasMany(p => p.ProductoTalles)
                .WithOne(t => t.Producto)
                .HasForeignKey(t => t.ProductoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Producto>()
                .HasMany(p => p.ProductoImagenes)
                .WithOne(i => i.Producto)
                .HasForeignKey(i => i.ProductoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Pedido>()
                .HasMany(p => p.PedidoDetalles)
                .WithOne(d => d.Pedido)
                .HasForeignKey(d => d.PedidoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductoTalle>()
                .HasMany<PedidoDetalle>()
                .WithOne(d => d.ProductoTalle)
                .HasForeignKey(d => d.ProductoTalleId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<EntradaStock>()
                .HasMany(e => e.Detalles)
                .WithOne(d => d.EntradaStock)
                .HasForeignKey(d => d.EntradaStockId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductoTalle>()
                .HasMany<DetalleEntradaStock>()
                .WithOne(d => d.ProductoTalle)
                .HasForeignKey(d => d.ProductoTalleId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Proveedor>()
                .HasMany<EntradaStock>()
                .WithOne(e => e.Proveedor)
                .HasForeignKey(e => e.ProveedorId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
