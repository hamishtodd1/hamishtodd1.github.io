/*
    Interfaces the user should be able to make:
        Timeline
        Cubic bezier. For points p0, p1, p2, p3
            pA = p0*t+p1*(1-t)     pB = p1*t+p2*(1-t)     pC = p2*t+p3*(1-t)
            pi = pA*t+pB*(1-t)     pj = pB*t+pC*(1-t)
            pf = pi*t+pj*(1-t)
 */

function blankFunction(){}

async function init() {
    let container = document.createElement('div')
    document.body.appendChild(container)

    initEga()

    await initCgaVizes()

    initCompilation()
    // initSpreadsheet()

    initMouse()
    initDrawing()

    // initSkinning()

    scene.background = new THREE.Color(0x8F8F8F)

    camera.position.set(0, 1.6, 3.5)
    // camera.position.z += 10.

    let orbitControls = new OrbitControls(camera, container)
    orbitControls.target.set(0, 1.6, 0)
    orbitControls.update()

    const floorGeometry = new THREE.PlaneGeometry(4, 4)
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
        roughness: 1.0,
        metalness: 0.0
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = - Math.PI / 2
    floor.position.y = -.01
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

    //

    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.shadowMap.enabled = true
    renderer.xr.enabled = true
    container.appendChild(renderer.domElement)

    document.body.appendChild(VRButton.createButton(renderer))

    // controllers

    let controller1 = renderer.xr.getController(0)
    // controller1.addEventListener('selectstart', onSelectStart)
    // controller1.addEventListener('selectend', onSelectEnd)
    scene.add(controller1)

    let controller2 = renderer.xr.getController(1)
    // controller2.addEventListener('selectstart', onSelectStart)
    // controller2.addEventListener('selectend', onSelectEnd)
    scene.add(controller2)

    const laserGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -5)])
    const laser = new THREE.Line(laserGeo)
    controller1.add(laser.clone())
    controller2.add(laser.clone())

    window.addEventListener('resize', () => {

        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()

        renderer.setSize(window.innerWidth, window.innerHeight)
    })

    function render() {
        let clockDelta = clock.getDelta()
        frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness
        ++frameCount

        blankFunction()
        // updateDqMeshes()
        // disorderedUpdate
        updatePanel()
        handleDrawing()
        updateRotorVizes()
        updatePpVizes()

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}