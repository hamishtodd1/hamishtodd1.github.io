/*

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

    initMouse()

    // initGraph()
    // await initPosa3d()
    initHyperbolic()
    // initWorldMaps()

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
    renderer.setClearColor(0x405B59)
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
        updateHyperbolic()

        obj3dsWithOnBeforeRenders.forEach(obj => obj.onBeforeRender())

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}