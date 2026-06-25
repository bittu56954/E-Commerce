import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'
import { createServer } from 'net'

// Check if port is free before starting backend
function isPortFree(port) {
  return new Promise((resolve) => {
    const tester = createServer()
      .once('error', () => resolve(false))
      .once('listening', () => { tester.close(); resolve(true); })
      .listen(port, '127.0.0.1');
  });
}

// Vite plugin that auto-starts the Node.js backend when `npm run dev` runs
function autoBackendPlugin() {
  let backendProcess = null;

  return {
    name: 'vite-auto-backend',
    async configureServer() {
      const portFree = await isPortFree(5000);

      if (!portFree) {
        console.log('\x1b[32m%s\x1b[0m', '[backend] ✅ Port 5000 already occupied — backend is already running.');
        return;
      }

      console.log('\x1b[36m%s\x1b[0m', '[backend] 🚀 Auto-starting Node.js server on port 5000...');

      backendProcess = spawn('node', ['server.js'], {
        stdio: 'inherit',
        shell: false,
        cwd: process.cwd()
      });

      backendProcess.on('error', (err) => {
        console.error('\x1b[31m%s\x1b[0m', `[backend] ❌ Failed to start: ${err.message}`);
      });

      backendProcess.on('exit', (code) => {
        // 3221225786 = 0xC000013A = Windows STATUS_CONTROL_C_EXIT (normal Ctrl+C stop)
        const normalExitCodes = [0, null, 3221225786, 130];
        if (!normalExitCodes.includes(code)) {
          console.error('\x1b[31m%s\x1b[0m', `[backend] ❌ Server exited unexpectedly with code ${code}`);
        } else {
          console.log('\x1b[33m%s\x1b[0m', `[backend] ✅ Server stopped cleanly.`);
        }
      });

      // Kill backend when Vite dev server exits
      const cleanup = () => {
        if (backendProcess && !backendProcess.killed) {
          console.log('\x1b[33m%s\x1b[0m', '[backend] 🛑 Stopping backend server...');
          backendProcess.kill('SIGTERM');
        }
      };
      process.on('exit', cleanup);
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), autoBackendPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
