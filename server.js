// Your independent backend server.
// This is plain Node.js + Express — your own code, runs anywhere Node runs.
// No dependency on Base44, Vercel, or any proprietary platform.

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());              // allows your frontend to call this server
app.use(express.json());      // parses incoming JSON form data

// Health check — visit this URL to confirm the server is alive
app.get('/', (req, res) => {
  res.send('Server is running.');
});

// Handles all 3 forms: general enquiry, property assessment, guide download.
// Mirrors the field names and validation your Base44 "submitEnquiry" function used,
// so the frontend didn't need to change how it calls this.
app.post('/api/submit-form', async (req, res) => {
  try {
    const {
      type, name, email, phone, company, location,
      propertyType, bedrooms, service, situation, message,
    } = req.body || {};

    const isGuide = type === 'guide';
    const isAssessment = type === 'assessment';

    if (isGuide) {
      if (!email) return res.status(400).json({ error: 'Email is required' });
    } else {
      if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Name, email and phone are required' });
      }
    }

    const clean = {
      type: isGuide ? 'guide' : (isAssessment ? 'assessment' : 'enquiry'),
      name: String(name || 'Guide Request').slice(0, 120),
      email: String(email).slice(0, 160),
      phone: String(phone || 'N/A').slice(0, 40),
      company: String(company || '').slice(0, 120),
      location: String(location || '').slice(0, 120),
      property_type: String(propertyType || '').slice(0, 60),
      bedrooms: String(bedrooms || '').slice(0, 20),
      service: String(service || '').slice(0, 80),
      situation: String(situation || '').slice(0, 500),
      message: String(message || '').slice(0, 2000),
    };

    const label =
      clean.type === 'guide' ? 'Free Guide Request' :
      clean.type === 'assessment' ? 'Free Property Assessment' : 'General Enquiry';

    const subject = `New ${label} — ${clean.name}`;

    const rows = [
      ['Type', label],
      ['Name', clean.name],
      ['Email', clean.email],
      clean.phone !== 'N/A' && ['Phone', clean.phone],
      clean.company && ['Company', clean.company],
      clean.location && ['Property Location', clean.location],
      clean.property_type && ['Property Type', clean.property_type],
      clean.bedrooms && ['Bedrooms', clean.bedrooms],
      clean.service && ['Service Required', clean.service],
      clean.situation && ['Current Situation', clean.situation],
      clean.message && ['Message', clean.message],
    ].filter(Boolean);

    const emailHtml = `
      <h2>${label}</h2>
      ${rows.map(([k, v]) => `<p><strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}</p>`).join('')}
      <p style="color:#888;font-size:12px;">Submitted from the UrbanScale website</p>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'UrbanScale Solutions <notifications@urbanscalesolutions.co.uk>',
        to: [process.env.NOTIFY_EMAIL],
        reply_to: clean.email,
        subject,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Resend error:', errText);
      return res.status(502).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Form submission error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
