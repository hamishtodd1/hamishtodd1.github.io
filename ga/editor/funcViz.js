/*
    So the claim is
        these are the function visualizations. They get colors just like the mvs
        Ok, so they're only one variable to one variable. But you can check

    Deciding which to use
        You could put in an mv, look at the output, see if anything has changed
        drop down menus

    What if you want more than one argument?

    Huh. Who says the functions, these visualizations, aren't things you're trying to "output"? Make a game of them
        Spheres, lines, points, what more do you want?
        
    There's visualizing the domain with where the things go to, and there's visualizing the range with where things came from
        Probably leave it to people to invert functions themselves
    
    Can you unify them?
    It should probably be the case that taking a hyperslice of a thing gets you a slice of that thing
    Maybe wanna treat it differently if it closes up?
    Going between these things fast may be very beneficial, it's what mathematicians do constantly
    tweening's not so hard. You have the space of inputs and outputs. You put them in the same space, linearly interpolate, make t a sinusoid
    Can you detect which viz to use at runtime? I mean, any transformation can be applied to any mv. Maybe it's a good thing to let folks choose?

    These are "the set of points obeying a constraint"
        R->R     line graph, filled underneath - greyscale line if looked at from above
                    The thing it's filled with is bivectors, anything to be done with that?

        R2->R
            1 surface (with volumetric stuff beneat, sounds like fun!)
            contour lines. To draw these, check the values at the corners of the pixel. If they're not all the same, pixel is filled
        R2,C->R2,C
            set of 2 surfaces - 2 color image if looked at from above
            vector field(points moving around/arrows)?
            Tokieda weirdness?
            Phase portrait, so just color
            height and color from hue circle
            Distorted square grid (collection of contour lines)
        C,R2->R3  set of 3 surfaces - 3 color image if looked at from above, or parametric surface??
                  colored parametric surface

        R->H            line of utah teapots
        R2->H           2D array of utah teapot
        R3->H           3D array of utah teapot

        R->dual quat    curve of utah teapots with color to indicate domain

        R3->R
            volume, white gas
            isosurface at 0
            isosurface at controllable level. Between, if you slice it, MRI-style texturing
        R3->C,R2
            pair of isosurfaces
            volumetric: hue and brightness
            colored isosurface. You choose a certain complex number magnitude and it uses hue circle
            3D grid squashed onto plane. We look at that all the time.
        R3->R3
            volumetric
            vector field
            3 color isosurface
            distorted cubic grid (collection of isosurfaces)

        R3->3x3 matrices
            diffusive tensor only has 6 elements. How does it compare with electromagnetic field?
            there's literature

        Is it possible to view these as all the same?
        Countour is "just" slices of volumetric

        Abstracting over any higher dimensional values, you have to make do with slices, i.e. rotate the thing yourself
*/

