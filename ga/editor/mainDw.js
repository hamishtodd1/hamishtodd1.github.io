/*
    Consider a single pixel and only black and white
    rasterization is minimum
    The general rasterization thing is  -> I
    f:I2->I3 is the uvs
    g:I2->colorspace is the texture
    so you have p in I2. f(p) is your color and g(p) is your position

    How new things get made
        You're on a new line
        There's a displayWindow but nothing in there
        You type some mvs, say 3 of them, and they appear in there but you don't have an operation yet
        If you click in the thing you make a new mv. Only got the 2 dimensions soooo
        System goes through every combination of + and * and *[1,2,3] for... certainly the basis vectors and what you've put in your line, maybe your whole scope
        May want to draw a tangent direction on a surface
        it'd be crowded to have every single variable. But maybe they only appear in place if you're almost going to snap to them?
        people know what output they want and what inputs it has so they select it
*/

function initGrabber() {
    //it is the de-facto "free parameter" symbol. Yuck, symbols
    grabberIm = new THREE.InstancedMesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ transparent: true }),256)
    pad.add(grabberIm)

    mainDw.grabbers = []
    //cooooooould use the im for these too
    let dwGrabberMat = grabberIm.material.clone()
    for(let i = 0; i < 4; ++i) {
        let dwGrabber = new THREE.Mesh(unchangingUnitSquareGeometry, dwGrabberMat)
        mainDw.add(dwGrabber)
        dwGrabber.scale.multiplyScalar(.1)

        mainDw.grabbers.push(dwGrabber)

        onClicks.push({
            z: () => mouse.checkIfOnScaledUnitSquare(dwGrabber) ? dwGrabber.position.z : -Infinity,
            start:()=>{dwGrabber.visible = false},
            during: () => {
                mouse.raycaster.intersectZPlane(dwGrabber.position.z, v1)
                mouse.oldRaycaster.intersectZPlane(dwGrabber.position.z, v2)
                dwGrabber.position.add(v1).sub(v2)
            },
            end: () => { dwGrabber.visible = true }
        })
    }

    // https://www.vhv.rs/viewpic/iboiwRx_drag-drop-cursor-pointer-position-tool-cursor-all/
    new THREE.TextureLoader().load("data/grabber.png", function (texture) {
        grabberIm.material.map = texture;
        grabberIm.material.needsUpdate = true

        dwGrabberMat.map = texture
        dwGrabberMat.needsUpdate = true
    })

    grabberIm.beginFrame = () =>{
        grabberIm.count = 0
    }

    grabberIm.drawInPlace = (x, y) => {
        boxDraw(grabberIm, x, y, m1.identity(), .5)
    }

    //whenever you have a free parameter, you have that symbol
    //free parameters... let's assume they get a line to themselves
}

