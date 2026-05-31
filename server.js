const http = require("http");
const fs = require("fs");
const path = require("path");
const { processClaim } = require("./src/pipeline");
const { loadPolicy, loadTestCases } = require("./src/dataAccess");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/api/policy") {
      return sendJson(res, loadPolicy());
    }
    if (req.method === "GET" && req.url === "/api/cases") {
      return sendJson(res, loadTestCases());
    }
    if (req.method === "POST" && req.url === "/api/claims") {
      const body = await readBody(req);
      const result = processClaim(JSON.parse(body || "{}"));
      return sendJson(res, result);
    }
    return serveStatic(req, res);
  } catch (error) {
    return sendJson(res, {
      decision: "MANUAL_REVIEW",
      approvedAmount: 0,
      reason: "System failure handled gracefully. Claim should be reviewed manually.",
      confidence: 0.35,
      trace: [
        {
          at: new Date().toISOString(),
          component: "APIGateway",
          status: "DEGRADED",
          message: error.message
        }
      ]
    }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`Plum Claims Copilot running at http://localhost:${PORT}`);
});

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function sendJson(res, payload, statusCode = 200) {
  res.writeHead(statusCode, { "content-type": "application/json" });
  res.end(JSON.stringify(payload, null, 2));
}

function serveStatic(req, res) {
  const urlPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const filePath = path.normalize(path.join(PUBLIC_DIR, urlPath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    return res.end("Not found");
  }
  const ext = path.extname(filePath);
  const types = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json"
  };
  res.writeHead(200, { "content-type": types[ext] || "text/plain" });
  fs.createReadStream(filePath).pipe(res);
}
