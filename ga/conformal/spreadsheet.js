/*
    NoModes: AT ANY TIME you can grab ANY object and modify it
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

    Cells should get smaller and fade out when not visible
        When you hover them with pointer, the things in them become visible
            BUT the boxes themselves only re-inflate if you select
        So, you're only looking at the definition of one of the things at a time
 */

function updatePanel(){}

function initSpreadsheet() {
    
    let selectedColumn = 0
    let selectedRow = 0
    let initial = [
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
    
    let refreshCountdown = -1.
    let typingIntoCell = false
    
    let typeableSymbols = `()*+-_~ .0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`
    let specialSymbols = `∧∨·⤻` //Σ√
    let specialStandin = `^&'>` //£#
    let subscriptables = [`0`, `1`, `2`, `3`, `4`, `5`, `p`, `m`, `o`]
    let subscripts     = [`₀`, `₁`, `₂`, `₃`, `₄`, `₅`, `ₚ`, `ₘ`, `𝅘`]

    let subscriptify = false
    translateChar = (char) => {

        if (subscriptables.includes(char) && subscriptify) {
            let index = subscriptables.indexOf(char)
            return index === -1 ? char : subscripts[index]
        }
        else {

            if (char === `e`)
                subscriptify = true
            else
                subscriptify = false

            if (specialStandin.indexOf(char) !== -1)
                return specialSymbols[specialStandin.indexOf(char)]
            else if (typeableSymbols.indexOf(char) !== -1)
                return char
            else
                return ``

        }
    }

    translateExpression = (expression) => {
        return expression.replace(/./g, translateChar)
    }

    initial.forEach( (a,i) => {
        a.forEach( (b,j) => {
            initial[i][j] = translateExpression(b)
        })
    })

    let layerWidth = .001
    let columns = 2
    let rows = 14

    let bg = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side:THREE.DoubleSide }))
    bg.scale.set(2.4, 2.4, 1.)
    bg.position.z = -layerWidth
    
    let obj3d = new THREE.Object3D()
    obj3d.position.y = 1.6
    obj3d.position.x = -bg.scale.x / 2.
    obj3d.position.z = .01
    // obj3d.scale.multiplyScalar(.3)
    scene.add(obj3d)
    obj3d.add(bg)

    let cellWidth = bg.scale.x / columns
    let cellHeight = bg.scale.y / rows
    let gridThickness = .09 * cellHeight

    let selectionMat = new THREE.MeshBasicMaterial({ color: 0x222222 })
    let selectionBox = new THREE.InstancedMesh(unchangingUnitSquareGeometry, selectionMat, 4)
    obj3d.add(selectionBox)
    
    let gridMat = new THREE.MeshBasicMaterial({color:0xAAAAAA})
    let gridLinesVerticalNum   = columns + 1
    let gridLinesHorizontalNum = rows + 1
    let gridLinesVertical   = new THREE.InstancedMesh(unchangingUnitSquareGeometry, gridMat, gridLinesVerticalNum)
    let gridLinesHorizontal = new THREE.InstancedMesh(unchangingUnitSquareGeometry, gridMat, gridLinesHorizontalNum)
    obj3d.add(gridLinesVertical, gridLinesHorizontal)

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
        typingIntoCell = true
        subscriptify = false
        cells[selectedColumn][selectedRow].refresh()
    }

    document.addEventListener(`keydown`, (event)=>{

        let selectedCell = cells[selectedColumn][selectedRow]

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
            default:
                
                if (!typingIntoCell )
                    clearCurrentCell()
                else
                    refreshCountdown = 0.5

                selectedCell.append(translateChar(event.key))
        }
    })

    function selectCell(newColumn, newRow) {
        cells[selectedColumn][selectedRow].setVizVisibility(false)

        selectedColumn = newColumn
        selectedRow = newRow

        cells[selectedColumn][selectedRow].refresh()
        cells[selectedColumn][selectedRow].setVizVisibility(true)

        typingIntoCell = false
    }

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
        obj3d.worldToLocal(v1)
        
        if ( inRect(v1, bg.position, bg.scale.x, bg.scale.y ) ) {
            forEachCell((cell, column, row)=>{
                
                if( inRect(v1, cell.position, cellWidth,cellHeight) )
                    selectCell(column, row)
            })
        }
        else {
            let newRow = -1
            for(let i = cells[0].length-2; i > -1; --i) {
                if( cells[0][i].currentText !== ``) {
                    newRow = i+1
                    break
                }
            }

            let cellToWriteTo = cells[0][newRow]
            let newText = cga0.fromEga(mousePlanePosition).flatPpToConformalPoint(cga0).asString()
            log(newText)
            cellToWriteTo.setText(newText)

            selectCell(selectedColumn, newRow)
        }
    })

    function getCellPos(column, row) {
        let px = -bg.scale.x / 2. + cellWidth * (column + .5)
        let py =  bg.scale.y / 2. - cellHeight * (row + .5)

        return [px,py]
    }

    ///////////////
    // Viz types //
    ///////////////

    //enum
    const NO_VIZ_TYPE = 0
    const SPHERE = 1
    const ROTOR = 2 //grade wise that's more like a circle but this will do for now
    const PP = 3
    const CONFORMAL_POINT = 3
    const vizTypes = [NO_VIZ_TYPE, SPHERE, ROTOR, PP, CONFORMAL_POINT ]
    //want a mesh type, and a curve type
    //no longer sorts-of-viz
    let constructors = [() => null, SphereViz, RotorViz, PpViz, ConformalPointViz]

    let evaluatedCga = new Cga()

    let numOfEachVizType = 90
    let unusedVizes = Array(vizTypes.length)
    for (let i = 0; i < vizTypes.length; ++i) {
        unusedVizes[i] = Array(numOfEachVizType)
        for (let j = 0; j < numOfEachVizType; ++j) {
            if (i === 0)
                unusedVizes[i][j] = null
            else {
                unusedVizes[i][j] = new constructors[i]()
                unusedVizes[i][j].visible = false
            }
        }
    }

    ///////////////////
    // Text in cell //
    //////////////////

    //both of these matter to where the text appears
    let textMeshHeight = cellHeight * .7
    let textMeshWidth = cellWidth - (cellHeight-textMeshHeight)
    let canvasVerticalResolution = 60
    let canvasHorizontalResolution = canvasVerticalResolution * textMeshWidth / textMeshHeight
    //have to choose a max then stick to it, it's complicated to think about changing uvs at runtime

    class Cell extends THREE.Mesh {
        constructor(column,row) {
            let canvas = document.createElement("canvas")
            let context = canvas.getContext("2d")
            let map = new THREE.CanvasTexture(canvas)

            super(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ map: map, transparent: true }))
            
            this.map = map
            this.context = context
            this.canvas = canvas

            this.canvas.height = canvasVerticalResolution
            this.canvas.width = canvasHorizontalResolution
            this.scale.y = textMeshHeight
            this.scale.x = textMeshWidth
            obj3d.add(this)

            let [px, py] = getCellPos(column, row)
            this.position.set(px, py, 0.)

            this.viz = null //so vis type is NO_VIZ_TYPE

            //"Σ√A∧B∨⋅a*sβα" //if you want ǁ it gets a bit taller
            this.currentText = ``

            this.setVizVisibility(false)
        }

        refresh() {

            let oldVizType = this.viz === null ? NO_VIZ_TYPE : constructors.indexOf(this.viz.constructor)

            // if (this.currentText === `hand & e123`)
            //     debugger

            let error = compile(this.currentText, evaluatedCga, 0)
            let vizType = NO_VIZ_TYPE
            if(error === ``) {

                vizType = evaluatedCga.grade()
                if(vizType === -2 || vizType === -1 ) //0 is a rotor
                    vizType = ROTOR
                
            }

            if (oldVizType !== vizType) {
                
                this.setVizVisibility(false)

                unusedVizes[oldVizType].push(this.viz)
                this.viz = unusedVizes[vizType].pop()
            }

            //now give it the value
            if (vizType !== NO_VIZ_TYPE)
                evaluatedCga.cast(this.viz.getMv())
        }

        setText(newText) {
            this.currentText = newText

            let textHeight = this.canvas.height
            let fontFull = textHeight + "px monospace"
            this.context.font = fontFull

            this.context.font = fontFull
            this.context.textAlign = "left"
            this.context.textBaseline = "top"

            // this.context.fillStyle = "#FF0000" //for debugging
            // this.context.fillRect(
            this.context.clearRect(
                0, 0,
                this.canvas.width,
                this.canvas.height )

            let textColor = "#000000"
            this.context.fillStyle = textColor
            this.context.fillText(this.currentText, 0, 0)

            this.map.needsUpdate = true
            // log(this.canvas.width / this.canvas.height, this.scale)al
        }

        append(suffix) {
            this.setText( this.currentText + suffix )
        }

        setVizVisibility(newVisibility) {
            if(this.viz !== null)
                this.viz.visible = newVisibility
        }
    }

    function forEachCell(func) {
        for (let column = 0; column < columns; ++column) {
            for (let row = 0; row < rows; ++row)
                func(cells[column][row], column, row)
        }
    }
    for(let column = 0; column < columns; ++column) {
        cells[column] = Array(rows)
        for(let row = 0; row < rows; ++row) {
            cells[column][row] = new Cell(column,row)
        }
    }

    initial.forEach( ( arr, i ) => {
        arr.forEach( ( entry, j ) => {
            cells[j][i].append(entry)
            cells[j][i].refresh()
        })
    })

    /////////////////
    // update func //
    /////////////////

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

        //selectionBox
        {
            let [px, py] = getCellPos(selectedColumn, selectedRow)
            //horizontal
            ourM.makeScale(cellWidth + gridThickness, gridThickness, 1.)
            ourM.setPosition(px, py + cellHeight / 2., layerWidth)
            selectionBox.setMatrixAt(0, ourM)
            ourM.setPosition(px, py - cellHeight / 2., layerWidth)
            selectionBox.setMatrixAt(1, ourM)
            //vertical
            ourM.makeScale(gridThickness, cellHeight + gridThickness, 1.)
            ourM.setPosition(px + cellWidth / 2., py, layerWidth)
            selectionBox.setMatrixAt(2, ourM)
            ourM.setPosition(px - cellWidth / 2., py, layerWidth)
            selectionBox.setMatrixAt(3, ourM)
            selectionBox.instanceMatrix.needsUpdate = true
        }

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

        cells.forEach((column, i) => {
            column.forEach((cell, j) => {
                if (i === selectedColumn && j === selectedRow && typingIntoCell)
                    return

                if ( cell.viz && cell.viz.visible)
                    cell.refresh()
            })
        })
    }

    selectCell(selectedColumn, selectedRow)
}