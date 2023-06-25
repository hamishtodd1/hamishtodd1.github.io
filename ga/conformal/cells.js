function initCells( cellWidth, cellHeight ) {

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

    //both of these matter to where the text appears
    let textMeshHeight = cellHeight * .7
    let textMeshWidth = cellWidth - (cellHeight - textMeshHeight)
    let canvasVerticalResolution = 60
    let canvasHorizontalResolution = canvasVerticalResolution * textMeshWidth / textMeshHeight
    //have to choose a max then stick to it, it's complicated to think about changing uvs at runtime

    class Cell extends THREE.Mesh {
        constructor(x,y) {
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

            this.viz = null //so vis type is NO_VIZ_TYPE

            //"Σ√A∧B∨⋅a*sβα" //if you want ǁ it gets a bit taller
            this.currentText = ``
            this.lastParsedText = ``
            this.parsedTokens = []

            this.setVizVisibility(false)
        }

        refresh() {

            if( this.currentText === this.lastParsedText ) {
                let compiledToMv = compile(this.parsedTokens, evaluatedCga, 0)
                if (compiledToMv )
                    evaluatedCga.cast(this.viz.getMv())
            }
            else {
                while(this.parsedTokens.length !== 0) {
                    delete this.parsedTokens.pop()
                }
                this.parsedTokens = reparseTokens( this.currentText )
                this.lastParsedText = this.currentText

                let oldVizType = this.viz === null ? NO_VIZ_TYPE : constructors.indexOf(this.viz.constructor)

                let compiledToMv = compile(this.parsedTokens, evaluatedCga, 0)
                let vizType = NO_VIZ_TYPE
                if ( compiledToMv ) {

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
                this.canvas.height)

            let textColor = "#000000"
            this.context.fillStyle = textColor
            this.context.fillText(this.currentText, 0, 0)

            this.map.needsUpdate = true
            // log(this.canvas.width / this.canvas.height, this.scale)al
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