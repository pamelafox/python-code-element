import {LitElement, html, css} from 'lit';
import {ref, createRef} from 'lit/directives/ref.js';
import {basicSetup} from 'codemirror';
import {EditorState} from '@codemirror/state';
import {python} from '@codemirror/lang-python';
import {EditorView} from '@codemirror/view';

import './loader-element.js';
import './test-results-element.js';

export class CodeExerciseElement extends LitElement {
	static properties = {
		code: {type: String},
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
		if (!this.resultsStatus) {
			results = 'Test results will appear here after clicking "Run Tests" above.';
		} else if (this.resultsStatus === 'fail') {
			results = html`<test-results-element
				status=${this.resultsStatus}
				header=${this.resultsHeader}
				details=${this.resultsDetails}
			></test-results-element>`;
		} else if (this.resultsStatus === 'pass') {
			results = ''; // Hide results when all tests pass
		}

		return html`
			<div class="row mt-4">
				<div class="col-sm-12">
					<div class="card">
						<div class="card-body">
							<div ${ref(this.editorRef)} class="editor-area"></div>
							<div class="row float-right">
								<div class="col-sm-12">
									<span style="margin-right: 8px">
										${this.runStatus &&
										html`<loader-element></loader-element>`}
										${this.runStatus}
									</span>
									<button
										@click=${this.onRun}
										type="button"
										class="btn btn-primary"
									>
										Run Tests
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			${results ? html`
			<div class="row mt-4">
				<div class="col-sm-12">
					<div class="card">
						<div class="card-header">
							<h4>Test Cases</h4>
						</div>
						<div id="test_description">
							<div class="card-body">${results}</div>
						</div>
					</div>
				</div>
			</div>
			` : ''}
		`;
	}

	firstUpdated() {
		const state = EditorState.create({
			doc: this.code || '',
			extensions: [
				basicSetup,
				python(),
				EditorView.lineWrapping,
			]
		});

		this.editor = new EditorView({
			state: state,
			parent: this.editorRef.value
		});
	}

	onRun() {
		this.runStatus = 'Running tests...';
		this.dispatchEvent(
			new CustomEvent('run', {
				detail: {
					code: this.editor.state.doc.toString()
				},
			})
		);
	}
}

customElements.define('code-exercise-element', CodeExerciseElement);
