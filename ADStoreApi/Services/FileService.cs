using ADStoreApi.DTOs;

namespace ADStoreApi.Services
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<FileService> _logger;
        private readonly IProductoService _productoService;
        private readonly IProductoImagenService _productoImagenService;
        private readonly IConfiguration _configuration;
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
        private const long MaxFileSize = 2 * 1024 * 1024; // 2MB

        public FileService(
            IWebHostEnvironment environment, 
            ILogger<FileService> logger,
            IProductoService productoService,
            IProductoImagenService productoImagenService, 
            IConfiguration configuration)
        {
            _environment = environment;
            _logger = logger;
            _productoService = productoService;
            _productoImagenService = productoImagenService;
            _configuration = configuration;
        }

        public bool ValidateImageFile(IFormFile file, out string errorMessage)
        {
            errorMessage = string.Empty;

            if (file == null || file.Length == 0)
            {
                errorMessage = "No se proporcionó ningún archivo";
                return false;
            }

            if (file.Length > MaxFileSize)
            {
                errorMessage = $"El archivo excede el tamaño máximo permitido de {MaxFileSize / 1024 / 1024}MB";
                return false;
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(extension))
            {
                errorMessage = $"Tipo de archivo no permitido. Solo se aceptan: {string.Join(", ", _allowedExtensions)}";
                return false;
            }

            return true;
        }

        public async Task<string> SaveFileAsync(IFormFile file, string folder)
        {
            try
            {
                // Crear carpeta si no existe
                var uploadPath = Path.Combine(_environment.WebRootPath, "uploads", folder);
                if (!Directory.Exists(uploadPath))
                {
                    Directory.CreateDirectory(uploadPath);
                }

                // Generar nombre único
                var extension = Path.GetExtension(file.FileName);
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadPath, fileName);

                // Guardar archivo
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Retornar path relativo
                return $"/uploads/{folder}/{fileName}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al guardar archivo");
                throw new InvalidOperationException("Error al guardar el archivo", ex);
            }
        }

        public async Task<bool> DeleteFileAsync(string filePath)
        {
            try
            {
                if (string.IsNullOrEmpty(filePath))
                    return false;

                // Convertir ruta relativa a absoluta
                var fullPath = Path.Combine(_environment.WebRootPath, filePath.TrimStart('/'));

                if(filePath.Contains("user.png"))
                {
                    //_logger.LogWarning("Intento de eliminación de avatar por defecto: {FilePath}", filePath);
                    return false; // No eliminar avatar por defecto
                }

                if (File.Exists(fullPath))
                {
                    await Task.Run(() => File.Delete(fullPath));
                    _logger.LogInformation("Archivo eliminado: {FilePath}", fullPath);
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar archivo: {FilePath}", filePath);
                return false;
            }
        }

        public async Task<ProductoImagenDto> UploadProductoImagenAsync(int productoId, IFormFile file)
        {
            // Validar que el producto existe
            var producto = await _productoService.GetByIdAsync(productoId);
            if (producto == null)
                throw new InvalidOperationException($"Producto con ID {productoId} no encontrado");

            // Validar archivo
            if (!ValidateImageFile(file, out string errorMessage))
                throw new InvalidOperationException(errorMessage);

            // Guardar archivo físico
            var rutaImagen = await SaveFileAsync(file, "productos");

            // Guardar referencia en base de datos
            var createDto = new CreateProductoImagenDto
            {
                ProductoId = productoId,
                RutaImagen = rutaImagen,
                EsPrincipal = false
            };

            var imagenDto = await _productoImagenService.CreateAsync(createDto);
            
            var baseUrl = _configuration["App:BaseUrl"] ?? "";
            var imagenUrl = !string.IsNullOrEmpty(imagenDto.RutaImagen) 
                ? $"{baseUrl}{imagenDto.RutaImagen}" 
                : null;

            imagenDto.RutaImagen = imagenUrl;
            _logger.LogInformation("Imagen subida exitosamente para producto {ProductoId}: {RutaImagen}", 
                productoId, rutaImagen);

            return imagenDto;
        }

        public async Task<bool> DeleteProductoImagenAsync(int productoId, int imagenId)
        {
            // Obtener la imagen de la base de datos
            var imagen = await _productoImagenService.GetByIdAsync(imagenId);
            if (imagen == null)
                throw new InvalidOperationException($"Imagen con ID {imagenId} no encontrada");

            // Validar que la imagen pertenece al producto especificado
            if (imagen.ProductoId != productoId)
                throw new InvalidOperationException($"La imagen {imagenId} no pertenece al producto {productoId}");

            // Eliminar archivo físico del disco
            var rutaImagen = imagen.RutaImagen;
            // Limpiar la URL base si existe
            if (rutaImagen.Contains("://"))
            {
                var uri = new Uri(rutaImagen);
                rutaImagen = uri.AbsolutePath;
            }

            await DeleteFileAsync(rutaImagen);

            // Eliminar registro de la base de datos
            var deleted = await _productoImagenService.DeleteAsync(imagenId);
            
            if (deleted)
            {
                _logger.LogInformation("Imagen {ImagenId} eliminada exitosamente del producto {ProductoId}", 
                    imagenId, productoId);
            }

            return deleted;
        }

        public async Task<ProductoImagenDto?> SetImagenPrincipalAsync(int productoId, int imagenId)
        {
            // Obtener la imagen de la base de datos
            var imagen = await _productoImagenService.GetByIdAsync(imagenId);
            if (imagen == null)
                throw new InvalidOperationException($"Imagen con ID {imagenId} no encontrada");

            // Validar que la imagen pertenece al producto especificado
            if (imagen.ProductoId != productoId)
                throw new InvalidOperationException($"La imagen {imagenId} no pertenece al producto {productoId}");

            // Actualizar imagen como principal (el servicio se encarga de desmarcar las demás)
            var updateDto = new UpdateProductoImagenDto
            {
                EsPrincipal = true
            };

            var updated = await _productoImagenService.UpdateAsync(imagenId, updateDto);
            
            if (updated != null)
            {
                _logger.LogInformation("Imagen {ImagenId} marcada como principal para producto {ProductoId}", 
                    imagenId, productoId);
            }

            return updated;
        }
    }
}
