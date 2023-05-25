/*
    Functions you want:
        Add 
        Subtract
        Sum over... integral? Differential?
        Mul
        Div. Or, Inverse, and multiply by that
        Bracket I guess
        Summation over a column
        Join I guess
        Dual?
        Inner
        Wedge
        Subscript and superscript for exp and log and grade select
        Norm... infinity norm?
        Sqrt?
        Numbers
        acsin... arcos...
        Reverse (which is shit in latex)
        I mean, people expect no better in programming, no subscripts there

    Could do it with little coloured squares to represent the colors of the mvs
 */

function initProgramming() {

    let layerWidth = .01
    let columns = 2
    let rows = 14
    
    let obj3d = new THREE.Object3D()
    obj3d.position.y = 1.6
    obj3d.position.x = -1.1
    // obj3d.scale.multiplyScalar(.3)
    scene.add(obj3d)

    let bg = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({color:0xFFFFFF}))
    bg.scale.set(1.4, 2.4, 1.)
    bg.position.z = -layerWidth
    obj3d.add(bg)

    let cellWidth = bg.scale.x / columns
    let cellHeight = bg.scale.y / rows
    let gridThickness = .09 * cellHeight

    let selectionMat = new THREE.MeshBasicMaterial({ color: 0x222222 })
    let selectionBox = new THREE.InstancedMesh(unchangingUnitSquareGeometry, selectionMat, 4)
    obj3d.add(selectionBox)
    let selectedColumn = 1
    let selectedRow = 1
    
    let gridMat = new THREE.MeshBasicMaterial({color:0xAAAAAA})
    let gridLinesVerticalNum   = columns + 1
    let gridLinesHorizontalNum = rows + 1
    let gridLinesVertical   = new THREE.InstancedMesh(unchangingUnitSquareGeometry, gridMat, gridLinesVerticalNum)
    let gridLinesHorizontal = new THREE.InstancedMesh(unchangingUnitSquareGeometry, gridMat, gridLinesHorizontalNum)
    obj3d.add(gridLinesVertical, gridLinesHorizontal)

    let typeableSymbols = `abcdefghijklmnopqrstuvwxyz0123456789()*~/`
    let specialSymbols = `Σ√∧∨⋅`
    let specialStandin = `£#^&|`
    document.addEventListener(`keydown`, (event)=>{

        let selectedCell = cells[selectedColumn][selectedRow]

        //also "you're done entering into that box", so we finalize the string
        switch(event.key) {
            case `ArrowLeft`:
                selectedColumn -= 1
                selectedColumn = clamp(selectedColumn,0,columns-1)
                return
            case `ArrowRight`:
                selectedColumn += 1
                selectedColumn = clamp(selectedColumn,0,columns-1)
                return
            case `ArrowUp`:
                selectedRow -= 1
                selectedRow = clamp(selectedRow,0,rows-1)
                return
            case `ArrowDown`:
                selectedRow += 1
                selectedRow = clamp(selectedRow,0,rows-1)
                return
            default:
                if ( typeableSymbols.indexOf(event.key) !== -1 )
                    selectedCell.append(event.key)
                else if(specialStandin.indexOf(event.key) !== -1)
                    selectedCell.append(specialSymbols[specialStandin.indexOf(event.key)])
        }
    })

    function getCellPos(column, row) {
        let px = -bg.scale.x / 2. + cellWidth * (column + .5)
        let py = bg.scale.y / 2. - cellHeight * (row + .5)

        return [px,py]
    }

    ///////////////////
    // Text in cell //
    //////////////////

    let canvasVerticalResolution = 60
    let canvasHorizontalResolution = 380
    //have to choose a max then stick to it, it's complicated to think about changing uvs at runtime

    let cellGeo = unchangingUnitSquareGeometry.clone()
    cellGeo.translate(.5, 0., 0.)

    class CellContents extends THREE.Mesh {
        constructor(column,row) {
            let canvas = document.createElement("canvas")
            let context = canvas.getContext("2d")
            let map = new THREE.CanvasTexture(canvas)

            super(cellGeo, new THREE.MeshBasicMaterial({ map: map, transparent: true }))
            
            this.map = map
            this.context = context
            this.canvas = canvas

            this.canvas.height = canvasVerticalResolution
            this.canvas.width = canvasHorizontalResolution
            this.scale.y = cellHeight * .7
            this.scale.x = this.canvas.width / this.canvas.height * this.scale.y;
            obj3d.add(this)

            let [px, py] = getCellPos(column, row)
            this.position.set(px - cellWidth / 2. + gridThickness / 2., py, 0.)

            //"Σ√A∧B∨⋅a*sβα" //if you want ǁ it gets a bit taller
            this.currentText = ``
        }

        append(char) {
            this.currentText += char

            let textHeight = this.canvas.height
            let fontFull = textHeight + "px monospace"
            this.context.font = fontFull
            let textWidth = this.context.measureText(this.currentText).width

            this.context.font = fontFull
            this.context.textAlign = "left"
            this.context.textBaseline = "top"

            // this.context.clearRect(
            //     this.canvas.width  / 2 - textWidth  / 2 - backgroundMargin / 2,
            //     this.canvas.height / 2 - textHeight / 2 - backgroundMargin / 2,
            //     textWidth  + backgroundMargin,
            //     textHeight + backgroundMargin)

            let textColor = "#000000"
            this.context.fillStyle = textColor
            this.context.fillText(this.currentText, 0, 0)

            this.map.needsUpdate = true
            // log(this.canvas.width / this.canvas.height, this.scale)al
        }
    }

    let cells = Array(columns)
    for(let column = 0; column < columns; ++column) {
        cells[column] = Array(rows)
        for(let row = 0; row < rows; ++row) {
            cells[column][row] = new CellContents(column,row)
        }
    }    

    cells[0][0].append(`e1`)
    cells[0][1].append(`e2`)

    /////////////////
    // update func //
    /////////////////

    let ourM = new THREE.Matrix4()
    updatePanel = () => {
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
    }
}