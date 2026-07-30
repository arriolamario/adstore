using ADStoreApi.DTOs;

namespace ADStoreApi.Services
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file, string folder);
        Task<bool> DeleteFileAsync(string filePath);
        bool ValidateImageFile(IFormFile file, out string errorMessage);
        Task<ProductoImagenDto> UploadProductoImagenAsync(int productoId, IFormFile file);
        Task<bool> DeleteProductoImagenAsync(int productoId, int imagenId);
        Task<ProductoImagenDto?> SetImagenPrincipalAsync(int productoId, int imagenId);
    }
}
