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
        let x = mousePlanePosition[13]
        let y = mousePlanePosition[12]
        return x > this.position.x - this.scale.x / 2. && x < this.position.x + this.scale.x / 2.
            && y > this.position.y - this.scale.y / 2. && y < this.position.y + this.scale.y / 2.
    }
}

async function init() {

    initEga()

    initRotorVizes()

    initMouse()
    initButtons()
    
    camera.position.set(0, 0., 4.)
    scene.add(camera)
    orbitControls = new OrbitControls(camera, container)
    orbitControls.target.set(0, 0., 0)
    orbitControls.update()
    orbitControls.enableZoom = true //change whenever you like!
    orbitControls.enableRotate = false

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