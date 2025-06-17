import {LitElement, html, css} from 'lit';
import {ref, createRef} from 'lit/directives/ref.js';
import {basicSetup} from 'codemirror';
import {EditorState} from '@codemirror/state';
import {python} from '@codemirror/lang-python';
import {EditorView, keymap} from '@codemirror/view';
import {indentWithTab} from "@codemirror/commands"
import { indentUnit } from "@codemirror/language";
import {prepareCode, processTestResults, processTestError} from './doctest-grader.js';
import {FiniteWorker} from './finite-worker.js';
import {get, set} from './user-storage.js';

import './loader-element.js';

export class CodeExerciseElement extends LitElement {
	static properties = {
		starterCode: {type: String},
		exerciseName: {type: String, attribute: 'name'},
		isLoading: {type: Boolean},
		runStatus: {type: String},
		resultsStatus: {type: String},
		resultsHeader: {type: String},
		resultsDetails: {type: String},
		runOutput: {type: String},
		showTests: {type: Boolean, attribute: 'show-tests'},
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

	connectedCallback() {
		super.connectedCallback();
		if (!this.starterCode && this.innerHTML.trim()) {
			// Unescape the > signs in doctest output that get escaped by HTML parser
			this.starterCode = this.innerHTML.trim().replace(/&gt;/g, '>');
			// Clear the innerHTML since it will be displayed in the editor
			this.innerHTML = '';
		}
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
								@click=${this.onRunCode}
								type="button"
								class="btn me-2"
								style="background-color: #d1e1f0;"
								aria-label="Run code"
							>
								▶️ Run Code
							</button>
							${this.showTests ? html`
								<button
									@click=${this.onRun}
									type="button"
									class="btn"
									style="background-color: #a4d8ae;"
									aria-label="Run tests"
								>
									🧪 Run Tests
								</button>
							` : ''}
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
					${this.runOutput ? html`
						<div class="mt-4">
							<h4>Value of final expression</h4>
							<div class="mt-2 bg-light rounded p-3">
								<pre class="mb-0"><code>${this.runOutput}</code></pre>
							</div>
						</div>
					` : ''}
					${this.runStdout ? html`
						<div class="mt-4">
							<h4>Standard output (i.e. from print statements)</h4>
							<div class="mt-2 bg-light rounded p-3">
								<pre class="mb-0"><code>${this.runStdout}</code></pre>
							</div>
						</div>
					` : ''}
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
				keymap.of([indentWithTab]),
				indentUnit.of('    '), // Use 4 spaces for indentation
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
			parent: this.editorRef.value,
		});
	}

	onRun() {
		this.runStatus = 'Running tests...';
		this.handleSubmit(this.editor.state.doc.toString());
	}

	async onRunCode() {
		this.runStatus = 'Running code...';
		this.resultsStatus = '';  // Clear any previous test results
		const code = this.editor.state.doc.toString();
		try {
			const {results, error, stdout} = await new FiniteWorker(code);
			this.runOutput = error?.message || results || '';
			this.runStdout = stdout || '';
		} catch (e) {
			console.warn(
				`Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`
			);
			this.runOutput = `Error: ${e.message}`;
		}
		this.runStatus = '';
	}

	async handleSubmit(submittedCode) {
		this.runOutput = '';
		this.runStdout = '';

		let testResults = prepareCode(submittedCode);

		if (testResults.code) {
			try {
				const code = testResults.code + '\nsys.stdout.getvalue()';
				const {results, error, stdout} = await new FiniteWorker(code);
				if (results) {
					testResults = processTestResults(results);
				} else {
					testResults = processTestError(error, testResults.startLine);
				}
				this.runStdout = stdout || '';
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
