/*  
    You can type the things, yes, but the line of symbols (/pictures) turns into a picture of the half way point for the operation
        eg
            a picture of the vector half way through being multiplied by the scalar
            or the bivector outlined by the vectors
        This is the way to specify a visualization for an arbitrary function?
            1. You have the inputs, arranged arbitrarily
            2. They move around in some way
            3. They end up in specific locations that outline/suggest the shape of the output
            3. The output is put in place (it's not col)
            4. The inputs disappear
            Details of step 2 can be computed from step 3
            Visualization needs to be unique, it's unfortunate that there are many functions that begin the same way
            In this half way picture, the output is not colored yet

        A given function may have a bunch of stuff going on in it. It can be visualized all in one coord system
        Maybe this intermediate stage should just be the inputs and outputs in same coord system
        When you make a function, you make an animation that can be played in one displayWindow

        Functions have inverses. a + b -> c, you get c. But the intermediate representation involves a,b,c as equal participants so you can visually reverse it?
        Well actually they're not equal participants, because b gets put onto the end of a (or vice versa)

    So you're on a new line
        There's a displayWindow but nothing in there
        You type some mvs, say 3 of them, and they appear in there but you don't have an operation yet
        If you click in the thing you make a new mv. Only got the 2 dimensions soooo
        System goes through every combination of + and * for... certainly the basis vectors and what you've put in your line, maybe your whole scope

    Exponential growth is very dynamical-system like, it is dependent on where you currently are

    TODO later maybe, pressing TODO is in init.js
        maybe try to make it so that when you change what you see in the window it back solves to change the free variables above?
            The same vector may be represented in many displayWindows, but you can grab and affect it in any you like
            But which free variables?
            Grab the coord system and rotate; it gives you the quaternion that does that
            Draw a new vector
                Triggered by enabling the draw new vector mode? Then you can click anywhere?
                Maybe if the carat is on a new line
                Your way of getting velocity is eg snapping to eg v1 - v2, or rather snapping to a vector parallel to v1-v2 while v1-v2 is visualized in place
                it could be written in terms of old ones
                try to snap to the nearest one that's a single operation performed on existing ones
                    If it's a vector and it's in a plane perpendicular to an existing vector and the same length, that's a single bivector multiplication
        Zooming automatically to get the furthest-out vertex
        copy a png or gif or whatever, paste into window, you have a textured quad, or three scalar fields or however you do it
        Double click something in window, to get to the place where it is made

    Probably screw the render target, except for evaluating functions
        Sounds like a lot of fun to write the shader for the under-over thing

    Click the things in the column, what happens?
        They appear in the window?
        Hovering shows the name, you can edit
        When you right click them, context menu:
            "Copy name"
            "Change name" (changes colors?)
            "Paste at carat"
            "change representation"

    What determines which things go in the display window?
        Much better than built in rotation is rotating the basis vectors. x or y rotate around y, y rotate upwards or downwards
        Wanna be able to program your own visualization, then use that to visualize your program. Or we enumerate all?
        Whatever lines are in the editor. Want more? Scroll up, copy it, paste it down here
        They are your sliders
        Unless you have some highlighted in which case it's those?
        "What is hightlighted" is a useful bit of state
        Where/how many to have?
            One for every line makes some sense. Inflate when you're on that line
            Maybe the output column has what you need too
            Can have an extra render window which is wherever the carat is, maybe highlighting the multivector it's nearest
            display is still good but it's kind of a fallback

    Representations, from abacus. Can build some from others?
		A line you can grab bits of
		A canvas you can draw on (i.e. a scalar field that starts all 0 and you can make it nonzero in places)
		Looping all the multivectors (i.e. varying over time)
		utah teapots with scalar for sizes
		orientations and positions: a bunch of utah teapots offset by the vector, oriented by the bivector
        One standing in for all. In this situation, everything coming from the same one gets the same representation
        
    C=R2. H?
    These all might be dumb, you should focus on the opengl premitives, not on specific stuff like this
        R->R    line graph, filled underneath - black and white line if looked at from above
        R->R2   line through R2, or through R3 plotted along z axis
        R->R3   curve through R3, "parametric", alternatively point moving over time and clickable scalar (slider)

        R2->R   1 surface
        R2->R2  set of 2 surfaces - 2 color image if looked at from above, or vector field(points moving around/arrows)? Tokieda weirdness?
        R2->R3  set of 3 surfaces - 3 color image if looked at from above, or parametric surface??
        surfaces are parametric, functions from R2
            If the vertices of a mesh are in a funky order with respect to triangles, they are probably imported from an outside program which should put them in a good order
            Except that you want to compute vertex normals.
                Though in order to do that you do have to iterate an array to find what faces a vertex is in

        R->H    utah teapot at origin
        R->R3,H utah teapot at position oriented by quaternion

        R3->R   isosurface. Two of them. One at 0 and the other at a controllable level. Between, if you slice it, MRI-style texturing
        R3->R2  pair of isosurfaces
        R3->R3  vector field? 3 color isosurface?
*/

