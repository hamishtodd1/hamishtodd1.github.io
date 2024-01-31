/*
    A relatively different approach is: one hand grabs a dq, other hand modifies
        Grab sclptable and other hand adds stuff to it
        Grab dq and you're holding the markupPos; other hand modifies what it does
        Gotta be experimenting!

    TODO for "show" demo:
        Can paint and grab with both hands independently
        Stage probably is from your point of view
        Make a properly rigged puppet! A tentacle or something
            Bind pose inverses may be a problem :(((
        More operations, and snapping should be accurate (snap button?)
        Circuits better
        Eraser of paint
    Jon demo:
        Deletion
        Levels
        Undo
        Eyeballs on vizes
        Wanna have gauging animations
        Grade selection is a "snap" sound
        Little lizard creatures that rate your animations, with different preferences
            Make an animation with the smallest number of bones, so it's doing a complex thing
        Some levels!!!!!!
        Are you using the measurer for anything? If so, some numbers...
    Beyond:
        Hidden surface removal for boxhelpers
        Flesh colors
        Maybe want a way for a sclptable to be affected by other buttons during the show?
            Have a button that does multiplcation by 0 or 1. And maybe a point that's always present which goes up and down when you do that
        Get rid of "current hand position"; it stinks of the origin
        Arrows should settle to being cut by the axes from your pov?
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
        One idea for visibility
            Your most-recently-created things are visible
            There's max 7 of them at a time
            Make a new thing visible (eg create a thing or grab a thing) and that thing becomes visible
            But something else is now invisible 
            You can "scroll back", making your new thing invisible and the thing that just disappeared visible
            Put this on futureofcoding slack

    Crazy zolly idea
        You have an orthographic camera for the spectators
        And things get transformed with some zolly on the snappeteer's side
        So that you can have things appear very far away in a small space
        
    Philosophy
        If you have arrows you can put end-to-end, do you need gauges?
        IRL, you can ONLY change things by moving something
            Well, sort of. There's switches, and speaking. Both technically are movement. But, movement is irrelevant
 */

async function init() {

    let container = document.createElement('div')
    document.body.appendChild(container)

    initDqMeshes()
    init31()

    initDqVizes()
    initFlVizes()

    initCamera(container)
    initSurroundings()

    initHands()
    initButtons()
    
    initSclptables()
    
    initSnapping()
    initPotentialSpectatorReception()
    initControl()

    initCircuits()

    // initRecording()

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

    initVrButton()

    function render() {
        let clockDelta = clock.getDelta()
        frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness
        ++frameCount

        if (spectatorMode) {
            handleDqMsgs()
        }
        else {

            updateCameraMvs()
            updateHandMvs()
            buttonWhileDowns()

            movingPaintingHighlightingHandLabels()
            updatePalette()
            
            snappables.forEach(s => {
                s.updateFromAffecters()
            })

            updateHighlighting()
            updateRecording()
            //then broadcast

        }
        
        obj3dsWithOnBeforeRenders.forEach(obj3d => obj3d.onBeforeRender())

        debugUpdates.forEach(du => du())

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}