import type { File } from "./types"
import { v4 as uuidv4 } from "uuid"

export const defaultFiles: File[] = [
  {
    id: "root",
    name: "Project",
    type: "folder",
    content: "",
    parentId: null,
    children: ["folder1", "file1", "file2", "file3", "file6", "file7"],
  },
  {
    id: "folder1",
    name: "src",
    type: "folder",
    content: "",
    parentId: "root",
    children: ["file4", "file5"],
  },
  {
    id: "file1",
    name: "index.html",
    type: "file",
    language: "html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app"></div>
  <script src="main.js"></script>
</body>
</html>`,
    parentId: "root",
  },
  {
    id: "file2",
    name: "styles.css",
    type: "file",
    language: "css",
    content: `body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}`,
    parentId: "root",
  },
  {
    id: "file3",
    name: "main.js",
    type: "file",
    language: "javascript",
    content: `// Main application code
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  
  // Create a heading element
  const heading = document.createElement('h1');
  heading.textContent = 'Hello, VS Code Clone!';
  
  // Create a paragraph element
  const paragraph = document.createElement('p');
  paragraph.textContent = 'This is a simple web application created in our VS Code clone.';
  
  // Append elements to the app container
  app.appendChild(heading);
  app.appendChild(paragraph);
  
  console.log('Application initialized');
});`,
    parentId: "root",
  },
  {
    id: "file4",
    name: "app.js",
    type: "file",
    language: "javascript",
    content: `// App component
class App {
  constructor() {
    this.state = {
      count: 0
    };
  }
  
  increment() {
    this.state.count++;
    this.render();
  }
  
  decrement() {
    this.state.count--;
    this.render();
  }
  
  render() {
    // Update UI based on state
    console.log('Current count:', this.state.count);
  }
}

export default App;`,
    parentId: "folder1",
  },
  {
    id: "file5",
    name: "utils.js",
    type: "file",
    language: "javascript",
    content: `// Utility functions

/**
 * Formats a date to a readable string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

/**
 * Debounces a function call
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}`,
    parentId: "folder1",
  },
  {
    id: "file6",
    name: "script.py",
    type: "file",
    language: "python",
    content: `# Python example script

def greet(name):
    """
    Simple greeting function
    
    Args:
        name (str): Name to greet
        
    Returns:
        str: Greeting message
    """
    return f"Hello, {name}!"

class Calculator:
    """A simple calculator class"""
    
    def __init__(self, initial_value=0):
        self.value = initial_value
    
    def add(self, x):
        self.value += x
        return self
    
    def subtract(self, x):
        self.value -= x
        return self
    
    def multiply(self, x):
        self.value *= x
        return self
    
    def divide(self, x):
        if x == 0:
            raise ValueError("Cannot divide by zero")
        self.value /= x
        return self
    
    def get_result(self):
        return self.value

# Example usage
if __name__ == "__main__":
    print(greet("World"))
    
    calc = Calculator(10)
    result = calc.add(5).multiply(2).subtract(8).divide(2).get_result()
    print(f"Calculator result: {result}")
`,
    parentId: "root",
  },
  {
    id: "file7",
    name: "untitled-1.js",
    type: "file",
    language: "javascript",
    content: "// This is a temporary file\nconsole.log('Hello world');",
    parentId: "root",
    isDirty: true,
  },
]

export function createNewFile(name: string, parentId: string, language = "plaintext"): File {
  return {
    id: uuidv4(),
    name,
    type: "file",
    language: language as any,
    content: "",
    parentId,
    isDirty: true, // Mark new files as dirty by default
  }
}

export function createNewFolder(name: string, parentId: string): File {
  return {
    id: uuidv4(),
    name,
    type: "folder",
    content: "",
    parentId,
    children: [],
  }
}
