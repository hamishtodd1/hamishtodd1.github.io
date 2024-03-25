/*
    should be able to hover within a cell, over eg the "e2" in "2e1 + 5e2", and see that thing

    So the way it works:
        You're always in drawing mode of some kind
            If you click in space, and there's nothing you're clicking on,
            by default it makes the thing you've currently got selected
            If you were currently on a blank cell, it uses that
            If you were currently on a cell containing a free thing, it uses that
            But if currently on a cell defined by other things
        You can select a new black cell

    When you call a function
        a little box-within-box?
        or: it's another column. It comes along and sits on the right

    Cells should get smaller and become washed out when not visible
        When you hover them with pointer, the things in them become visible
            BUT the boxes themselves only re-inflate if you select
        So, you're only looking at the definition of one of the things at a time

 */

function initSpreadsheet() {

    const gridThickness = .09 * cellHeight
    const gridMat = new THREE.MeshBasicMaterial({ color: 0xAAAAAA, side:THREE.DoubleSide })

    const MAX_CELLS = 30 //based on nothing
    let numberMats = Array(MAX_CELLS)
    for(let i = 0; i < MAX_CELLS; i++)
        numberMats[i] = text(i+1, true, `#000000`)
    let numberWidth = cellHeight*numberMats.reduce((a,b)=>Math.max(a,b.getAspect()),0)

    const cellWidthMax = cellHeight*64. // based on nothing probably
    const textMeshHeight = cellHeight * .7 //you get a .3 padding on all four sides
    const canvasYRez = 32 //eyeballed

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
        class Cell extends THREE.Group {

            constructor(spreadsheet) {
                let canvas = document.createElement("canvas")
                let context = canvas.getContext("2d")
                let map = new THREE.CanvasTexture(canvas)

                super()
                this.spreadsheet = spreadsheet

                this.textMesh = new THREE.Mesh(spreadsheet.cellGeo, new THREE.MeshBasicMaterial({ map: map, transparent: true }))
                this.add(this.textMesh)

                this.minCellWidth = cellHeight

                this.map = map
                this.context = context
                this.canvas = canvas

                this.canvas.height = canvasYRez
                this.canvas.width = canvasXRezMax
                this.textMesh.scale.y = textMeshHeight
                //scale.x handled by spreadsheet

                this.number = new THREE.Mesh(unchangingUnitSquareGeometry, numberMats[0])
                this.number.scale.y = cellHeight
                this.add(this.number)

                this.viz = null //so vis type is NO_VIZ_TYPE

                //"Σ√A∧B∨⋅a*sβα" //if you want ǁ it gets a bit taller
                this.currentText = ``
                this.lastParsedText = ``
                this.parsedTokens = []
            }

            getVizType() {
                // return this.viz === null ? NO_VIZ_TYPE : constructors.indexOf(this.viz.constructor)
                //TODO
                return NO_VIZ_TYPE
            }

            refresh() {

                return

                if (this.currentText === this.lastParsedText) {
                    let result = compile(this.parsedTokens)
                    if (result) {
                        result.cast(this.viz.getMv())
                        result.free()
                    }
                }
                else {
                    while (this.parsedTokens.length !== 0)
                        delete this.parsedTokens.pop()
                        
                    reparseTokens( this.currentText, this.parsedTokens )
                    this.lastParsedText = this.currentText

                    //so, there has to be a meshViz constructor
                    let oldVizType = this.getVizType()

                    let result = compile(this.parsedTokens)
                    let vizType = NO_VIZ_TYPE

                    if (result === null)
                        log("couldn't compile: " + this.currentText)
                    else {

                        if (result.meshName !== ``)
                            vizType = MESH
                        else {
                            vizType = result.grade()
                            if (vizType === -2 || vizType === -1 || vizType === 0) //a combination, OR 0, OR a scalar
                                vizType = ROTOR
                        }
                    }

                    if (oldVizType !== vizType) {

                        //putting old one to sleep
                        this.setVizVisibility(false)
                        unusedVizes[oldVizType].push(this.viz)

                        this.viz = unusedVizes[vizType].pop()
                    }

                    //now give it the value
                    if (result) {

                        result.cast(this.viz.getMv())
                        if (result.meshName !== ``)
                            this.viz.set(result.meshName)

                        let vizType = this.getVizType()
                        let symbolIndex = symbolVizTypes.indexOf(vizType)
                        if(symbolIndex === -1)
                            symbolIndex = 0
                        if (vizType === PLANE && this.viz.getMv().isPlane() )
                            symbolIndex = 2
                        result.free()
                    }
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
                this.minCellWidth = clamp( canvasXRezToCellWidth(textWidth), cellHeight, cellWidthMax )
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

    class Tab extends THREE.Group {
        constructor(mat) {
            super()

            this.plaque = new THREE.Mesh( unchangingUnitSquareGeometry, mat )
            this.plaque.castShadow = true
            this.plaque.scale.y = cellHeight
            this.plaque.position.z = -layerWidth
            this.add(this.plaque)

            this.leftSpandrel = new THREE.Mesh( spandrelGeo, mat )
            this.leftSpandrel.castShadow = true
            this.leftSpandrel.scale.x = spandrelWidth
            this.leftSpandrel.scale.y = cellHeight
            this.rightSpandrel = new THREE.Mesh( spandrelGeo, mat )
            this.rightSpandrel.castShadow = true
            this.rightSpandrel.scale.x = spandrelWidth
            this.rightSpandrel.scale.y = cellHeight
            this.rightSpandrel.rotation.y = Math.PI
            this.rightSpandrel.position.z = -layerWidth
            this.leftSpandrel.position.z = -layerWidth
            this.add(this.leftSpandrel, this.rightSpandrel)
        }

        setTotalWidth(totalWidth) {
            this.leftSpandrel.position.x = -totalWidth / 2.
            this.rightSpandrel.position.x = totalWidth / 2.
            this.plaque.scale.x = totalWidth - spandrelWidth * 2. + .0001
        }

        setPlaqueWidth(width) {
            this.plaque.scale.x = width
            this.leftSpandrel.position.x = -width / 2. - this.leftSpandrel.scale.x
            this.rightSpandrel.position.x = width / 2. + this.rightSpandrel.scale.x
        }
    }
    
    let spandrelMat = new THREE.MeshBasicMaterial({ color: 0xD8D8D8, side: THREE.DoubleSide })
    let spandrelWidth = cellHeight * .6
    let bgMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide })
    let capitalAlphabet = `ABCDEFGHIJKLMNOPQRSTUVWXYZ`
    let lowestUnusedAlphabetIndex = 0
    class Spreadsheet extends THREE.Object3D {

        constructor(numRows, title) {

            if(spreadsheets.length === 26) {
                console.error("Too many spreadsheets!")
                return
            }
            super()
            scene.add(this)
            spreadsheets.push(this)
            this.position.set( 0., 1.6, .01 )

            this.editable = true

            this.cellGeo = unchangingUnitSquareGeometry.clone()

            this.bg = new THREE.Mesh(unchangingUnitSquareGeometry, bgMat)
            this.bg.scale.x = 0.05 //because it only grows, start small
            this.bg.castShadow = true
            this.bg.position.z = -layerWidth
            this.add(this.bg)

            this.numbersBg = new THREE.Mesh(unchangingUnitSquareGeometry, spandrelMat)
            this.numbersBg.scale.x = numberWidth
            this.numbersBg.position.z = -layerWidth
            this.add(this.numbersBg)

            {
                if(title === undefined) 
                    title = capitalAlphabet[lowestUnusedAlphabetIndex++]
                this.sign = text(title, false, `#000000`)
                this.sign.scale.multiplyScalar(cellHeight)
                this.add(this.sign)

                this.titleTab = new Tab(spandrelMat)
                this.titleTab.position.z = -layerWidth
                this.add(this.titleTab)
            }

            this.cells = []
            for (let row = 0; row < numRows; ++row) 
                this.makeExtraCell()
            this.resizeFromCellWidths()

            let gridLinesHorizontalNum = MAX_CELLS + 1
            let gridLinesVertical = new THREE.InstancedMesh(unchangingUnitSquareGeometry, gridMat, 2)
            let gridLinesHorizontal = new THREE.InstancedMesh(unchangingUnitSquareGeometry, gridMat, gridLinesHorizontalNum)
            this.add( gridLinesVertical, gridLinesHorizontal )

            this.bg.onBeforeRender = () => {

                hands[LEFT].dq.sandwich(e123.addScaled(e023, -.05 - this.bg.scale.x/2., fl0), fl1).pointToGibbsVec(this.position)
                this.quaternion.slerpQuaternions( this.quaternion, camera.quaternion, .12 )

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

        makeExtraCell(text) {
            let row = this.cells.length
            let cell = new Cell(this)
            this.add( cell )
            cell.number.material = numberMats[row]
            cell.position.set(0., this.getCellY(row), 0.)
            this.cells[row] = cell

            if(text)
                cell.setText(text)

            return cell
        }

        resizeFromCellWidths() {

            let minWidth = cellHeight
            this.bg.scale.x = this.cells.reduce(
                (currentMax, cell) => Math.max( currentMax, cell.minCellWidth ),
                minWidth)
            this.bg.scale.y = cellHeight * this.cells.length

            let numberX = -this.bg.scale.x / 2. - numberWidth / 2.
            this.numbersBg.scale.y = this.bg.scale.y
            this.numbersBg.position.x = numberX

            let newTextMeshWidth = cellWidthToTextMeshWidth(this.bg.scale.x)
            this.cells.forEach( cell => {
                cell.textMesh.scale.x = newTextMeshWidth
                cell.number.position.x = numberX
                cell.number.scale.x = cell.number.material.getAspect() * cellHeight
            })

            //the uv x coords of the top right and bottom right corners
            let cutoffX = newTextMeshWidth / textMeshWidthMax
            this.cellGeo.attributes.uv.array[2] = cutoffX
            this.cellGeo.attributes.uv.array[6] = cutoffX
            this.cellGeo.attributes.uv.needsUpdate = true
            
            this.sign.position.y = this.bg.scale.y / 2. + cellHeight / 2.
            this.titleTab.position.y = this.sign.position.y
            this.titleTab.setTotalWidth(this.bg.scale.x)

            // this.buttons.forEach( (btn, i) => {
            //     btn.position.y = -this.bg.scale.y / 2. - cellHeight / 2.
            //     btn.position.x = (cellHeight*1.9) * (i - this.buttons.length / 2. + .5)
            // })
        }

        getCellY(row) {
            return this.bg.scale.y / 2. - cellHeight * (row+.5)
        }
    }
    window.Spreadsheet = Spreadsheet

    setSpreadsheetsFromStringArrays = (initial) => {
        initial.forEach((cellContentses, i) => {
            let ss = new Spreadsheet(cellContentses.length)
            ss.position.x = i * 1.6 - 1.6 * (initial.length - 1) / 2.
            cellContentses.forEach((cellContents, j) => {
                translated = translateExpression(cellContents)
                ss.cells[j].setText(translated)
            })
        })
    }

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
}