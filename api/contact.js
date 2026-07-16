import dbConnect from '../lib/dbConnect.js';
import Contact from '../models/Contact.js';

// Set this in Vercel's env vars to your GitHub Pages origin,
// e.g. "https://yourusername.github.io"
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Browsers send a preflight OPTIONS request before the real POST
  // for cross-origin requests with a JSON body — must respond 200 here.
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are all required.' });
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address.' });
  }

  if (message.length > 5000) {
    return res.status(400).json({ message: 'Message is too long (max 5000 characters).' });
  }

  try {
    await dbConnect();
    await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    return res.status(200).json({ message: 'Message received.' });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return res.status(500).json({ message: 'Something went wrong on our end. Please try again later.' });
  }
}