using ADStoreApi.DTOs;

namespace ADStoreApi.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task ForgotPasswordAsync(ForgotPasswordDto dto);
        Task ResetPasswordWithTokenAsync(ResetPasswordWithTokenDto dto);
        string GenerateJwtToken(string email, string nombre, string rol, int userId);
    }
}
