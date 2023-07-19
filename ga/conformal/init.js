/*
    Something for PAF, 5th Aug
        Just the spheres and tubes maybe?

    TODO for October 2021:
        Cubes m8!
        Record a general series of movements for playback on a certain bone
            It creates a new spreadsheet with the movements in it
            And a line at the end that's like... N1 + time*N2 or whatever
        Audience view
            Separate spectator view
            Or maybe pupeteer view should be the same?
            But pupeteer has lots of markup, can't just rebroadcast
        Analogue button
            Eye direction
            Mouth opening
            Eyebrows furrowing
        
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
        

    Have a "hand" spreadsheet
        Always updated
        dq (and separate position+rotation?)
        digital1
        digital2
        analogue

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
 */

function blankFunction(){}

async function init() {

    initEga()
    
    initCamera()
    initSurroundings()

    await initCgaVizes()
    initRotorVizes()

    initMouse()
    initButtons()

    initDrawing()

    // initRigging()

    initMeshes()
    initCompilation()
    initSpreadsheet()

    let initial = [
        [
            `ep`,
            `2e12`,
            //want something that affects itself Or two affecting each other
            `-0.5e123m + 0.5e123p`,
            `e1 - e0`,
            `ep - em + time * e0`,
            `e23 - e03`,
            `(1+time*e01) > e1`,
            `e123`,
            `e0`, `ep`, `e2`, `e23`
        ],
        [
            `exp( time * (e12 + e01) )`,
            `B1 > hand`,
            `e23 - time * e13`,
            `hand & e123`,
            `B3 + B4`,
            `hand`,
        ]
    ]
    initSpreadsheetNavigation(initial)

    // controllers
    {
        let controller1 = renderer.xr.getController(0)
        // controller1.addEventListener('selectstart', onSelectStart)
        // controller1.addEventListener('selectend', onSelectEnd)
        scene.add(controller1)

        let controller2 = renderer.xr.getController(1)
        // controller2.addEventListener('selectstart', onSelectStart)
        // controller2.addEventListener('selectend', onSelectEnd)
        scene.add(controller2)

        const laserGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -5)])
        const laser = new THREE.Line(laserGeo)
        controller1.add(laser.clone())
        controller2.add(laser.clone())
    }

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

    function render() {
        let clockDelta = clock.getDelta()
        frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness
        ++frameCount

        updateCameraMvs()

        updateHandSpreadsheet()
        blankFunction()
        buttonWhileDowns()
        refreshActiveCells()
        handleDrawing()
        updateRigging()
        obj3dsWithOnBeforeRenders.forEach(obj3d => obj3d.onBeforeRender())

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}