const http = require("http");
const fs = require("fs");
const path = require("path");
const root = __dirname;
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};
http
  .createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const f = path.join(root, decodeURIComponent(p));
    fs.readFile(f, (e, d) => {
      if (e) {
        res.writeHead(404);
        res.end("404");
        return;
      }
      res.writeHead(200, {
        "Content-Type": types[path.extname(f)] || "application/octet-stream",
      });
      res.end(d);
    });
  })
  .listen(5500, "127.0.0.1", () => console.log("up on 5500"));
