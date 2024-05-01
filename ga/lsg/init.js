/*
    Need a cow or w/e shown having undergone that transformation


    A wall covered in hyperboloids. Nice thing is you can see the places where ones that don't meet meet


    A more modest thing:

    A modest and realistic thing for Hiley is:
        You can pick up planes, spheres etc and move them around
        You have a teapot and can select the transform it is subject to

    Visualiz

    Is it possible to have a rule against having to get coords of things that are "barely in the space"?


    Quantum:
        CHSH
        Delayed choice quantum eraser
        Stern gerlach

    Minkowski space as a way of presenting trees
        What to put in test tree?
            Addition, mul, division, subtraction
            You type a mathematical expression, it parses it into an AST
*/

function blankFunction(){}

async function init() {

    initDqMeshes()

    initCamera()
    initSurroundings()

    await initHands()
    initButtons()

    init42()
    initPluckerVizes()
    
    
    initDebugDisplay()
    
    // initBasises()
    // initPosSqShader()

    window.addEventListener('resize', () => {

        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()

        renderer.setSize(window.innerWidth, window.innerHeight)
    })

    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight) 
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.shadowMap.enabled = true
    renderer.xr.enabled = true
    container.appendChild(renderer.domElement)

    document.body.appendChild(VRButton.createButton(renderer))    

    function render() {
        let clockDelta = clock.getDelta()
        frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness
        ++frameCount

        updateCameraMvs()
        updateHandMvs()
        buttonWhileDowns()
        
        updateDebugDisplay()

        debugUpdates.forEach(func=>func())

        obj3dsWithOnBeforeRenders.forEach( obj3d => obj3d.onBeforeRender() )

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}