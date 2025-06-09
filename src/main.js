import {get, set} from './user-storage.js';
import {
	prepareCode,
	processTestResults,
	processTestError,
} from './doctest-grader.js';
import './code-exercise.js';
import {FiniteWorker} from './finite-worker.js';

const LS_REPR = '-repr';
let probEl;

export function initWidget() {
  const startingCode = `def lesser_num(num1, num2):
    """ Returns whichever number is lowest of the two supplied numbers.

    >>> lesser_num(45, 10)
    10
    >>> lesser_num(-1, 30)
    -1
    >>> lesser_num(20, 20)
    20
    """
    # YOUR CODE HERE`;

  probEl = document.createElement('code-exercise-element');
  probEl.setAttribute('code', startingCode);
  probEl.addEventListener('run', (e) => {
    handleSubmit(e.detail.code);
  });
  document.getElementById('code-exercise-wrapper').appendChild(probEl);
}

async function handleSubmit(submittedCode) {
	let testResults = prepareCode(submittedCode);

	if (testResults.code) {
		try {
			const code = testResults.code + '\nsys.stdout.getvalue()';
			const {results, error} = await new FiniteWorker(code);
			if (results) {
				testResults = processTestResults(results);
			} else {
				testResults = processTestError(error, testResults.startLine);
			}
		} catch (e) {
			console.warn(
				`Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`
			);
		}
	}

	probEl.setAttribute('runStatus', '');
	probEl.setAttribute('resultsStatus', testResults.status);
	probEl.setAttribute('resultsHeader', testResults.header);
	probEl.setAttribute('resultsDetails', testResults.details);
}