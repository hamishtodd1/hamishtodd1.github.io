/*
    Grade selection is a "snap" sound

    TODO for November:
        Numbers on measurer
        "Parenting" somehow
        Some way for a sclptable to be affected by the buttons you are pressing
        Audience view
            no markup visible
            MAYBE pupeteer view should be the same angle, maybe not, make it optional for now

    Little lizard creatures that rate your animations, with different preferences
        Make an animation with the smallest number of bones, so it's doing a complex thing

    IF you were to do the inertia tensor
        First thing would be, for the sclptables, getting the inertia tensor
        And having you move a line L around, and showing you the I[L]

    https://english.lem.pl/works/novels/the-cyberiad/146-how-the-world-was-saved
    
    One idea for visibility
        Your most-recently-created things are visible
        There's max 7 of them at a time
        Make a new thing visible (eg create a thing or grab a thing) and that thing becomes visible
        But something else is now invisible
        You can "scroll back", making your new thing invisible and the thing that just disappeared visible
        Put this on futureofcoding slack
    
    One idea for how control is going to look, generally:
        Say there are two points A and B added to get C
        There'll be directed wires coming down from A and B, from player's POV, which go into an add symbol, and an arrow coming from there into C
        In spreadsheet mode that's two cells and a third cell A+B
        So really they can be thought of on a sphere surrounding you
        Meshes/mesh pieces are a little palette you hold in your hand
        rendering:
            Y shape is bum-like. Two arcs coming together into a directed CGA point
            wires don't change thickness and always have chevrons going down them from your pov
            Rendered on top of everything
            Given three points and a directed Y shape, probably easy to find a natural way to put that on a sphere
            Circular arcs, ideally all the same length and not overlapping
        But is this a good idea?
            Spreadsheets and indeed lines of code let you do multiple things in one line. Maybe that's bad
            It does give you an idea of WHEN this will happen, which is nice
            Spaghetti should be avoided by only seeing a few of these at a time
                even if you've got everything visible, that doesn't mean you have to have their wires visible
                Remember you are doing more basic things than many computer programs

        
    sculpting, - rigging must happen automatically (so sculptVR approach doesn't work great)
        Press buttons with your controller, it's making a triangle
        Starts out as a sphere. You're 
        Would it be possible to add bones and shape at the same time? Like, if you know the bones you know the shape?
            Maybe yes because you can scale bones. So all bones are spheres maybe?
            You can give them colors too, which it interpolates
        Remember, the animation/mvmt is more important than the coloring
        Hmm sounds like sdfs. Buuuut, you probably want texturing.
        When making the thing, it's attached to one arm and you sculpt with the other surely
            Use analogue stick to move your grip point on it around
        EXTREMELY SIMPLE DUDE, THIS IS FOR KIDS. As simple as a crayon!
        Separate shapes = automatically separate bones?
        An idea
            Point at a bone and press the button
            It makes a new bone where your hand is, which you can move and resize until you let go of the button
            Where to put the vertices? Let alone uvs?
                Since it's a sphere, call it a geodesic sphere...
                Each bone pair has their spherical caps, and a tube between them
                When a new bone is made, you can cut off exactly a hemisphere of the parent
                If there's another bone already there, whatever, nothing to remove
                If you have two bones coming out of one, then yes, you have some hard intersections, but that's your problem
            But what if you want a surface, like a wing or a cape? A separate tool: a single conformal triangle going between 3 bones
            Sounds remarkably like the cap that you need anyway. So, caps and tubes

        So the tubes start and end with circles defined at bones. Circles can be straight lines...
        Quads, covered with rivets. Can pin corners to lines, to circles
        Tube is a special case of quad
        Bones define centers, arc segmenets start from a rivet a certain distance from it
        In general, when you hold a sphere, you're holding it at its surface
        Perhaps it's ok for kids so long as it is POSSIBLE for it to be used in a crayonesque way
        Extended idea:
            Bones are still a thing
                they are hovering spheres
                They have a scale/radius
                Anything attached to them has their radius as the attachment points
            Point at a bone, press a button
                you've made a new bone connected to that bone. Holding it by its surface ofc
                You've also made a tube. The tube has a seam at the top leading to your hand
                The tube has two ends: one is a circle around the bone, one is a circle like a hoop you're carrying
                You can scale the new bone you're making, of course
                But you can also double tap the button, which will
                    Leave your new bone in place, but now
                    you're unwrapping the quad from being a tube to now having 

    TODO for August 2024:
        Make it more kid-friendly / More able to do stuff without the spreadsheet
            Snapping
            "Trash" button on the right of each cell
            You can hover in between cells and it offers you new ones to make (no permanent tabs)
            Buttons at the bottom to make new objects
                point, pp, circle, sphere, mesh, transform
            A mode where the things in the spreadsheets just are those icons
            Though yes you still need arrows showing what's affected by what
        A way to select a puppet to control
            Something like: you put your hand's spreadsheet next to its, and that copies stuff to it
            That said, you probably want an idling animation
            Probably one hand = one puppet. But maybe want to control multiple sometimes in lockstep
            Your own hands' spreadsheets are always hovering where your hands are
            Fun to experiment with! For the time being, just two puppets
        Roblox addon for importing the animal you made
        Don't market it. This is the start, a way to get investment for further things
        

    Non-spreasheet TODO
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

    Interfaces the user should be able to make:
        Timeline
            With parameters on it that you can vary
            Maybe it behaves like a texture?
        Cubic bezier. For points p0, p1, p2, p3
            pA = p0*t+p1*(1-t)     pB = p1*t+p2*(1-t)     pC = p2*t+p3*(1-t)
            pi = pA*t+pB*(1-t)     pj = pB*t+pC*(1-t)
            pf = pi*t+pj*(1-t)

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
        viz2.arrowStart.point(-.4, .9, 0.)
    }

    function render() {
        let clockDelta = clock.getDelta()
        frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness
        ++frameCount

        updateCameraMvs()
        updateHandMvs()

        blankFunction()
        
        updatePalette()

        buttonWhileDowns()

        updatePainting()

        obj3dsWithOnBeforeRenders.forEach(obj3d => obj3d.onBeforeRender())

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}