function initCaretInteractions() {

    let $changedLineIndicator = document.createElementNS('http://www.w3.org/2000/svg', 'line') //weblink refers to a standard
    ourSvg.appendChild($changedLineIndicator)
    $changedLineIndicator.style.stroke = "rgb(180,180,180)"
    updateChangedLineIndicator = () => {
        if(lowestChangedLineSinceCompile !== Infinity) {
            let textareaBox = textarea.getBoundingClientRect()
            let y = lineToScreenY(lowestChangedLineSinceCompile )
            setSvgLine($changedLineIndicator,
                textareaBox.x, y,
                textareaBox.x + textareaBox.width, y)
        }
        else
            setSvgLine($changedLineIndicator, -10, -10, -10, -10)
    }

    function insertTextAtCaret(text) {
        let code = textarea.value
        let beforeText = code.slice(0, textarea.selectionStart)
        let afterText = code.slice(textarea.selectionEnd, textarea.value.length)
        let cursorPos = textarea.selectionEnd
        textarea.value = beforeText + text + afterText

        setCaretPosition(cursorPos + text.length)
    }

    function setCaretPosition(pos) {
        // Modern browsers
        if (textarea.setSelectionRange) {
            textarea.focus();
            textarea.setSelectionRange(pos, pos);
        }
        else if (textarea.createTextRange) {
            var range = textarea.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }
    
    function afterInput(event) {
        hideErrorBoxIfNeeded()

        if (caretLine <= lowestChangedLineSinceCompile)
            lowestChangedLineSinceCompile = caretLine
        updateChangedLineIndicator()

        updateSyntaxHighlighting(textarea.value)
        updateSyntaxHighlightingScroll(textarea)

        onCaretMove()
    }

    //when you mouseup after a drag, DON'T update

    //meant to occur BEFORE the character has put in
    textarea.addEventListener('keydown', (event) => {
        if (event.key === "Enter" && event.altKey === false) {
            insertTextAtCaret("\n    ")
            afterInput()
            event.preventDefault()
        }
        if (event.key == "Tab") {
            insertTextAtCaret("    ")
            afterInput()
            event.preventDefault()
        }
    })

    //meant to occur AFTER the character has put in
    textarea.addEventListener('input',afterInput)

    textarea.addEventListener('scroll', () => {
        updateChangedLineIndicator()
        updateSyntaxHighlightingScroll(textarea)
    })
    
    onCaretMove = () => {
        let caretPosition = textarea.selectionStart

        if (caretPosition === caretPositionOld) 
            return
            
        let text = textarea.value

        let lineIndex = 0
        let columnIndex = 0
        for (let i = 0, il = text.length; i < il; ++i) {
            if ( i === caretPosition ) {
                caretLine = lineIndex
                caretColumn = columnIndex
                break
            }

            ++columnIndex
            if (text[i] === "\n") {
                ++lineIndex
                columnIndex = 0
            }
        }

        let caretX = columnToScreenX(columnIndex)
        let caretY = lineToScreenY(lineIndex)
        updateMentionVisibilitiesAndIndication(textarea, caretX, caretY)
        renderAll()

        caretPositionOld = caretPosition
    }

    let caretPositionOld = -1
    let caretLine = -1
    let caretColumn = -1
    document.addEventListener('selectionchange', onCaretMove)

    mentionVisibleDueToCaret = (mention) => 
        mention.lineIndex === caretLine && caretLine < lowestChangedLineSinceCompile
}