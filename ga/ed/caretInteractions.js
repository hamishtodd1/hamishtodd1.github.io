function initCaretInteractions() {

    let lowestChangedLineSinceCompile = -1

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

    inamongstChangedLines = (lineIndex) => {
        return lineIndex >= lowestChangedLineSinceCompile
    }

    updateLclsc = (newValue) => {
        lowestChangedLineSinceCompile = newValue
        updateChangedLineIndicator()
        updateDwsVisibility()
    }

    function insertTextAtCaret(text) {
        let code = textarea.value
        let beforeText = code.slice(0, textarea.selectionStart)
        let afterText = code.slice(textarea.selectionEnd, textarea.value.length)
        let cursorPos = textarea.selectionEnd
        textarea.value = beforeText + text + afterText

        setCaretPosition(cursorPos + text.length)
    }

    setCaretPosition = (pos) => {
        textarea.focus()
        textarea.setSelectionRange(pos, pos)
    }
    
    function afterInput() {
        hideErrorBoxIfNeeded()

        updateLclsc(Math.min(lowestChangedLineSinceCompile, caretLine))

        updateSyntaxHighlighting()
        updateSyntaxHighlightingScroll(textarea)

        onCaretMove()
    }

    /////////////////////////////////////////////////////////
    // Meant to occur BEFORE the character has been put in //
    /////////////////////////////////////////////////////////
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

    ////////////////////////////////////////////////////////
    // Meant to occur AFTER the character has been put in //
    ////////////////////////////////////////////////////////
    textarea.addEventListener('input',afterInput)

    textarea.addEventListener('scroll', () => {
        updateChangedLineIndicator()
        updateSyntaxHighlightingScroll(textarea)
    })

    getCaretColumnAndLine = () => {
        let text = textarea.value
        let caretPosition = textarea.selectionStart

        let lineIndex = 0
        let columnIndex = 0
        for (let i = 0, il = text.length; i < il; ++i) {
            if (i === caretPosition) {
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

        return [caretColumn, caretLine]
    }
    
    onCaretMove = () => {
        let caretPosition = textarea.selectionStart

        if (caretPosition === caretPositionOld) 
            return

        getCaretColumnAndLine()

        updateDwsVisibility()

        let caretX = columnToScreenX(caretColumn)
        let caretY = lineToScreenY(caretLine)
        updateMentionVisibilitiesAndIndication(textarea, caretX, caretY)
        renderAll()

        caretPositionOld = caretPosition
    }

    let caretAboveLclscIndicatorOld = true
    function updateDwsVisibility() {
        let caretAboveLclscIndicator = caretLine < lowestChangedLineSinceCompile
        if (caretAboveLclscIndicator !== caretAboveLclscIndicatorOld) {
            forEachPropt(dws, (dw) => {
                dw.elem.style.display = caretAboveLclscIndicator ? `` : `none`
            })
        }
        caretAboveLclscIndicatorOld = caretAboveLclscIndicator
    }

    let caretLine = -1
    let caretColumn = -1
    document.addEventListener('selectionchange', onCaretMove)

    mentionVisibleDueToCaret = (mention) => 
        mention.lineIndex === caretLine && caretLine < lowestChangedLineSinceCompile
}