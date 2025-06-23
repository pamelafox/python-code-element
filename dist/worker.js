/* global loadPyodide, importScripts */

importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');

async function loadPyodideAndRemember() {
  self.pyodide = await loadPyodide({
    stdout: function (line) {
      self.postMessage({stdout: line});
    },
  });
}
let pyodideReadyPromise = loadPyodideAndRemember();

self.onmessage = async (event) => {
  await pyodideReadyPromise;
  const python = event.data;
  try {
    let results = await self.pyodide.runPythonAsync(python);
    // if results is an object, convert it to a string
    if (typeof results === 'object' && results !== null) {
      results = JSON.stringify(results, null, 2);
    }
    self.postMessage({results});
  } catch (error) {
    self.postMessage({error: error});
  }
};
