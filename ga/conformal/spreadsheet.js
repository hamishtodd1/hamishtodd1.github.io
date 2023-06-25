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

    let initial = [
    [
        `exp( time * (e12 + e01) )`,
        `0.7e123p - 0.7e123m`,
        `2e12`,
        `-1`,
        `hand & e123`,
        `e23 - time * e13`,
        `e1 - e0`,
        `e4 + time * e0`,
        `e23 - e03`,
        `hand`,
        `(1+time*e01) > e1`,
        `A3 + A4`,
        `A1 > hand`,
    ],
    [
        `ep`, `e2`, `e3`, `e23`
    ]
    ]
    initNotation()
    initial.forEach((a, i) => {
        a.forEach((b, j) => {
            initial[i][j] = translateExpression(b)
        })
    })

    let refreshCountdown = -1.
    let currentlyTyping = false
    
    let cellWidth = 1.2
    let cellHeight = 0.11
    initCells(cellWidth, cellHeight)

    let gridThickness = .09 * cellHeight
    let gridMat = new THREE.MeshBasicMaterial({ color: 0xAAAAAA })
    let layerWidth = .001
    
    let ourM = new THREE.Matrix4()
    let MAX_CELLS = 30 //based on nothing right now
    class Spreadsheet extends THREE.Object3D {
        constructor(numRows) {
            super()
            scene.add(this)
            spreadsheets.push(this)
            this.position.set(0., 1.6, .01)

            let bgMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide })
            this.bg = new THREE.Mesh(unchangingUnitSquareGeometry, bgMat)
            this.bg.position.z = -layerWidth
            this.add(this.bg)

            this.cells = []
            for (let row = 0; row < numRows; ++row) {
                this.cells[row] = new Cell()
                this.add(this.cells[row])
            }
            this.updateScale()

            let gridLinesHorizontalNum = MAX_CELLS + 1
            let gridLinesVertical = new THREE.InstancedMesh(unchangingUnitSquareGeometry, gridMat, 2)
            let gridLinesHorizontal = new THREE.InstancedMesh(unchangingUnitSquareGeometry, gridMat, gridLinesHorizontalNum)
            this.add( gridLinesVertical, gridLinesHorizontal )

            this.bg.onBeforeRender = () => {

                //for vr, except you're doing the mouse-in-plane thing for now
                // this.lookAt(camera.position)

                this.cells.forEach( (cell,row) => {
                    cell.position.set(0., this.getCellY(row), 0.)
                })

                this.updateScale()

                let xMin = -this.bg.scale.x / 2.
                for (let i = 0; i < 2; ++i) {
                    ourM.makeScale(gridThickness, this.bg.scale.y + gridThickness, 1.)
                    ourM.setPosition(xMin + i * cellWidth, 0., 0.)
                    gridLinesVertical.setMatrixAt(i, ourM)
                }
                gridLinesVertical.instanceMatrix.needsUpdate = true

                let yMax = this.bg.scale.y / 2.
                for (let i = 0; i < gridLinesHorizontalNum; ++i) {
                    let iLimited = Math.min(i, this.cells.length)
                    ourM.makeScale(this.bg.scale.x + gridThickness, gridThickness, 1.)
                    ourM.setPosition(0., yMax - iLimited * cellHeight, 0.)
                    gridLinesHorizontal.setMatrixAt(i, ourM)
                }
                gridLinesHorizontal.instanceMatrix.needsUpdate = true
            }
        }

        addCell() {
            let row = this.cells.length
            let cell = new Cell()
            this.add( cell )
            cell.position.set(0., this.getCellY(row), 0.)
            this.cells[row] = cell
        }

        updateScale() {
            this.bg.scale.set(cellWidth, cellHeight * this.cells.length, 1.)
        }

        getCellY(row) {
            return this.bg.scale.y / 2. - cellHeight * (row+.5)
        }
    }
    let ss1 = new Spreadsheet(initial[0].length)
    ss1.position.x = -cellWidth / 2. - .1
    let ss2 = new Spreadsheet(initial[1].length)
    ss2.position.x =  cellWidth / 2. + .1

    function forEachCell(func) {
        spreadsheets.forEach((ss,ssIndex) => {
            ss.cells.forEach( ( cell, cellIndex ) => {
                func( cell, ssIndex, cellIndex )
            })
        })
    }

    ///////////////
    // Selection //
    ///////////////

    class SelectionBox extends THREE.InstancedMesh {

        constructor(mat) {
            
            super(unchangingUnitSquareGeometry, mat, 4)
            
        }

        setPosition(spreadsheet, row) {

            spreadsheet.add(this)

            let py = spreadsheet.getCellY(row)
            //horizontal
            ourM.makeScale(cellWidth + gridThickness, gridThickness, 1.)
            ourM.setPosition(0., py + cellHeight / 2., layerWidth)
            this.setMatrixAt(0, ourM)
            ourM.setPosition(0., py - cellHeight / 2., layerWidth)
            this.setMatrixAt(1, ourM)
            //vertical
            ourM.makeScale(gridThickness, cellHeight + gridThickness, 1.)
            ourM.setPosition(0. + cellWidth / 2., py, layerWidth)
            this.setMatrixAt(2, ourM)
            ourM.setPosition(0. - cellWidth / 2., py, layerWidth)
            this.setMatrixAt(3, ourM)
            this.instanceMatrix.needsUpdate = true
        }
    }
    let mainSelectionBox = new SelectionBox( new THREE.MeshBasicMaterial({ color: 0x111111 }) )

    function selectCell(newSs, newRow) {

        resetSecondarySelectionBoxes()
        forEachCell(cell => cell.setVizVisibility(false))

        selectedSpreadsheet = newSs
        selectedRow = newRow
        selectedSpreadsheet.cells[selectedRow].refresh()
        selectedSpreadsheet.cells[selectedRow].setVizVisibility(true)

        mainSelectionBox.setPosition(newSs, newRow)

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

        if (unusedSecondarySelectionBoxes.length === 0) {
            let ssb = new SelectionBox(ssbMat)
            unusedSecondarySelectionBoxes.push(ssb)
        }

        let ssb = unusedSecondarySelectionBoxes.pop()
        ssb.setPosition(spreadsheet, row)
        ssb.visible = true
        usedSecondarySelectionBoxes.push(ssb)
    }

    //////////////////////////
    // Controls / selection //
    //////////////////////////

    let rememberedSelectedRow = 0
    function incrementCell( increment ) {
        let maxVal = selectedSpreadsheet.cells.length - 1
        let newVal = clamp(selectedRow + increment, 0, maxVal)
        selectCell( selectedSpreadsheet, newVal)
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

    document.addEventListener(`keydown`, (event)=>{

        let selectedCell = selectedSpreadsheet.cells[selectedRow]

        if(event.key.length === 1) {
            if (!currentlyTyping)
                clearCurrentCell()
            else
                refreshCountdown = 0.65

            selectedCell.setText(translateExpression(selectedCell.currentText + event.key))
        }

        //also "you're done entering into that box", so we finalize the string
        switch(event.key) {
            case `ArrowUp`:
                incrementCell( -1 )
                return
            case `ArrowDown`:
                incrementCell(  1 )
                return
            case `ArrowRight`:
                incrementSs(-1)
                return
            case `ArrowLeft`:
                incrementSs(1)
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
        let clickedSpreadsheet = false
        spreadsheets.forEach(ss=>{
            mousePlanePosition.pointToVec3(v1)
            ss.worldToLocal(v1)
            if( inRect(v1, ss.bg.position, ss.bg.scale.x, ss.bg.scale.y) ) {
                ss.cells.forEach((cell,row)=>{
                    if (inRect(v1, cell.position, cellWidth, cellHeight)) {
                        selectCell(ss, row)
                        clickedSpreadsheet = true
                        rememberedSelectedRow = row
                    }
                })
            }
        })
        
        if ( !clickedSpreadsheet ) {
            selectedSpreadsheet.addCell()

            let newRow = selectedSpreadsheet.cells.length - 1
            let cellToWriteTo = selectedSpreadsheet.cells[newRow]
            cga0.fromEga(mousePlanePosition).flatPpToConformalPoint(cga0)
            let newText = translateExpression(cga0.toString(3))
            cellToWriteTo.setText(newText)

            selectedSpreadsheet.updateScale()
            selectCell(selectedSpreadsheet, newRow)
        }
    })

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

    /////////////
    // Finally //
    /////////////

    forEachCell((cell, ssIndex, row) => {
        if (initial[ssIndex] !== undefined && initial[ssIndex][row] !== undefined) {
            cell.append(initial[ssIndex][row])
            cell.refresh()
        }
    })
    let selectedSpreadsheet = spreadsheets[0]
    let selectedRow = 0
    selectCell(selectedSpreadsheet, selectedRow)
}