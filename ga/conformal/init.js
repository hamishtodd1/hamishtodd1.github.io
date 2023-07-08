/*
    TODO for puppet show:
        Sketching of 3D shapes obv
        Need essentially skeletal animation
        Hold the puppet with one hand and control some aspect of it with the other
        Automatic eyeballs
        Automatic feet?
        Need to be able to grab the controls of different puppets quickly
        Analogue button
            Mouth opening
            Eyebrows furrowing


    More able to do stuff without typing!
        Buttons at the bottom to make new objects
            point, pp, circle, sphere, mesh, transform
        A mode where the things in the spreadsheets just are those icons
        Though yes you still need arrows showing what's affected by what

    Yo maybe time and hand should be built-in at the top

    Could have four little tabs at the bottom of the sheet:

    Non-spreasheet TODO
        Wanna be able to make looooots of things gesturally
        And, yes, you snap things
        Need your rotation and translation arrows and need them to follow your hands in a good way
        Need some way of making a simple animation with a hand gesture
    TODO
        Every cell should actually be an array of things (it's just that most of them are one thing)
        Would be nice to drag a cell onto a declaration in another cell and have it fill in the thing there
        Better sphere rendering close to infinity eg e2+e3
        Change what possibly-spherical slice you're looking at? With a watch interface?
        Ternary operators
        A tube with three bones in it
        Improved line rendering:
            It is a full circle, and the last two vertices are in the same place,
            BUT you don't join them together
        Wanna have gauging animations
        "Undo". Should probably rewind "time"

    Ideas
        Dance demo
        You should be able to break off definitions and stick them to a point
        Something indicating what cells affect what, for example arrows

    Let's say there's a cloud of random dots, call it "cloud"
        Mention it in a cell on its own and now that cell is that cloud of dots
            So, that's "cloud, with identity transform applied"
        Should be able to write versor ⤳ cloud, and you get the transformed cloud (just like a single point)
    
    Interfaces the user should be able to make:
        Timeline
            With parameters on it that you can vary
            Maybe it behaves like a texture?
        Cubic bezier. For points p0, p1, p2, p3
            pA = p0*t+p1*(1-t)     pB = p1*t+p2*(1-t)     pC = p2*t+p3*(1-t)
            pi = pA*t+pB*(1-t)     pj = pB*t+pC*(1-t)
            pf = pi*t+pj*(1-t)
 */

function blankFunction(){}

async function init() {

    // let cornerGeo = new THREE.CircleGeometry(1.,14,0.,Math.PI/2.)
    // class NiceCorners extends THREE.Group {
    //     constructor(color) {
    //         super()

    //         let mat = new THREE.MeshBasicMaterial({ color })
            
    //         // this.rect = new THREE.Mesh(unchangingUnitSquareGeometry, mat)
    //         // this.add(this.rect)
    //         this.corners = [
    //             new THREE.Mesh(cornerGeo, mat),
    //             new THREE.Mesh(cornerGeo, mat),
    //             new THREE.Mesh(cornerGeo, mat),
    //             new THREE.Mesh(cornerGeo, mat),
    //         ]
    //         this.corners.forEach((corner,i)=>{
    //             corner.rotation.z = Math.PI/2. * i
    //             this.add(corner)
    //         })

    //         scene.add(this)
    //     }
    // }

    // let nc = new NiceCorners(0x0000ff)
    // nc.position.y = .4
    // scene.add(nc)

    
    
    initEga()

    await initCgaVizes()
    initRotorVizes()

    initMouse()
    initButtons()

    initMeshes()

    initCompilation()
    initSpreadsheet()

    initDrawing()

    let initial = [
        [
            `e1 + digital * e0`,
            `2e12`,
            //want something that affects itself Or two affecting each other
            `-0.5e123m + 0.5e123p`,
            `e1 - e0`,
            `ep - em + time * e0`,
            `e23 - e03`,
            `(1+time*e01) > e1`,
            `e123`,
            `e0`, `ep`, `e2`, `e23`
        ],
        [
            `exp( time * (e12 + e01) )`,
            `B1 > hand`,
            `e23 - time * e13`,
            `hand & e123`,
            `B3 + B4`,
            `hand`,
        ]
    ]
    initSpreadsheetNavigation(initial)

    initSurroundings()

    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.shadowMap.enabled = true
    renderer.xr.enabled = true
    container.appendChild(renderer.domElement)

    document.body.appendChild(VRButton.createButton(renderer))

    // controllers
    {
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
    }

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
        buttonWhileDowns()
        refreshActiveCells()
        handleDrawing()
        obj3dsWithOnBeforeRenders.forEach(obj3d => obj3d.onBeforeRender())

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}