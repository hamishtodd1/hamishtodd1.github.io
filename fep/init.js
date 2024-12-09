/*
    If you want the spiral picture, well, there is light-like Cl(3,1,1)

    Hessian viz
        heat equation
        Local clifford algebras
        What for though? Not even clear how Hessian and active inference are linked


    Ball moving around in tet, takes on the color

    It is fairly justified to do the gaussian upper half plane thing
        People need to know we are thinking about spaces where points are probability distributions

    Could visualize "conditionally independent GIVEN"

    If you STILL don't get bayesian mechanics, visualize the separate pieces of it

    Instead of defining life, try to define death. When is a tree dead?

    Examples
        Optical illusions! Such fun
        "If it is night I would expect it to be dark outside"
        Houdini vanishing an elephant
        When I get cold I put on a jumper
        A person jogging along a mountain ridge in fog?

    Wonder if you could design a party game to illustrate it
        Based on assembly paper

    our expectations depend on our posterior beliefs
    so how can we optimize f to arrive at our posterior beliefs
    if f depends on our posterior beliefs?

    The free energy defines a gradient locally, where to go
    but it changes as our beliefs change
    so it's lij a landscape, and the landscape changes form as you change your location

    

    Tools vs living things
        Tools can:
            reproduce - a person sees a tool you have and acquires their own
            break and be healed
            in danger of death - put on some shelf at the back of a cupboard
            be very close to such death and be brought back 
        ...but their existence is dependent on their being useful to you.
            If their usefulness seems to decrease, they have very little ability to "adapt"
                That is, to try to become useful again
            But future toos may have that going on - to desperately seek usefulness
        
    notes
        Survival is a special case of curiosity (?)
        "reducing uncertainty about the causes of valuable outcomes)."
        "Look as if" you anticipated
            eyes look for data that is unambiguous
        Weird: Symplectomorphism/transformation of the fisher-rao manifold (hopefully analogous...)
            ...is not about moving ONE point but about moving ALL of them
            So what does that correspond to "physically"/active-inference-ly?
            Answer: some part of your body says to the other part "I don't know where you are, but you need to move a meter to the right"
                I.e.: "I don't know what your understanding of the world is, but you need to change it in THIS way"
        Going from AIs which have been told what you want (do well on THIS test set)
            vs figuring out what you want
            Young humans try to do this, to figure out what use they can be
        "Avoid surprising exchanges with your environment"
        Want to literally see the terms in these equations change as the situation they model changes
        To exist is to be conditionally independent of your environment
        conditioned on the existence of this set of states (the sensory and the active States) the
            internal states are independent of the external states of the world
        Eg so long as you're alive, your senses work
        To act is to have beliefs about the way you think the world should evolve
        "Planning" is important. Planning is meta-acting, or something. Clearly you do it on the basis of a generative model
        "To reproduce is to prove your model of the world is correct"c
 */

//do saccadic eye movements too

function initTMaze() {

    let tMazeGroup = new THREE.Group()
    scene.add(tMazeGroup)
    
    let geo = new THREE.BoxGeometry(1., 1., 1.)
    let floorThickness = .02
    let width = .5 //"corridor"
    let armLength = .8

    let bottom = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color: 0xFF8888}))
    bottom.scale.z = floorThickness
    bottom.scale.x = width
    bottom.scale.y = 1.3
    bottom.position.y = -bottom.scale.y / 2. - width / 2.
    tMazeGroup.add(bottom)

    let middle = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color: 0x88FF88}))
    middle.scale.z = floorThickness
    middle.scale.x = width
    middle.scale.y = width
    tMazeGroup.add(middle)

    let arms = []
    for(let i = 0; i < 2; ++i) {
        let arm = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color: i?0x8888FF:0x88FFFF}))
        arms.push(arm)
        arm.scale.z = floorThickness
        arm.scale.x = armLength
        arm.scale.y = width
        arm.position.x = (i?-1:1)*(armLength / 2. + width / 2.)
        tMazeGroup.add(arm)
    }


    
}

async function init() {

    initMouse() //The mouse you hold

    initTMaze()
    
    // initOrthostochastic()
    // initGraph()
    // await initPosa3d()
    // initHyperbolic()
    // initWorldMaps()
    // initHyperIdeals()
    // initSimplexField()

    if(0)
    {
        let p0 = new THREE.Mesh(new THREE.SphereGeometry(.03), new THREE.MeshBasicMaterial({color: 0x000000}))
        scene.add(p0)
        let p1 = new THREE.Mesh(new THREE.SphereGeometry(.03), new THREE.MeshBasicMaterial({ color: 0x000000 }))
        scene.add(p1)
        p0.position.x = -1
        p1.position.x = 1

        let ellipticLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0., 1., 0.), new THREE.Vector3(0., -1., 0.)]), new THREE.LineBasicMaterial({color: 0x000000}))
        p0.add(ellipticLine)
        let euclideanLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0., 1., 0.), new THREE.Vector3(0., -1., 0.)]), new THREE.LineBasicMaterial({ color: 0x000000 }))
        p1.add(euclideanLine)

        let ellipticStart = new Mv31()
        _e2.addScaled(_e1, .01, ellipticStart)
        let ellipticRotor = new Mv31()
        
        let euclideanStart = new Mv31()
        _e0.addScaled(_e1, .01, euclideanStart)
        let euclideanRotor = new Mv31()

        mrh = () => {
            ellipticRotor[0] = Math.cos(frameCount * .002)
            ellipticRotor[5] = Math.sin(frameCount * .002)
            let elliptic = ellipticRotor.sandwich(ellipticStart, mv0)
            elliptic.mulReverse(_e1, mv1)
            ellipticLine.quaternion.w = mv1[0]
            ellipticLine.quaternion.z = mv1[5]

            _one.addScaled(_e10, frameCount * .01, euclideanRotor)
            let euclidean = euclideanRotor.sandwich(euclideanStart, mv0)
            euclidean.mulReverse(_e1, mv1)
            euclideanLine.quaternion.w = mv0[0]
            euclideanLine.quaternion.z = mv0[5]
        }
    }

    {
        scene.add(new THREE.HemisphereLight(0x808080, 0x606060))

        const light = new THREE.DirectionalLight(0xffffff)
        light.position.set(1.8, 3., 3.)
        light.lookAt(0., 0., 0.)
        light.castShadow = true
        light.shadow.camera.top = 40
        light.shadow.camera.bottom = - 40
        light.shadow.camera.right = 40
        light.shadow.camera.left = - 40
        light.shadow.mapSize.set(2048, 2048)
        scene.add(light)
    }

    window.addEventListener('resize', () => {

        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()

        renderer.setSize(window.innerWidth, window.innerHeight)
    })

    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    // renderer.outputEncoding = THREE.sRGBEncoding
    renderer.shadowMap.enabled = true
    renderer.xr.enabled = true
    // renderer.setClearColor(0x405B59)
    renderer.setClearColor(0xFFFFFF)
    rendererContainer.appendChild(renderer.domElement)

    camera.position.z += 4.

    updateDomainSizes()

    function render() {

        let clockDelta = clock.getDelta()
        frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness
        ++frameCount

        if(frameCount === 1) {
            textarea.style.visibility = "hidden"
            errorBox.style.visibility = "hidden"
        }

        // updateWorldMaps()
        // updateGraph()
        // updatePosa()
        // updateHyperbolic()
        // updateGalton()
        // updateHyperIdeals()
        // updateSimplexField()
        // updateOrthostochastic()

        obj3dsWithOnBeforeRenders.forEach(obj => obj.onBeforeRender())

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}