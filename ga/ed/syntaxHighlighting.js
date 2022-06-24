function updateSyntaxHighlighting() {
    let resultElement = document.querySelector("#highlighting-content")
    // Handle final newlines (see article)
    let text = textarea.value
    if (text[text.length - 1] == "\n")
        text += " "

    // Update code
    resultElement.innerHTML = text.replace(new RegExp("&", "g"), "&amp;").replace(new RegExp("<", "g"), "&lt;") /* Global RegExp */
    // Syntax Highlight
    Prism.highlightElement(resultElement)
}

function updateSyntaxHighlightingScroll(element) {
    /* Scroll result to scroll coords of event - sync with textarea */
    let resultElement = document.querySelector("#highlighting")
    // Get and set x and y
    resultElement.scrollTop = element.scrollTop
    resultElement.scrollLeft = element.scrollLeft
}