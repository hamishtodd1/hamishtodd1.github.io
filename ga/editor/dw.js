/*
    Orthographic/almost orthographic camera is probably better. They're super small and you definitely want to see the integrals from above
    Orthogonal from top, perspective from side?
    "scale to fit vs don't" switch

    Uses
        displaying footage
        Displaying the mouse ray in a separate view as you move it... need multiple points of view then?
            Maybe only set the rotations for the other things once you've let go?
        displaying animations of the operations, not just moving around
        When a free variable is in there, display all the "later" mvs that come from that variable
        Display all mvs that are visible in the code currently scrolled to. Want more? Scroll up, copy it, paste it down here

    You can type the things, yes, but the line of symbols (/pictures) turns into a picture of the half way point for the operation
        eg
            a picture of the vector half way through being multiplied by the scalar
            or the bivector outlined by the vectors
        This is the way to specify a visualization for an arbitrary function?
            1. You have the inputs, arranged arbitrarily
            2. They move around in some way
            3. They end up in specific locations that outline/suggest the shape of the output
            3. The output is put in place (it's not col)
            4. The inputs disappear
            Details of step 2 can be computed from step 3
            Visualization needs to be unique, it's unfortunate that there are many functions that begin the same way
            In this half way picture, the output is not colored yet

        A given function may have a bunch of stuff going on in it. It can be visualized all in one coord system
        Maybe this intermediate stage should just be the inputs and outputs in same coord system
        When you make a function, you make an animation that can be played in one displayWindow

        Functions have inverses. a + b -> c, you get c. But the intermediate representation involves a,b,c as equal participants so you can visually reverse it?
        Well actually they're not equal participants, because b gets put onto the end of a (or vice versa)

    Long term TODO
        when you change what you see in the window it back solves to change the free variables above?
            The same vector may be represented in many displayWindows, but you can grab and affect it in any you like
            But which free variables?
            Grab the coord system and rotate; it gives you the quaternion that does that
            Draw a new vector
                Triggered by enabling the draw new vector mode? Then you can click anywhere?
                Maybe if the carat is on a new line
                Your way of getting velocity is eg snapping to eg v1 - v2, or rather snapping to a vector parallel to v1-v2 while v1-v2 is visualized in place
                it could be written in terms of old ones
                try to snap to the nearest one that's a single operation performed on existing ones
                    If it's a vector and it's in a plane perpendicular to an existing vector and the same length, that's a single bivector multiplication
                    I guess it's sort of appropriate in how it fosters this "the complement and reverse and whatever are always THERE, you just haven't computed them"
        copy a png or gif or whatever, paste into window, you have a textured quad, or three scalar fields or however you do it
        Copy a picture of a line graph with marked axes, it interprets that too?
        Double click something in window, to get to the place where it is made

    What determines which things go in the display window?
        Unless you have some highlighted in which case it's those?
        "What is hightlighted"?

    Representations, from abacus. Can build some from others?
		A line you can grab bits of
		A canvas you can draw on (i.e. a scalar field that starts all 0 and you can make it nonzero in places)
		Looping all the multivectors (i.e. varying over time)
		utah teapots with scalar for sizes
		orientations and positions: a bunch of utah teapots offset by the vector, oriented by the bivector
        One standing in for all. In this situation, everything coming from the same one gets the same representation

    Alright so juxtaposition f x is "apply function to x". And because your objects, curried with geometric product, are functions...
*/

