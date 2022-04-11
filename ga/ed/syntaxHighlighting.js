function updateSyntaxHighlighting(text) {
    let result_element = document.querySelector("#highlighting-content");
    // Handle final newlines (see article)
    if (text[text.length - 1] == "\n") {
        text += " ";
    }
    // Update code
    result_element.innerHTML = text.replace(new RegExp("&", "g"), "&amp;").replace(new RegExp("<", "g"), "&lt;"); /* Global RegExp */
    // Syntax Highlight
    Prism.highlightElement(result_element);
}

function updateSyntaxHighlightingScroll(element) {
    /* Scroll result to scroll coords of event - sync with textarea */
    let result_element = document.querySelector("#highlighting");
    // Get and set x and y
    result_element.scrollTop = element.scrollTop;
    result_element.scrollLeft = element.scrollLeft;
}

//you're fucked if you want to ctrl+z though
function checkIfKeyIsTab(event) {
    if (event.key == "Tab") {
        log("y")
        /* Tab key pressed */
        
        //for the time being you just can't tab
        //the right thing to do is have spaces (ugh) and just make sure it's the right amount
        
        event.preventDefault(); // stop normal
        // let code = textarea.value;
        // let before_tab = code.slice(0, textarea.selectionStart); // text before tab
        // let after_tab = code.slice(textarea.selectionEnd, textarea.value.length); // text after tab
        // let cursor_pos = textarea.selectionEnd + 1; // where cursor moves after tab - moving forward by 1 char to after tab
        // textarea.value = before_tab + "\t" + after_tab; // add tab char
        // // move cursor
        // textarea.selectionStart = cursor_pos;
        // textarea.selectionEnd = cursor_pos;
        // updateSyntaxHighlighting(textarea.value); // Update text to include indent
    }
}