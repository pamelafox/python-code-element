import './code-exercise.js';

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
  probEl.setAttribute('starterCode', startingCode);
  probEl.setAttribute('exerciseName', 'lesser-num');
  document.getElementById('code-exercise-wrapper').appendChild(probEl);
}
