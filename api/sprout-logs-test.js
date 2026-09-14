// Minimal diagnostic version to test Vercel deployment
export default async function handler(req, res) {
  try {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify({
      ok: true,
      message: "sprout-logs handler loaded successfully",
      method: req.method,
      timestamp: new Date().toISOString()
    }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      error: err.message,
      stack: err.stack
    }));
  }
}
