function initCaretInteractions() {

    let $changedLineIndicator = document.createElementNS('http://www.w3.org/2000/svg', 'line') //weblink refers to a standard
    ourSvg.appendChild($changedLineIndicator)
    $changedLineIndicator.style.stroke = "rgb(180,180,180)"
    updateChangedLineIndicator = () => {
        if(lowestChangedLineSinceCompile !== Infinity) {
            let textareaBox = textarea.getBoundingClientRect()
            let y = lineToScreenY(lowestChangedLineSinceCompile - 1)
            setSvgLine($changedLineIndicator,
                textareaBox.x, y,
                textareaBox.x + textareaBox.width, y)
        }
        else
            setSvgLine($changedLineIndicator, -10, -10, -10, -10)
    }
    textarea.addEventListener('scroll', updateChangedLineIndicator)

    textarea.addEventListener('input', () => {
        errorBox.style.top = "-200px"

        if (caretLine+1 < lowestChangedLineSinceCompile)
            lowestChangedLineSinceCompile = caretLine+1
        
        updateChangedLineIndicator()

        onCaretMove()
    })

    onCaretMove = () => {
        let caretPosition = textarea.selectionStart
        if (caretPosition !== caretPositionOld) {
            let text = textarea.value

            let lineIndex = 0
            for (let i = 0, il = text.length; i < il; ++i) {
                let caretIsNewlyOnThisLine = i === caretPosition && lineIndex !== caretLine
                if (caretIsNewlyOnThisLine) {
                    caretLine = lineIndex
                    updateHighlightingAndDws()
                }

                if (text[i] === "\n")
                    ++lineIndex
            }

            caretPositionOld = caretPosition
        }
    }

    let caretPositionOld = -1
    let caretLine = -1
    document.addEventListener('selectionchange', onCaretMove)

    mentionVisibleDueToCaret = (mention) => mention.lineIndex === caretLine && caretLine < lowestChangedLineSinceCompile
}