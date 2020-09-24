/*
    Sticking textures i.e. pictures i.e. I2->I3 in places will be veeeeeeery useful for giving diagrams character

    Consider a single pixel and only black and white
    rasterization is minimum
    The general rasterization thing is  -> I. 
        The interesting part is ->(I3,I3)
        The special cases are
            volumetric, which is integral over I
            Texture mapped, which is color:min(fragments.z)
    f:I2->I3 is the uvs
    g:I2->colorspace is the texture
    so you have p in I2. f(p) is your color and g(p) is your position

    Continuousness problem.
        Essentially you want one vertex per pixel.
        So, everything is points?

    Note that you'll never do more than a curve through n-space because you only have one dimension of time
    Anything higher and you need combination-based stuff

    Fairly likely: you want to make one vector in terms of two or three others (Maybe also them-multiplied-by-integer complex numbers).

    choosing the next thing to happen
        it'd be crowded to have every single variable. But maybe they only appear in place if you're almost going to snap to them?
        drawing
            functions from time to multivectors
            individual multivectors
            draw on top of what's already in there, eg a tangent vector on a curve
            Grabbing a free parameter and editing it
    
    Fourier or taylor? Well sometimes you join up your loop. Fourier for that
        If you've got projective geometry, i.e. lines = circles with center at infinity, can't you have a square wave represented exactly?

    So you're on a new line
        There's a displayWindow but nothing in there
        You type some mvs, say 3 of them, and they appear in there but you don't have an operation yet
        If you click in the thing you make a new mv. Only got the 2 dimensions soooo
        System goes through every combination of + and * for... certainly the basis vectors and what you've put in your line, maybe your whole scope

    Could put only highlighted ones in there

    making the things with the mouse, in a certain plane
        Vector, translator
        "transformation" may roll together many things? Click in one place, unclick in another

    We also want this thing to be able to edit, not just create
        
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
        let caratNotAtBeginningOfLine = backgroundString[carat.positionInString] !== "\n" ||
            (carat.positionInString !== 0 && backgroundString[carat.positionInString - 1] !== "\n")

        if (caratNotAtBeginningOfLine) {
            let backgroundStringLength = backgroundString.length
            while (backgroundString[carat.positionInString] !== "\n" && carat.positionInString !== backgroundStringLength - 1)
                ++carat.positionInString
            makeNewLineAtCaratPosition()
        }

        let insertion = "[0.;0.;1.;0.;0.;0.;0.;0.]"
        addStringAtCarat(insertion)
    })

    addButton("rotor", () => {
        log("clicked rotor")

        //bivector always goes up on screen, always in a certain plane

        //probably the right thing to do is have a stanford teapot and rotate that thing
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

    mainDw.setGrabbablePosition = (mvFromString) => {
        let lowestUnusedGrabber = 0
        for (lowestUnusedGrabber; lowestUnusedGrabber < mainDw.grabbers.length; ++lowestUnusedGrabber) {
            if (mainDw.grabbers[lowestUnusedGrabber].visible === false)
                break
            if(lowestUnusedGrabber === mainDw.grabbers.length - 1)
                console.error("need more grabbers")
        }

        let gr = mainDw.grabbers[lowestUnusedGrabber]
        gr.visible = true
        if (getGrade(mvFromString.elements) === 1) {
            getVector(mvFromString.elements, gr.position)
            gr.position.applyQuaternion(displayRotation.q)
            gr.position.applyMatrix4(mainDw.scene.matrix)

            //the location of shit inside the dw is messed up, probably need to work on it
        }
    }

    mainDw.beginFrame = () => {
        mainDw.scene.children.forEach((c,i) => {
            if ( i ) //0 is the grid
                mainDw.scene.remove(c)
        })

        mainDw.grabbers.forEach((g) => { g.visible = false })
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
        let maxScaleForContainment = .5 / obj.boundingSphereRadius
        if (mainDw.scene.scale.x > maxScaleForContainment) {
            mainDw.scene.scale.setScalar(maxScaleForContainment)

            //wanna stop flick? It's weird
            // mainDw.scene.updateMatrix()
            // mainDw.scene.updateMatrixWorld()
            // obj.dw.updateMatrixWorld()
        }
    }

    onClicks.push({
        z: () => {
            return mouse.checkIfOnScaledUnitSquare(mainDw) ? 1. : -Infinity
        },
        during:()=>{
            //what if there are two?
            mouse.getZZeroPosition(v1)
            mainDw.scene.updateMatrixWorld()
            mainDw.scene.worldToLocal(v1)
            q1.copy(displayRotation.q).inverse()
            v1.applyQuaternion(q1)
            let elementsString = "0.;" + v1.x.toString() +";"+ v1.y.toString() +";"+ v1.z.toString() + "0.;0.;0.;0.;"
            
            let numberOfThisLine = 0
            let openBracketPosition = -1
            let closeBracketPosition = -1
            for (let i = 0, il = backgroundString.length; i < il; ++i) {
                if(carat.lineNumber === numberOfThisLine) {
                    if(backgroundString[i] === "[")
                        openBracketPosition = i
                    if(backgroundString[i] === "]")
                        closeBracketPosition = i
                }

                if(backgroundString[i] === "\n")
                    ++numberOfThisLine
            }
            if (openBracketPosition !== -1) {
                backgroundString =
                    backgroundString.substring(0, openBracketPosition+1) +
                    elementsString +
                    backgroundString.substring(closeBracketPosition)
            }

            //want multiple in the window, and want to modify them from anywhere
            //or maybe there's reasons you'd only want to modify them in place? Remind you where they're from and where else they're used?

            //so you have the grabbers. Click one
            //maybe the grabbers store an idea of what their value is
        }
    })
}