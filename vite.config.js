import { defineConfig } from 'vite';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig({
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  plugins: [
    monacoEditorPlugin.default({
      languageWorkers: ['typescript', 'editorWorkerService']
    })
  ],
  optimizeDeps: {
    exclude: ['@webcontainer/api'],
  },
});