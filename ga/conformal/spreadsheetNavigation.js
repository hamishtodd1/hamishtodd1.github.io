function initSpreadsheetNavigation() {

    let refreshCountdown = -1.
    let currentlyTyping = false

    let initial = [
        [
            //want something that affects itself Or two affecting each other
            `2e12`,
            `e1 - e0`,
            `e4 + time * e0`,
            `e23 - e03`,
            `(1+time*e01) > e1`,
            `e0`, `ep`, `e2`, `e23`
        ],
        [
            `exp( time * (e12 + e01) )`,
            `B1 > hand`,
            `e23 - time * e13`,
            `hand & e123`,
            `B3 + B4`,
            `hand`,
        ]
    ]
    initNotation()
    initial.forEach((a, i) => {
        a.forEach((b, j) => {
            initial[i][j] = translateExpression(b)
        })
    })

    let ss1 = new Spreadsheet(initial[0].length)
    ss1.position.x = -.8
    let ss2 = new Spreadsheet(initial[1].length)
    ss2.position.x = .8

    ///////////////
    // Selection //
    ///////////////

    let mainSelectionBox = new SelectionBox(new THREE.MeshBasicMaterial({ color: 0x111111 }))

    selectCell = (newSs, newRow) => {

        resetSecondarySelectionBoxes()
        forEachCell(cell => cell.setVizVisibility(false))

        if(newRow === undefined) {
            let cell = newSs
            selectedSpreadsheet = spreadsheets.find(ss => ss.cells.includes(cell))
            selectedRow = selectedSpreadsheet.cells.indexOf(cell)
        }
        else {
            selectedSpreadsheet = newSs
            selectedRow = newRow
        }

        selectedSpreadsheet.cells[selectedRow].refresh()
        selectedSpreadsheet.cells[selectedRow].setVizVisibility(true)

        mainSelectionBox.setCell(selectedSpreadsheet, selectedRow)

        currentlyTyping = false
    }

    let ssbMat = new THREE.MeshBasicMaterial({ color: 0x404040 })
    let usedSecondarySelectionBoxes = []
    let unusedSecondarySelectionBoxes = []
    resetSecondarySelectionBoxes = () => {
        while (usedSecondarySelectionBoxes.length > 0) {
            let ssb = usedSecondarySelectionBoxes.pop()
            ssb.visible = false
            unusedSecondarySelectionBoxes.push(ssb)
        }
    }
    setSecondarySelectionBox = (spreadsheet, row) => {

        let alreadyGotOne = usedSecondarySelectionBoxes.reduce(
            (val,ssb) => val || (ssb.spreadsheet === spreadsheet && ssb.row === row),
            false
        )

        if (alreadyGotOne)
            return

        if (unusedSecondarySelectionBoxes.length === 0) {
            let ssb = new SelectionBox(ssbMat)
            unusedSecondarySelectionBoxes.push(ssb)
        }

        let ssb = unusedSecondarySelectionBoxes.pop()
        ssb.setCell(spreadsheet, row)
        ssb.visible = true
        usedSecondarySelectionBoxes.push(ssb)
    }

    //////////////////////////
    // Controls / selection //
    //////////////////////////

    let rememberedSelectedRow = 0
    function incrementCell(increment) {
        let maxVal = selectedSpreadsheet.cells.length - 1
        let newVal = clamp(selectedRow + increment, 0, maxVal)
        selectCell(selectedSpreadsheet, newVal)
        rememberedSelectedRow = newVal
    }
    function incrementSs(increment) {
        let currentVal = spreadsheets.indexOf(selectedSpreadsheet)
        let index = (currentVal + 1) % spreadsheets.length
        let newSs = spreadsheets[index]

        let newRow = rememberedSelectedRow
        if (newRow >= newSs.cells.length)
            newRow = newSs.cells.length - 1

        selectCell(newSs, newRow)
    }

    function clearCurrentCell() {
        selectedSpreadsheet.cells[selectedRow].setText(``)
        currentlyTyping = true
        selectedSpreadsheet.cells[selectedRow].refresh()
    }

    function inRect(posVec, rectPos, rectScaleX, rectScaleY) {

        let ret =
            rectPos.x - rectScaleX / 2. < posVec.x && posVec.x < rectPos.x + rectScaleX / 2. &&
            rectPos.y - rectScaleY / 2. < posVec.y && posVec.y < rectPos.y + rectScaleY / 2.
        return ret
    }

    function forEachCell(func) {
        spreadsheets.forEach((ss, ssIndex) => {
            ss.cells.forEach((cell, cellIndex) => {
                func(cell, ssIndex, cellIndex)
            })
        })
    }

    forEachCell((cell, ssIndex, row) => {
        if (initial[ssIndex] !== undefined && initial[ssIndex][row] !== undefined) {
            cell.append(initial[ssIndex][row])
            cell.refresh()
        }
    })
    selectedSpreadsheet = spreadsheets[0]
    let selectedRow = 0
    selectCell(selectedSpreadsheet, selectedRow)

    //////////////////////////
    // Auto refresh control //
    //////////////////////////

    refreshActiveCells = () => {

        if (!currentlyTyping)
            selectedSpreadsheet.cells[selectedRow].refresh()
        else if (refreshCountdown !== -1.) {

            // Refresh cell if not typed into for a while
            refreshCountdown -= frameDelta

            if (refreshCountdown < 0.) {
                selectedSpreadsheet.cells[selectedRow].refresh()
                selectedSpreadsheet.cells[selectedRow].setVizVisibility(true)
                refreshCountdown = -1.
            }
        }
    }

    /////////////////////
    // event listeners //
    /////////////////////

    document.addEventListener(`mousedown`, (event) => {
        if (event.button !== 0)
            return

        //first of all we do need the position of the "mouse"
        let clickedSpreadsheet = false
        spreadsheets.forEach(ss => {
            mousePlanePosition.pointToVec3(v1)
            ss.worldToLocal(v1)
            if (inRect(v1, zeroVector, ss.bg.scale.x, ss.bg.scale.y)) {
                ss.cells.forEach((cell, row) => {
                    if (inRect(v1, cell.position, ss.bg.scale.x, cellHeight)) {
                        selectCell(ss, row)
                        clickedSpreadsheet = true
                        rememberedSelectedRow = row
                    }
                })
            }
        })

        if (!clickedSpreadsheet) {
            let cell = selectedSpreadsheet.makeExtraCell()

            cga0.fromEga(mousePlanePosition).flatPpToConformalPoint(cga0)
            let newText = translateExpression(cga0.toString(3))
            cell.setText(newText)

            selectCell(cell)
        }
    })

    document.addEventListener(`keydown`, (event) => {

        //also "you're done entering into that box", so we finalize the string
        if (event.key.length > 1) {
            switch (event.key) {
                case `ArrowUp`:
                    incrementCell(-1); 
                    break
                case `ArrowDown`:
                    incrementCell(1); 
                    break
                case `ArrowRight`:
                    incrementSs(-1); 
                    break
                case `ArrowLeft`:
                    incrementSs(1); 
                    break
                case `Backspace`:
                    clearCurrentCell(); 
                    break
                case `Tab`:
                    spreadsheets.forEach(ss => {
                        ss.cells.forEach(cell => cell.setVizVisibility(true))
                    })
                    break
            }

            return
        }
        log(event.key)

        if (!currentlyTyping)
            clearCurrentCell()
        else
            refreshCountdown = 0.65

        let selectedCell = selectedSpreadsheet.cells[selectedRow]
        selectedCell.setText(translateExpression(selectedCell.currentText + event.key))
    })
}