function initFuncViz()
{
    //can't do this coordinate-free shit for a graph really, you need an origin
    let curveMaterial = new THREE.LineBasicMaterial({ color: 0xFF0000 })
    let surfaceMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000, side:THREE.DoubleSide })
    function FuncViz(func,inputDimension,outputDimension) {
        let viz = new THREE.Group()
        // viz.add(Grid())

        let numSamples = 256
        let range = [-Math.PI, Math.PI] //ideally -infinity,infinity
        /*
            Could check if f(-pi) = f(pi) and if so use that domain, otherwise something else

            Need to specify function domains for eg R->R2. [0,1]?
            don't want to choose an arbitrary cutoff, want [-infinity, infinity]
            It's about zooming, determining a zoom level
            This has probably been studied by others
            A function can take any damn thing and operate on it, so how to choose which for visualize a given function?
                We know how to do it for the drawing input things
            For a given f:R2->R3, can we calculate the function describing the pixel colors of the framebuffer containing that curve? Call it f':R2->R
                Note that f:R->R3 can be done as well, it's just a tube
                To make it easier let's say it's black and white and colored by depth
                Well it's hard enough to get an intersection/depth function from an implicit surface, let alone parametric
                Assume orthographic camera, if it helps we are only looking for intersections down the z axis between [-1,1]
                Example: cylinder
                    paratmetric: f(t) = cos(t),sin(t)
                    intersection:f(y) = abs(y)>1 ? infinity : sqrt(1-y*y) - rasterization
        */

        if(inputDimension === 1 && outputDimension === 1) {
            let curve = new THREE.Line(new THREE.Geometry(), curveMaterial)
            for (let i = 0; i <= numSamples; i++) {
                let p = new THREE.Vector3()
                p.x = (i / numSamples) * (range[1] - range[0]) + range[0]
                p.y = func(p.x)
                curve.geometry.vertices.push(p)
            }
            viz.add(curve)
        }

        if (inputDimension === 1 && outputDimension === 2) {
            let curve = new THREE.Line(new THREE.Geometry(), curveMaterial)
            for (let i = 0; i <= numSamples; i++) {
                let p = new THREE.Vector3()
                p.z = (i / numSamples) * (range[1] - range[0]) + range[0]
                func(p.z,p)
                curve.geometry.vertices.push(p)
            }
            viz.add(curve)
        }

        if (inputDimension === 1 && outputDimension === 3)
        {
            let curve = new THREE.Line(new THREE.Geometry(), curveMaterial)
            for (let i = 0; i <= numSamples; i++)
            {
                let p = new THREE.Vector3()
                let t = (i / numSamples) * (range[1] - range[0]) + range[0]
                func(t, p)
                curve.geometry.vertices.push(p)
            }
            viz.add(curve)
        }

        if (inputDimension === 2 && outputDimension === 3)
        {
            let surface = new THREE.Mesh(new THREE.PlaneGeometry(1.,1.,numSamples-1,numSamples-1), surfaceMaterial)

            for (let i = 0, il = numSamples * numSamples; i < il; ++i) {
                let x =             (i % numSamples) / (numSamples - 1)
                let y = (Math.floor(i / numSamples)) / (numSamples - 1)
                x = x * (range[1] - range[0]) + range[0]
                y = y * (range[1] - range[0]) + range[0]
                func(x,y, surface.geometry.vertices[i])
            }
            viz.add(surface)
        }

        updateFunctions.push(() => { 
            viz.rotation.y += .05
            // viz.rotation.x += .05
        })

        return viz
    }
    let sqFunction = (x) => x * x //shader mofo. Transpile to glsl
    let graph = FuncViz(sqFunction,1,1)
    scene.add(graph)

    let helixFunction = (t, target) => {
        let numTwists = 2.
        target.x = Math.cos(t*numTwists)
        target.y = Math.sin(t*numTwists)
    }
    scene.add(FuncViz(helixFunction, 1, 2))

    let torusKnotFunc = (t, target) => {
        let minorAngle = t * 2.
        let majorAngle = t * 3.

        let majorRadius = 1.
        let minorRadius = .6
        target.x = Math.cos(minorAngle) * (majorRadius + minorRadius * Math.cos(majorAngle))
        target.y = Math.sin(minorAngle) * (majorRadius + minorRadius * Math.cos(majorAngle))
        target.z = minorRadius * Math.sin(majorAngle)
    }
    scene.add(FuncViz(torusKnotFunc, 1, 3))

    function torusFunc(minorAngle,majorAngle,target) {
        let majorRadius = 1.
        let minorRadius = .2
        target.x = Math.cos(minorAngle) * (majorRadius + minorRadius * Math.cos(majorAngle))
        target.y = Math.sin(minorAngle) * (majorRadius + minorRadius * Math.cos(majorAngle))
        target.z = minorRadius * Math.sin(majorAngle)
    }
    function sphereFunc(longtitude,latitudeTimes2,target){
        let latitude = latitudeTimes2 / 2.
        target.y = Math.sin(latitude)
        target.x = Math.cos(latitude) * Math.sin(longtitude)
        target.z = Math.cos(latitude) * Math.cos(longtitude)
    }
    scene.add(FuncViz(torusFunc, 2, 3))
}