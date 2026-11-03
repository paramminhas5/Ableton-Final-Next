// The phone apps have no pages of their own: they open the web app (artifacts/ccd-school).
// This writes the tiny local page the app starts on, which goes straight to the web app
// and says so plainly if there is no connection. Set the address in app-url.json.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const { url, start } = JSON.parse(readFileSync("app-url.json", "utf8"));
const target = new URL(start ?? "/", url).toString();
mkdirSync("www", { recursive: true });
writeFileSync(
  "www/index.html",
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="dark">
<title>ccd school</title>
<style>html,body{margin:0;height:100%;background:#1A1B1D;color:#EEEEEB;font:15px/1.4 system-ui,-apple-system,sans-serif}
main{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:24px;text-align:center}
button{font:inherit;color:#fff;background:#D2307A;border:0;border-radius:12px;min-height:44px;padding:0 20px}</style>
</head>
<body>
<main><p id="m">opening ccd school</p><button id="b" hidden>try again</button></main>
<script>
const target = ${JSON.stringify(target)};
const go = () => { location.replace(target); };
if (navigator.onLine) go();
else {
  document.getElementById("m").textContent = "no connection. ccd school needs the internet to open for now.";
  const b = document.getElementById("b"); b.hidden = false; b.onclick = go;
}
</script>
</body>
</html>
`,
);
console.log("www/index.html opens", target);