function initMainDw() {

    mainDw = DisplayWindow(false)
    mainDw.scale.setScalar(8.)
    mainDw.renderOrder = carat.renderOrder + 1
    carat.material.depthTest = false

    initGrabber()

    let buttons = {}
    function addButton(newLabel,onClick)
    {
        let index = 0
        for(label in buttons) ++index

        buttons[newLabel] = text(newLabel)	
        buttons[newLabel].scale.multiplyScalar(.1)
        mainDw.add(buttons[newLabel])	

        buttons[newLabel].position.y = -.5 - buttons[newLabel].scale.y * .5 - .001
        buttons[newLabel].position.x = (index-1.) * .3
        buttons[newLabel].position.z = .01

        onClicks.push({
            z: () => mouse.checkIfOnScaledUnitSquare(buttons[newLabel]) ? 2. : -Infinity,
            start: onClick,
        })
    }

    updateFunctions.push(() => {
        v1.copy(carat.position)
        pad.localToWorld(v1)
        let bottomYDestination = v1.y - .5 * pad.scale.y
        if (bottomYDestination > camera.topAtZZero - mainDw.scale.y - .3)
            bottomYDestination = camera.topAtZZero - mainDw.scale.y - .3
        mainDw.bottomY += .1 * (bottomYDestination - mainDw.bottomY)
        mainDw.position.x = camera.rightAtZZero - mainDw.scale.x * .5
    })

    addButton("vector", () => {
        orderedNames.splice(carat.nextOrderedNameNumber, 0, getLowestUnusedName())
        addStringAtCarat("[0.;0.;1.;0.;0.;0.;0.;0.]")
    })

    addButton("rotor", () => {
        orderedNames.splice(carat.nextOrderedNameNumber, 0, getLowestUnusedName())
        addStringAtCarat("[1.;0.;0.;0.;1.;0.;0.;0.]")

        //have a stanford teapot and rotate that thing?
    })

    //better: doodle on what seems to you like a plane, but it's extruded in z because z is input time
    //or the doodling stays on the plane and if you look at it three dimensionally it's extruded?
    {
        var mouseTrail = new THREE.Line(new THREE.Geometry())
        mainDw.scene.add(mouseTrail)
        for (let i = 0; i < 256; i++)
            mouseTrail.geometry.vertices.push(new THREE.Vector3())
        var lastTrailVertexToBeAssigned = 0
        
        addButton("curve", () => {
            log("clicked curve")

            //Curves: click the button and a helix or some other placeholder is made.
            //Click the window when on the line and it erases that and begins a new one

            // let ndcOnDisplayWindow = mainDw.worldToLocal(mouse.getZZeroPosition(v1))

            // mouseTrail.geometry.vertices[lastTrailVertexToBeAssigned].set(ndcOnDisplayWindow.x, ndcOnDisplayWindow.y, 0.)
            // mouseTrail.geometry.vertices[lastTrailVertexToBeAssigned].multiplyScalar(8.)
            // for (let i = lastTrailVertexToBeAssigned + 1, il = mouseTrail.geometry.vertices.length; i < il; i++)
            //     mouseTrail.geometry.vertices[i].copy(mouseTrail.geometry.vertices[lastTrailVertexToBeAssigned])
            // mouseTrail.geometry.verticesNeedUpdate = true

            // ++lastTrailVertexToBeAssigned
            // if (lastTrailVertexToBeAssigned >= mouseTrail.geometry.vertices.length)
            //     lastTrailVertexToBeAssigned = 0

            //bit better would be to have it be flat then set the extrusion once you're done
        })
    }

    mainDw.setGrabbablePosition = (mvFromString, openBracketPosition) => {
        let lowestUnusedGrabber = 0
        for (lowestUnusedGrabber; lowestUnusedGrabber < mainDw.grabbers.length; ++lowestUnusedGrabber) {
            if (mainDw.grabbers[lowestUnusedGrabber].visible === false)
                break
            if(lowestUnusedGrabber === mainDw.grabbers.length - 1)
                console.error("need more grabbers")
        }

        let gr = mainDw.grabbers[lowestUnusedGrabber]
        gr.openBracketPosition = openBracketPosition
        gr.mv = mvFromString
        gr.visible = true

        let grade = getGrade(mvFromString.elements)
        if(grade === 0) {
            mvFromString.getScalarDirection(gr.position)
            gr.position.multiplyScalar(mvFromString.elements[0])
        }
        else if (grade === 1) {
            getVector(mvFromString.elements, gr.position)
        }
        else if(grade === 2) {
            gr.position.copy(mvFromString.getImaginaryDirection(v1))
            gr.position.multiplyScalar(bivectorMagnitude(mvFromString.elements))
        }
        else if(grade === "spinor" ) {
            mvFromString.getImaginaryDirection(gr.position).multiplyScalar(bivectorMagnitude(mvFromString.elements))
            gr.position.add(mvFromString.getScalarDirection(v1).multiplyScalar(mvFromString.elements[0]))
        }
        else {
            // log("not able to do editing of these yet")
        }

        gr.position.applyQuaternion(displayRotation.q)
        gr.position.applyMatrix4(mainDw.scene.matrix)
    }

    mainDw.beginFrame = () => {
        mainDw.scene.children.forEach((c,i) => {
            if ( i ) //0 is the grid
                mainDw.scene.remove(c)
        })

        mainDw.grabbers.forEach((gr) => {
            gr.visible = false
            gr.openBracketPosition = null
            gr.mv = null
        })
    }

    mainDw.resetScene = ()=>{
        mainDw.scene.scale.setScalar(.5 / Math.sqrt(2.)) //grid
    }

    mainDw.addToScene = (obj)=>{
        // if (obj.name !== undefined && .indexOf(obj.name) elementsPositionInString !== undefined && obj. ) {

        // }
        //backgroundString has the array

        //0 dimensional projective space: binary. There's the ideal 0, and the anything-else
        //check if the other products are boolean operations?

        mainDw.scene.add(obj.dw)
        if (grabbedGrabber === null) {
            let maxScaleForContainment = .5 / obj.boundingSphereRadius
            if (mainDw.scene.scale.x > maxScaleForContainment)
                mainDw.scene.scale.setScalar(maxScaleForContainment)
        }
    }

    let grabbedGrabber = null
    let parsedMv = MathematicalMultivector()
    function updateBackgroundString() {
        let closeBracketPosition = -1
        let backgroundStringLength = backgroundString.length
        for (let i = grabbedGrabber.openBracketPosition; i < backgroundStringLength; ++i) {
            if (backgroundString[i] === "]") {
                closeBracketPosition = i
                break
            }
        }
        backgroundString =
            backgroundString.substring(0, grabbedGrabber.openBracketPosition + 1) +
            parsedMv.join(";") +
            backgroundString.substring(closeBracketPosition)
        carat.positionInString = grabbedGrabber.openBracketPosition
    }
    onClicks.push({
        z: () => {
            return mouse.checkIfOnScaledUnitSquare(mainDw) ? 1. : -Infinity
        },
        start:()=>{
            mouse.getZZeroPosition(v1)
            mainDw.scene.updateMatrixWorld()
            mainDw.scene.worldToLocal(v1)

            grabbedGrabber = null
            let closestDistSq = Infinity
            mainDw.grabbers.forEach((gr)=>{
                let distSq = gr.position.distanceToSquared(v1)
                if( distSq < closestDistSq ) {
                    grabbedGrabber = gr
                    closestDistSq = distSq
                }
            })
        },
        during:()=>{
            mouse.getZZeroPosition(v1)
            mainDw.scene.updateMatrixWorld(v1)
            mainDw.scene.worldToLocal(v1)
            
            parseMv(grabbedGrabber.openBracketPosition, parsedMv)
            let grade = getGrade(parsedMv)
            if (grade === 0)
                parsedMv[0] = v1.dot(grabbedGrabber.mv.getScalarDirection(v2))
            else if (grade === 1) {
                q1.copy(displayRotation.q).inverse()
                v1.applyQuaternion(q1)

                setVector(v1, parsedMv)
                //If mouse is on unit sphere, you have the front
                //if it's further out we loop around to the back of the sphere
                //bad idea, you do want that planar thing going on
            }
            else if (grade === 2) {
                let newBivectorMagnitude = v1.dot(grabbedGrabber.mv.getImaginaryDirection(v2))
                let multiple = newBivectorMagnitude / bivectorMagnitude(parsedMv)
                parsedMv[4] *= multiple
                parsedMv[5] *= multiple
                parsedMv[6] *= multiple
            }
            else if(grade === "spinor") {
                v1.normalize()

                parsedMv[0] = v1.dot(grabbedGrabber.mv.getScalarDirection(v2))
                
                let newBivectorMagnitude = v1.dot(grabbedGrabber.mv.getImaginaryDirection(v2))
                let multiple = newBivectorMagnitude / bivectorMagnitude(parsedMv)
                parsedMv[4] *= multiple
                parsedMv[5] *= multiple
                parsedMv[6] *= multiple
            }
            else if(grade === 3)
                parsedMv[7] = v1.length()

            updateBackgroundString()
        },
        end:()=>{
            let grade = getGrade(parsedMv)

            if(grade === "spinor") {
                let bvm = bivectorMagnitude(parsedMv)
                if (bvm < .05 ) {
                    parsedMv[0] = parsedMv[0] > 0. ? 1. : -1.

                    parsedMv[4] = 0.
                    parsedMv[5] = 0.
                    parsedMv[6] = 0.
                }
                if(bvm > .95) {
                    parsedMv[0] = 0.

                    let multiple = 1./bvm
                    parsedMv[4] *= multiple
                    parsedMv[5] *= multiple
                    parsedMv[6] *= multiple
                }
            }

            updateBackgroundString()

            grabbedGrabber = null
        }
    })
}