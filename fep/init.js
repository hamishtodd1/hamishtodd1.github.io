//have a "highlight" button I guess, which goes across them all
//the setup could be: record it on the side, then just move stuff around on the side afterwards. Can put in slides etc

/*
    -Grey rat, cover is over
    -Remove and replace cover
    -Gaussian appears. It is changing. Its belief space point changes from place to place along a smooth arc.
    -More rats, and their gaussians
    -horizontal and vertical lines for the belief space points
    -pause
    -choose the rat’s initial distribution (by clicking in belief space)
    -have a starting and ending distribution
    -make a huge amount of pellets fall out according to the final (by clicking on it I guess)
    -move distribution in a straight line
    -click to make a new distribution in belief space
    -Make the translation from one to the other appear
    -Click randomly to make a bunch, flash the arcs between them
    -generate a random translation, apply it to all to get that shape somewhere else
    -watch them go from one to the other
    -watch some fun transformations
    Slide break
    -Gaussians and rats go away
    -rotations. Rings of colored beliefs around a center. You can grab the center of rotation and move it obv
    -random beliefs, flash line segments
    -make mercator rotate around britain
    -rotate around a dirac delta



    Can you make an interface for this where you move from thing to thing using your hands? Not just clicking. Get rid of the blocking box by pulling it in

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


async function init() {

    simplyMoveableThings = []

    initMouse() //The mouse you hold

    if(1)
    {
        let separator = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0., 9., 0.), new THREE.Vector3(0., -9., 0.)]), new THREE.LineBasicMaterial({ color: 0x000000 }))
        scene.add(separator)
        separator.position.x = -.2

        let slideNames = [
            `Davide.png`,
            `bloch.png`,
            `Frank Nielsen.png`,
            `Lance.png`,
            `gradient descent.png`,
            `tensorflow_pytorch.png`,
            `Poincare.png`,
            `nn.png`,
            `nn2.png`,
            `Amari.png`,
        ]
        slideNames.forEach((name, i) => {
            textureLoader.load(`https://hamishtodd1.github.io/fep/data/` + name, texture => {
                let mat = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                })
                
                let mesh = new THREE.Mesh(unchangingUnitSquareGeometry, mat)
                mesh.scale.y = 1.1
                mesh.scale.x = texture.image.width / texture.image.height * mesh.scale.y
                mesh.position.x = -2.3
                mesh.position.y = .5 * ( i - slideNames.length / 2)
                mesh.position.z = .01 * i
                scene.add(mesh)
                simplyMoveableThings.push(mesh)
            })
        })
    }

    let grabbedSmt = null
    document.addEventListener('mousedown', e => {
        if (e.button === 2) {
            e.preventDefault()
            e.stopPropagation()

            //get the one that is closest to mousePos
            grabbedSmt = null
            let closestD = Infinity
            simplyMoveableThings.forEach(thing => {
                let d = thing.position.distanceToSquared(mousePos)
                if (d < closestD) {
                    grabbedSmt = thing
                    closestD = d
                }
            })
        }
    })
    document.addEventListener('contextmenu', e => {
        e.preventDefault()
    })
    document.addEventListener('mousemove', e => {
        if(grabbedSmt) {
            grabbedSmt.position.add(mousePosDiff)
            beliefSpaceScene.position.y = -1.87
        }
    })
    document.addEventListener('mouseup', e => {
        if (e.button === 2)
            grabbedSmt = null
    })

    document.addEventListener('mousewheel', (event) => {
        // raycaster.setFromCamera(mouse, camera)
        if (event.deltaY < 0.)
            camera.position.z *= 1.1
        if (event.deltaY > 0.)
            camera.position.z *= (1. / 1.1)
    })

    {
        // let simplex = initSimplexField()
        // simplex.position.y = .8
        // simplex.scale.multiplyScalar(.6)
        // let state = new SimplexState()

        // let saccadicScene = initSaccadic(state)
        // saccadicScene.position.y = -.8
        // saccadicScene.scale.multiplyScalar(.8)
    }

    {
        initVizes2d()

        initGaussians()

        initGalton()

        initRotations()
        
        beliefSpaceScene.position.y -= 0.
        beliefSpaceScene.position.x = 1.4
        galtonScene.position.x = 1.3
    }
    
    // initShm()
    // initTMaze()
    // initOrthostochastic()
    // initGraph()
    // await initPosa3d()
    // initHyperbolic()
    // initWorldMaps()
    // initHyperIdeals()


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
    // renderer.xr.enabled = true
    // renderer.setClearColor(0x405B59)
    renderer.localClippingEnabled = true
    renderer.setClearColor(0xFFF5EF)
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
        updateGalton()
        updateGaussianAnimations()

        // updateGraph()
        // updatePosa()
        // updateHyperIdeals()
        // updateSimplexField()
        // updateOrthostochastic()
        // updateSaccadic()
        // updateShm()
        // updateMeasuringStick()

        obj3dsWithOnBeforeRenders.forEach(obj => obj.onBeforeRender())

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}

