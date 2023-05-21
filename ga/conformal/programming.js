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

    let obj3d = new THREE.Object3D()
    obj3d.position.y = 1.6
    // obj3d.scale.multiplyScalar(.3)
    scene.add(obj3d)

    let bg = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({color:0xFFFFFF}))
    obj3d.add(bg)

    bg.scale.set(4, 2.4, 1.)
    bg.position.z = -layerWidth

    let columns = 3
    let rows = 8
    let gridThickness = .01 * bg.scale.y
    let columnWidth = bg.scale.x / columns
    let columnHeight = bg.scale.y / rows

    let selectionMat = new THREE.MeshBasicMaterial({ color: 0x222222 })
    let selectionBox = new THREE.InstancedMesh(unchangingUnitSquareGeometry, selectionMat, 4)
    obj3d.add(selectionBox)
    let selectedHorizontal = 1
    let selectedVertical = 1
    
    let gridMat = new THREE.MeshBasicMaterial({color:0xAAAAAA})
    let gridLinesVerticalNum   = columns + 1
    let gridLinesHorizontalNum = rows + 1
    let gridLinesVertical   = new THREE.InstancedMesh(unchangingUnitSquareGeometry, gridMat, gridLinesVerticalNum)
    let gridLinesHorizontal = new THREE.InstancedMesh(unchangingUnitSquareGeometry, gridMat, gridLinesHorizontalNum)
    obj3d.add(gridLinesVertical, gridLinesHorizontal)

    // let theTextbox = document.getElementById("textbox")
    let theTextbox = document.createElement("INPUT")
    container.appendChild(theTextbox)
    theTextbox.setAttribute("type", "text")
    theTextbox.setAttribute("size", "1")
    theTextbox.setAttribute("font-size", "100pt")
    // theTextbox.style.visibility = "hidden"
    // theTextbox.setAttribute("type", "hidden")
    document.addEventListener(`keydown`, (event)=>{

        theTextbox.focus()
        log(theTextbox.value)
        
        //also "you're done entering into that box", so we finalize the string
        switch(event.key) {
            case `ArrowLeft`:
                selectedHorizontal -= 1
                selectedHorizontal = clamp(selectedHorizontal,0,columns-1)
                return
            case `ArrowRight`:
                selectedHorizontal += 1
                selectedHorizontal = clamp(selectedHorizontal,0,columns-1)
                return
            case `ArrowUp`:
                selectedVertical -= 1
                selectedVertical = clamp(selectedVertical,0,rows-1)
                return
            case `ArrowDown`:
                selectedVertical += 1
                selectedVertical = clamp(selectedVertical,0,rows-1)
                return
        }
    })

    function getCellPos(hor, ver) {
        let px = -bg.scale.x / 2. + columnWidth * (hor + .5)
        let py = bg.scale.y / 2. - columnHeight * (ver + .5)

        return [px,py]
    }

    ///////////////////
    // Text in cell //
    //////////////////

    let resolutionMagicNumber = 60

    let cellGeo = unchangingUnitSquareGeometry.clone()
    cellGeo.translate(.5, 0., 0.)

    class CellContents extends THREE.Mesh {
        constructor(i, j) {
            let canvas = document.createElement("canvas")
            canvas.height = resolutionMagicNumber
            let context = canvas.getContext("2d")
            let map = new THREE.CanvasTexture(canvas)

            super(cellGeo, new THREE.MeshBasicMaterial({ map: map, transparent: true }))

            this.map = map
            this.context = context
            this.canvas = canvas

            this.scale.y = columnHeight * .7
            this.scale.x = canvas.width / canvas.height * this.scale.y
            obj3d.add(this)

            let [px, py] = getCellPos(i, j)
            this.position.set(px - columnWidth / 2. + gridThickness / 2., py, 0.)

            this.updateText("") 
            //"Σ√A∧B∨⋅a*sβα" //if you want ǁ it gets a bit taller
        }

        updateText(text) {
            let textHeight = this.canvas.height
            let fontFull = textHeight + "px monospace"
            this.context.font = fontFull
            let textWidth = this.context.measureText(text).width
            this.canvas.width = textWidth || 1 //empty string needs some width
            this.canvas.height = textHeight

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
            this.context.fillText(text, 0, 0)

            this.map.needsUpdate = true
            this.scale.x = this.canvas.width / this.canvas.height * this.scale.y;
        }
    }

    let cells = Array(rows)
    for(let i = 0; i < rows; ++i) {
        cells[i] = Array(columns)
        for(let j = 0; j < columns; ++j) {
            cells[i][j] = new CellContents(i, j)
        }
    }

    cells[2][2].updateText("yoΣ√")//A∧B∨⋅a * sβα")

    /////////////////
    // update func //
    /////////////////

    let ourM = new THREE.Matrix4()
    updatePanel = () => {
        let xMin = -bg.scale.x / 2.
        for (let i = 0; i < gridLinesVerticalNum; ++i) {
            ourM.makeScale(gridThickness, bg.scale.y + gridThickness, 1.)
            ourM.setPosition(xMin + i * columnWidth, 0., 0.)
            gridLinesVertical.setMatrixAt(i, ourM)
        }
        gridLinesVertical.instanceMatrix.needsUpdate = true

        let yMax = bg.scale.y / 2.
        for (let i = 0; i < gridLinesHorizontalNum; ++i) {
            ourM.makeScale(bg.scale.x + gridThickness, gridThickness, 1.)
            ourM.setPosition(0., yMax - i * columnHeight, 0.)
            gridLinesHorizontal.setMatrixAt(i, ourM)
        }
        gridLinesHorizontal.instanceMatrix.needsUpdate = true

        //selectionBox
        {
            let [px, py] = getCellPos(selectedHorizontal, selectedVertical)
            //horizontal
            ourM.makeScale(columnWidth + gridThickness, gridThickness, 1.)
            ourM.setPosition(px, py + columnHeight / 2., layerWidth)
            selectionBox.setMatrixAt(0, ourM)
            ourM.setPosition(px, py - columnHeight / 2., layerWidth)
            selectionBox.setMatrixAt(1, ourM)
            //vertical
            ourM.makeScale(gridThickness, columnHeight + gridThickness, 1.)
            ourM.setPosition(px + columnWidth / 2., py, layerWidth)
            selectionBox.setMatrixAt(2, ourM)
            ourM.setPosition(px - columnWidth / 2., py, layerWidth)
            selectionBox.setMatrixAt(3, ourM)
            selectionBox.instanceMatrix.needsUpdate = true
        }
    }
}