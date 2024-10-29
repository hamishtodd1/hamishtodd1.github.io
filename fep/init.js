/*
    For first presentation to Emmett
        Making nodes
        editing nodes
        Visualizing distributions?

    TODO
        Instead of code, boxes could also have a picture of an equation in latex
            represented as code under the hood


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
        
    notes
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
    initGraph()

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
    renderer.setClearColor(0x000000)
    rendererContainer.appendChild(renderer.domElement)

    camera.position.z += 2.

    // textarea.style.visibility = "hidden"
    document.addEventListener('keydown', (event) => {
        if (event.altKey && event.key === "Enter" ) {
            if( textarea.style.visibility === "hidden")
                textarea.style.visibility = ""
            else {
                textarea.style.visibility = "hidden"

                try {
                    eval(textarea.value);
                } catch (e) {
                    // +3 because `err` has the line number of the `eval` line plus two.
                    log(e)
                }
            }
        }
    })

    textarea.value = "log('hello');\n\nboogle;\n\nlet a = 3;"//"log('hello')"

    function render() {

        let clockDelta = clock.getDelta()
        frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness
        ++frameCount

        updateGraph()

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}