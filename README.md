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
```html
<code-exercise-element name="exercise-name" show-tests>
def my_function(param):
    """ A function that does something.
    
    >>> my_function(5)
    10
    """
    # YOUR CODE HERE
</code-exercise-element>
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

Lint the code:

```
npm run lint
```

Format the code:

```
npm run format
```

Build the production version:

```
npm run build
```

