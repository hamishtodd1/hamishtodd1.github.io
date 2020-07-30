/* 
    TODO later maybe, pressing TODO is in init.js
    copy a png or gif or whatever, paste into window, you have a textured quad, or three scalar fields or however you do it
    Double click something in window, to get to the place where it is made
    maybe try to make it so that when you change what you see in the window it back solves to change the code?
        Drawing a curve and geting an array is an example
        Grab the coord system and rotate; it gives you the quaternion that does that
        Draw a new vector
            it could be written in terms of old ones
            try to snap to the nearest one that's a single operation performed on existing ones

    Click the things in the column, what happens?
        They appear in the window?
        Probably you can have text in that column, appears when you hover?
        When you right click them, context menu:
            "Copy name"
            "Change name" (changes colors?)
            "Paste at carat"
            "change representation"

    What's in the render window?
        Much better than built in rotation is rotating the basis vectors. horizontal rotate around pole, y rotate upwards or downwards
        Wanna be able to program your own visualization, then use that to visualize your program
        Whatever lines are in the editor. Want more? Scroll up, copy it, paste it down here
        Unless you have some highlighted in which case it's those?
        "What is hightlighted" is a useful bit of state

    Representations, from abacus. Can bootstrap some?
		A line you can grab bits of
		A canvas you can draw on (i.e. a scalar field that starts all 0 and you can make it nonzero in places)
		Looping all the multivectors (i.e. varying over time)
		utah teapots with scalar for sizes
		points moving aroound due to vector field
		surface: vectors interpreted as contiguous vertices of triangls
		orientations and positions: a bunch of utah teapots offset by the vector, oriented by the bivector
		hmm, how about offset by the bivector, oriented by the vector combined with the pseudoscalar?
        One standing in for all. In this situation, everything coming from the same one gets the same representation
        
    C=R2. H?
    f:
    R->R    line graph - black and white line if looked at from above
    R->R2   line through R2, or through R3 plotted along z axis
    R->R3   curve through R3, "parametric"

    R2->R   1 surface
    R2->R2  set of 2 surfaces - 2 color image if looked at from above, or vector field? Tokieda weirdness?
    R2->R3  set of 3 surfaces - 3 color image if looked at from above, or parametric surface??
    surfaces are parametric, functions from R2
        If the vertices of a mesh are in a funky order with respect to triangles, they are probably imported from an outside program which should put them in a good order
        Except that you want to compute vertex normals.
            Though in order to do that you do have to iterate an array to find what faces a vertex is in

    R3->R   isosurface. Two of them. One at 0 and the other at a controllable level. Between, if you slice it, MRI-style texturing
    R3->R2  pair of isosurfaces
    R3->R3  vector field? 3 color isosurface?

    Good to think about velocity space or differential space.
        Like that 3b1b thing with the circular bunch of velocity vectors. What happens when you control velocity with your mouse and watch position change?
        Or Hestenes' thing about velocity space
        Something something integration and differentiation
        "Look at the system in velocity space", "look at the system in integration/energy space". All fully determined.

    Interesting to compare a scatter plot, statistics game note
        A scatter plot is for when you have a probability distribution over two variables (R2->R) and it has been sampled a few times.
        A single color texture, really
*/

