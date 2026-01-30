import { readdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../../../apps/web/public/email-templates");

// Get all HTML files (excluding index.html)
const templates = readdirSync(outDir)
  .filter((file) => file.endsWith(".html") && file !== "index.html")
  .map((file) => {
    const name = file
      .replace(".html", "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return { name, file };
  });

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Templates | props.to</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f6f9fc; min-height: 100vh; padding: 48px 24px; }
    .container { max-width: 600px; margin: 0 auto; }
    h1 { font-size: 24px; color: #1f2937; margin-bottom: 8px; }
    .subtitle { color: #6b7280; margin-bottom: 32px; }
    .templates { display: flex; flex-direction: column; gap: 16px; }
    a { display: block; background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-decoration: none; transition: box-shadow 0.2s; }
    a:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .name { font-size: 16px; font-weight: 600; color: #1f2937; }
    .file { font-size: 12px; color: #9ca3af; font-family: monospace; margin-top: 4px; }
    .back { display: inline-block; color: #6b7280; font-size: 14px; margin-bottom: 24px; text-decoration: none; }
    .back:hover { color: #1f2937; }
  </style>
</head>
<body>
  <div class="container">
    <a href="/" class="back">← Back to home</a>
    <h1>Email Templates</h1>
    <p class="subtitle">Preview the email templates used by props.to</p>
    <div class="templates">
${templates.map((t) => `      <a href="/email-templates/${t.file}" target="_blank">
        <div class="name">${t.name}</div>
        <div class="file">/email-templates/${t.file}</div>
      </a>`).join("\n")}
    </div>
  </div>
</body>
</html>`;

writeFileSync(join(outDir, "index.html"), html);
console.log(`Generated index.html with ${templates.length} templates`);
