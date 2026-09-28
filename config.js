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

/* ---------- Theme toggle (persists across visits) ---------- */
const THEME_ICONS = `
  <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8"/></svg>
  <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></svg>
`;

function mountThemeToggle(container) {
  if (!container || document.getElementById("theme-toggle")) return;
  const btn = document.createElement("button");
  btn.id = "theme-toggle";
  btn.className = "theme-btn";
  btn.type = "button";
  btn.setAttribute("aria-label", "Toggle dark mode");
  btn.innerHTML = THEME_ICONS;
  btn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "" : "dark";
    if (next) document.documentElement.dataset.theme = next;
    else delete document.documentElement.dataset.theme;
    try { localStorage.setItem("bookit-theme", next); } catch (_) {}
  });
  container.appendChild(btn);
}
