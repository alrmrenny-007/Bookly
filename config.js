// Supabase config. The anon key is safe to expose; RLS protects your data.
const SUPABASE_URL = "https://ucvactsreafaxpxowhfv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdmFjdHNyZWFmYXhweG93aGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MDcwNTgsImV4cCI6MjEwNjE4MzA1OH0.dlrH_w63W6hZwnDtetc8eJRCkOhIuc1KKVP7_ler7rY";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// EmailJS lets a static site send real emails with no backend server.
// Get these three values from emailjs.com after setup (see the guide).
const EMAILJS_PUBLIC_KEY = "PASTE_YOUR_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "PASTE_YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "PASTE_YOUR_TEMPLATE_ID";

if (window.emailjs && EMAILJS_PUBLIC_KEY !== "PASTE_YOUR_PUBLIC_KEY") {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

// Sends an email if the customer gave one. Fails silently and logs to
// the console, so a broken or missing email never blocks a booking.
async function sendEmail(toEmail, toName, subject, message) {
  if (!toEmail || !window.emailjs || EMAILJS_PUBLIC_KEY === "PASTE_YOUR_PUBLIC_KEY") return;
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: toEmail,
      to_name: toName,
      subject,
      message,
    });
  } catch (err) {
    console.error("Email failed to send:", err);
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
