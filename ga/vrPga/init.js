/*
    Can do "if" statements with with thingYouMayNotWant * (translationDist > 0 ? 1 : 0)

    Need to have mul working! So you can have parenting!
        That means: bring their arrows over

    Moving things into place
    Crocodile
        Jaw must rotate around a line that its head carries around
        Soooo it's like the head is carrying a transform around with it
        1. Make the head
        2. Make the jaw, in place
        3. Make the "open" transform, next to the jaw
        4. Make the "open with button" transform, also next to the jaw
        5. Move the head
        5. Grab the jaw. Make it the composition of the head movmeent and the "open with button" movement

    FoC demo:
        Put the eye ON the thing damn you!
        Show a creature with eyeballs that track, a bird flapping its wings, maybe a snake
        Show from your pov making one of them
        Make a puppet of maggie? “pizza’s almost here guys”
        Make the silly old Ram
            Hand controls head
            Body always in a certain plane
                Its transform is the rejection from the plane of the head's transform? Uh maybe
            Trigger button controls boolean, for mouth
            Hold it by the head
            Body follows
            Legs pump when moved, eg the instantaneous movement is known
    TODO for Lauren demo on saturday:
        Translation from point to point didn't go very well
        Just have the disk pos be extra state
        Practice!
            Load test. Make sure you can do exactly what you want to do
        Redo personal website
            put non-working ga stuff in "archive"
    Jon demo:
        Spreadsheet
            Auto-adds vizes
            Auto-adds affectations
            Visibility icons I guess
            dqTo goes into spreadsheet as 1+A~B for same grade, sqrt(sqrt(sq(A~B))) otherwise
                point-point for a translation is the most likely so it's ok that it's a bit weird
            userPow goes in as exp(L*distance(T))
        For rotoreflections/transflections, definitely need the pointy extension of your plane to the axis point
        Levels. Just 4 or so
        Gauges. Some kind of animation system for this triggered by creating mvs.
        Eyeballs on vizes
        SFX
            Grade selection is a "snap"
        Judges that rate your animations
            One changes their opinion with every level
            One always likes less code.
            One likes dynamism or something, just "seeing more stuff happen"
        Undo
    Beyond:
        Bare hands https://github.com/mrdoob/three.js/blob/master/examples/webxr_vr_handinput_cubes.html
            Thumb touching index finger is trigger; touching middle is paint
            Palm is covered in colors, touch them to set that hand to using that color
        Meshes can have fl's as their transform
        Don't want to be loading the xr input profile from the internet. "assetPath" may be a place to start
        Infinity is at 10m or whatever
        Think about what hand gestures bring about loop translations
            ACTUALLY, there is such a thing as a "nega screw". It has no logarithm or sqrt but it's a thing
            How come hand can't do anything more than 180deg arrow?
        If passthrough, maybe have a warning saying to do it in the middle of a field
        Experiment with stage from your POV (but probably keep as is because facing audience is good)
        Hidden surface removal for boxhelpers
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
        Bounding cylinders, not cuboids
            One line L, a plane P in the middle, a radius r and a height h
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
        Training wheels
            dqTo, userPow, lockedGrades, joinPt (except maybe PGA is typed so lockedGrades is fundamental...)
        Instead of
            Sqrt, grade selection, scalars/norms/normalization        

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

    initArrows()
    let transparentOpacity = .45
    initDqVizes( transparentOpacity )
    initFlVizes( transparentOpacity )

    initCamera(container)
    initSurroundings()

    let buttonDqVizes = [new DqViz(0xFFFF00, false, true), new DqViz(0xFFFF00, false, true)]
    // let timeDqViz = new DqViz(0x000000, false, true)
    function updateTimeGrabbable() {
        // let len = frameCount * .0003
        // timeDqViz.dq.translator(0., len, 0.)
        // comfortableHandPos(timeDqViz.markupPos, 1.5)
    }
    let distanceOnlyDqVizes = [
        buttonDqVizes[0], buttonDqVizes[1], 
        // timeDqViz
    ]

    initHands(buttonDqVizes)
    
    initSclptables()
    
    initSnapping(distanceOnlyDqVizes)
    initPotentialSpectatorReception()
    initStack()

    const potentialSnapDqVizes = []
    const potentialSnapFlVizes = []
    
    initMarkupPos(potentialSnapDqVizes, potentialSnapFlVizes)
    initControl(potentialSnapDqVizes, potentialSnapFlVizes)

    initSpreadsheet()
    initSpreadsheetHelpers()
    initTestSpreadsheet()

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
    // initMeasurer()

    // turnOnSpectatorMode()

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
            updateTimeGrabbable()

            movingPaintingHighlightingHandLabels()

            // updateSpreadsheetVisibilitiesAndRefresh()
            
            vizes.forEach(s => {
                if(s === null)
                    return
                updateFromAffecters(s)
            })

            //then broadcast

            updateMarkupPoses()
            updatePaletteAnimation()
        }
        
        obj3dsWithOnBeforeRenders.forEach(obj3d => obj3d.onBeforeRender())

        debugUpdates.forEach(du => du())

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}