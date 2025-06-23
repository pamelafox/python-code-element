function extractError(error, numDocstringLines) {
  let startI = -1;
  let endI = -1;
  let lineNum;
  const errorLines = error.split('\n');
  for (var i = errorLines.length - 1; i >= 0; i--) {
    let line = errorLines[i];
    if (line.startsWith('SyntaxError') || line.startsWith('IndentationError')) {
      endI = i;
    } else if (line.includes('File "<exec>", line')) {
      lineNum = parseInt(line.split(', line ')[1], 10);
      lineNum -= numDocstringLines - 1;
      startI = i;
      break;
    }
  }
  if (startI == -1 || endI == -1) {
    return 'No error report found.';
  } else {
    return `Error at line ${lineNum}:\n` + errorLines.slice(startI + 1, endI + 1).join('\n');
  }
}

function cleanupDoctestResults(resultsStr) {
  let keptLines = [];
  let inKeepRange = false;
  resultsStr.split('\n').forEach((line) => {
    if (line.startsWith('File "__main__"')) {
      inKeepRange = true;
      return;
    } else if (line.startsWith('Trying:') || line.startsWith('1 items had no tests:')) {
      inKeepRange = false;
    }
    if (inKeepRange) {
      line = line.replace('Failed example:', '\n❌ Failed test:');
      keptLines.push(line);
    }
  });
  return keptLines.join('\n').trim();
}

export function prepareCode(code) {
  const lines = code.split('\n');
  if (!(lines[0].includes('def') || lines[0].includes('class'))) {
    return {
      status: 'fail',
      header: 'Error running tests',
      details: 'First code line must be `def` or `class` declaration',
    };
  }

  let finalCode = [...lines]; // Copy the lines array

  // Redirects stdout so we can return it
  finalCode.push('import sys');
  finalCode.push('import io');
  finalCode.push('sys.stdout = io.StringIO()');
  // Runs the doctests
  finalCode.push('import doctest');
  finalCode.push('doctest.testmod(verbose=True)');
  finalCode.push('sys.stdout.getvalue()');
  finalCode = finalCode.join('\n');

  return {
    status: 'success',
    header: 'Running tests...',
    code: finalCode,
    startLine: 0, // Line numbers now match original code
  };
}

export function processTestResults(outputStr) {
  const summaryRe = /(\d+)\spassed\sand\s(\d+)\sfailed./;
  const summaryMatches = outputStr.match(summaryRe);
  if (summaryMatches) {
    const successCount = parseInt(summaryMatches[1], 10);
    const failCount = parseInt(summaryMatches[2], 10);
    const totalCount = successCount + failCount;
    const doctestResults = cleanupDoctestResults(outputStr);
    return {
      status: successCount == totalCount ? 'pass' : 'fail',
      header: `${successCount} of ${totalCount} tests passed`,
      details: doctestResults,
    };
  }
}

export function processTestError(error, startLine) {
  if (error.message.startsWith('Traceback')) {
    return {
      status: 'fail',
      header: 'Syntax error',
      details: extractError(error.message, startLine),
    };
  } else if (error.message == 'Infinite loop') {
    return {
      status: 'fail',
      header: 'Infinite loop',
      details:
        'Your code did not finish executing within 60 seconds. Please look to see if you accidentally coded an infinite loop.',
    };
  }
  return {
    status: 'fail',
    header: 'Unexpected error occurred',
    details: `Error: ${error.message}`,
  };
}
