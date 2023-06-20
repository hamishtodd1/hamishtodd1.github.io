/*
    You do want a little "lock" symbol next to the columns that you can check to make it stay visible

    NoModes: AT ANY TIME you can grab ANY object you can see and modify it
        Or, create a new object
    So the way it works:
        You're always in drawing mode of some kind
            If you click in space, and there's nothing you're clicking on,
            by default it makes the thing you've currently got selected
            If you were currently on a blank cell, it uses that
            If you were currently on a cell containing a free thing, it uses that
            But if currently on a cell defined by other things
        You can select a new black cell

    When you call a function
        could inline it, a little box-within-box
        or: it's another column. It comes along and sits on the right

    Cells should get smaller and become washed out when not visible
        When you hover them with pointer, the things in them become visible
            BUT the boxes themselves only re-inflate if you select
        So, you're only looking at the definition of one of the things at a time

    call your boost-generators, aka imaginary lines, "dual point pairs"
    Zero radius sphere ^ zero radius sphere = dual point pair
    Zero radius sphere ^ dual point pair = 
 */

function updatePanel(){}

function initSpreadsheet() {

    let selectedColumn = 0
    let selectedRow = 0
    let initial = [
        [`0.7e123p - 0.7e123m`],
        [`2e12`],
        [`-1`],
        [`hand & e123`, `ep`],
        [`e23 - time * e13`],
        [`e1 - e0`, `e2`],
        [`e4 + time * e0`, `e3`],
        [`e23 - e03`],
        [`hand`],
        [`(1+time*e01) > e1`, `e23`],
        [`A3 + A4`],
    ]

    let columns = 2
    let rows = 14
    let layerWidth = .001

    spreadsheet = new THREE.Object3D()
    scene.add(spreadsheet)

    let bgMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide })
    let bg = new THREE.Mesh(unchangingUnitSquareGeometry, bgMat )
    bg.scale.set(2.4, 2.4, 1.)
    bg.position.z = -layerWidth
    spreadsheet.add(bg)
    spreadsheet.position.set( -bg.scale.x / 2., 1.6, .01 )

    let cellWidth = bg.scale.x / columns
    let cellHeight = bg.scale.y / rows
    initCells(cellWidth, cellHeight)
    
    let refreshCountdown = -1.
    let currentlyTyping = false
    
    initNotation()

    initial.forEach( (a,i) => {
        a.forEach( (b,j) => {
            initial[i][j] = translateExpression(b)
        })
    })

    function selectCell(newColumn, newRow) {

        mainSelectionBox.setColumnRow(newColumn,newRow)

        resetSecondarySelectionBoxes()
        forEachCell(cell=>cell.setVizVisibility(false))

        selectedColumn = newColumn
        selectedRow = newRow

        cells[selectedColumn][selectedRow].refresh()
        cells[selectedColumn][selectedRow].setVizVisibility(true)

        currentlyTyping = false
    }

    //////////
    // Grid //
    //////////
    
    let gridThickness = .09 * cellHeight

    let gridMat = new THREE.MeshBasicMaterial({ color: 0xAAAAAA })
    let gridLinesVerticalNum = columns + 1
    let gridLinesHorizontalNum = rows + 1
    let gridLinesVertical = new THREE.InstancedMesh(unchangingUnitSquareGeometry, gridMat, gridLinesVerticalNum)
    let gridLinesHorizontal = new THREE.InstancedMesh(unchangingUnitSquareGeometry, gridMat, gridLinesHorizontalNum)
    spreadsheet.add(gridLinesVertical, gridLinesHorizontal)

    getCellPos = (column, row) => {
        let px = -bg.scale.x / 2. + cellWidth * (column + .5)
        let py = bg.scale.y / 2. - cellHeight * (row + .5)

        return [px, py]
    }

    function forEachCell(func) {
        for (let column = 0; column < columns; ++column) {
            for (let row = 0; row < rows; ++row)
                func(cells[column][row], column, row)
        }
    }
    for (let column = 0; column < columns; ++column) {
        cells[column] = Array(rows)
        for (let row = 0; row < rows; ++row) {
            cells[column][row] = new Cell(column, row)
        }
    }

    ///////////////
    // Selection //
    ///////////////

    class SelectionBox extends THREE.InstancedMesh {

        constructor(mat) {
            
            super(unchangingUnitSquareGeometry, mat, 4)
            spreadsheet.add(this)
        }

        setColumnRow(col, row) {
            let [px, py] = getCellPos(col, row)
            //horizontal
            ourM.makeScale(cellWidth + gridThickness, gridThickness, 1.)
            ourM.setPosition(px, py + cellHeight / 2., layerWidth)
            this.setMatrixAt(0, ourM)
            ourM.setPosition(px, py - cellHeight / 2., layerWidth)
            this.setMatrixAt(1, ourM)
            //vertical
            ourM.makeScale(gridThickness, cellHeight + gridThickness, 1.)
            ourM.setPosition(px + cellWidth / 2., py, layerWidth)
            this.setMatrixAt(2, ourM)
            ourM.setPosition(px - cellWidth / 2., py, layerWidth)
            this.setMatrixAt(3, ourM)
            this.instanceMatrix.needsUpdate = true
        }
    }
    let mainSelectionBox = new SelectionBox( new THREE.MeshBasicMaterial({ color: 0x111111 }) )

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
    setSecondarySelectionBox = (col, row) => {
        if (unusedSecondarySelectionBoxes.length === 0) {
            let ssb = new SelectionBox(ssbMat)
            unusedSecondarySelectionBoxes.push(ssb)
            usedSecondarySelectionBoxes.push(ssb)
        }

        let ssb = unusedSecondarySelectionBoxes.pop()
        ssb.setColumnRow(col, row)
        ssb.visible = true
        usedSecondarySelectionBoxes.push(ssb)
    }

    //////////////
    // Controls //
    //////////////

    function incrementSelection( increment, isRow ) {
        let newVal = isRow ? selectedRow : selectedColumn
        newVal += increment
        newVal = clamp(newVal, 0, isRow?rows:columns - 1)

        if(isRow)
            selectCell( selectedColumn, newVal)
        else
            selectCell( newVal, selectedRow)
    }

    function clearCurrentCell() {
        cells[selectedColumn][selectedRow].setText(``)
        currentlyTyping = true
        cells[selectedColumn][selectedRow].refresh()
    }

    document.addEventListener(`keydown`, (event)=>{

        let selectedCell = cells[selectedColumn][selectedRow]

        if(event.key.length === 1) {
            if (!currentlyTyping)
                clearCurrentCell()
            else
                refreshCountdown = 0.65

            selectedCell.append(translateExpression(selectCell.currentText + event.key))
        }

        //also "you're done entering into that box", so we finalize the string
        switch(event.key) {
            case `ArrowLeft`:
                incrementSelection(-1,false)
                return
            case `ArrowRight`:
                incrementSelection( 1,false)
                return
            case `ArrowUp`:
                incrementSelection(-1,true)
                return
            case `ArrowDown`:
                incrementSelection( 1,true)
                return
            case `Backspace`:
                clearCurrentCell()
                return
        }
    })

    function inRect( posVec, rectPos, rectScaleX, rectScaleY ) {

        let ret = 
            rectPos.x-rectScaleX / 2. < posVec.x && posVec.x < rectPos.x+rectScaleX / 2. &&
            rectPos.y-rectScaleY / 2. < posVec.y && posVec.y < rectPos.y+rectScaleY / 2.
        return ret
    }
    document.addEventListener(`mousedown`, (event) => {
        if (event.button !== 0)
            return

        //first of all we do need the position of the "mouse"
        mousePlanePosition.pointToVec3(v1)
        spreadsheet.worldToLocal(v1)
        
        if ( inRect(v1, bg.position, bg.scale.x, bg.scale.y ) ) {
            forEachCell((cell, column, row)=>{
                
                if( inRect(v1, cell.position, cellWidth,cellHeight) )
                    selectCell(column, row)
            })
        }
        else {
            let newRow = -1
            for (newRow = cells[0].length-2; newRow > -1; --newRow) {
                if( cells[0][newRow].currentText !== ``) {
                    break
                }
            }
            ++newRow

            let cellToWriteTo = cells[0][newRow]
            cga0.fromEga(mousePlanePosition).flatPpToConformalPoint(cga0)
            let newText = translateExpression(cga0.toString(3))
            cellToWriteTo.setText(newText)

            selectCell(selectedColumn, newRow)
        }
    })

    ///////////////////////
    // Update appearance //
    ///////////////////////

    let ourM = new THREE.Matrix4()
    updatePanel = () => {

        // cells[0][0].setText( clock.getElapsedTime().toFixed(0) )
        // cells[0][3].setText( mousePlanePosition[13].toFixed(2) )
        // cells[0][4].setText( mousePlanePosition[12].toFixed(2) )

        //appearance
        let xMin = -bg.scale.x / 2.
        for (let i = 0; i < gridLinesVerticalNum; ++i) {
            ourM.makeScale(gridThickness, bg.scale.y + gridThickness, 1.)
            ourM.setPosition(xMin + i * cellWidth, 0., 0.)
            gridLinesVertical.setMatrixAt(i, ourM)
        }
        gridLinesVertical.instanceMatrix.needsUpdate = true

        let yMax = bg.scale.y / 2.
        for (let i = 0; i < gridLinesHorizontalNum; ++i) {
            ourM.makeScale(bg.scale.x + gridThickness, gridThickness, 1.)
            ourM.setPosition(0., yMax - i * cellHeight, 0.)
            gridLinesHorizontal.setMatrixAt(i, ourM)
        }
        gridLinesHorizontal.instanceMatrix.needsUpdate = true

        // Refresh cell if not typed into. Currently useless since if it's visible it's refreshed every frame
        if (refreshCountdown !== -1.) {
            refreshCountdown -= frameDelta

            if (refreshCountdown < 0.) {
                // log(refreshCountdown)
                cells[selectedColumn][selectedRow].refresh()
                cells[selectedColumn][selectedRow].setVizVisibility(true)
                refreshCountdown = -1.
            }
        }

        if (!currentlyTyping)
            cells[selectedColumn][selectedRow].refresh()
    }

    /////////////
    // Finally //
    /////////////

    forEachCell((cell, col, row) => {
        if (initial[row] !== undefined && initial[row][col] !== undefined) {
            cell.append(initial[row][col])
            cell.refresh()
        }
    })
    selectCell(selectedColumn, selectedRow)
}