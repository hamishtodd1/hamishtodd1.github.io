let updateHandSpreadsheet = ()=>{}
let refreshActiveCells = ()=>{}

function initSpreadsheetNavigation(initial) {

    let refreshCountdown = -1.
    let currentlyTyping = false

    initNotation()
    initial.forEach((a, i) => {
        a.forEach((b, j) => {
            initial[i][j] = translateExpression(b)
        })
    })

    let ss1 = new Spreadsheet(initial[0].length)
    ss1.position.x = -.8
    let ss2 = new Spreadsheet(initial[1].length)
    ss2.position.x =  .8

    //////////////////////
    // Hand Spreadsheet //
    //////////////////////
    {
        let handSs = new Spreadsheet(3, `HAND`)
        handSs.position.x = -.8
        handSs.position.y += 1.3
        let middleMousePressed = false
        document.addEventListener(`mousedown`, (event) => {
            if (event.button === 1)
                middleMousePressed = true
        })
        document.addEventListener(`mouseup`, (event) => {
            if (event.button === 1)
                middleMousePressed = false
        })
        updateHandSpreadsheet = () => {

            cga0.fromEga(mousePlanePosition).flatPpToConformalPoint(cga1)
            let handString = translateExpression(cga1.toString(2))
            handSs.cells[0].setText(handString)

            handSs.cells[1].setText(middleMousePressed ? `1.` : `0.`)

            handSs.cells[2].setText(`0.`)
        }
    }

    ///////////////
    // Modifying //
    ///////////////

    function clearCurrentCell() {
        selectedSpreadsheet.cells[selectedRow].setText(``)
        currentlyTyping = true
        selectedSpreadsheet.cells[selectedRow].refresh()
    }

    bindButton(`Backspace`, clearCurrentCell)

    function onLetterKey(event) {

        if(event.ctrlKey)
            return

        if (selectedSpreadsheet.editable === false)
            return

        //also "you're done entering into that box", so we finalize the string
        if (event.key.length > 1)
            return

        if (!currentlyTyping)
            clearCurrentCell()
        else
            refreshCountdown = 0.65

        let selectedCell = selectedSpreadsheet.cells[selectedRow]
        selectedCell.setText(selectedCell.currentText + translateExpression(event.key))
    }
    document.addEventListener(`keydown`, onLetterKey)

    {
        var carat = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0x000000 }))
        carat.material.transparent = true
        carat.scale.set(0.01, cellHeight, 1.)
        scene.add(carat)
        carat.onBeforeRender = () => {

            let selectedCell = selectedSpreadsheet.cells[selectedRow]

            carat.position.y = selectedCell.position.y
            carat.position.z = layerWidth

            carat.position.x = selectedCell.position.x - selectedCell.scale.x / 2. + selectedCell.currentText.length * selectedCell.scale.y * .57

            carat.material.opacity = (frameCount % 120 < 60) ? 0. : 1.
            if (carat.position.x > selectedSpreadsheet.bg.scale.x / 2.)
                carat.material.opacity = carat.material.opacity = 0.
        }
    }

    ////////////////
    // Visibility //
    ////////////////

    bindButton(`#`, () => {
        let newSymbolness = !spreadsheets[0].cells[0].symbol.visible
        spreadsheets.forEach(ss => {
            ss.cells.forEach(cell => { cell.setSymbolness(newSymbolness) })
            ss.resizeFromCellWidths()
        })
    })

    let allVisibleMode = false
    bindButton(`Tab`, () => {
        allVisibleMode = !allVisibleMode
        spreadsheets.forEach(ss => {
            ss.cells.forEach(cell => cell.setVizVisibility(allVisibleMode))
        })
    })

    //////////////////
    // Highlighting //
    //////////////////

    let mainSelectionBox = new SelectionBox(new THREE.MeshBasicMaterial({ color: 0x111111 }))

    selectCell = (newSs, newRow) => {

        newSs.add(carat)

        while (usedSecondarySelectionBoxes.length > 0) {
            let ssb = usedSecondarySelectionBoxes.pop()
            ssb.visible = false
            unusedSecondarySelectionBoxes.push(ssb)
        }

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

    ////////////////
    // Arrow keys //
    ////////////////

    let rememberedSelectedRow = 0
    function incrementRow(increment) {
        let maxVal = selectedSpreadsheet.cells.length - 1
        let newVal = clamp(selectedRow + increment, 0, maxVal)
        selectCell(selectedSpreadsheet, newVal)
        rememberedSelectedRow = newVal
    }
    function incrementSs(increment) {
        let currentVal = spreadsheets.indexOf(selectedSpreadsheet)
        let index = ((currentVal + increment)<0?spreadsheets.length-1:currentVal+increment) % spreadsheets.length
        let newSs = spreadsheets[index]

        let newRow = rememberedSelectedRow
        if (newRow >= newSs.cells.length)
            newRow = newSs.cells.length - 1

        selectCell(newSs, newRow)
    }
    bindButton(`ArrowUp`, () => incrementRow(-1))
    bindButton(`ArrowDown`, () => incrementRow(1))
    bindButton(`ArrowRight`, () => incrementSs(-1))
    bindButton(`ArrowLeft`, () => incrementSs(1))

    //////////////////////////////////
    // Setting up the initial stuff //
    //////////////////////////////////

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
    

    //////////////
    // clicking //
    //////////////

    function inRect(posVec, rectPos, rectScaleX, rectScaleY) {

        let ret =
            rectPos.x - rectScaleX / 2. < posVec.x && posVec.x < rectPos.x + rectScaleX / 2. &&
            rectPos.y - rectScaleY / 2. < posVec.y && posVec.y < rectPos.y + rectScaleY / 2.
        return ret
    }

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

            let vizType = selectedSpreadsheet.cells[selectedRow].getVizType()
            if(vizType === NO_VIZ_TYPE) //No viz
                vizType = CONFORMAL_POINT //point

            startDrawing(selectedSpreadsheet.cells[selectedRow], vizType)
        }
    })

    
}