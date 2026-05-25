import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const AIRTABLE_BASE_ID = 'appiidWXwEAZtzTPh'
const AIRTABLE_TABLE_ID = 'tblEXq4VKb3SYRRqV'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://agenteagora.com'

function buildEmailHtml({
  firstName,
  lastName,
  company,
  email,
  volume,
}: {
  firstName: string
  lastName: string
  company: string
  email: string
  volume: string
}) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gracias por tu interés en Agora</title>
</head>
<body style="margin:0;padding:0;background-color:#F1E8D5;font-family:Arial,Helvetica,sans-serif;">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;color:#F1E8D5;">Te contactaremos en las próximas horas con los próximos pasos.</div>

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F1E8D5;padding:48px 20px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#FFFCF1;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(43,31,18,0.14);">

          <!-- Hero image -->
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">
              <img
                src="${SITE_URL}/landing/hero-bg.png"
                width="600"
                alt="Agora — Plataforma operacional para exportadores"
                style="width:100%;height:220px;object-fit:cover;display:block;border-radius:16px 16px 0 0;"
              />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 48px 40px;">

              <!-- Eyebrow -->
              <p style="margin:0 0 20px;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#8A7860;">
                Agora &mdash; Confirmación de solicitud
              </p>

              <!-- Heading -->
              <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:38px;font-weight:300;font-style:italic;line-height:1.08;color:#2B1F12;letter-spacing:-0.015em;">
                Gracias, ${firstName}.
              </h1>
              <h2 style="margin:0 0 28px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:300;font-style:italic;line-height:1.2;color:#5A4A38;letter-spacing:-0.01em;">
                Recibimos tu solicitud.
              </h2>

              <!-- Body copy -->
              <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#5A4A38;line-height:1.68;">
                Nuestro equipo revisará los detalles de <strong style="color:#2B1F12;">${company}</strong> y se pondrá en contacto contigo en las <strong style="color:#2B1F12;">próximas horas</strong> para coordinar una conversación.
              </p>
              <p style="margin:0 0 36px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#5A4A38;line-height:1.68;">
                Mientras tanto, si tienes alguna pregunta, puedes responder directamente a este correo.
              </p>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr><td style="height:1px;background-color:rgba(60,42,22,0.10);font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>

              <!-- Details label -->
              <p style="margin:0 0 16px;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#8A7860;">
                Resumen de tu solicitud
              </p>

              <!-- Details table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FCF7EA;border-radius:10px;overflow:hidden;border:1px solid rgba(60,42,22,0.08);">

                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid rgba(60,42,22,0.07);">
                    <p style="margin:0 0 3px;font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#B5A586;">Nombre</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#2B1F12;font-weight:500;">${firstName} ${lastName}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid rgba(60,42,22,0.07);">
                    <p style="margin:0 0 3px;font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#B5A586;">Empresa</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#2B1F12;font-weight:500;">${company}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 20px;border-bottom:1px solid rgba(60,42,22,0.07);">
                    <p style="margin:0 0 3px;font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#B5A586;">Email</p>
                    <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:13px;color:#2B1F12;">${email}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 20px;">
                    <p style="margin:0 0 3px;font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#B5A586;">Volumen de exportaciones</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#2B1F12;font-weight:500;">${volume} <span style="font-family:'Courier New',Courier,monospace;font-size:11px;color:#8A7860;font-weight:400;">embarques / año</span></p>
                  </td>
                </tr>

              </table>

              <!-- Footer note -->
              <p style="margin:32px 0 0;font-family:'Courier New',Courier,monospace;font-size:10px;color:#B5A586;line-height:1.7;">
                Este es un correo automático de confirmación generado desde agenteagora.com.<br/>
                Para consultas, responde directamente a este mensaje.
              </p>

            </td>
          </tr>

          <!-- Footer bar -->
          <tr>
            <td style="padding:20px 48px;background-color:#F8F2E4;border-top:1px solid rgba(60,42,22,0.08);">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:300;font-size:22px;color:#2B1F12;letter-spacing:-0.01em;">Agora</p>
                    <p style="margin:3px 0 0;font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:#8A7860;">Plataforma operacional para exportadores</p>
                  </td>
                  <td align="right" valign="middle">
                    <a href="${SITE_URL}" style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8A7860;text-decoration:none;letter-spacing:0.06em;">agenteagora.com</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, company, email, volume } = await req.json()

    if (!firstName || !lastName || !company || !email || !volume) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ── Save to Airtable ──────────────────────────────────────────
    const airtableRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_PAT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                Nombre: firstName,
                Apellido: lastName,
                Email: email,
                Empresa: company,
                'Volumen (embarques/año)': volume,
                'Enviado el': new Date().toISOString(),
                Status: 'Todo',
              },
            },
          ],
        }),
      }
    )

    if (!airtableRes.ok) {
      const err = await airtableRes.text()
      console.error('Airtable error:', err)
    }

    // ── Send email ────────────────────────────────────────────────
    const html = buildEmailHtml({ firstName, lastName, company, email, volume })

    await resend.emails.send({
      from: 'Agora <hola@agenteagora.com>',
      to: email,
      cc: 'sebastian@agenteagora.com',
      subject: `Gracias por tu interés, ${firstName} — te contactamos pronto`,
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
