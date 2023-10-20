/*
    When you're working on it, dq transform is shown (axis in world, and angle+distance window)

    TODO
        Want a "preview" of where the next thing you're about to lay is

    If you're     holding a  thing in your other hand and you hold the paint button
        it adds to that object
    If you're NOT holding anything in your other hand and you hold the paint button,
        it makes a new object
        Probably if you press the grab button while holding the paint button, you're now holding the new object
    If you were holding a transform, great, we're adding it to that transform
    If you were holding a point/line/plane, erm, maybe not

    Soooo, sometimes you want the same mesh with several different transforms.
        Aaaaand you may want that mesh to be updated 

    Other hand:
        Top finger: create point, line, plane, transform... scalar (appears on a double cover plot). First three act as a rigid bodies
        Transformation: Grab in one place, move hand. Most important, do first! This is animation!
        They snap. Use analogue stick to flick to different ones to snap to. Push in to turn off snapping
        Translations are arrows
            But there's the line at infinity to help stabilize thm ofc
            Possibly the start and end of them should be connected to that line

    Mouse:
        Mouse wheel press is for rotating the camera
        Joystick is joystick
        Click is index
        Right click is side button (probably "hold"/grab)
        "Rewind" is A
        "Forward" is B
        Pushing in joystick is pushing in joystick 
        Wheel is rotating
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

            coloredPointMats.forEach(mat => {
                this.add(new ColoredSection(mat))
            })

            this.dqViz = new DqViz()
            //well, it makes sense to have the thing be at the tip of an arrow

            this.com = new Fl() //NOT NORMALIZED AND NO REASON TO CHANGE THAT!

            obj3dsWithOnBeforeRenders.push(this)
            sclptables.push(this)

            this.onBeforeRender = () => {
                this.dqViz.dq.toMat4(this.matrix)
            }
        }

        getWorldCom(target) {
            return this.dqViz.dq.sandwich(this.com, target)
        }

        brushStroke(pos) {
            
            if(pos === undefined)
                pos = handPosition

            hidePalette()

            let cs = this.children[currentColor]

            cs.vAttr.updateRange.offset = cs.lowestUnusedCube * 3
            cs.vAttr.updateRange.count = 0

            pos.pointToVertex(v1)
            this.worldToLocal(v1)

            // let distanceGone = handPosition.distanceToPt(handPositionOld)
            // let numSteps = Math.max(1,Math.floor(distanceGone / VOXEL_WIDTH * .9))
            // for (let i = 0; i < numSteps+1; ++i) {
            //     let step = handPositionOld.lerp(handPosition, i / numSteps, fl0)
            //     cs.fillCubePosition(step.pointToVertex(v2))
            // }

            //one thought is that you couldmake a shell of cubes, and always be subtracting ones from the center

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

                            fl0.pointFromVertex(v2)
                            this.com.add(fl0,this.com)

                        }
                    }
                }
            }

            cs.vAttr.needsUpdate = true
        }
    }
    window.Sclptable = Sclptable

    //Palette
    {
        let sizes = [1., 2., 4.]
        let currentSize = 1
        let palette = new THREE.Group()
        selectorRayCone.add(palette)
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