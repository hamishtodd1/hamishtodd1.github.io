function init() {
    container = document.createElement('div')
    document.body.appendChild(container)

    scene.background = new THREE.Color(0x444444)

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10)
    camera.position.set(0, 1.6, 3)

    const floorGeometry = new THREE.PlaneGeometry(4, 4)
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = - Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    scene.add(new THREE.HemisphereLight(0x808080, 0x606060))

    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(0, 6, 0)
    light.castShadow = true
    light.shadow.camera.top = 2
    light.shadow.camera.bottom = - 2
    light.shadow.camera.right = 2
    light.shadow.camera.left = - 2
    light.shadow.mapSize.set(4096, 4096)
    scene.add(light)

    let canvas = document.createElement('canvas')
    let gl = canvas.getContext('webgl2')
    console.assert(gl !== null)
    renderer = new THREE.WebGLRenderer({ canvas: canvas, context: gl, antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.shadowMap.enabled = true
    renderer.xr.enabled = true

    container.appendChild(renderer.domElement)

    window.addEventListener('resize', () => {

        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()

        renderer.setSize(window.innerWidth, window.innerHeight)

    })

    initXr(camera, container)

    // initShaderExperimentation(gl)

    renderer.setAnimationLoop(() => {
        let clockDelta = clock.getDelta()
        frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness

        ufs.forEach(uf=>uf())

        ++frameCount

        renderer.render(scene, camera)
    })
}