function initOutputColumnAndDisplayWindows()
{
    // let inputRow = new THREE.Mesh(new THREE.PlaneGeometry(1., 1.), outputColumn.material)
    // inputRow.geometry.translate(-.5,0.,0.)
    // scene.add(inputRow)
    // inputRow.position.x = outputColumn.position.x
    // inputRow.scale.x = 5.

    let ordinaryClearColor = renderer.getClearColor().clone()
    let ordinaryRenderTarget = renderer.getRenderTarget()
    DisplayWindow = function()
    {
        let localScene = new THREE.Scene()
        {
            let gridSize = 8.
            let axis = new THREE.Line(new THREE.Geometry(), new THREE.MeshBasicMaterial({ color: 0xFFFFFF }))
            axis.geometry.vertices.push(new THREE.Vector3(0., gridSize / 2., 0.), new THREE.Vector3(0., -gridSize / 2., 0.))
            let grid = new THREE.GridHelper(gridSize, gridSize, axis.material.color)
            localScene.add(grid, axis)
        }

        let localCamera = new THREE.PerspectiveCamera(90., 1., .01, 100.)
        localCamera.position.z = 8.5
        localCamera.rotation.order = "YXZ"

        let filter = THREE.NearestFilter
        let wrap = THREE.ClampToEdgeWrapping
        let params = {
            minFilter: filter,
            magFilter: filter,
            wrapS: wrap,
            wrapT: wrap,
            format: THREE.RGBAFormat,
            stencilBuffer: false,
            depthBuffer: false,
            premultiplyAlpha: false,
            type: THREE.FloatType // THREE.HalfFloat for speed
        }
        let dimensionInPixels = 128
        let localFramebuffer = new THREE.WebGLRenderTarget(dimensionInPixels, dimensionInPixels, params)

        let screen = new THREE.Mesh(new THREE.PlaneGeometry(1., 1.), new THREE.MeshBasicMaterial({ map: localFramebuffer.texture }))
        scene.add(screen)
        screen.bottomY = 0.
        let displayWindow = { screen, scene: localScene, camera: localCamera }
        displayWindows.push(displayWindow)

        //the idea of this is that we then pop up the array in the code
        //better: doodle on what seems to you like a plane, but it's extruded in z because z is input
        let trailMode = true
        if(trailMode)
        {
            var mouseTrail = new THREE.Line(new THREE.Geometry())
            localScene.add(mouseTrail)
            for (let i = 0; i < 256; i++)
                mouseTrail.geometry.vertices.push(new THREE.Vector3())
            lastTrailVertexToBeAssigned = 0
        }
        
        let grabbed = false
        updateFunctions.push(() =>
        {
            screen.scale.x = getDisplayColumnWidth()
            screen.position.x = (-camera.rightAtZZero + outputColumn.left()) / 2.
            
            screen.position.y = screen.scale.y / 2. + screen.bottomY
            //and scale.y could be various things
            //and change resolution, and think about camera bullshit

            if (!mouse.clicking)
                grabbed = false
            let thingMouseIsOn = getThingMouseIsOn()
            if (mouse.clicking && !mouse.oldClicking && thingMouseIsOn === displayWindow )
                grabbed = true

            // log(mouse.justMoved())
            if (grabbed)
            {
                if (trailMode)
                {
                    let ndcOnDisplayWindow = screen.worldToLocal(mouse.getZZeroPosition(v1))

                    mouseTrail.geometry.vertices[lastTrailVertexToBeAssigned].set(ndcOnDisplayWindow.x, ndcOnDisplayWindow.y,0.)
                    mouseTrail.geometry.vertices[lastTrailVertexToBeAssigned].multiplyScalar(8.)
                    for (let i = lastTrailVertexToBeAssigned + 1, il = mouseTrail.geometry.vertices.length; i < il; i++)
                        mouseTrail.geometry.vertices[i].copy(mouseTrail.geometry.vertices[lastTrailVertexToBeAssigned])
                    mouseTrail.geometry.verticesNeedUpdate = true

                    ++lastTrailVertexToBeAssigned
                    if (lastTrailVertexToBeAssigned >= mouseTrail.geometry.vertices.length)
                        lastTrailVertexToBeAssigned = 0
                }
                else
                {
                    v1.copy(mouse.raycaster.ray.direction)
                    v1.y = 0.
                    v2.copy(mouse.oldRaycaster.ray.direction)
                    v2.y = 0.
                    let horizontalDelta = v1.angleTo(v2) * (v1.x < v2.x ? 1. : -1.)

                    v1.copy(mouse.raycaster.ray.direction)
                    v1.x = 0.
                    v2.copy(mouse.oldRaycaster.ray.direction)
                    v2.x = 0.
                    let verticalDelta = v1.angleTo(v2) * (v1.y > v2.y ? 1. : -1.)

                    localCamera.rotation.y += horizontalDelta * 60.
                    localCamera.rotation.x += verticalDelta * 60.
                    localCamera.rotation.x = clamp(localCamera.rotation.x, -TAU / 4., TAU / 4.)

                    localCamera.updateMatrix()
                    generalMatrix.getInverse(localCamera.matrix)
                    generalMatrix.setPosition(0., 0., 0.) //alternatively use matrix3
                }
            }
            // else //for when you have multiple render windows
            // {
            //     localCamera.updateMatrix()
            //     generalMatrix.getInverse(localCamera.matrix)
            // }

            let currentDistFromCamera = localCamera.position.length()
            localCamera.updateMatrixWorld()
            localCamera.localToWorld(v1.set(0., 0., -currentDistFromCamera ) )
            localCamera.position.sub(v1)

            renderer.setRenderTarget(localFramebuffer)
            renderer.setClearColor(0x000000)
            renderer.clear()
            renderer.render(localScene, localCamera)

            renderer.setRenderTarget(ordinaryRenderTarget)
            renderer.setClearColor(ordinaryClearColor)
        })

        return displayWindow
    }

    document.addEventListener('wheel', (event)=>
    {
        event.preventDefault()

        if( event.ctrlKey) //handled by window resize
            return
        else
        {
            let thingMouseIsOn = getThingMouseIsOn()
            if (displayWindows.indexOf(thingMouseIsOn) === -1)
                pad.position.y += event.deltaY * -.008
            else
            {
                let displayWindow = thingMouseIsOn
                let cameraPosition = displayWindow.camera.position
                let inflationFactor = 1.2
                cameraPosition.setLength(cameraPosition.length() * (event.deltaY < 0 ? inflationFactor : 1. / inflationFactor))
            }   
        }
    }, false);

    outputColumn.position.z = -.001 //better would be drawn 1st
    outputColumn.position.x = -camera.rightAtZZero * .3
    outputColumn.left = () => outputColumn.position.x - outputColumn.scale.x / 2.
    outputColumn.right = () => outputColumn.position.x + outputColumn.scale.x / 2.
    getDisplayColumnWidth = () => Math.abs(-camera.rightAtZZero - outputColumn.left())
    scene.add(outputColumn)
    let outputColumnGrabbed = false
    function getThingMouseIsOn()
    {
        let mouseX = mouse.getZZeroPosition(v1).x

        if (outputColumn.right() < mouseX)
            return "pad"
        else if (outputColumn.left() < mouseX && mouseX < outputColumn.right())
            return "column"

        for (let i = 0; i < displayWindows.length; i++)
        {
            mouse.getZZeroPosition(v1)
            displayWindows[i].screen.worldToLocal(v1)
            if (-.5 < v1.x && v1.x < .5 &&
                -.5 < v1.y && v1.y < .5)
                return displayWindows[i]
        }

        return "left"
    }
    updateFunctions.push(() =>
    {
        let cursorStyle = "default"
        let thingMouseIsOn = getThingMouseIsOn()
        if (thingMouseIsOn === "column")
            cursorStyle = "col-resize"
        else if (thingMouseIsOn === "pad")
            cursorStyle = "text"
        else if (displayWindows.indexOf(thingMouseIsOn) !== -1)
            cursorStyle = "grab" //you might like "grabbing" but we can't rely on domElement to change it
        // "cell" excel
        // "copy" has little cross
        renderer.domElement.style.cursor = cursorStyle

        //click output to put it in or take it out of preview. double click to select it as one would select text

        if (!mouse.clicking)
            outputColumnGrabbed = false
        else if (!mouse.oldClicking && thingMouseIsOn === "column")
            outputColumnGrabbed = true

        if (outputColumnGrabbed)
            outputColumn.position.x = mouse.getZZeroPosition(v1).x
        outputColumn.position.x = clamp(outputColumn.position.x, -camera.rightAtZZero + outputColumn.scale.x / 2., camera.rightAtZZero - outputColumn.scale.x / 2.)
        //and maybe resize as well?

        outputColumn.scale.copy(pad.scale)

        pad.position.x = outputColumn.right()
        if (pad.position.y < camera.topAtZZero)
            pad.position.y = camera.topAtZZero
    })
}