function initOutputColumnAndRenderWindows()
{
    // let inputRow = new THREE.Mesh(new THREE.PlaneGeometry(1., 1.), outputColumn.material)
    // inputRow.geometry.translate(-.5,0.,0.)
    // scene.add(inputRow)
    // inputRow.position.x = outputColumn.position.x
    // inputRow.scale.x = 5.

    outputColumn.position.z = -.001 //better would be drawn 1st
    scene.add(outputColumn)
    let outputColumnGrabbed = false
    function getColumnMouseIsIn()
    {
        let mouseX = mouse.getZZeroPosition(v1).x

        let columnLeft = outputColumn.position.x - outputColumn.scale.x / 2.
        let columnRight = outputColumn.position.x + outputColumn.scale.x / 2.

        if (columnLeft > mouseX)
            return "left"
        else if (mouseX > columnRight)
            return "right"
        else
            return "center"
    }
    updateFunctions.push(() =>
    {
        let cursorStyle = "text"
        let column = getColumnMouseIsIn()
        if (column === "center")
            cursorStyle = "col-resize"
        else if (column === "left")
            cursorStyle = "grab" //you might like "grabbing" but we can't rely on domElement to change it
        // "cell" excel
        // "copy" has little cross
        renderer.domElement.style.cursor = cursorStyle

        //click output to put it in or take it out of preview. double click to select it as one would select text

        if (!mouse.clicking)
            outputColumnGrabbed = false
        else if (!mouse.oldClicking && cursorStyle === "col-resize")
            outputColumnGrabbed = true
        if (outputColumnGrabbed)
            outputColumn.position.x = mouse.getZZeroPosition(v1).x
        outputColumn.position.x = Math.min(outputColumn.position.x, camera.rightAtZZero - outputColumn.scale.x / 2.)
        outputColumn.position.x = Math.max(outputColumn.position.x, -camera.rightAtZZero + outputColumn.scale.x / 2.)

        //need to change the resolution of those screens! Except for the fragment shader ones
    })

    let ordinaryClearColor = renderer.getClearColor().clone()
    let ordinaryRenderTarget = renderer.getRenderTarget()

    function RenderWindow()
    {
        let localScene = new THREE.Scene()
        let localCamera = new THREE.PerspectiveCamera(90., 1., .01, 100.)
        localCamera.position.z = 8.5
        localCamera.rotation.order = "YXZ"

        //may want a "background" thing

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
            if (!mouse.clicking)
                grabbed = false
            if (mouse.clicking && !mouse.oldClicking && getColumnMouseIsIn() === "left")
                grabbed = true

            // log(mouse.justMoved())
            if (grabbed)
            {
                if (trailMode)
                {
                    let ndcOnRenderWindow = screen.worldToLocal(mouse.getZZeroPosition(v1))

                    mouseTrail.geometry.vertices[lastTrailVertexToBeAssigned].set(ndcOnRenderWindow.x, ndcOnRenderWindow.y,0.)
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

            //probably will want zoom in and out at some point. But zooming to get the furthest-out vertex should be pretty good

            renderer.setRenderTarget(localFramebuffer)
            renderer.setClearColor(0x000000)
            renderer.clear()
            renderer.render(localScene, localCamera)

            renderer.setRenderTarget(ordinaryRenderTarget)
            renderer.setClearColor(ordinaryClearColor)
        })

        return { screen, scene: localScene,camera:localCamera }
    }

    let superimposedWindow = RenderWindow()
    scene.add(superimposedWindow.screen)
    updateFunctions.push(() =>
    {
        pad.scale.copy(outputColumn.scale)

        let columnLeft = outputColumn.position.x - outputColumn.scale.x / 2.
        let columnRight = outputColumn.position.x + outputColumn.scale.x / 2.

        pad.position.y = camera.topAtZZero
        pad.position.x = columnRight

        superimposedWindow.screen.scale.setScalar(Math.abs(-camera.rightAtZZero - columnLeft ) )
        superimposedWindow.screen.position.x = (-camera.rightAtZZero + columnLeft) / 2.
    })
    
    let gridSize = 8.
    let axis = new THREE.Line(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0xFFFFFF}))
    axis.geometry.vertices.push(new THREE.Vector3(0., gridSize / 2., 0.), new THREE.Vector3(0., -gridSize / 2., 0.))
    let grid = new THREE.GridHelper(gridSize, gridSize, axis.material.color)
    superimposedWindow.scene.add(grid,axis)

    document.addEventListener('wheel', (event) =>
    {
        let inflationFactor = 1.3

        mouse.getZZeroPosition(v1)
        superimposedWindow.screen.worldToLocal(v1)
        if (-.5 < v1.x && v1.x < .5 &&
            -.5 < v1.y && v1.y < .5 )
        {
            let cameraPosition = superimposedWindow.camera.position
            cameraPosition.setLength(cameraPosition.length() * (event.deltaY < 0 ? inflationFactor : 1./inflationFactor))
        }
        else
        {
            outputColumn.scale.setScalar(pad.scale.x * (event.deltaY < 0 ? inflationFactor : 1./inflationFactor))

            //which should change output column size too
        }
    }, false);
}