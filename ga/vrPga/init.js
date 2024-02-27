/*
    A relatively different approach is: one hand grabs a dq, other hand modifies
        Grab sclptable and other hand adds stuff to it
        Grab dq and you're holding the markupPos; other hand modifies what it does
        Gotta be experimenting!

    If you put too many training wheels on things
        (eg normalizing, taking logs, grade selecting)
        then what's the point of emphasizing understanding PGA?

    No it's not that bad. There's what snaps you offer, and there's what you can put in the spreadsheet

    TODO for FoC demo:
        Just tried lockedGrade, see what that's like
        markupPosAttractor
        Round screws to the nearest rotation or translation
        Some bug where loooooads of stuff just gets made. It happened after making a few models
        Just an eye that rotates in place
            Join eye position with initial eyeFocusPoint (at infinity), get line
            Join eye position with focusPoint, get line
            Do dqTo
        // Make a head with a rotating eye
        //     Make an eye somewhere in space, and a head somwhere else. headDq, eyeDq, unmovedEyeToUnmovedEyeSocketDq
        //     Make a line from where the eye socket
        //     eyeDq = headDq * headToEyeSocketDq * ()
        // Make the silly old Ram
        //     Trigger button controls boolean, for mouth
        //     Hold it by the head
        //     Body follows
        //     Legs pump when moved, eg the instantaneous movement is known
        Paint eraser "color"
    Jon demo:
        arrow starts move slowly to correct position instead of teleporting
        Levels. Just 4 or so
        Gauges. Some kind of animation system for this triggered by creating mvs.
        Spreadsheets
        Infinity is at 10m or whatever
        Eyeballs on vizes
        SFX
            Grade selection is a "snap"
        Judges that rate your animations
            One changes their opinion with every level
            One always likes less code.
            One likes dynamism or something, just "seeing more stuff happen"
        Undo
    Beyond:
        ACTUALLY, there is such a thing as a "nega screw". It has no logarithm or sqrt but it's a thing
        How come hand can't do anything more than 180deg arrow?
        Are you using the measurer for anything? If so, some numbers...
        If passthrough, maybe have a warning saying to do it in the middle of a field
        Experiment with stage from your POV (but probably keep as is because facing audience is good)
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
    MR lectures
        For sure spreadsheet. Can just have a single column, so variable names are A, B, C, etc
        Probably make them pretty small, and pretty close to the camera

    Crazy zolly idea
        You have an orthographic camera for the spectators
        And things get transformed with some zolly on the snappeteer's side
        So that you can have things appear very far away in a small space
        
    Philosophy
        If you have arrows you can put end-to-end, do you need gauges?
        IRL, you can ONLY change things by moving something
            Well, sort of. There's switches, and speaking. Both technically are movement. But, movement is irrelevant

    Code for "nega screw"
    let transform = new Dq()
    let initialPos = new Fl().point(0., 0., -0.5, 1.)
    camera.position.z += 1.
    debugUpdates.push(()=>{
        let factor = frameCount * .004
        let transBiv = oneDq.multiplyScalar(-1.,dq4).addScaled( e02, -factor, transform )
        let rotBiv = e13.multiplyScalar(frameCount*.0033, dq5).exp(dq6)
        transBiv.mul(rotBiv,transform)
        // dq1.mul(e13, transform)
        // biv.zero()
        transform.sandwich( initialPos, fl0 ).pointToGibbsVec(debugSphere.position)

        camera.position.z = 1.2
    })
 */

async function init() {

    let container = document.createElement('div')
    document.body.appendChild(container)

    initDqMeshes()
    
    let transparentOpacity = .65
    initArrows()
    initDqVizes(transparentOpacity)
    initFlVizes(transparentOpacity)

    initCamera(container)
    initSurroundings()

    initHands()
    initButtons()
    
    initSclptables()
    
    initSnapping()
    initPotentialSpectatorReception()
    initControl()

    // initCircuits()

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
    renderer.xr.enabled = true //regardless of whether you're connected or not
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
            updatePaletteAnimation()
            
            snappables.forEach(s => {
                updateFromAffecters(s)
            })

            updateRecording()
            //then broadcast
        }
        
        obj3dsWithOnBeforeRenders.forEach(obj3d => obj3d.onBeforeRender())

        debugUpdates.forEach(du => du())

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}