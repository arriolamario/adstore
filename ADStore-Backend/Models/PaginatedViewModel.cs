namespace ADStoreBackend.Models
{
    public interface IPaginationInfo
    {
        int PaginaActual { get; }
        int TotalPaginas { get; }
        int TotalItems { get; }
        int PorPagina { get; }
        bool TienePaginaAnterior { get; }
        bool TienePaginaSiguiente { get; }
    }

    public class PaginatedViewModel<T> : IPaginationInfo
    {
        public List<T> Items { get; set; } = new();
        public int PaginaActual { get; set; }
        public int TotalPaginas { get; set; }
        public int TotalItems { get; set; }
        public int PorPagina { get; set; }

        public bool TienePaginaAnterior => PaginaActual > 1;
        public bool TienePaginaSiguiente => PaginaActual < TotalPaginas;

        public static PaginatedViewModel<T> Crear(IEnumerable<T> source, int pagina, int porPagina = 10)
        {
            var lista = source.ToList();
            var total = lista.Count;
            var totalPaginas = (int)Math.Ceiling(total / (double)porPagina);
            pagina = Math.Max(1, Math.Min(pagina, Math.Max(1, totalPaginas)));

            return new PaginatedViewModel<T>
            {
                Items = lista.Skip((pagina - 1) * porPagina).Take(porPagina).ToList(),
                PaginaActual = pagina,
                TotalPaginas = Math.Max(1, totalPaginas),
                TotalItems = total,
                PorPagina = porPagina
            };
        }
    }
}
