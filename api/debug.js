// api/debug.js
export default function handler(req, res) {
  const uri = process.env.MONGODB_URI;
  if (!uri) return res.status(500).json({ ok: false, reason: "MONGODB_URI missing" });

  // mask sensitive parts
  const showStart = uri.slice(0, 16);
  const showEnd = uri.slice(-12);
  const masked = `${showStart}...${showEnd}`;
  // detect placeholder-like values (helpful if you accidentally left <db_password>)
  const looksPlaceholder = uri.includes("<db_password>") || uri.includes("<") || uri.includes(">");

  return res.status(200).json({
    ok: true,
    preview: masked,
    looksPlaceholder,
    host: (() => {
      try {
        const host = uri.split('@')[1]?.split('/')[0] || null;
        return host;
      } catch { return null; }
    })()
  });
}
