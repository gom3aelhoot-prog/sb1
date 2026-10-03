export default async function handler(req: any, res: any) {
  const path = req.url || "";

  res.setHeader("Content-Type", "application/json");

  if (path.includes("/health")) {
    return res.status(200).json({
      status: "ok",
      service: "SB1 system"
    });
  }

  if (path.includes("/monitor")) {
    return res.status(200).json({
      status: "active",
      monitor: true
    });
  }

  return res.status(404).json({
    error: "API route not found"
  });
}
