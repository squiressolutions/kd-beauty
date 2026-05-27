import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import nodemailer from 'nodemailer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app  = express()
const PORT = process.env.PORT || 3002

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL    || 'keenansquires@gmail.com'
const GMAIL_USER   = process.env.GMAIL_USER       || 'keenansquires@gmail.com'
const GMAIL_PASS   = process.env.GMAIL_APP_PASSWORD

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  })
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// ── Booking Request ───────────────────────────────────────────────────────────
app.post('/api/book', async (req, res) => {
  const { fname, lname, email, phone, service, date, date2, time, notes } = req.body
  const name = [fname, lname].filter(Boolean).join(' ').trim()

  if (!name || !email || !service || !date) {
    return res.status(400).json({ error: 'Name, email, service, and date are required.' })
  }

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff5f8;padding:32px;border-radius:12px;">
      <div style="background:linear-gradient(135deg,#c45978,#1a0a10);padding:22px 24px;border-radius:10px;margin-bottom:24px;">
        <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:1px;">NEW BOOKING REQUEST ✦</h1>
        <p style="color:#f4c2d4;margin:5px 0 0;font-size:13px;">KD Beauty · St. Louis, MO</p>
      </div>

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f4c2d4;width:38%;font-size:13px;color:#c45978;font-weight:600;">Client</td>
          <td style="padding:10px 0;border-bottom:1px solid #f4c2d4;font-size:14px;color:#1a0a10;">${name}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f4c2d4;font-size:13px;color:#c45978;font-weight:600;">Email</td>
          <td style="padding:10px 0;border-bottom:1px solid #f4c2d4;font-size:14px;"><a href="mailto:${email}" style="color:#c45978;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f4c2d4;font-size:13px;color:#c45978;font-weight:600;">Phone</td>
          <td style="padding:10px 0;border-bottom:1px solid #f4c2d4;font-size:14px;color:#1a0a10;">${phone || 'Not provided'}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f4c2d4;font-size:13px;color:#c45978;font-weight:600;">Service</td>
          <td style="padding:10px 0;border-bottom:1px solid #f4c2d4;font-size:14px;color:#1a0a10;font-weight:600;">${service}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f4c2d4;font-size:13px;color:#c45978;font-weight:600;">Preferred Date</td>
          <td style="padding:10px 0;border-bottom:1px solid #f4c2d4;font-size:14px;color:#1a0a10;">${date}</td>
        </tr>
        ${date2 ? `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #f4c2d4;font-size:13px;color:#c45978;font-weight:600;">Alternate Date</td>
          <td style="padding:10px 0;border-bottom:1px solid #f4c2d4;font-size:14px;color:#1a0a10;">${date2}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f4c2d4;font-size:13px;color:#c45978;font-weight:600;">Time Slot</td>
          <td style="padding:10px 0;border-bottom:1px solid #f4c2d4;font-size:14px;color:#1a0a10;">${time || 'Not specified'}</td>
        </tr>
        ${notes ? `<tr>
          <td style="padding:10px 0;font-size:13px;color:#c45978;font-weight:600;vertical-align:top;">Notes</td>
          <td style="padding:10px 0;font-size:14px;color:#1a0a10;">${notes}</td>
        </tr>` : ''}
      </table>

      <div style="margin-top:20px;">
        <a href="mailto:${email}?subject=Your KD Beauty Appointment&body=Hi ${fname},%0A%0AThanks for booking! Your appointment for ${service} is confirmed for ${date} at ${time || 'TBD'}.%0A%0ASee you then!%0A— KD Beauty"
          style="display:inline-block;background:#c45978;color:#fff;padding:10px 22px;border-radius:30px;text-decoration:none;font-size:13px;font-weight:600;">
          Reply to ${fname} →
        </a>
      </div>

      <div style="margin-top:20px;padding:12px 16px;background:#1a0a10;border-radius:8px;text-align:center;">
        <p style="color:#f4c2d4;font-size:12px;margin:0;">KD Beauty · St. Louis, MO · 314-738-8282 · @_brandedbeauty_</p>
      </div>
    </div>
  `

  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from: `"KD Beauty" <${GMAIL_USER}>`,
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: `✦ New Booking: ${service} — ${name}`,
      html,
    })
    res.json({ success: true })
  } catch (err) {
    console.error('Email error:', err)
    res.status(500).json({ error: 'Failed to send.' })
  }
})

// ── Catch-all ─────────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`KD Beauty server running on port ${PORT}`)
})
