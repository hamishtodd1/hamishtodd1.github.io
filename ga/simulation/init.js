/*
    One idea is that e1 e2 e3 eMinus do STA = EM
    And then CGA brings in ePlus which gives you positrons
        And happens, also, to give you PGA

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

    let stateArray = initUserDefinedField()
    simBox = await initSimAppearance()
    putSphereInField(v3.set(.5, .4, .5), 0.35, 0., 1., 0.)
    putSphereInField(v3.set(.5, .6, .5), 0.4, 0., 0., 1.)
    let numStepsPerFrame = 1;
    let sim = await GpuSim(
        `basicSimulation`,
        THREE.ClampToEdgeWrapping,
        stateArray,
        numStepsPerFrame, 
        simBox.material.uniforms.simulationTexture,
        {},
        THREE.LinearFilter)

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
        
        sim.update()
        
        buttonWhileDowns()

        obj3dsWithOnBeforeRenders.forEach(obj3d => obj3d.onBeforeRender())

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}