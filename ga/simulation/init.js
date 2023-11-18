/*
    Femi game
        Just want a thing that shows a POTENTIAL control scheme

    Need to make something in two weeks, just needs to look like something
        GA speculations
            One-qubite density matrix is bloch vector...
            but really, it's a boost (of the origin, to someplace)
            Maybe your tet vertices are the basis vectors you could measure it in?
            With a hyperbolic PGA view,
                Feels like rotations and boosts won't change whether there is a nested tet
            What does an ellipsoid really mean in a klein ball?
            2D CGA may be useful, the tet edges become point pairs
            A 1-qubit density matrix is a 1+xyz is a boost.
        What are these planes?
        Probably bad idea to prejudice yourself with GA. It's matrices, for now
            Make a visualization of it, and make it so you can move it around

    On light cone vs in light cone: light-like vs time-like

    (4,C)
        The argument is that grades with CGA are not really stating the geometric info:
            negative-square "spheres" are hyperideal spheres which look like nothing. Like a quadvector really!
            positive-square "circles" are point pairs
            positive-square "point pairs" are circles
            negative-square quadvectors are spheres, positive-square are like your hyperideal spheres
        But, bit bizarre to say that a plane(sphere) like e4, added to...
            ...a negative-square quadvector, e1234, multiplied by i...
            gives you a displaced plane
        And ok, so e12 (180) and e345 may look the same, but they generate different transformations, one handedness-reversing, one preserving
 */

function blankFunction(){}

async function init() {

    // let stateArray = initUserDefinedField()
    // simBox = await initSimAppearance()
    // putSphereInField(v3.set(.5, .4, .5), 0.35, 0., 1., 0.)
    // putSphereInField(v3.set(.5, .6, .5), 0.4, 0., 0., 1.)
    // let numStepsPerFrame = 1;
    // let sim = await GpuSim(
    //     `basicSimulation`,
    //     THREE.ClampToEdgeWrapping,
    //     stateArray,
    //     numStepsPerFrame, 
    //     simBox.material.uniforms.simulationTexture,
    //     {},
    //     THREE.LinearFilter)

    // document.addEventListener('mousedown', event => {
    //     if(event.button === 0)
    //         painting = true
    // })
    // document.addEventListener('mouseup', event => {
    //     if (event.button === 0)
    //         painting = false
    // })

    initCamera()
    initSurroundings()

    await initHands()
    initButtons()

    initDraft()
    
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

        updateSteeringSpheres()
        // sim.update()
        
        buttonWhileDowns()

        obj3dsWithOnBeforeRenders.forEach(obj3d => obj3d.onBeforeRender())

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}