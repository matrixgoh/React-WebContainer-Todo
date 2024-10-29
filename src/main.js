import { WebContainer } from '@webcontainer/api';
import { files, srcFiles, publicFiles } from './files.js';
import * as monaco from 'monaco-editor';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { FileExplorer } from './fileExplorer.js';

let webcontainerInstance;

async function writeFiles() {
  // Create directories first
  await webcontainerInstance.fs.mkdir('src');
  await webcontainerInstance.fs.mkdir('public');

  // Write root files
  for (const [path, file] of Object.entries(files)) {
    await webcontainerInstance.fs.writeFile(path, file.file.contents);
  }

  // Write src files
  for (const [path, file] of Object.entries(srcFiles)) {
    await webcontainerInstance.fs.writeFile(`src/${path}`, file.file.contents);
  }

  // Write public files
  for (const [path, file] of Object.entries(publicFiles)) {
    await webcontainerInstance.fs.writeFile(`public/${path}`, file.file.contents);
  }
}

async function installDependencies(terminal) {
  const installProcess = await webcontainerInstance.spawn('npm', ['install']);
  
  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data);
      }
    })
  );

  return installProcess.exit;
}

async function startDevServer(terminal) {
  const serverProcess = await webcontainerInstance.spawn('npm', ['start']);
  
  serverProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data);
      }
    })
  );

  // Wait for the server to be ready
  webcontainerInstance.on('server-ready', (port, url) => {
    document.getElementById('preview').src = url;
  });
}

async function initializeWebContainer() {
  try {
    // Boot WebContainer
    webcontainerInstance = await WebContainer.boot();

    // Write files
    await writeFiles();

    // Initialize editor
    const editor = monaco.editor.create(document.getElementById('editor'), {
      value: srcFiles['App.js'].file.contents,
      language: 'javascript',
      theme: 'vs-dark',
      automaticLayout: true
    });
    
    // In the initializeWebContainer function, after initializing the editor:
    const fileExplorer = new FileExplorer(
      document.getElementById('file-explorer'),
      webcontainerInstance,
      editor
    );
    // Initialize terminal
    const terminal = new Terminal({
      convertEol: true
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(document.getElementById('terminal'));
    fitAddon.fit();

    // Start shell process
    const shellProcess = await webcontainerInstance.spawn('bash');
    shellProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(data);
        }
      })
    );

    // Handle terminal input
    terminal.onData((data) => {
      shellProcess.input.write(data);
    });

    // Install dependencies
    terminal.write('Installing dependencies...\r\n');
    await installDependencies(terminal);
    
    // Start development server
    terminal.write('\r\nStarting development server...\r\n');
    await startDevServer(terminal);

    // Handle file changes with debouncing
    let saveTimeout;
    editor.onDidChangeModelContent(async () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      
      saveTimeout = setTimeout(async () => {
        const content = editor.getValue();
        if (fileExplorer.currentFile) {
          await fileExplorer.updateFileContent(fileExplorer.currentFile, content);
        }
      }, 500);
    });

  } catch (error) {
    console.error('Failed to initialize WebContainer:', error);
    document.body.innerHTML = `
      <div style="color: red; padding: 2rem;">
        <h2>Error Initializing WebContainer</h2>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// Initialize when the window loads
window.addEventListener('load', initializeWebContainer);