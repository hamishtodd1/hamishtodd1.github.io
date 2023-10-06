/*
    Buttons are "erase" and "move"
    How about voice?

    Features:
        dotted brush stroke?
        Grabbing might be nice but brings in new complexity
        Scaling the next. Naaaah.
 */

function blankFunction(){}

class CollideableRect extends THREE.Mesh {
    constructor(mat) {
        super(unchangingUnitSquareGeometry, mat)
    }
    mouseInside() {
        let x = handPosition[13]
        let y = handPosition[12]
        return x > this.position.x - this.scale.x / 2. && x < this.position.x + this.scale.x / 2.
            && y > this.position.y - this.scale.y / 2. && y < this.position.y + this.scale.y / 2.
    }
}

isSketch = true

async function init() {

    initEga()

    initCamera()
    initRotorVizes()

    initHands()
    initButtons()
    
    camera.position.set(0, 0., 4.)
    scene.add(camera)
    orbitControls = new OrbitControls(camera, container)
    orbitControls.target.set(0, 0., 0)
    orbitControls.update()
    orbitControls.enableRotate = false
    orbitControls.enableZoom = true

    initVoice()

    initBrushStroke()
    
    {
        scene.add(new THREE.HemisphereLight(0x808080, 0x606060))

        const light = new THREE.DirectionalLight(0xffffff)
        light.position.set(-.5, 2., 2.)
        light.lookAt(0., 1.6, 0.)
        light.castShadow = true
        light.shadow.camera.top = 2
        light.shadow.camera.bottom = - 2
        light.shadow.camera.right = 2
        light.shadow.camera.left = - 2
        light.shadow.mapSize.set(4096, 4096)
        scene.add(light)

        scene.background = new THREE.Color(0x8F8F8F)
    }

    window.addEventListener('resize', () => {

        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()

        renderer.setSize(window.innerWidth, window.innerHeight)
    })

    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    // let numContactPoints = 0
    // document.addEventListener(`pointerdown`,()=>{
    //     ++numContactPoints
    // })
    // document.addEventListener(`pointerup`, () => {
    //     --numContactPoints
    // })
    // document.addEventListener(`pointermove`, event => {
    //     if(numContactPoints === 2) {
    //         let dx = event.movementX
    //         let dy = event.movementY
    //         // camera.position.x -= dx * .003
    //         // camera.position.y -= dy * .003
    //     }
    // })


    function render() {
        let clockDelta = clock.getDelta()
        frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness
        ++frameCount

        orbitControls.update()
        camera.rotation.set(0.,0.,0.)
        adjustControlsToCamera()

        blankFunction()
        buttonWhileDowns()
        obj3dsWithOnBeforeRenders.forEach(obj3d => obj3d.onBeforeRender())

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}