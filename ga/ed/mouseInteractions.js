function initMouseInteractions() {
    var characterWidth = parseInt(window.getComputedStyle(textMeasurer).width) / 40.

    let grabbedMention = null
    document.addEventListener('mouseup',(event)=>{
        if(grabbedMention !== null) {

            let newLine = "\n    " + grabbedMention.variable.name + " = vec4(" +
                grabbedMention.mesh.position.x.toFixed(2) + "," +
                grabbedMention.mesh.position.y.toFixed(2) + "," +
                grabbedMention.mesh.position.z.toFixed(2) + ",1.);\n"

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
        //actually possibly unwanted, what you really need are the camera left-right and up-down axes
        //and your mouse movements make motors using those
        
        let cameraMotor = new Mv()
        let e12Camera = new Mv()
        let e23Camera = new Mv()

        // you get the two ideal lines that are where the
        //there's the ideal line e02. rotate it around e23 by fov/2
        //there's the ideal line e01. rotate it around e12 by horizontal fov/2

        let cameraQuat = new Mv()

        let cameraFovHorizontal = otherFov(camera.fov, camera.aspect, true)
        let cameraFrameQuatHorizontal = new Mv().fromAxisAngle(e31, camera.fov / 2. * (TAU / 360.))
        let cameraFrameQuatVertical = new Mv().fromAxisAngle(e31, cameraFovHorizontal / 2. * (TAU / 360.))
        let cameraFrameLeft = cameraFrameQuatHorizontal.sandwich(e1,new Mv())
        let cameraFrameBottom = cameraFrameQuatHorizontal.sandwich(e2, new Mv())

        //wanting to test the above
        let lineMv = add(add(e23,e12).multiplyScalar(.2),e01)
        let displayedLineMv = new Mv()
        {
            displayedLineMv.copy(lineMv)
            let hasEuclideanPart = displayedLineMv.normSquared() > .00001
            if(!hasEuclideanPart) {
                console.error("put stuff here about projecting on camera plane")
                // let zPlaneNotFarFromCamera = e3.clone()
                // meet( cameraFrameLeft, zPlaneNotFarFromCamera, displayedLineMv )
            }

            let projectedOnOrigin = displayedLineMv.projectOn(e123,mv0)
            //usual line is e31

            let quatToProjOnOrigin = mul(projectedOnOrigin, e31, mv1)
            quatToProjOnOrigin.sqrtSelf()
            quatToProjOnOrigin.log()

            let pos = e123.projectOn( lineMv, mv2 )

            let lineGeo = new THREE.CylinderGeometry(.05, .05, 100.)
            let lineMesh = new THREE.Mesh(lineGeo, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }))
            dws.top.scene.add(lineMesh)
            quatToProjOnOrigin.toQuaternion(lineMesh.quaternion)
            log(lineMesh.quaternion)
            pos.toVector(lineMesh.position)
        }



        updateFunctions.push(()=>{
            if(frameCount === 2) {

                cameraQuat.fromQuaternion(camera.quaternion)

                cameraQuat.sandwich(e12, e12Camera)
                cameraQuat.sandwich(e23, e23Camera)

                

                

            //     cameraMotor.fromPosQuat(camera.position, camera.quaternion)
            //     cameraMotor.log()
                
            //     cameraMotor.sandwich(e12, e12Camera)
            //     cameraMotor.sandwich(e23, e23Camera)
            //     e23Camera.log("e23Camera")

            //     cameraMotor.sandwich(e123, mv0)
            //     mv0.log()
            }
        })

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
            if (!mention.mesh.visible || mention.mesh.parent !== dw.scene)
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