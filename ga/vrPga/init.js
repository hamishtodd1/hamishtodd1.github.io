/*
    One idea for visibility
        Your most-recently-created things are visible
        There's max 7 of them at a time
        Make a new thing visible (eg create a thing or grab a thing) and that thing becomes visible
        But something else is now invisible
        You can "scroll back", making your new thing invisible and the thing that just disappeared visible
        Put this on futureofcoding slack

    TODO for "show" demo:
        Rotations as well as translations
        Circuits need to be a bit more readable, see notes in markup.js
        Numbers on measurer
        Some way for a sclptable to be affected by the buttons you are pressing
        Not so hard to animate a tentacle
        Recording your hand motion somehow. Probably it is automatically turned into a loop
        Audience view
            no markup visible
            MAYBE pupeteer view should be the same angle, maybe not, make it optional for now
        How to control multiple puppets in lockstep? Probably "idle" animations
        https://english.lem.pl/works/novels/the-cyberiad/146-how-the-world-was-saved
    Jon demo:
        "Undo". Should probably rewind "time"
        Eyeballs, maybe faces, on vizes!
        Wanna have gauging animations
        Not just dqs
            Grade selection is a "snap" sound
        Little lizard creatures that rate your animations, with different preferences
            Make an animation with the smallest number of bones, so it's doing a complex thing
        Some levels!!!!!!
    Beyond:
        Roblox addon for importing the animal you made
            Don't market it. This is the start, a way to get investment for further things
        Spreads:
            grab an object with two hands, pull them apart, it makes a duplicate
            And press some button to increase the number of them you have between your hands
            And somehow you have, well, an index variable you can use to affect them independently
            There was probably SOME treatment of indices you thought up somewhere that was reasonable
                Maybe numbers from 0 to 1
            If you then re-grab two, maybe NOT even the start and end ones
        IF you were to do the inertia tensor
            First thing would be, for the sclptables, getting the inertia tensor
            And having you move a line L around, and showing you the I[L]
        
    Philosophy
        If you have arrows you can put end-to-end, do you need gauges?
 */

function blankFunction(){}

async function init() {

    initDqMeshes()

    initCamera()
    initSurroundings()

    await initHands()
    initButtons()
    
    initSclptables()
    initVizes()
    initSnapping()
    initControl()

    initMarkup()
    initCircuits()

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

    //debug examples
    {
        // let verySimple = new DqViz()
        // verySimple.dq.copy(Translator(0., 1., 0.))
        // verySimple.arrowStart.point(0., 0., 0.)

        let viz1 = new DqViz()
        snappables.push(viz1)
        viz1.dq.copy(Translator(.8, 0., 0.))
        viz1.arrowStart.point(-.4, .9, 0.)

        var sclptable = new Sclptable()
        sclptable.brushStroke(fl0.point(0., 1.6, 0., 1.))

        let viz2 = new DqViz()
        snappables.push(viz2)
        viz2.dq.copy(Translator(0., .6, 0.))
        viz2.arrowStart.point(-.4, 1.3, 0.)
    }

    function render() {
        let clockDelta = clock.getDelta()
        frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness
        ++frameCount

        updateCameraMvs()
        updateHandMvs()

        blankFunction()

        updateHighlighting()
        
        updatePalette()

        buttonWhileDowns()

        updatePainting()

        obj3dsWithOnBeforeRenders.forEach(obj3d => obj3d.onBeforeRender())

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}