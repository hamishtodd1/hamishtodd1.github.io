updateSpreadsheetVisibilitiesAndRefresh = () => { }

function initSpreadsheetHelpers() {

    let refreshCountdown = -1.
    let currentlyTyping = false

    forEachCell = (func) => {
        spreadsheets.forEach((ss, ssIndex) => {
            ss.cells.forEach((cell, cellIndex) => {
                func(cell, ssIndex, cellIndex)
            })
        })
    }

    selectCell = (newSs, newRow) => {

        newSs.add(carat)

        while (usedSecondarySelectionBoxes.length > 0) {
            let ssb = usedSecondarySelectionBoxes.pop()
            ssb.visible = false
            unusedSecondarySelectionBoxes.push(ssb)
        }

        if (newRow === undefined) {
            let cell = newSs
            selectedSpreadsheet = spreadsheets.find(ss => ss.cells.includes(cell))
            selectedRow = selectedSpreadsheet.cells.indexOf(cell)
        }
        else {
            selectedSpreadsheet = newSs
            selectedRow = newRow
        }

        mainSelectionBox.setCell(selectedSpreadsheet, selectedRow)

        currentlyTyping = false
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
        let index = ((currentVal + increment) < 0 ? spreadsheets.length - 1 : currentVal + increment) % spreadsheets.length
        let newSs = spreadsheets[index]

        let newRow = rememberedSelectedRow
        if (newRow >= newSs.cells.length)
            newRow = newSs.cells.length - 1

        selectCell(newSs, newRow)
    }
    document.addEventListener(`keydown`,event=>{
        switch(event.key) {
            case `ArrowUp`:
                incrementRow(-1)
                break
            case `ArrowDown`:
                incrementRow(1)
                break
            case `ArrowRight`:
                incrementSs(-1)
                break
            case `ArrowLeft`:
                incrementSs(1)
                break
            case `Backspace`:
                clearCurrentCell()
                break
        }
    })

    //////////////////
    // Highlighting //
    //////////////////

    let mainSelectionBox = new SelectionBox(new THREE.MeshBasicMaterial({ color: 0x111111 }))

    let ssbMat = new THREE.MeshBasicMaterial({ color: 0x404040 })
    let usedSecondarySelectionBoxes = []
    let unusedSecondarySelectionBoxes = []
    setSecondarySelectionBox = (spreadsheet, row) => {

        let alreadyGotOne = usedSecondarySelectionBoxes.reduce(
            (val, ssb) => val || (ssb.spreadsheet === spreadsheet && ssb.row === row),
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

        //your ssb vizes could be translucent?
    }

    ///////////////
    // Modifying //
    ///////////////

    function onLetterKey(event) {

        if (event.ctrlKey || selectedSpreadsheet.editable === false || event.key.length > 1)
            return

        if (!currentlyTyping)
            clearCurrentCell()
        else
            refreshCountdown = 0.65

        let selectedCell = selectedSpreadsheet.cells[selectedRow]
        selectedCell.setText(selectedCell.currentText + translateExpression(event.key))
    }
    // document.addEventListener(`keydown`, onLetterKey)

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

    ////////////////////////////
    // Refresh and visibility //
    ////////////////////////////

    function clearCurrentCell() {
        selectedSpreadsheet.cells[selectedRow].setText(``)
        selectedSpreadsheet.cells[selectedRow].refresh()
        currentlyTyping = true
    }
    updateSpreadsheetVisibilitiesAndRefresh = () => {
        // log(usedSecondarySelectionBoxes)

        let selectedCell = selectedSpreadsheet.cells[selectedRow]
        if (!currentlyTyping)
            selectedCell.refresh()
        else if (refreshCountdown !== -1.) {

            // Refresh cell if not typed into for a while
            refreshCountdown -= frameDelta

            if (refreshCountdown < 0.) {
                selectedCell.refresh()
                refreshCountdown = -1.
            }
        }


        if (allCellsVisible) {
            spreadsheets.forEach(ss => ss.cells.forEach(cell => {
                cell.setVizVisibility(true)
                if (cell !== selectedCell) //see above; this one should NOT necessarily be refreshed
                    cell.refresh()
            }))
        }
        else {
            spreadsheets.forEach(ss => ss.cells.forEach((cell, row) => {
                let visible = cell.getVizType() === MESH ? true : false
                cell.setVizVisibility(visible)
            }))
            
            selectedCell.setVizVisibility(true)

            //only know what is impacting the selected cell via the selection boxes, which is a bit crap
            usedSecondarySelectionBoxes.forEach(ssb => {
                let cell = ssb.spreadsheet.cells[ssb.row]
                cell.setVizVisibility(true)
                cell.refresh()
            })
        }
    }
}