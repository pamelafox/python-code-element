# python-code-exercise-element

A web component for creating Python coding exercises with doctest validation.

## Usage

You can use this component by either loading it from the CDN or installing it locally.

### Loading from CDN

Add the script to your HTML:
```html
<script src="https://cdn.jsdelivr.net/npm/python-code-exercise-element@0.1.6/dist/code-exercise.umd.js"></script>
```

Then use the component in your HTML:

<code-exercise-element name="exercise-name" show-tests>
def my_function(param):
    """ A function that does something.
    
    >>> my_function(5)
    10
    """
    # YOUR CODE HERE
</code-exercise-element>

The component will preserve whitespace and indentation in the code, so you can write the Python code naturally in your HTML.

I recommend using CSS to style the code elements so that they look like code blocks before they get turned into a CodeMirror editor. That will avoid any layout shifts when the editor is initialized.

```css
code-exercise-element {
    white-space: pre;
    font-family: monospace;
}
```
To style the CodeMirror editor that loads inside the element, include a CSS rule that targets the `.cm-editor` class:

```css
code-exercise-element .cm-editor {
    border: 1px solid #ccc;
}
```

### Attributes

- `name`: A unique name for the exercise. Used to store progress in localStorage.
- `show-tests`: (Optional) Whether to show the "Run Tests" button. By default, only the "Run Code" button is shown.

### Features

- Python code editor with syntax highlighting
- Run code and see output/results
- Run tests using Python's doctest format
- Local storage of code progress
- Reset button to restore starter code
- Displays both stdout and the value of the last expression

## Development

Install packages:

```
npm install
```

Run the development server (with hot reloading):

```
npm run dev
```

## Publishing

1. Lint the code:

    ```
    npm run lint
    ```

2. Format the code:

    ```
    npm run format
    ```

3. Update the version in `package.json`

4. Build the production version:

    ```
    npm run build
    ```

5. Publish to npm:

    ```
    npm publish
    ```
