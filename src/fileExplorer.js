export class FileExplorer {
    constructor(container, webcontainerInstance, editor) {
      this.container = container;
      this.webcontainer = webcontainerInstance;
      this.editor = editor;
      this.currentPath = '';
      this.currentFile = null;
      this.initialize();
    }
  
    async initialize() {
      await this.render();
      this.attachEventListeners();
    }
  
    async render() {
      const structure = await this.getFileStructure();
      this.container.innerHTML = `
        <div class="file-explorer-header">
          <span class="file-explorer-title">Files</span>
          <div class="file-explorer-actions">
            <button class="file-explorer-button" id="new-file">New File</button>
            <button class="file-explorer-button" id="new-folder">New Folder</button>
          </div>
        </div>
        <div class="file-tree">
          ${await this.renderFileTree(structure)}
        </div>
      `;
    }
  
    async getFileStructure(path = '') {
      const entries = await this.webcontainer.fs.readdir(path, { withFileTypes: true });
      const structure = {};
  
      for (const entry of entries) {
        const fullPath = path ? `${path}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          structure[entry.name] = {
            type: 'directory',
            children: await this.getFileStructure(fullPath)
          };
        } else {
          structure[entry.name] = {
            type: 'file',
            path: fullPath
          };
        }
      }
  
      return structure;
    }
  
    async renderFileTree(structure, level = 0) {
      let html = '';
      const indent = '  '.repeat(level);
  
      for (const [name, info] of Object.entries(structure)) {
        const itemClass = info.type === 'directory' ? 'folder-icon' : 'file-icon';
        const fullPath = info.path || name;
  
        html += `
          <div class="file-tree-item ${itemClass}" data-path="${fullPath}" data-type="${info.type}" style="padding-left: ${level * 20}px">
            ${name}
          </div>
        `;
  
        if (info.type === 'directory' && info.children) {
          html += await this.renderFileTree(info.children, level + 1);
        }
      }
  
      return html;
    }
  
    async showCreateModal(type) {
      const modal = document.createElement('div');
      modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal">
          <h3>Create New ${type === 'file' ? 'File' : 'Folder'}</h3>
          <input type="text" id="create-input" placeholder="${type === 'file' ? 'filename.js' : 'folder name'}">
          <div class="modal-buttons">
            <button class="file-explorer-button" id="modal-cancel">Cancel</button>
            <button class="file-explorer-button" id="modal-create">Create</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
  
      return new Promise((resolve) => {
        const input = modal.querySelector('#create-input');
        const createBtn = modal.querySelector('#modal-create');
        const cancelBtn = modal.querySelector('#modal-cancel');
        const overlay = modal.querySelector('.modal-overlay');
  
        const cleanup = () => {
          modal.remove();
        };
  
        createBtn.onclick = () => {
          cleanup();
          resolve(input.value);
        };
  
        cancelBtn.onclick = overlay.onclick = () => {
          cleanup();
          resolve(null);
        };
  
        input.focus();
      });
    }
  
    async createFile(name) {
      if (!name) return;
      const path = this.currentPath ? `${this.currentPath}/${name}` : name;
      await this.webcontainer.fs.writeFile(path, '');
      await this.render();
    }
  
    async createFolder(name) {
      if (!name) return;
      const path = this.currentPath ? `${this.currentPath}/${name}` : name;
      await this.webcontainer.fs.mkdir(path);
      await this.render();
    }
  
    async openFile(path) {
      const contents = await this.webcontainer.fs.readFile(path, 'utf-8');
      this.currentFile = path;
      this.editor.setValue(contents);
      const language = this.getFileLanguage(path);
      monaco.editor.setModelLanguage(this.editor.getModel(), language);
      this.updateFileSelection(path);
    }

    updateFileSelection(path) {
      const items = this.container.querySelectorAll('.file-tree-item');
      items.forEach(item => item.classList.remove('selected'));

      const selectedItem = this.container.querySelector(`[data-path="${path}"]`);
      if (selectedItem) {
        selectedItem.classList.add('selected');
      }
    }

    async updateFileContent(path, content) {
      await this.webcontainer.fs.writeFile(path, content);
    }
  
    getFileLanguage(path) {
      const ext = path.split('.').pop();
      const languageMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'css': 'css',
        'html': 'html',
        'json': 'json',
        'md': 'markdown'
      };
      return languageMap[ext] || 'plaintext';
    }
  
    attachEventListeners() {
      this.container.addEventListener('click', async (e) => {
        const item = e.target.closest('.file-tree-item');
        if (!item) return;
  
        const path = item.dataset.path;
        const type = item.dataset.type;
  
        if (type === 'file') {
          await this.openFile(path);
        }
      });
  
      const newFileBtn = this.container.querySelector('#new-file');
      const newFolderBtn = this.container.querySelector('#new-folder');
  
      newFileBtn.onclick = async () => {
        const name = await this.showCreateModal('file');
        if (name) await this.createFile(name);
      };
  
      newFolderBtn.onclick = async () => {
        const name = await this.showCreateModal('folder');
        if (name) await this.createFolder(name);
      };
    }
  }