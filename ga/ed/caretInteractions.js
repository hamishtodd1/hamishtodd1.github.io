function initCaretInteractions() {

    let lowestChangedLineSinceCompile = -1

    let $changedLineIndicator = SvgLine()
    colorSvgLine($changedLineIndicator, 180,180,180)
    updateChangedLineIndicator = () => {
        if(lowestChangedLineSinceCompile !== Infinity) {
            let textareaBcr = textarea.getBoundingClientRect()
            let y = lineToScreenY(lowestChangedLineSinceCompile )
            setSvgLine($changedLineIndicator,
                textareaBcr.x, y,
                textareaBcr.x + textareaBcr.width, y)
        }
        else
            freeSvgLine($changedLineIndicator)
    }

    inamongstChangedLines = (lineIndex) => {
        return lineIndex >= lowestChangedLineSinceCompile
    }

    updateLclsc = (newValue) => {
        lowestChangedLineSinceCompile = newValue
        updateChangedLineIndicator()
        // updateDwsVisibility()
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

    // let $focussedLineLines = []
    // for(let i = 0; i < 4; ++i) {
    //     $focussedLineLines[i] = SvgLine()
    //     colorSvgLine($focussedLineLines[i], 0.5, 0.5, 0.5)
    // }

    /////////////////////////////////////////////////////////
    // Meant to occur BEFORE the character has been put in //
    /////////////////////////////////////////////////////////
    textarea.addEventListener('keydown', (event) => {
        if (event.key === "Enter" && event.altKey === false) {
            let ourLine = textarea.value.split(`\n`)[caretLine]
            let insertion = `\n`
            for (let i = 0, il = ourLine.length; i < il; ++i) {
                if (ourLine[i] === ` `) insertion += ` `
                else break
            }
            insertTextAtCaret(insertion)
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

    textarea.addEventListener('scroll', (event) => {
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
                // if(caretLine !== lineIndex) {
                //     let textareaBcr = textarea.getBoundingClientRect()
                //     let y = lineToScreenY(lineIndex)
                //     setSvgHighlight(0, y, textareaBcr.width, lineHeight, $focussedLineLines)
                // }
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

        // updateDwsVisibility()

        let caretX = columnToScreenX(caretColumn)
        let caretY = lineToScreenY(caretLine)
        updateMentionVisibilitiesAndIndication(textarea, caretX, caretY)

        caretPositionOld = caretPosition
    }

    //this is from when we were hiding the windows
    // let caretAboveLclscIndicatorOld = true
    // function updateDwsVisibility() {
    //     let caretAboveLclscIndicator = caretLine < lowestChangedLineSinceCompile
    //     if (caretAboveLclscIndicator !== caretAboveLclscIndicatorOld) {
    //         forEachPropt(dws, (dw) => {
    //             dw.elem.style.display = caretAboveLclscIndicator ? `` : `none`
    //         })
    //     }
    //     caretAboveLclscIndicatorOld = caretAboveLclscIndicator
    // }

    let caretLine = -1
    let caretColumn = -1
    document.addEventListener('selectionchange', onCaretMove)

    mentionVisibleDueToCaret = (mention) =>  {
        return mention.lineIndex === caretLine && caretLine < lowestChangedLineSinceCompile
    }
}