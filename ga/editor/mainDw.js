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
    
    //cooooooould use the im for these too, maybe easier not to
    let dwGrabberMat = grabberIm.material.clone()
    for(let i = 0; i < 4; ++i) {
        let dwGrabber = new THREE.Mesh(unchangingUnitSquareGeometry, dwGrabberMat)
        scene.add(dwGrabber)
        dwGrabber.scale.multiplyScalar(.5)

        dwGrabber.position.x = i * 2.

        onClicks.push({
            z: () => mouse.checkIfOnScaledUnitSquare(dwGrabber) ? dwGrabber.position.z : -Infinity,
            start:()=>{dwGrabber.visible = false},
            during: () =>
            {
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

    initGrabber()

    mainDw = DisplayWindow(false)
    mainDw.scale.setScalar(8.)
    mainDw.renderOrder = carat.renderOrder + 1
    carat.material.depthTest = false

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

        let insertion = "[0.,0.,1.,0.,0.,0.,0.,0.]"
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

    mainDw.addToScene = (obj)=>{
        mainDw.scene.add(obj.dw)
        if (carat.movedVerticallySinceLastFrame) { //or if the bounding sphere radius has changed
            let maxScaleForContainment = .5 / obj.boundingSphereRadius
            if (mainDw.scene.scale.x > maxScaleForContainment) {
                mainDw.scene.scale.setScalar(maxScaleForContainment)

                //wanna stop flick? It's weird
                // mainDw.scene.updateMatrix()
                // mainDw.scene.updateMatrixWorld()
                // obj.dw.updateMatrixWorld()
            }
        }
    }

    onClicks.push({
        z: () => mouse.checkIfOnScaledUnitSquare(mainDw) ? 1. : -Infinity,
        during:()=>{
            log("yes, we would be editing")

            // let mv = getNamedMv(token)

            //ahh, it's more about getting what's on the line

            // mouse.getZZeroPosition(v1)
            // mainDw.scene.worldToLocal(v1)
            // for (let i = 0, il = variable.elements.length; i < il; ++i)
            //     variable.elements[i] = 0.
            // variable.elements[1] = v1.x
            // variable.elements[2] = v1.y

            log(carat)
        }
    })
}