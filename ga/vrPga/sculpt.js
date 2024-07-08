/*
    WEIRD AS FUCK THAT THERE IS AN ERASERCOL MESH IN THERE

    May want the ability to check if you're ADDING to a blob or making a new one
        Adjacency is an option: if your thing is connected to an existing thing, then yes, that's it
        But apparently bounding boxes go a long way

    When you delete a sculptable, maybe it should only delete a part of it with one color

    could make a shell of cubes, and always be subtracting ones from the center
 */

function initSclptables()
{
    const VOXEL_WIDTH = .003
    const maxVoxels = 30000 //eyeballed
    const numWide = 3 // this isn't affected by currentSize yet

    let currentColor = 12

    let rounded = new Float32Array(3)
    let unrounded = new THREE.Vector3()
    function doRounding(p) {
        rounded[0] = Math.round(p.x / VOXEL_WIDTH) * VOXEL_WIDTH
        rounded[1] = Math.round(p.y / VOXEL_WIDTH) * VOXEL_WIDTH
        rounded[2] = Math.round(p.z / VOXEL_WIDTH) * VOXEL_WIDTH
    }

    establishSculptablePointSize = () => {
        if (coloredPointMats[0] === null) {
            //point size different because it's not about size but about subtended angle or something
            const pointSize = spectatorMode ? VOXEL_WIDTH * 9.5 : VOXEL_WIDTH * 2.6
            cols.forEach((col, i) => {
                coloredPointMats[i] = new THREE.PointsMaterial({ color: col, size: pointSize })
            })
        }
    }

    let coloredPointMats = []
    let eraserCol = new THREE.Color().setRGB(.1,.2,.3)
    {
        let hueDivisions = 8
        let greyDivisions = 3
        var cols = []
        for (let i = 0, il = hueDivisions + greyDivisions + 1; i < il; ++i) {

            cols.push(new THREE.Color())
            if (i < hueDivisions)
                cols[i].setHSL(i / hueDivisions, 1., .5)
            else if(i - hueDivisions < greyDivisions){
                let grey = (i - hueDivisions) / (greyDivisions - 1)
                cols[i].setRGB(grey, grey, grey)
            }
            else
                cols[i].copy(eraserCol)
        }
        cols.push(new THREE.Color(0xDF9686))
        var numCols = cols.length

        cols.forEach((col, i) => { 
            coloredPointMats[i] = null
        })
    }

    let posGibbsVec = new THREE.Vector3()
    class Sclptable extends THREE.Group {

        constructor(dqViz) {

            establishSculptablePointSize()

            super()
            scene.add(this)
            this.matrixAutoUpdate = false
            sclptables.push(this)

            this.boundingBox = new THREE.Box3()
            this.boxHelper = new THREE.BoxHelper()
            this.boxHelper.visible = false
            this.boxHelper.matrixAutoUpdate = false
            scene.add(this.boxHelper)

            coloredPointMats.forEach(mat => {
                let cs = new ColoredSection(mat)
                this.add(cs)
            })

            this.lastViz = null //hacky?

            this.viz = dqViz
            this.viz.sclptable = this
            //well, it makes sense to have the thing be at the tip of an arrow

            this.com = new Fl() //NOT NORMALIZED AND NO REASON TO CHANGE THAT!

            obj3dsWithOnBeforeRenders.push(this)

            this.onBeforeRender = () => {
                this.viz.dq.toMat4(this.matrix)
                // this.viz.dq.log()
                //apparently this is being changed on the spectator side, so what the FUCK is going on?
                this.boxHelper.matrix.copy(this.matrix)
            }
        }

        dispose() {
            
            this.viz.dispose()
            
            scene.remove(this)
            scene.remove(this.boxHelper)
            this.boxHelper.dispose()
            
            while (this.children.length > 0) {
                let child = this.children[this.children.length - 1]
                this.remove(child)
                child.geometry.dispose()
            }
        }

        finishAndEmit() {

            if (spectatorMode !== false) {
                turnOnPresenterMode()
            }

            if (!cols[currentColor].equals(eraserCol)) 
                this.children[currentColor].emitSelf()
            else {
                let bb = this.boundingBox
                bb.makeEmpty()
                this.children.forEach( cs => {
                    cs.geometry.computeBoundingBox()
                    bb.union(cs.geometry.boundingBox )

                    cs.emitSelf()
                })
            }
        }

        getWorldCom(target) {
            return this.viz.dq.sandwich(this.com, target)
        }

        brushStrokeWouldBeConnected(pos) {

        }

        brushStroke(pos) {

            pos.pointToGibbsVec(posGibbsVec)
            this.worldToLocal(posGibbsVec)

            if(currentColor === 11) {

                return

                let eraserWidth = numWide * 2
                let start = -(eraserWidth - 1) / 2.
                let ml = this.children.length
                for (let m = 0; m < ml; ++m) {

                    let cs = this.children[m]
                    cs.vAttr.updateRange.offset = 0
                    cs.vAttr.updateRange.count = cs.lowestUnusedCube * 3
                    cs.vAttr.needsUpdate = true

                    for (let i = 0; i < eraserWidth; ++i)
                    for (let j = 0; j < eraserWidth; ++j)
                    for (let k = 0; k < eraserWidth; ++k) {
    
                        unrounded.set(i + start, j + start, k + start)
                        unrounded.multiplyScalar(VOXEL_WIDTH)
                        unrounded.add(posGibbsVec)
    
                        cs.deleteCubePosition(unrounded)
                    }
                }
            }
            else {
                let cs = this.children[currentColor]
                cs.vAttr.updateRange.offset = cs.lowestUnusedCube * 3
                cs.vAttr.updateRange.count = 0
                cs.vAttr.needsUpdate = true

                //both of these are in voxels
                // let radiusSq = sq(numWide / 2.)
                let start = -(numWide - 1) / 2.
                for (let i = 0; i < numWide; ++i)
                for (let j = 0; j < numWide; ++j)
                for (let k = 0; k < numWide; ++k) {

                    unrounded.set(i + start, j + start, k + start)
                    unrounded.multiplyScalar(VOXEL_WIDTH)
                    unrounded.add(posGibbsVec)

                    cs.fillCubePositionIfEmpty(unrounded)
                }
            }

            updateBoxHelper(this.boxHelper, this.boundingBox)
        }
    }
    window.Sclptable = Sclptable

    //Palette
    {
        let handIndex = RIGHT
        let sizes = [1., 2., 4.]
        let currentSize = 1
        let palette = new THREE.Group()
        scene.add(palette)
        let visibilityCountdown = -1.
        hidePalette = () => {
            visibilityCountdown = -1.
        }
        let spacing = .024
        palette.position.z = .2

        let bg = new THREE.Mesh(new THREE.RingGeometry(spacing * .75, spacing * 3.5, numCols * 2), new THREE.MeshBasicMaterial({ color: 0xCCCCCC }))
        bg.position.z = -.001
        palette.add(bg)

        let selector = new THREE.Mesh( new THREE.CircleGeometry(1.,16), new THREE.MeshBasicMaterial({ color: 0x555555 }))
        palette.add(selector)
        selector.position.z = bg.position.z * .5
        selector.scale.setScalar(spacing*.5)

        let swatches = []
        cols.forEach((col, i) => {

            let swatchesOfSize = []
            swatches.push(swatchesOfSize)
            let mat = new THREE.MeshBasicMaterial({ color: col })

            sizes.forEach((size, j) => {
                let swatch = new THREE.Mesh(unchangingUnitSquareGeometry, mat)
                swatchesOfSize.push(swatch)
                swatch.scale.set(size*VOXEL_WIDTH, size*VOXEL_WIDTH, 1.)
                palette.add(swatch)
                swatch.position.x = (i - numCols / 2. + .5) * spacing
                swatch.position.y = (j - sizes.length    / 2. + .5) * spacing
            })
        })
        textureLoader.load('data/icons/eraser.png', (texture) => {
            let eraser = palette.children.find(child => child.material.color.equals(eraserCol))
            eraser.material.map = texture
            eraser.material.needsUpdate = true
            eraser.material.color.setRGB(1., 1., 1.)
        })
        
        updatePaletteAnimation = () => {

            visibilityCountdown -= frameDelta
            if (visibilityCountdown < 0.)
                palette.visible = false

            let hand = hands[handIndex]
            hand.dq.sandwich(e123, fl0).pointToGibbsVec(palette.position)
            palette.lookAt(camera.position)

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

        updatePaletteFromDiscreteStick = (joystickVec, newHandIndex) => {

            handIndex = newHandIndex

            palette.visible = true
            visibilityCountdown = 1.3

            currentSize += joystickVec.y
            currentSize = Math.max(0, Math.min(sizes.length - 1, currentSize))

            currentColor = (currentColor + numCols + joystickVec.x) % numCols
        }
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

        emitSelf() {
            socket.emit("sclptable", {
                snappableIndex: snappables.indexOf(this.parent.viz),
                sclptableIndex: sclptables.indexOf(this.parent),
                childIndex: this.parent.children.indexOf(this),
                arr: this.vAttr.array.toString(), //bad to have it sent as a string, buffer would be better
                count: this.vAttr.count,
            })
        }

        deleteCubePosition(p) {
            doRounding(p)

            // debugger
            let arr = this.vAttr.array
            let h = (this.lowestUnusedCube - 1) * 3
            for (let i = 0; i < this.lowestUnusedCube; ++i) {
                let i3 = i * 3
                if (
                    arr[i3 + 0] === rounded[0] &&
                    arr[i3 + 1] === rounded[1] &&
                    arr[i3 + 2] === rounded[2]
                )
                {
                    //take the coordinates of the last cube and put them in the place of the one we're deleting
                    arr[i3 + 0] = arr[h + 0]
                    arr[i3 + 1] = arr[h + 1]
                    arr[i3 + 2] = arr[h + 2]

                    --this.lowestUnusedCube
                    --this.geometry.drawRange.count
                    this.parent.com.sub(fl0.pointFromGibbsVec(p), this.parent.com)
                    
                    return
                }
            }
        }

        fillCubePositionIfEmpty(p) {

            doRounding(p)

            let arr = this.vAttr.array
            for (let i = 0; i < this.lowestUnusedCube; ++i) {
                let i3 = i * 3
                if (
                    arr[i3 + 0] === rounded[0] &&
                    arr[i3 + 1] === rounded[1] &&
                    arr[i3 + 2] === rounded[2]
                ) {
                    return
                }
            }

            //THIS ASSUMES THAT rounded CONTAINS p ROUNDED
            
            let c3 = this.lowestUnusedCube * 3
            this.vAttr.array[c3 + 0] = rounded[0]
            this.vAttr.array[c3 + 1] = rounded[1]
            this.vAttr.array[c3 + 2] = rounded[2]

            if (this.lowestUnusedCube === maxVoxels) 
                console.error("Need more cubes")
            else {
                ++this.lowestUnusedCube
                this.vAttr.updateRange.count += 3
            }

            let potentialNewDrawRange = this.lowestUnusedCube
            this.geometry.drawRange.count = Math.max(this.geometry.drawRange.count, potentialNewDrawRange)

            this.parent.com.add(fl0.pointFromGibbsVec(p), this.parent.com)

            let bb = this.parent.boundingBox
            bb.min.x = Math.min( bb.min.x, p.x - 1.5 * VOXEL_WIDTH )
            bb.min.y = Math.min( bb.min.y, p.y - 1.5 * VOXEL_WIDTH )
            bb.min.z = Math.min( bb.min.z, p.z - 1.5 * VOXEL_WIDTH )
            bb.max.x = Math.max( bb.max.x, p.x + 1.5 * VOXEL_WIDTH )
            bb.max.y = Math.max( bb.max.y, p.y + 1.5 * VOXEL_WIDTH )
            bb.max.z = Math.max( bb.max.z, p.z + 1.5 * VOXEL_WIDTH )
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