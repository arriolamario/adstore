using ADStoreApi.DTOs;

namespace ADStoreApi.Services
{
    public interface IUsuarioService
    {
        Task<IEnumerable<UsuarioDto>> GetAllUsuariosAsync();
        Task<UsuarioDto?> GetUsuarioByIdAsync(int id);
        Task<UsuarioDto> CreateUsuarioAsync(CreateUsuarioDto createDto);
        Task<UsuarioDto?> UpdateUsuarioAsync(int id, UpdateUsuarioDto updateDto);
        Task<bool> DeleteUsuarioAsync(int id);
        Task<UsuarioDto?> UpdateAvatarAsync(int id, string? avatarPath);
    }
}
