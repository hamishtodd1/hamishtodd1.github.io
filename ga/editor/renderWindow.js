/* 
    comment-like bits of code that say what vectors should be in the render windows where

    the below is for showing meshes / animations / vertex shades
    you will want graphs for functions mapping multivectors to multivectors
    one case of which is a fragment shader, woo

    maybe try to make it so that when you change what you see in the window it back solves to change the code? Urgh

    change angle on these, with your mouse, and your angle on all the vectors changes

    When you click the things in the columns it makes them appear in the window
    When you right click them, context menu:
        "Copy name"
        "Change name"
        "Paste at carat"
        "change representation"
    
    One idea to make names consistent: record what names got attributed to what calculations

    Should be able to edit the vectors in the render window too

    What's in the render window?
        Whatever lines are in the editor. Want more? Scroll up, copy it, paste it down here
        Unless you have some highlighted in which case it's those?
        "What is hightlighted" is a useful bit of state

    Good to think about velocity space or differential space. Like that 3b1b thing with the circular bunch of velocity vectors. What happens when you control velocity with your mouse and watch position change?

    copy a png or gif or whatever, paste into window, you have a textured quad, or three scalar fields or however you do it

    Double click something in window, to get to the part where it is made
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
    function getColumn()
    {
        let mouseX = mouse.getZZeroPosition(v1).x

        let columnLeft = outputColumn.position.x - outputColumn.scale.x / 2.
        let columnRight = outputColumn.position.x + outputColumn.scale.x / 2.

        if (columnLeft > mouseX)
            return "left"
        else if (mouseX > columnRight)
            return "right"
        else
            return "outputColumn"
    }
    updateFunctions.push(() =>
    {
        let cursorStyle = "text"
        let column = getColumn()
        if (column === "outputColumn")
            cursorStyle = "col-resize"
        else if (column === "right")
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
            if (mouse.clicking && !mouse.oldClicking && getColumn() === "right")
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
        superimposedWindow.screen.position.x = (camera.rightAtZZero + (outputColumn.position.x + outputColumn.scale.x / 2.)) / 2.
        superimposedWindow.screen.scale.setScalar(camera.rightAtZZero - (outputColumn.position.x + outputColumn.scale.x / 2.))
    })
    
    let gridSize = 8.
    let axis = new THREE.Line(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0xFFFFFF}))
    axis.geometry.vertices.push(new THREE.Vector3(0., gridSize / 2., 0.), new THREE.Vector3(0., -gridSize / 2., 0.))
    let grid = new THREE.GridHelper(gridSize, gridSize, axis.material.color)
    superimposedWindow.scene.add(grid,axis)

    document.addEventListener('wheel', (event) =>
    {
        if (getColumn() === "right")
        {
            let cameraPosition = superimposedWindow.camera.position
            cameraPosition.setLength(cameraPosition.length() * (event.deltaY < 0 ? 1.1 : 0.91))
        }
        else
        {
            mouse.getZZeroPosition(v1)
            pad.worldToLocal(v1)

            pad.scale.setScalar(pad.scale.x * (event.deltaY < 0 ? 1.1 : 0.91))
            pad.updateMatrixWorld()

            pad.localToWorld(v1)
            mouse.getZZeroPosition(v2)

            pad.position.add(v2).sub(v1)
            pad.position.x = 0.

            //which changes output column size too
        }

    }, false);
}