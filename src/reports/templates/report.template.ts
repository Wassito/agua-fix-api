import { CreateReportDto } from '../dtos/create-report.dto';

const escapeHtml = (value: string | number): string =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const severityLabel = (severity: string): string => {
  const map: Record<string, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
  };
  return map[severity] ?? escapeHtml(severity);
};

const severityColor = (severity: string): string => {
  const map: Record<string, string> = {
    low: '#2e9e5b',
    medium: '#e0a800',
    high: '#d9363e',
  };
  return map[severity] ?? '#4a5265';
};

const detailRow = (label: string, value: string): string => `
      <tr>
        <td style="padding:12px 20px;border-bottom:1px solid #eef0f4;font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8a93a5;white-space:nowrap;">${label}</td>
        <td style="padding:12px 20px;border-bottom:1px solid #eef0f4;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;color:#1b2233;text-align:right;">${value}</td>
      </tr>`;

export const generateReportTemplate = (dto: CreateReportDto, photoUrl: string): string => {
  const { address, description, severity, reporterPhone } = dto;

  const safeAddress = escapeHtml(address);
  const safeDescription = escapeHtml(description);
  const safePhone = escapeHtml(reporterPhone);
  const phoneHref = escapeHtml(String(reporterPhone).replace(/[^\d+]/g, ''));

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Nuevo reporte de fuga de agua</title>
</head>
<body style="margin:0;padding:0;background-color:#f2f4f8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f2f4f8;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 28px rgba(20,26,44,0.10);">

          <tr>
            <td style="background-color:#1e6fd9;background-image:linear-gradient(135deg,#1e6fd9 0%,#0f4c9c 100%);padding:36px 32px;text-align:center;">
              <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:#dbeafe;">AguaFix · Nuevo reporte</div>
              <div style="font-family:Helvetica,Arial,sans-serif;font-size:36px;line-height:44px;font-weight:bold;color:#ffffff;padding-top:10px;">🚿 Nuevo reporte para reparar una FUGA DE AGUA</div>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 32px 8px 32px;">
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:26px;color:#4a5265;">
                Se recibió un nuevo reporte de fuga de agua en la vía pública. Aquí los detalles:
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px 8px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fafbfd;border:1px solid #eef0f4;border-radius:14px;">
${detailRow('Foto de la fuga', `<img src="${escapeHtml(photoUrl)}" alt="Foto de la fuga" width="400" style="width:100%;max-width:400px;height:auto;display:block;" />`)}
${detailRow('Dirección', safeAddress)}
${detailRow('Descripción', safeDescription)}
                <tr>
                  <td style="padding:12px 20px;font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8a93a5;white-space:nowrap;">Severidad</td>
                  <td style="padding:12px 20px;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;text-align:right;color:${severityColor(severity)};">
                    ${severityLabel(severity)}
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 20px;font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8a93a5;white-space:nowrap;">Contacto</td>
                  <td style="padding:12px 20px;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;text-align:right;">
                    <a href="tel:${phoneHref}" style="color:#1e6fd9;text-decoration:none;">${safePhone}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 32px 32px 32px;">
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:20px;color:#8a93a5;text-align:center;">
                Cuadrilla de mantenimiento — Municipio · AguaFix
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
