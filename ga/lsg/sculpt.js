/*
    May want the ability to check if you're ADDING to a blob or making a new one
        Adjacency is an option: if your thing is connected to an existing thing, then yes, that's it
        But apparently bounding boxes go a long way

    could make a shell of cubes, and always be subtracting ones from the center
 */

function initSclptables()
{
    const pointSize = .08
    const maxVoxels = 30000 //eyeballed
    const numWide = 3 // this isn't affected by currentSize yet

    {
        let hueDivisions = 10
        let greyDivisions = 3
        var numCols = hueDivisions + greyDivisions
        var cols = Array(numCols)
        for (let i = 0; i < numCols; ++i) {

            cols[i] = new THREE.Color()
            if (i < hueDivisions)
                cols[i].setHSL(i / hueDivisions, 1., .5)
            else {
                let grey = (i - hueDivisions) / (greyDivisions - 1)
                cols[i].setRGB(grey, grey, grey)
            }
        }
    }

    let currentColor = Math.floor(Math.random() * numCols)
     
    let coloredPointMats = []
    cols.forEach((col, i) => { 
        coloredPointMats[i] = new THREE.PointsMaterial({ color: col, size: pointSize })
    })

    class Sclptable extends THREE.Group {

        constructor() {
            
            super()
            scene.add(this)
            this.matrixAutoUpdate = false

            this.boundingBox = new THREE.Box3()
            this.boxHelper = new THREE.BoxHelper()
            this.boxHelper.visible = false
            this.boxHelper.matrixAutoUpdate = false
            scene.add(this.boxHelper)

            coloredPointMats.forEach(mat => {
                let cs = new ColoredSection(mat)
                this.add(cs)
            })

            this.dqViz = new DqViz()
            this.dqViz.sclptable = this
            snappables.push(this.dqViz)
            //well, it makes sense to have the thing be at the tip of an arrow

            this.com = new Fl() //NOT NORMALIZED AND NO REASON TO CHANGE THAT!

            obj3dsWithOnBeforeRenders.push(this)
            sclptables.push(this)

            this.onBeforeRender = () => {
                this.dqViz.dq.toMat4(this.matrix)
                this.boxHelper.matrix.copy(this.matrix)
            }
        }

        getWorldCom(target) {
            return this.dqViz.dq.sandwich(this.com, target)
        }

        brushStrokeWouldBeConnected(pos) {

        }

        brushStroke(pos) {
            
            if(pos === undefined)
                pos = handPosition

            hidePalette()

            pos.pointToGibbsVec(v1)
            this.worldToLocal(v1)

            let cs = this.children[currentColor]
            cs.vAttr.updateRange.offset = cs.lowestUnusedCube * 3
            cs.vAttr.updateRange.count = 0
            cs.vAttr.needsUpdate = true

            // let distanceGone = handPosition.distanceToPt(handPositionOld)
            // let numSteps = Math.max(1,Math.floor(distanceGone / VOXEL_WIDTH * .9))
            // for (let i = 0; i < numSteps+1; ++i) {
            //     let step = handPositionOld.lerp(handPosition, i / numSteps, fl0)
            //     cs.fillCubePosition(step.pointToGibbsVec(v2))
            // }

            //both of these are in voxels
            // let radiusSq = sq(numWide / 2.)
            let start = -(numWide - 1) / 2.
            for (let i = 0; i < numWide; ++i) {
                for (let j = 0; j < numWide; ++j) {
                    for (let k = 0; k < numWide; ++k) {

                        v2.set(i + start, j + start, k + start)
                        // if(v2.lengthSq() > radiusSq)
                        //     continue
                        v2.multiplyScalar(VOXEL_WIDTH)
                        v2.add(v1)

                        let fillable = cs.checkCubePosition(v2) //could check other ones
                        if(fillable) {

                            cs.fillCubePosition(v2)

                            fl0.pointFromGibbsVec(v2)
                            this.com.add(fl0,this.com)
                            
                            this.boundingBox.min.x = Math.min(this.boundingBox.min.x, v2.x - 1.5*VOXEL_WIDTH)
                            this.boundingBox.min.y = Math.min(this.boundingBox.min.y, v2.y - 1.5*VOXEL_WIDTH)
                            this.boundingBox.min.z = Math.min(this.boundingBox.min.z, v2.z - 1.5*VOXEL_WIDTH)
                            this.boundingBox.max.x = Math.max(this.boundingBox.max.x, v2.x + 1.5*VOXEL_WIDTH)
                            this.boundingBox.max.y = Math.max(this.boundingBox.max.y, v2.y + 1.5*VOXEL_WIDTH)
                            this.boundingBox.max.z = Math.max(this.boundingBox.max.z, v2.z + 1.5*VOXEL_WIDTH)
                        }
                    }
                }
            }

            this.dqViz.dq.getReverse(dq0)
            this.com.getNormalization(fl0)
            dq0.sandwichFl(fl0, this.dqViz.markupPos)

            updateBoxHelper(this.boxHelper, this.boundingBox)

        }
    }
    window.Sclptable = Sclptable

    //Palette
    {
        let sizes = [1., 2., 4.]
        let currentSize = 1
        let palette = new THREE.Group()
        hand2.add(palette)
        let visibilityCountdown = -1.
        function hidePalette() {
            visibilityCountdown = -1.
        }
        let spacing = .2
        palette.position.z = .2
        let bg = new THREE.Mesh(new THREE.RingGeometry(spacing * .75, spacing * 3.5, numCols * 2), new THREE.MeshBasicMaterial({ color: 0xCCCCCC }))
        bg.position.z = -.001
        palette.add(bg)
        let selector = new THREE.Mesh(new THREE.CircleGeometry(1.,16), new THREE.MeshBasicMaterial({ color: 0x555555 }))
        palette.add(selector)
        selector.position.z = bg.position.z * .5
        selector.scale.setScalar(spacing*.5)
        let swatches = []
        cols.forEach((col, i) => {
            let swatchesOfSize = []
            swatches.push(swatchesOfSize)
            sizes.forEach((size, j) => {
                let swatch = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: col }))
                swatchesOfSize.push(swatch)
                swatch.scale.set(size*VOXEL_WIDTH, size*VOXEL_WIDTH, 1.)
                palette.add(swatch)
                swatch.position.x = (i - numCols / 2. + .5) * spacing
                swatch.position.y = (j - sizes.length    / 2. + .5) * spacing
            })
        })
        function keyToAxes(eventKey, target) {
            if (eventKey === "ArrowUp")
                target.set(0., 1.)
            else if (eventKey === "ArrowDown")
                target.set(0., -1.)
            else if (eventKey === "ArrowLeft")
                target.set(1., 0.)
            else if (eventKey === "ArrowRight")
                target.set(-1., 0.)
            else
                return false

            return true
        }

        updatePalette = () => {
            
            visibilityCountdown -= frameDelta
            if (visibilityCountdown < 0.)
                palette.visible = false

            let selectorIntendedY = spacing * (currentSize - sizes.length / 2. + .5) + spacing * 2.
            selector.position.y += .1 * (selectorIntendedY - selector.position.y)

            cols.forEach((colName, i) => {
                sizes.forEach((size, j) => {

                    let swatch = swatches[i][j]
                    let swatchIntendedAngle = ((i - currentColor + numCols + 6) % numCols - numCols / 2. + .5) * TAU / numCols
                    let currentSwatchAngle = Math.atan2(swatch.position.x, swatch.position.y)
                    if (swatchIntendedAngle - currentSwatchAngle > Math.PI)
                        swatchIntendedAngle -= TAU
                    else if (swatchIntendedAngle - currentSwatchAngle < -Math.PI)
                        swatchIntendedAngle += TAU
                    let swatchNewAngle = currentSwatchAngle + .1 * (swatchIntendedAngle - currentSwatchAngle)
                    let radius = spacing * (j + 1)
                    swatch.position.set(
                        Math.sin(swatchNewAngle) * radius,
                        Math.cos(swatchNewAngle) * radius,
                        0.
                    )

                })
            })
        }

        document.addEventListener('keydown', (event) => {
            if(!simulatingPaintingHand)
                return
            
            let didMove = keyToAxes(event.key, v1)
            if (!didMove)
                return

            palette.visible = true
            visibilityCountdown = 1.3

            currentSize += v1.y
            currentSize = Math.max(0, Math.min(sizes.length - 1, currentSize))

            currentColor = (currentColor + numCols + v1.x) % numCols
        })
    }
    
    let rounded = new Float32Array(3)
    function doRounding(p) {
        rounded[0] = Math.round(p.x / VOXEL_WIDTH) * VOXEL_WIDTH
        rounded[1] = Math.round(p.y / VOXEL_WIDTH) * VOXEL_WIDTH
        rounded[2] = Math.round(p.z / VOXEL_WIDTH) * VOXEL_WIDTH
    }
    class ColoredSection extends THREE.Points {

        constructor(mat) {
            let vAttr = new THREE.BufferAttribute(new Float32Array(maxVoxels*3), 3)

            let geo = new THREE.BufferGeometry()
            geo.drawRange.start = 0
            geo.drawRange.count = 0
            geo.setAttribute('position', vAttr)

            super(geo, mat)
            this.vAttr = vAttr

            this.lowestUnusedCube = 0
        }

        checkCubePosition(p) {

            doRounding(p)

            for (let i = 0; i < this.lowestUnusedCube; ++i) {
                let i3 = i * 3
                if (
                    this.vAttr.array[i3 + 0] === rounded[0] &&
                    this.vAttr.array[i3 + 1] === rounded[1] &&
                    this.vAttr.array[i3 + 2] === rounded[2]
                )
                    return false
            }

            return true
        }

        //ASSUMES ROUNDING!
        fillCubePosition(p) {

            doRounding(p)
            
            let c3 = this.lowestUnusedCube * 3
            this.vAttr.array[c3 + 0] = rounded[0]
            this.vAttr.array[c3 + 1] = rounded[1]
            this.vAttr.array[c3 + 2] = rounded[2]

            if (this.lowestUnusedCube === maxVoxels) 
                console.error("yeah need more cubes")
            else {
                ++this.lowestUnusedCube
                this.vAttr.updateRange.count += 3
            }

            let potentialNewDrawRange = this.lowestUnusedCube
            this.geometry.drawRange.count = Math.max(this.geometry.drawRange.count, potentialNewDrawRange)

            return true
        }
    }
}

