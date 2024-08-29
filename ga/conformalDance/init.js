/*
    Problems:
        When you look at the hyperboloid diagonally, it goes weird
        When your basis is light like, it goes weird
            Possibly solved by not bothering with
        No points or curves right now
            Points is in principle easy to solve, just stick a sphere at that point
            Curves is still possible. Project the origin onto the curve, get transform taking you up and down it, use that
            Both of these suffer from the problem that they will be occluded by the hyperboloids

    Should say:
        what the current versor is
        whether it is hyperbolic/elliptic/euclidean/parabolic
        What the current basis is

    Pre-program the versors for the music
    In one hand: the thing. It gets transformed using your hand transform, no biggie
    In other hand: Spray can. Colours change on a loop. Old points get removed, new points get added


    Need a cow or w/e shown having undergone that transformation


    A wall covered in hyperboloids. Nice thing is you can see the places where ones that don't meet meet


    A more modest thing:

    A modest and realistic thing for Hiley is:
        You can pick up planes, spheres etc and move them around
        You have a teapot and can select the transform it is subject to

    Visualiz

    Is it possible to have a rule against having to get coords of things that are "barely in the space"?


    Quantum:
        CHSH
        Delayed choice quantum eraser
        Stern gerlach

    Minkowski space as a way of presenting trees
        What to put in test tree?
            Addition, mul, division, subtraction
            You type a mathematical expression, it parses it into an AST
*/

function blankFunction(){}

async function init() {

    initDqMeshes()

    initCamera()
    initSurroundings()

    await initHands()
    initButtons()

    init41()
    
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
    renderer.localClippingEnabled = true;
    container.appendChild(renderer.domElement)

    // document.body.appendChild(VRButton.createButton(renderer))

    initTransform()

    camera.position.multiplyScalar(.9)
    function render() {
        
        let clockDelta = clock.getDelta()
        frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness
        ++frameCount
        
        updateCameraMvs()
        updateHandMvs()
        buttonWhileDowns()

        // camera.position.set(0.,1.,0.)
        // camera.position.applyAxisAngle(yUnit, -.004)
        camera.lookAt(0., 0., 0.)
        
        // {
        //     even0.translationFromVec3(camera.position).sandwich(_eo, odd0)
        //     for (let i = 0; i < 5; ++i)
        //         grade1Mat.floats[i] = odd0[i]
        // }

        update()
        
        debugUpdates.forEach(func=>func())

        obj3dsWithOnBeforeRenders.forEach( obj3d => obj3d.onBeforeRender() )

        renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(render)
}