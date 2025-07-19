# 🏡 Domy v Itálii - Website Development Setup

## Quick Start

### Starting the Website
Simply double-click `start-website.bat` to:
- ✅ Install dependencies automatically (if needed)
- ✅ Start a development server with hot reload
- ✅ Open the website in your browser at http://localhost:3000

### Stopping the Website
Double-click `stop-website.bat` to stop all website server processes.

## What You Get

- **Live Reload**: Changes to HTML, CSS, and JS files automatically refresh the browser
- **Local Development**: Full website functionality without needing to upload files
- **Cross-Platform**: Works with multiple server types (npm, Python, etc.)

## Server Options (in order of preference)

1. **npm + live-server** (recommended) - Hot reload, automatic browser opening
2. **http-server** - Simple HTTP server with basic features  
3. **Python HTTP server** - Fallback option if Node.js not available

## URLs

- **Website**: http://localhost:3000
- **Files**: Edit any file in the project and see changes instantly

## Troubleshooting

If the batch file doesn't work:
1. Install [Node.js](https://nodejs.org/) 
2. Run `npm install` in the project directory
3. Try `start-website.bat` again

## Commands (if you prefer manual control)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Alternative server
npm run serve
```

---

*This mirrors the same convenient setup as the admin dashboard!* 