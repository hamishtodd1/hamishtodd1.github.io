updateHandSpreadsheet = ()=>{}

function initSpreadsheetControl() {

    //////////////////////
    // Hand Spreadsheet //
    //////////////////////

    {
        let handSs = new Spreadsheet(3, `HAND`)
        handSs.position.x = -.8
        handSs.position.y += 1.3
        let middleMousePressed = false
        document.addEventListener(`pointerdown`, (event) => {
            if (event.button === 1)
                middleMousePressed = true
        })
        document.addEventListener(`pointerup`, (event) => {
            if (event.button === 1)
                middleMousePressed = false
        })
        updateHandSpreadsheet = () => {

            cga0.fromEga(handPosition).flatPpToConformalPoint(cga1)
            let handString = translateExpression(cga1.toString(2))
            handSs.cells[0].setText(handString)

            handSs.cells[1].setText(middleMousePressed ? `1.` : `0.`)

            handSs.cells[2].setText(`0.`)
        }

        selectedSpreadsheet = handSs

        // let meshSs = new Spreadsheet(0, `MESHES`)
        // meshSs.position.x = -handSs.position.x
        // meshSs.position.y = handSs.position.y
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
    bindButton(`ArrowUp`, () => incrementRow(-1))
    bindButton(`ArrowDown`, () => incrementRow(1))
    bindButton(`ArrowRight`, () => incrementSs(-1))
    bindButton(`ArrowLeft`, () => incrementSs(1))

    //////////////
    // Clicking //
    //////////////

    function inRect(posVec, rectPos, rectScaleX, rectScaleY) {

        let ret =
            rectPos.x - rectScaleX / 2. < posVec.x && posVec.x < rectPos.x + rectScaleX / 2. &&
            rectPos.y - rectScaleY / 2. < posVec.y && posVec.y < rectPos.y + rectScaleY / 2.
        return ret
    }

    document.addEventListener(`pointerdown`, (event) => {
        if (event.button !== 0)
            return

        //first of all we do need the position of the "mouse"
        let clickedSpreadsheet = false
        spreadsheets.forEach(ss => {
            handPosition.pointToVec3(v1)
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
            if (vizType === NO_VIZ_TYPE) //No viz
                vizType = CONFORMAL_POINT //point

            startDrawing(selectedSpreadsheet.cells[selectedRow], vizType)
        }
    })
}

