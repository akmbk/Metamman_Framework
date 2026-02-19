const editor = document.getElementById('editor');
const highlightedTextDiv = document.getElementById('highlightedText');
const scrollContainer = document.getElementById('scrollContainer');

const customDictionary = new Set(['function', 'let', 'const', 'var', 'if', 'else', 'console', 'log', 'return', 'true', 'false', 'છેલ']);

let currentIndentCount = 0; // The memory variable

function isValidWord(word) {
    return customDictionary.has(word.toLowerCase());
}

function highlightText(text) {
    // Escape HTML and preserve trailing space for alignment
    let escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + " ";
    
    return escaped.split(/(\s+)/).map(token => {
        if (token.trim() && isValidWord(token.trim())) {
            return `<span class="highlight">${token}</span>`;
        }
        return token;
    }).join('');
}

// Logic to update our indent memory based on where the user is
function updateIndentLevel() {
    const { selectionStart, value } = editor;
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const currentLineSoFar = value.substring(lineStart, selectionStart);
    
    // Check leading spaces of current line
    const leadingSpaces = currentLineSoFar.match(/^[ ]*/);
    if (leadingSpaces) {
        currentIndentCount = leadingSpaces[0].length;
    }
}

// Keep the illusion heights in sync
function syncHeights() {
    const contentHeight = editor.scrollHeight + 'px';
    editor.style.height = contentHeight;
    highlightedTextDiv.style.height = contentHeight;
}

editor.addEventListener('input', () => {
    updateIndentLevel();
    highlightedTextDiv.innerHTML = highlightText(editor.value);
    syncHeights();
});

// Add this new listener to handle pasting
editor.addEventListener('paste', () => {
    // We use setTimeout(..., 0) to wait for the browser to 
    // actually finish putting the text into the textarea.
    setTimeout(() => {
        updateIndentLevel();
        highlightedTextDiv.innerHTML = highlightText(editor.value);
        syncHeights();
    }, 0);
});

// Also, initialize the height once on load in case there's default text
window.addEventListener('load', syncHeights);

editor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const { selectionStart, selectionEnd, value } = editor;
        
        // Use the remembered indent variable
        const indentation = ' '.repeat(currentIndentCount);
        
        editor.value = value.substring(0, selectionStart) + '\n' + indentation + value.substring(selectionEnd);
        
        const newPos = selectionStart + 1 + indentation.length;
        editor.setSelectionRange(newPos, newPos);
        
        highlightedTextDiv.innerHTML = highlightText(editor.value);
        syncHeights();
    }
});

// Update indent level on clicks or arrows
editor.addEventListener('click', updateIndentLevel);
editor.addEventListener('keyup', (e) => {
    if (e.key.includes('Arrow')) updateIndentLevel();
});