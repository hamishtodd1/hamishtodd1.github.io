/*
    You do want a little "lock" symbol next to the columns that you can check to make it stay visible

    should be able to hover within a cell, over eg the "e2" in "2e1 + 5e2", and see that thing

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

    let gridThickness = .09 * cellHeight
    let gridMat = new THREE.MeshBasicMaterial({ color: 0xAAAAAA, side:THREE.DoubleSide })
    let layerWidth = .001

    let MAX_CELLS = 30 //based on nothing right now

    let cellWidthMax = 1.9 // trying to squee
    let textMeshHeight = cellHeight * .7 //you get a .3 padding on all four sides
    let canvasYRez = 64 //eyeballed

    function canvasXRezToCellWidth(canvasXRez) {
        let textMeshWidth = canvasXRez / canvasYRez * textMeshHeight
        let cellWidth = textMeshWidth + (cellHeight - textMeshHeight)
        return cellWidth
    }
    function cellWidthToCanvasXRez(cellWidth) {
        let textMeshWidth = cellWidthToTextMeshWidth(cellWidth)
        let canvasXRez = canvasYRez * textMeshWidth / textMeshHeight
        return canvasXRez
    }
    function cellWidthToTextMeshWidth(cellWidth) {
        return cellWidth - (cellHeight - textMeshHeight)
    }
    let canvasXRezMax = cellWidthToCanvasXRez(cellWidthMax)
    let textMeshWidthMax = cellWidthToTextMeshWidth(cellWidthMax)

    {
        //enum
        const NO_VIZ_TYPE = 0
        const SPHERE = 1
        const ROTOR = 2 //grade wise that's more like a circle but this will do for now
        const PP = 3
        const CONFORMAL_POINT = 3
        const vizTypes = [NO_VIZ_TYPE, SPHERE, ROTOR, PP, CONFORMAL_POINT]
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

        class Cell extends THREE.Mesh {
            constructor(spreadsheet) {
                let canvas = document.createElement("canvas")
                let context = canvas.getContext("2d")
                let map = new THREE.CanvasTexture(canvas)

                super(spreadsheet.cellGeo, new THREE.MeshBasicMaterial({ map: map, transparent: true }))

                this.spreadsheet = spreadsheet

                this.minCellWidth = cellHeight

                this.map = map
                this.context = context
                this.canvas = canvas

                this.canvas.height = canvasYRez
                this.canvas.width = canvasXRezMax
                this.scale.y = textMeshHeight
                //scale.x handled by spreadsheet

                this.viz = null //so vis type is NO_VIZ_TYPE

                //"Σ√A∧B∨⋅a*sβα" //if you want ǁ it gets a bit taller
                this.currentText = ``
                this.lastParsedText = ``
                this.parsedTokens = []

                this.setVizVisibility(false)
            }

            refresh() {

                if (this.currentText === this.lastParsedText) {
                    let compiledToMv = compile(this.parsedTokens, evaluatedCga, 0)
                    if (compiledToMv)
                        evaluatedCga.cast(this.viz.getMv())
                }
                else {
                    while (this.parsedTokens.length !== 0) {
                        delete this.parsedTokens.pop()
                    }
                    this.parsedTokens = reparseTokens(this.currentText)
                    this.lastParsedText = this.currentText

                    let oldVizType = this.viz === null ? NO_VIZ_TYPE : constructors.indexOf(this.viz.constructor)

                    let compiledToMv = compile(this.parsedTokens, evaluatedCga, 0)
                    let vizType = NO_VIZ_TYPE
                    if (compiledToMv) {

                        vizType = evaluatedCga.grade()
                        if (vizType === -2 || vizType === -1 || vizType === 0) //0 is a rotor
                            vizType = ROTOR

                    }

                    if (oldVizType !== vizType) {

                        //putting old one to sleep
                        this.setVizVisibility(false)
                        unusedVizes[oldVizType].push(this.viz)

                        this.viz = unusedVizes[vizType].pop()
                        this.setVizVisibility(true)
                    }

                    //now give it the value
                    if (vizType !== NO_VIZ_TYPE)
                        evaluatedCga.cast(this.viz.getMv())
                }
            }

            setText(newText) {
                this.currentText = newText

                this.context.font = this.canvas.height + `px monospace`
                this.context.textAlign = `left`
                this.context.textBaseline = `top`

                // this.context.fillStyle = "#FF0000" //for debugging
                // this.context.fillRect(
                this.context.clearRect(
                    0, 0,
                    this.canvas.width,
                    this.canvas.height)

                this.context.fillStyle = "#000000"
                this.context.fillText(this.currentText, 0, 0)

                this.map.needsUpdate = true

                let textWidth = this.context.measureText(this.currentText).width
                this.minCellWidth = clamp(canvasXRezToCellWidth(textWidth), cellHeight, cellWidthMax)
                this.spreadsheet.resizeFromCellWidths()
            }

            append(suffix) {
                this.setText(this.currentText + suffix)
            }

            setVizVisibility(newVisibility) {
                if (this.viz !== null)
                    this.viz.visible = newVisibility
            }
        }
        window.Cell = Cell
    }

    {
        const spandrelShape = new THREE.Shape()
        var spandrelWidth = cellHeight * .6
        spandrelShape.bezierCurveTo(spandrelWidth, 0., 0., cellHeight, spandrelWidth, cellHeight)
        spandrelShape.lineTo(spandrelWidth, 0.)
        spandrelShape.lineTo(0.,0.)
        var spandrelGeo = new THREE.ShapeGeometry(spandrelShape)
        var spandrelMat = new THREE.MeshBasicMaterial({ color: 0xD8D8D8, side: THREE.DoubleSide })
    }

    let bgMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide })
    let capitalAlphabet = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`
    class Spreadsheet extends THREE.Object3D {

        constructor(numRows) {

            if(spreadsheets.length === 26) {
                console.error("Too many spreadsheets!")
                return
            }
            super()
            scene.add(this)
            spreadsheets.push(this)
            this.position.set( 0., 1.6, .01 )

            this.cellGeo = unchangingUnitSquareGeometry.clone()

            this.bg = new THREE.Mesh(unchangingUnitSquareGeometry, bgMat)
            this.bg.castShadow = true
            this.bg.position.z = -layerWidth
            this.add(this.bg)

            {
                let title = capitalAlphabet[spreadsheets.indexOf(this)]
                this.sign = text(title, false, `#000000`)
                this.sign.scale.multiplyScalar(cellHeight)
                this.add(this.sign)

                this.plaque = new THREE.Mesh(unchangingUnitSquareGeometry, spandrelMat)
                this.plaque.scale.y = cellHeight
                this.plaque.position.z = -layerWidth
                this.add(this.plaque)

                this.leftSpandrel = new THREE.Mesh(spandrelGeo, spandrelMat)
                this.rightSpandrel = new THREE.Mesh(spandrelGeo, spandrelMat)
                this.rightSpandrel.rotation.y = Math.PI
                this.rightSpandrel.position.z = -layerWidth
                this.leftSpandrel.position.z = -layerWidth
                this.add(this.leftSpandrel, this.rightSpandrel)
            }

            this.cells = []
            for (let row = 0; row < numRows; ++row) {
                this.cells[row] = new Cell(this)
                this.add(this.cells[row])
            }
            this.resizeFromCellWidths()

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

                let xMin = -this.bg.scale.x / 2.
                for (let i = 0; i < 2; ++i) {
                    m1.makeScale(gridThickness, this.bg.scale.y + gridThickness, 1.)
                    m1.setPosition(xMin + i * this.bg.scale.x, 0., layerWidth)
                    gridLinesVertical.setMatrixAt(i, m1)
                }
                gridLinesVertical.instanceMatrix.needsUpdate = true

                let yMax = this.bg.scale.y / 2.
                for (let i = 0; i < gridLinesHorizontalNum; ++i) {
                    let iLimited = Math.min(i, this.cells.length)
                    m1.makeScale(this.bg.scale.x + gridThickness, gridThickness, 1.)
                    m1.setPosition(0., yMax - iLimited * cellHeight, layerWidth)
                    gridLinesHorizontal.setMatrixAt(i, m1)
                }
                gridLinesHorizontal.instanceMatrix.needsUpdate = true
            }
        }

        addCell() {
            let row = this.cells.length
            let cell = new Cell(this)
            this.add( cell )
            cell.position.set(0., this.getCellY(row), 0.)
            this.cells[row] = cell
        }

        resizeFromCellWidths() {

            let maxCellWidth = this.cells.reduce(
                (accumulator, cell) => Math.max(accumulator, cell.minCellWidth),
                cellHeight)

            this.bg.scale.set(maxCellWidth, cellHeight * this.cells.length, 1.)

            let newTextMeshWidth = cellWidthToTextMeshWidth(maxCellWidth)
            this.cells.forEach( cell => {
                cell.scale.x = newTextMeshWidth
            })

            //the uv x coords of the top right and bottom right corners
            let cutoffX = newTextMeshWidth / textMeshWidthMax
            this.cellGeo.attributes.uv.array[2] = cutoffX
            this.cellGeo.attributes.uv.array[6] = cutoffX
            // log(this.cellGeo.attributes.uv.version)
            this.cellGeo.attributes.uv.needsUpdate = true
            // this.cellGeo.uvsNeedUpdate = true

            this.leftSpandrel.position.set( -this.bg.scale.x / 2., this.bg.scale.y / 2., -layerWidth)
            this.rightSpandrel.position.set( this.bg.scale.x / 2., this.bg.scale.y / 2., -layerWidth)
            this.plaque.position.y = this.bg.scale.y / 2. + cellHeight / 2.
            this.plaque.scale.x = this.bg.scale.x - spandrelWidth * 2. + .0001
            this.sign.position.y = this.plaque.position.y
        }

        getCellY(row) {
            return this.bg.scale.y / 2. - cellHeight * (row+.5)
        }
    }
    window.Spreadsheet = Spreadsheet

    class SelectionBox extends THREE.InstancedMesh {

        constructor(mat) {

            super( unchangingUnitSquareGeometry, mat, 4 )
            this.spreadsheet = null
            this.row = -1
        }

        onBeforeRender() {
            let py = this.spreadsheet.getCellY(this.row)
            //horizontal
            m1.makeScale(this.spreadsheet.bg.scale.x + gridThickness, gridThickness, 1.)
            m1.setPosition(0., py + cellHeight / 2., layerWidth*2.)
            this.setMatrixAt(0, m1)
            m1.setPosition(0., py - cellHeight / 2., layerWidth*2.)
            this.setMatrixAt(1, m1)
            //vertical
            m1.makeScale(gridThickness, cellHeight + gridThickness, 1.)
            m1.setPosition(0. + this.spreadsheet.bg.scale.x / 2., py, layerWidth*2.)
            this.setMatrixAt(2, m1)
            m1.setPosition(0. - this.spreadsheet.bg.scale.x / 2., py, layerWidth*2.)
            this.setMatrixAt(3, m1)
            this.instanceMatrix.needsUpdate = true
        }

        setCell(spreadsheet, row) {

            spreadsheet.add(this)
            this.spreadsheet = spreadsheet
            this.row = row
        }
    }
    window.SelectionBox = SelectionBox

    initSpreadsheetNavigation()
}