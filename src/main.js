import HighlightableEditor from './highlightable-editor.js';

async function main() {
  let pyodide, editor;
  const codeDiv = document.getElementById('code-area');
  const button = document.getElementById('button');
  const statusDiv = document.getElementById('status');
  const code = `def lesser_num(num1, num2):
    """ Returns whichever number is lowest of the two supplied numbers.

    >>> lesser_num(45, 10)
    10
    >>> lesser_num(-1, 30)
    -1
    >>> lesser_num(20, 20)
    20
    """
    # YOUR CODE HERE`;

  async function loadPyodideScript() {
    const scriptUrl = 'https://cdn.jsdelivr.net/pyodide/v0.27.6/full/pyodide.js';
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.onload = async () => {
      pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.6/full/'
      });
      statusDiv.innerText = '';
      button.removeAttribute('disabled');
      button.addEventListener('click', runCode);
      
    };
    document.head.appendChild(script);
  }

  editor = new HighlightableEditor(codeDiv, code);

  await loadPyodideScript();
}

main();
