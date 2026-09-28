// Supabase config. The anon key is safe to expose; RLS protects your data.
const SUPABASE_URL = "https://ucvactsreafaxpxowhfv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdmFjdHNyZWFmYXhweG93aGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MDcwNTgsImV4cCI6MjEwNjE4MzA1OH0.dlrH_w63W6hZwnDtetc8eJRCkOhIuc1KKVP7_ler7rY";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
