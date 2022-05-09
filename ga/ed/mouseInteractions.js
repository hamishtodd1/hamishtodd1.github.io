function initMouseInteractions() {
    var characterWidth = parseInt(window.getComputedStyle(textMeasurer).width) / 40.

    let grabbedMention = null
    document.addEventListener('mouseup',(event)=>{
        if(grabbedMention !== null) {

            let newLine = "\n    " + grabbedMention.variable.name + " = vec4(" +
                grabbedMention.viz.position.x.toFixed(2) + "," +
                grabbedMention.viz.position.y.toFixed(2) + "," +
                grabbedMention.viz.position.z.toFixed(2) + ",1.);\n"

            let lines = textarea.value.split("\n")
            let pre  = lines.slice(0, grabbedMention.lineIndex+1).join("\n")
            let post = lines.slice(grabbedMention.lineIndex+1).join("\n")
            
            textarea.value = pre + newLine + post
            updateSyntaxHighlighting(textarea.value)
            compile()

            let newCaretPosition = textarea.value.length - post.length - 1
            textarea.focus()
            textarea.setSelectionRange(newCaretPosition, newCaretPosition)

            grabbedMention = null
        }

        updateBasedOnCaret()
    })
    {
        let cameraMotor = new Mv()
        let cameraQuat = new Mv()
        let cameraPos = new Mv()

        let mouseRay = new Mv()
        let frustum = {
            left: new Mv(),
            right: new Mv(),
            bottom: new Mv(),
            top: new Mv(),
            far: new Mv()
        }
        {
            let fovHorizontal = otherFov(camera.fov, camera.aspect, true)
            let frameQuatHorizontal = new Mv().fromAxisAngle(e31, -fovHorizontal / 2. * (TAU / 360.))
            let frameQuatVertical = new Mv().fromAxisAngle(e23, -camera.fov / 2. * (TAU / 360.))

            let frustumUntransformed = {}
            for (let planeName in frustum)
                frustumUntransformed[planeName] = new Mv()

            frustumUntransformed.far.plane(camera.far * .97, 0., 0., 1.)
            frameQuatHorizontal.sandwich(e1, frustumUntransformed.left)
            frameQuatVertical.sandwich(e2, frustumUntransformed.bottom)
            frameQuatHorizontal[0] *= -1.
            frameQuatVertical[0] *= -1.
            frameQuatHorizontal.sandwich(e1, frustumUntransformed.right)
            frameQuatVertical.sandwich(e2, frustumUntransformed.top)

            updateFunctions.push(()=>{
                cameraPos.fromVector(camera.position)
                cameraQuat.fromQuaternion(camera.quaternion)
                cameraMotor.fromPosQuat(camera.position, camera.quaternion)

                for(let planeName in frustum) {
                    cameraMotor.sandwich(frustumUntransformed[planeName], frustum[planeName])    
                    frustum[planeName].normalize()
                }

                {
                    let clientRect = dws.top.elem.getBoundingClientRect()
                    let xProportion = (oldClientX - clientRect.x) / clientRect.width
                    let yProportion = (oldClientY - clientRect.y) / clientRect.height

                    let xPlane = mv0.fromLerp(frustum.left, frustum.right, xProportion)
                    let yPlane = mv1.fromLerp(frustum.bottom, frustum.top, yProportion)

                    meet(yPlane, xPlane, mouseRay).normalize()
                }

                meet(e0, mouseRay, mv0)
                ourPointViz.setMv(mv0)
            })
        }

        let lineMv = e01.clone()
        if(0)
        {
            let lineGeo = new THREE.CylinderGeometry(.05, .05, 500.)
            let lineMesh = new THREE.Mesh(lineGeo, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }))
            dws.top.scene.add(lineMesh)
            let displayedLineMv = new Mv()

            updateFunctions.push(() => {
                
                if (lineMv.hasEuclideanPart())
                    displayedLineMv.copy(lineMv)
                else {
                    let planeContainingCameraAndLine = mv0
                    join(lineMv, cameraPos, planeContainingCameraAndLine)
                    meet(frustum.far, planeContainingCameraAndLine, displayedLineMv)
                    //order here has not been thought through, may screw up orientation
                    //actually you maybe want it intersected with
                }

                let pos = e123.projectOn(displayedLineMv, mv2)
                pos.toVector(lineMesh.position)

                let projectedOnOrigin = displayedLineMv.projectOn(e123, mv0).normalize()
                let quatToProjOnOrigin = mul(projectedOnOrigin, e31, mv1)
                quatToProjOnOrigin.log()
                quatToProjOnOrigin.sqrtSelf()
                quatToProjOnOrigin.toQuaternion(lineMesh.quaternion)
            })
        }

        {
            const pointRadius = .1
            let pointGeo = new THREE.SphereBufferGeometry(pointRadius, 32, 16)
            let displayedPointMv = new Mv()
            class PointViz extends THREE.Mesh {
                #mv = new Mv()

                constructor(col){
                    if(col === undefined)
                        col = 0xFFFFFF
                    super(pointGeo, new THREE.MeshBasicMaterial({ color: col }))
                    this.castShadow = true
                }

                setMv(newMv) {
                    this.#mv.copy(newMv)

                    if (this.#mv.hasEuclideanPart())
                        this.#mv.toVector(this.position)
                    else {
                        let cameraJoin = mv0
                        join(this.#mv, cameraPos, cameraJoin)
                        meet(frustum.far, cameraJoin, displayedPointMv)
                        displayedPointMv.toVector(this.position)
                    }
                    //and scale its size with distance to camera
                }
            }
            window.PointViz = PointViz
        }
        let ourPointViz = new PointViz()
        dws.top.addNonMentionChild(ourPointViz)

        if(0)
        {
            let planeMesh = new THREE.Mesh(new THREE.CircleGeometry(2.), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))
            dws.top.scene.add(planeMesh)

            let planeMv = new Mv().plane(2., 1., 1., 1.)
            planeMv.normalize()
            updateFunctions.push(() => {
                e123.projectOn(planeMv, mv0).toVector(planeMesh.position)

                let planeOnOrigin = planeMv.projectOn(e123,mv0)
                let e3ToPlaneMotor = mul(planeOnOrigin, e3, mv2).sqrt(mv3)
                e3ToPlaneMotor.toQuaternion(planeMesh.quaternion)

                {
                    let vec = new THREE.Vector3(1.,0.,0.)

                    let transformedByOrdinary = vec.clone().applyQuaternion(camera.quaternion)
                    
                    let mrh = new Mv().fromVector(vec)
                    let transformedByUs = cameraQuat.sandwich(mrh).toVector(new THREE.Vector3())
                }
            })
        }

        document.addEventListener('mousemove', (event) => {
            
            if (grabbedMention !== null ) {    
                
                //aaaaaaand yeah you don't 
                
            }

            oldClientX = event.clientX
            oldClientY = event.clientY
        })
    }

    let style = window.getComputedStyle(textarea)
    let lineHeight = parseInt(style.lineHeight)

    let textAreaOffset = parseInt(style.padding) + parseInt(style.margin) // can add some fudge to this if you like

    let svgLines = [labelLine, labelSide1, labelSide2, labelSide3, labelSide4]

    let oldClientX = 100
    let oldClientY = 100

    lineToScreenY = (line) => {
        return line * lineHeight + textAreaOffset - textarea.scrollTop
    }
    updateHorizontalBounds = (index, nameLength, target) => {
        target.x = index * characterWidth + textAreaOffset

        target.w = nameLength * characterWidth
    }

    function toElementCoord(type,x,y) {
        let dw = type === TYPES_POINT ? dws.top : dws.second
        // dw.elem.style.display = ''
        let dwRect = dw.elem.getBoundingClientRect()
        
        let ndc = { 
            x: x / 2. + .5,
            y: y / 2. + .5
        }

        return [dwRect.x + dwRect.width * ndc.x, dwRect.y + dwRect.height * (1. - ndc.y)]
    }

    function canvasPos(mention) {
        transformedV.set(mention.canvasPosWorldSpace[0], mention.canvasPosWorldSpace[1], mention.canvasPosWorldSpace[2], mention.canvasPosWorldSpace[3])
        transformedV.applyMatrix4(worldToCanvas)
        let canvasX = transformedV.x / transformedV.w
        let canvasY = transformedV.y / transformedV.w

        return toElementCoord(mention.variable.type, canvasX, canvasY)
    }

    function highlightMention(mention) {
        hoveredMention = mention

        let c = mention.variable.col
        svgLines.forEach((svgLine) => { svgLine.style.stroke = "rgb(" + c.r * 255. + "," + c.g * 255. + "," + c.b * 255. + ")" })

        let [elemX, elemY] = canvasPos(mention)

        let mb = mention.horizontalBounds
        let mby = lineToScreenY(mention.lineIndex)

        setSvgLine(labelLine,
            mb.x + mb.w,
            mby + lineHeight / 2.,
            elemX, elemY)

        setSvgLine(labelSide1, mb.x, mby, mb.x + mb.w, mby)
        setSvgLine(labelSide2, mb.x + mb.w, mby, mb.x + mb.w, mby + lineHeight)
        setSvgLine(labelSide3, mb.x + mb.w, mby + lineHeight, mb.x, mby + lineHeight)
        setSvgLine(labelSide4, mb.x, mby + lineHeight, mb.x, mby)
    }

    function resetHover() {            
        hoveredMention = null
        svgLines.forEach((svgLine) => { setSvgLine(svgLine, -10, -10, -10, -10) })
    }

    function updateTextAreaHover(clientX,clientY) {

        resetHover()

        camera.updateMatrixWorld()
        worldToCanvas.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse)

        mentions.every((mention) => {
            if (mention.lineIndex > lowestChangedLineSinceCompile)
                return false

            let mb = mention.horizontalBounds
            let mby = lineToScreenY(mention.lineIndex)
            let mouseInBox =
                mb.x <= clientX && clientX < mb.x + mb.w &&
                mby <= clientY && clientY < mby + lineHeight

            if (mouseInBox)
                highlightMention(mention)

            return !mouseInBox
        })

        updateDwContents()
    }

    let worldToCanvas = new THREE.Matrix4()
    let transformedV = new THREE.Vector4()
    textarea.addEventListener('mousemove', (event)=>{
        if (grabbedMention)
            return
        updateTextAreaHover(event.clientX,event.clientY)
    })

    textarea.addEventListener('scroll', (event) =>{
        updateTextAreaHover(oldClientX,oldClientY)
    })

    function onDwHover(dw, clientX,clientY) {
        camera.updateMatrixWorld()
        worldToCanvas.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse)

        resetHover()

        let closestIndex = -1
        let closestDist = Infinity
        mentions.forEach((mention,i) => {
            if (!mention.viz.visible || mention.viz.parent !== dw.scene)
                return

            let [elemX, elemY] = canvasPos(mention)
            let dist = Math.sqrt(sq(clientX - elemX) + sq(clientY - elemY))

            if(dist < closestDist) {
                closestIndex = i
                closestDist = dist
            }
        })
        if(closestIndex !== -1)
            highlightMention(mentions[closestIndex])
    }

    for(dwName in dws ) {
        let dw = dws[dwName]
        dw.elem.addEventListener('mousemove',(event)=>{
            if(grabbedMention)
                return

            onDwHover(dw, event.clientX,event.clientY)
        })
        dw.elem.addEventListener('mousedown',(event)=>{
            if( lowestChangedLineSinceCompile !== Infinity) {
                changedLineIndicator.style.stroke = "rgb(255,255,255)"
                setTimeout(()=>{
                    changedLineIndicator.style.stroke = "rgb(180,180,180)"
                }, 500)
            }
            else {
                grabbedMention = hoveredMention
                hoveredMention = null
            }
        })
    }
}