function initDisplayWindows() {
    let outlineCollection = OutlineCollection()
    scene.add(outlineCollection)

    DisplayWindow = (useScreen) => {
        let dw = new THREE.Group()
        scene.add(dw)
        dw.bottomY = 0.
        displayWindows.push(dw)

        dw.scene = new THREE.Group()
        // dw.scene.scale.setScalar(.1)
        let ourGrid = Grid()
        dw.scene.add(ourGrid)

        dw.beginFrame = () => {
            dw.scene.children.forEach((c) => {
                if (c !== ourGrid)
                    dw.scene.remove(c)
            })
        }

        dw.add(dw.scene)
        
        // {
        //     //TODO your render target should still be the same.
        //     //You just render to a small part of it, with a different transformation matrix. Scissor.
        //     let filter = THREE.NearestFilter
        //     let wrap = THREE.ClampToEdgeWrapping
        //     let params = {
        //         minFilter: filter,
        //         magFilter: filter,
        //         wrapS: wrap,
        //         wrapT: wrap,
        //         format: THREE.RGBAFormat,
        //         stencilBuffer: false,
        //         depthBuffer: false,
        //         premultiplyAlpha: false,
        //         type: THREE.FloatType // THREE.HalfFloat for speed
        //     }
        //     let dimensionInPixels = 256 //TOOD updated to how big the fucker is
        //     let localFramebuffer = new THREE.WebGLRenderTarget(dimensionInPixels, dimensionInPixels, params)
        //     dw.screen = new THREE.Mesh(new THREE.PlaneGeometry(1., 1.), new THREE.MeshBasicMaterial({ map: localFramebuffer.texture }))
        //     dw.add(dw.screen)
        //     let displayCamera = new THREE.PerspectiveCamera(70., 1., .01)
        //     let ordinaryClearColor = renderer.getClearColor().clone()
        //     let ordinaryRenderTarget = renderer.getRenderTarget()
        //     dw.screen.draw = () =>
        //     {
        //         displayCamera.quaternion.copy(displayRotation.q)
        //         displayCamera.quaternion.inverse()
        //         v1.set(0., 0., -displayDistance).applyQuaternion(displayCamera.quaternion).add(displayCamera.position)
        //         displayCamera.position.sub(v1)
        //         displayCamera.position.setLength(displayDistance)

        //         renderer.setRenderTarget(localFramebuffer)
        //         renderer.setClearColor(0x000000)
        //         renderer.clear()
        //         renderer.render(dw.scene, displayCamera) //yay this works, apparently there's no difference between scene and group?

        //         renderer.setRenderTarget(ordinaryRenderTarget)
        //         renderer.setClearColor(ordinaryClearColor)
        //     }
        // }

        updateFunctions.push(() => {
            dw.position.y = dw.scale.y / 2. + dw.bottomY
            outlineCollection.draw(dw.position.x, dw.position.y, dw.scale.x)

            if(useScreen)
                dw.screen.draw()
        })

        return dw
    }

    
    // DisplayWindow = function()
    // {
    //     let localScene = new THREE.Scene()
    //     localScene.add(Grid())

    //     let dw = new THREE.Group()
    //     scene.add(dw)
    //     dw.bottomY = 0.
    //     dw.scene = localScene
    //     displayWindows.push(dw)

        

        
        
    //     updateFunctions.push(() =>
    //     {
            

    //         dw.position.y = dw.scale.y / 2. + dw.bottomY
    //         //and scale.y could be various things
    //         //and change resolution, and think about camera bullshit

    //         outlineCollection.draw(dw.position.x,dw.position.y,dw.scale.x)

    //         if(dw.screen)
    //             dw.screen.draw()
    //     })

    //     return dw
    // }

    {
        let gridDivisions = 10
        let gridRadius = 1.
        let gridGeometryCoords = [0., gridRadius, 0., 0., -gridRadius, 0.]
        let gridHelperCoords = new THREE.GridHelper(gridRadius*2., gridDivisions).geometry.attributes.position.array
        gridHelperCoords.forEach((coord) => { gridGeometryCoords.push(coord) })
        let gridGeometry = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(gridGeometryCoords), 3))
        let gridMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF })
        Grid = () => {
            let g = new THREE.LineSegments(gridGeometry, gridMaterial)
            updateFunctions.push(()=>{
                g.quaternion.copy(displayRotation.q)
            })
            return g
        }
    }

    document.addEventListener('wheel', (event)=>
    {
        event.preventDefault()

        if( event.ctrlKey) //handled by window resize
            return
        else
        {
            let dw = mouse.displayWindowMouseIsOn()
            if (dw === null)
                pad.position.y += event.deltaY * .008
            else {
                let inflationFactor = 1.2
                let multiple = event.deltaY < 0 ? inflationFactor : 1. / inflationFactor
                dw.scene.scale.multiplyScalar(multiple)
            }
        }
    }, false);

    updateFunctions.push(() =>
    {
        if (mouse.rightClicking)
        {
            // Much better than built in rotation is rotating the basis vectors.x or y rotate around y, y rotate upwards or downwards

            v1.copy(mouse.raycaster.ray.direction)
            v1.y = 0.
            v2.copy(mouse.oldRaycaster.ray.direction)
            v2.y = 0.
            let horizontalDelta = v1.angleTo(v2) * (v1.x < v2.x ? -1. : 1.)

            v1.copy(mouse.raycaster.ray.direction)
            v1.x = 0.
            v2.copy(mouse.oldRaycaster.ray.direction)
            v2.x = 0.
            let verticalDelta = v1.angleTo(v2) * (v1.y > v2.y ? -1. : 1.)

            displayRotation.y += horizontalDelta * 20.
            displayRotation.x += verticalDelta * 20.
            displayRotation.x = clamp(displayRotation.x, -TAU / 4., TAU / 4.)
        }
        else
        {
            let closestIntegerMultipleX = Math.round(displayRotation.x / (TAU / 4.)) * TAU / 4
            let closestIntegerMultipleY = Math.round(displayRotation.y / (TAU / 4.)) * TAU / 4
            if (Math.abs(closestIntegerMultipleX - displayRotation.x) < .3 &&
                Math.abs(closestIntegerMultipleY - displayRotation.y) < .3)
            {
                displayRotation.x += getStepTowardDestination(displayRotation.x, closestIntegerMultipleX)
                displayRotation.y += getStepTowardDestination(displayRotation.y, closestIntegerMultipleY)
            }
        }

        displayRotation.q.setFromEuler(displayRotation)
    })
}