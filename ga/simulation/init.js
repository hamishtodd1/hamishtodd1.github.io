/*
    We want a cube, and a square's, worth

 */

function blankFunction(){}

async function init() {

    initSim()

    document.addEventListener(`keydown`,event=>{
        if(event.key === " ")
            simulatingPaintingHand = !simulatingPaintingHand
    })

    initCamera()
    initSurroundings()

    await initHands()
    initButtons()
    
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

        blankFunction()
        updateSim()
        
        buttonWhileDowns()

        obj3dsWithOnBeforeRenders.forEach(obj3d => obj3d.onBeforeRender())

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}