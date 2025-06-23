/* global Promise */
import PyodideWorker from 'web-worker:./worker.js';
export class FiniteWorker {
  constructor(code) {
    this.gotCalledBack = false;

    this.worker = new PyodideWorker();
    this.worker.onmessage = this.handleMessage.bind(this);
    this.stdout = [];
    return new Promise((resolve) => {
      window.setTimeout(this.finishIt.bind(this), 1000 * 5);
      this.worker.postMessage(code);
      this.resolve = resolve;
    });
  }

  finishIt() {
    if (!this.gotCalledBack) {
      this.worker.terminate();
      this.resolve({error: {message: 'Infinite loop'}});
    }
  }

  handleMessage(event) {
    if (event.data.stdout) {
      this.stdout.push(event.data.stdout);
      return;
    } else {
      this.gotCalledBack = true;
      this.resolve({error: event?.data?.error, results: event?.data?.results, stdout: this.stdout.join('\n')});
    }
  }
}