function initButtonPanel() {
    let buttonPanel = new THREE.Group()
    scene.add(buttonPanel)
    buttonPanel.position.x = 2.
    buttonPanel.position.y = 0.6
    buttonPanel.position.z = -.5

    let bg = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0xCCCCCC }))
    bg.scale.setScalar(1.)
    bg.position.z = -.002
    buttonPanel.add(bg)

    let buttonTextureFiles = [
        `transform.png`, `plane.png`, `point.png`, `rotor.png`
    ]
    let btns = []
    buttonTextureFiles.forEach((filename, i) => {
        let btn = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({
            transparent: true
        }))
        btns.push(btn)
        buttonPanel.add(btn)
        btn.scale.setScalar(.4)
        let x = (i % 2) * .5 - .25
        let y = Math.floor(i / 2) * .5 - .25
        btn.position.set(x, y, 0.)
        textureLoader.load(`data/icons/` + filename, (texture) => {
            btn.material.map = texture
            btn.material.needsUpdate = true
        })
    })

    // let col = new THREE.Color()
    // let hueDivisions = 9
    // let greyDivisions = 3
    // let numCols = hueDivisions + greyDivisions
    // let geo = new THREE.CircleGeometry(.2, 3, 0., TAU / numCols)
    // for (let i = 0; i < numCols; ++i) {

    //     if (i < hueDivisions)
    //         col.setHSL(i / hueDivisions, 1., .5)
    //     else {
    //         let grey = (i - hueDivisions) / (greyDivisions - 1)
    //         col.setRGB(grey, grey, grey)
    //     }

    //     let colorBtn = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col }))
    //     colorBtn.rotation.z = TAU / numCols * i
    //     colorBtn.position.copy(btns[0].position)
    //     colorBtn.position.z -= .001
    //     buttonPanel.add(colorBtn)
    // }
}