import {LitElement, html, css} from 'lit';
import {ref, createRef} from 'lit/directives/ref.js';
import {basicSetup} from 'codemirror';
import {EditorState} from '@codemirror/state';
import {python} from '@codemirror/lang-python';
import {EditorView} from '@codemirror/view';
import {prepareCode, processTestResults, processTestError} from './doctest-grader.js';
import {FiniteWorker} from './finite-worker.js';
import {get, set} from './user-storage.js';

import './loader-element.js';

export class CodeExerciseElement extends LitElement {
	static properties = {
		starterCode: {type: String},
		exerciseName: {type: String},
		isLoading: {type: Boolean},
		runStatus: {type: String},
		resultsStatus: {type: String},
		resultsHeader: {type: String},
		resultsDetails: {type: String},
	};

	static styles = css`
		.editor-area {
			width: 100%;
			margin: 10px 0;
		}
		.cm-editor {
			border: 1px solid #ccc;
			border-radius: 4px;
		}
	`;

	editorRef = createRef();
	editor = null;

	createRenderRoot() {
		return this;
	}

	render() {
		let results = null;
		if (this.resultsStatus === 'fail') {
			results = html`<pre class="mb-0"><code>${this.resultsDetails}</code></pre>`;
		}

		return html`
			<div class="card">
				<div class="card-body">
					<div ${ref(this.editorRef)} class="editor-area"></div>
					<div class="d-flex justify-content-between align-items-center mt-3">
						<div>
							<button
								@click=${this.onRun}
								type="button"
								class="btn btn-primary"
							>
								Run Tests
							</button>
							<span style="margin-left: 8px">
								${this.runStatus &&
								html`<loader-element></loader-element>`}
								${this.runStatus}
							</span>
						</div>
						<div>
							<button
								@click=${this.resetCode}
								type="button"
								class="btn btn-secondary"
								title="Reset code to starter code"
							>
								Reset
							</button>
						</div>
					</div>
					${results ? html`
						<div class="mt-4">
							<h4>Test results (${this.resultsHeader})</h4>
							<div class="mt-2 bg-light rounded p-3">
								${results}
							</div>
						</div>
					` : ''}
				</div>
			</div>
		`;
	}

	getStorageKey() {
		return this.exerciseName ? `${this.exerciseName}-repr` : null;
	}

	firstUpdated() {
		const key = this.getStorageKey();
		// Try to get stored code for this exercise
		const storedCode = key ? get(key) : null;
		if (storedCode) {
			console.log(`Loading stored code in localStorage from ${key}`);
		} else if (!key) {
			console.log('No exercise name provided, code will not be stored');
		} else {
			console.log(`No stored code found for ${key}, using starter code. Your code changes will be stored in localStorage.`);
		}
		
		const state = EditorState.create({
			doc: storedCode || this.starterCode || '',
			extensions: [
				basicSetup,
				python(),
				EditorView.lineWrapping,
				EditorView.updateListener.of((update) => {
					const key = this.getStorageKey();
					if (update.docChanged && key) {
						// Save code when it changes
						set(key, update.state.doc.toString());
					}
				})
			]
		});

		this.editor = new EditorView({
			state: state,
			parent: this.editorRef.value
		});
	}

	onRun() {
		this.runStatus = 'Running tests...';
		this.handleSubmit(this.editor.state.doc.toString());
	}

	async handleSubmit(submittedCode) {
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

		this.runStatus = '';
		this.resultsStatus = testResults.status;
		this.resultsHeader = testResults.header;
		this.resultsDetails = testResults.details;
	}

	async resetCode() {
		if (confirm('Are you sure you want to reset your code to the starter code? This cannot be undone.')) {
			console.log('Resetting code to starter code');
			const state = EditorState.create({
				doc: this.starterCode || '',
				extensions: [
					basicSetup,
					python(),
					EditorView.lineWrapping,
				]
			});
			this.editor.setState(state);

			// Clear stored code if it exists
			const key = this.getStorageKey();
			if (key) {
				set(key, this.starterCode);
			}
		}
	}
}

window.customElements.define('code-exercise-element', CodeExerciseElement);
