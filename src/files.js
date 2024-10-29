// src/files.js
export const files = {
    'package.json': {
      file: {
        contents: JSON.stringify({
          name: "react-todo-app",
          version: "0.1.0",
          private: true,
          dependencies: {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-scripts": "5.0.1"
          },
          scripts: {
            "start": "react-scripts start",
            "build": "react-scripts build"
          },
          browserslist: {
            production: [">0.2%", "not dead", "not op_mini all"],
            development: ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
          }
        }, null, 2)
      }
    }
  };
  
  export const srcFiles = {
    'index.js': {
      file: {
        contents: `
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import './index.css';
  import App from './App';
  
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );`
      }
    },
    'index.css': {
      file: {
        contents: `
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }`
      }
    },
    'App.js': {
      file: {
        contents: `
  import React, { useState } from 'react';
  import './App.css';
  
  function App() {
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState('');
  
    const addTodo = (e) => {
      e.preventDefault();
      if (input.trim()) {
        setTodos([...todos, { id: Date.now(), text: input }]);
        setInput('');
      }
    };
  
    return (
      <div className="App">
        <h1>Todo List</h1>
        <form onSubmit={addTodo}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add todo"
          />
          <button type="submit">Add</button>
        </form>
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>{todo.text}</li>
          ))}
        </ul>
      </div>
    );
  }
  export default App  
  `
      }
    },
    'App.css': {
      file: {
        contents: `
  .App {
    text-align: center;
    padding: 20px;
  }
  
  form {
    margin: 20px 0;
  }
  
  input {
    margin-right: 10px;
    padding: 5px;
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    margin: 10px 0;
  }`
      }
    }
  };
  
  export const publicFiles = {
    'index.html': {
      file: {
        contents: `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>React Todo App</title>
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>`
      }
    }
  };