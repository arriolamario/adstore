using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace ADStoreApi.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string toName, string resetLink)
        {
            var smtpHost = _config["Email:SmtpHost"] ?? throw new InvalidOperationException("Email:SmtpHost no configurado");
            var smtpPort = int.Parse(_config["Email:SmtpPort"] ?? "587");
            var smtpUser = _config["Email:SmtpUser"] ?? throw new InvalidOperationException("Email:SmtpUser no configurado");
            var smtpPass = _config["Email:SmtpPassword"] ?? throw new InvalidOperationException("Email:SmtpPassword no configurado");
            var fromName = _config["Email:FromName"] ?? "ADStore";
            var fromEmail = _config["Email:FromEmail"] ?? smtpUser;

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = "Recuperar contraseña - ADStore";

            var body = new BodyBuilder
            {
                HtmlBody = $"""
                    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:12px">
                      <h2 style="color:#1a1a2e;margin-top:0">Recuperar contraseña</h2>
                      <p>Hola <strong>{toName}</strong>,</p>
                      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>ADStore</strong>.</p>
                      <p>Hacé clic en el botón para crear una nueva contraseña. Este enlace es válido por <strong>1 hora</strong>.</p>
                      <a href="{resetLink}" 
                         style="display:inline-block;background:#1a1a2e;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
                        Restablecer contraseña
                      </a>
                      <p style="font-size:12px;color:#888;margin-top:24px">
                        Si no solicitaste este cambio, podés ignorar este email. Tu contraseña no será modificada.<br/>
                        El enlace expira en 1 hora.
                      </p>
                      <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
                      <p style="font-size:11px;color:#aaa">ADStore — Este es un email automático, no respondas a este mensaje.</p>
                    </div>
                    """
            };
            message.Body = body.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(smtpUser, smtpPass);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email de recuperación enviado a {Email}", toEmail);
        }
    }
}
