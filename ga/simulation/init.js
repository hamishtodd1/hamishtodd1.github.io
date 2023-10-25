/*
    We want a cube, and a square's, worth

 */

function blankFunction(){}

async function init() {

    let stateArray = initUserDefinedField()
    simBox = await initSimAppearance()
    putSphereInField(v3.set(.5,.5,.5))
    let numStepsPerFrame = 1;
    let sim = await GpuSim(
        `basicSimulation`,
        `clamped`,
        stateArray,
        numStepsPerFrame, 
        simBox.material.uniforms.simulationTexture)

    let painting = false
    document.addEventListener('mousedown', event => {
        if(event.button === 0)
            painting = true
    })
    document.addEventListener('mouseup', event => {
        if (event.button === 0)
            painting = false
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
        
        sim.update(painting)
        
        buttonWhileDowns()

        obj3dsWithOnBeforeRenders.forEach(obj3d => obj3d.onBeforeRender())

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}