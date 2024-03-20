/*

    How scalars work
        Any rotation, translation (and maybe roto/transflection) has a distance and angle implicitly
        The scalar doesn't have to be an extra object, it's just inferred from those
        There are braces/compasses which appear in place indicating that it's involved
        Alright, so what are scalars used for?
            You take powers with them.
            You have == < > != >= <= which then go into if statements
                Another way of saying it is "sign"
                == and !== are unlikely because everything is continuous
                Can maybe do all with (translationDist > 0 ? 1 : 0)*:

    Control which ones are visibl, which ones are fodder for snapping
        Could have it be that only the last 3 you made are visible, like a stack
            Delete something and one of the ones last seen comes back
            To bring back one of the old ones, "make" it with your hands and it'll snap to BEING that one
                And maybe its affecters appear too?
                Or you can press a button to show everything?
                    Or a button to show "the next layer", eg things that affect what you can currently see?
            But yeah basically when it's out of sight it could be gone for good
        Spreadsheet would work but it's the nuclear option. 7 year old, very unlikely
    Give some markup influence from dqTo

    If you put too many training wheels on things
        (eg normalizing, taking logs, grade selecting)
        then what's the point of emphasizing understanding PGA?
        Letting people do more in the spreadsheet

    TODO for FoC demo:
        Spreadsheet
        Redo personal website and vtbotb
        Just an eye that rotates in place
            Join eye position with initial eyeFocusPoint (at infinity), get line
            Join eye position with focusPoint, get line
            Do dqTo
            Then parenting...
        Some bug where loooooads of stuff just gets made. It happened after making a few models
        Make the silly old Ram
            Hand controls head
            Body always in a certain plane
                Its transform is the rejection from the plane of the head's transform? Uh maybe
            Trigger button controls boolean, for mouth
            Hold it by the head
            Body follows
            Legs pump when moved, eg the instantaneous movement is known
        Paint eraser "color"
        Meshes can have fl's as their transform
    Jon demo:
        For rotoreflections/transflections, definitely need the pointy extension of your plane to the axis point
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
        Don't want to be loading the xr input profile from the internet. "assetPath" may be a place to start
        Bounding cylinders, not cuboids
            One line L, a plane P in the middle, a radius r and a height h
        Think about what hand gestures bring about loop translations
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

    let transparentOpacity = .45
    initArrows()
    initDqVizes(transparentOpacity)
    initFlVizes(transparentOpacity)

    initCamera(container)
    initSurroundings()

    initHands()
    
    initSclptables()
    
    initSnapping()
    initPotentialSpectatorReception()
    initStack()
    initMarkupPos()
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

            movingPaintingHighlightingHandLabels()
            updatePaletteAnimation()
            
            snappables.forEach(s => {
                if(s === null)
                    return
                updateFromAffecters(s)
            })

            //then broadcast

            updateMarkupPoses()
        }
        
        obj3dsWithOnBeforeRenders.forEach(obj3d => obj3d.onBeforeRender())

        debugUpdates.forEach(du => du())

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}