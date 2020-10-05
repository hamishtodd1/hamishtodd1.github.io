/*
    Bit useless to visualize these things if you can't trace along and see the result, all ends up like the horn
    If you do do that, it's a hyperbolic paraboloid for multiplication

    Test case: earth
        you have the mapping I2->R3:
            cos(x)sin(y)
            sin(x)sin(y)
            cos(y)
        The texture is a mapping I2->I3
        Together they map (x,y) to (x,y,z,r,g,b), a "colored point"
        Ehhh... not rgb but hsv. h is so nice for phase
        Maybe your colors come from that RP2 thing you thought of?
        Or colors are directions in R3?
        Well, they're points in the positive octant of R3, aka I3
        Funny how you can map points to the I3 clip space or the I3 color space. What does a photo look like if color space is ordinary space?
        
    List
        GA is just a good way to visualize linear functions

        The shapes we think of most easily: R2 -> R3 x R3
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
        R3->C orR2
            pair of isosurfaces
            volumetric: hue and brightness
            colored isosurface. You choose a certain complex number magnitude and it uses hue circle
            3D grid squashed onto plane. We look at that all the time.
        R3->R3
            volumetric
            vector field
            3 color isosurface. Ehhhh... need darkness for shading
            distorted cubic grid (collection of isosurfaces)

        R3->3x3 matrices
            diffusive tensor only has 6 elements. How does it compare with electromagnetic field?
            there's literature
        R2->R3 x R3
            Rasterization and texture mappiiiiiing

    //background is white and there are bright white lights on it all, so opacity brings it towards white. Blackness is for lighting
*/

function initFuncViz()
{
    //it's a mapping from I2->I3
    document.addEventListener('paste', (e) => {
        if (!e.clipboardData || !e.clipboardData.items)
            return
        let items = e.clipboardData.items
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") === -1)
                continue
            e.preventDefault();
            
            const pastedImage = new Image();
            const url = window.URL || window.webkitURL;
            pastedImage.src = url.createObjectURL(items[i].getAsFile());

            pastedImage.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = pastedImage.width;
                canvas.height = pastedImage.height;
                const ctx = canvas.getContext('2d')
                ctx.drawImage(pastedImage, 0, 0)

                const pastedTextureMesh = new THREE.Mesh(unchangingUnitSquareGeometry,new THREE.MeshBasicMaterial({
                    map: new THREE.CanvasTexture(canvas)
                }))
                pastedTextureMesh.scale.x = pastedImage.width / pastedImage.height
                scene.add(pastedTextureMesh)
            }

            return;
        }

        log("if you think you have an image in there it may be the wrong kind")
    }, false);

    //can't do this coordinate-free shit for a graph really, you need an origin?
    let funcColor = 0x222222
    let curveMaterial = new THREE.LineBasicMaterial({ color: funcColor })
    let surfaceMaterial = new THREE.MeshPhongMaterial({ color: funcColor, side:THREE.DoubleSide })
    curveMaterial.im = curveMaterial.clone()
    surfaceMaterial.im = surfaceMaterial.clone()

    let maxInstances = 256
    let numSamples = 256
    let range = [0., 1.] //ideally -infinity,infinity
    function numberInRange(i) {
        return (i / numSamples) * (range[1] - range[0]) + range[0]
    }

    FuncViz = (func,inputDimension,outputDimension) => {
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

        let geo = null
        let mat = null

        if (inputDimension === 1) {
            geo = new THREE.Geometry()
            mat = curveMaterial
            
            for (let i = 0; i <= numSamples; ++i)
                geo.vertices.push(new THREE.Vector3())

            if( outputDimension === 1) {
                geo.vertices.forEach( (p,i)=> {
                    p.x = numberInRange(i)
                    p.y = func(p.x)
                })
            }
            else if( outputDimension === 2) {
                geo.vertices.forEach( (p,i)=> {
                    p.z = numberInRange(i)
                    func(p.z,p)
                })
            }
            else if( outputDimension === 3) {
                geo.vertices.forEach( (p,i)=> {
                    let t = numberInRange(i)
                    func(t, p)
                })
            }
        }
        else if (inputDimension === 2 && outputDimension === 2) {
            
        }
        else if (inputDimension === 2 && outputDimension === 3) {
            geo = new THREE.PlaneGeometry(1., 1., numSamples - 1, numSamples - 1)
            mat = surfaceMaterial
            
            for (let i = 0, il = numSamples * numSamples; i < il; ++i)
            {
                let x = (i % numSamples) / (numSamples - 1)
                let y = (Math.floor(i / numSamples)) / (numSamples - 1)
                x = x * (range[1] - range[0]) + range[0]
                y = y * (range[1] - range[0]) + range[0]
                func(x, y, geo.vertices[i])
            }

            geo.computeFaceNormals()
            geo.computeVertexNormals()
        }
        else {
            log("unvisualizable function dimensionalities")
            return null
        }

        let im = new THREE.InstancedMesh(geo, mat.im, maxInstances)
        pad.add(im)
        let viz = {}
        viz.dw = new THREE.Mesh(geo, mat)
        viz.dw.matrixAutoUpdate = false

        let radiusSq = -Infinity
        geo.vertices.forEach((v) => { radiusSq = Math.max(v.lengthSq(), radiusSq) })
        viz.boundingSphereRadius = Math.sqrt(radiusSq)

        viz.beginFrame = () =>{
            im.count = 0
        }

        viz.drawInPlace = (x, y) => {
            viz.dw.matrix.makeRotationFromQuaternion(displayRotation.q)

            boxDraw(im, x, y, viz.dw.matrix, viz.boundingSphereRadius)
        }

        return viz
    }

    // scene.add(FuncViz(helixFunction, 1, 2))

    // let torusKnotFunc = (t, target) => {
    //     let minorAngle = t * 2.
    //     let majorAngle = t * 3.

    //     let majorRadius = 1.
    //     let minorRadius = .6
    //     target.x = Math.cos(minorAngle) * (majorRadius + minorRadius * Math.cos(majorAngle))
    //     target.y = Math.sin(minorAngle) * (majorRadius + minorRadius * Math.cos(majorAngle))
    //     target.z = minorRadius * Math.sin(majorAngle)
    // }
    // scene.add(FuncViz(torusKnotFunc, 1, 3))

    function sphereFunc(longtitude, latitudeTimes2, target)
    {
        let latitude = latitudeTimes2 / 2.
        target.y = Math.sin(latitude)
        target.x = Math.cos(latitude) * Math.sin(longtitude)
        target.z = Math.cos(latitude) * Math.cos(longtitude)
    }
    // let sqFunc = (x) => x * x //shader mofo. Transpile to glsl
    // let sqViz = FuncViz(sqFunc, 1, 1)
    
    function bubbleFunc(longtitude,latitudeTimes2,target) {
        let latitude = latitudeTimes2 / 2.
        target.y = Math.sin(latitude)
        target.x = Math.cos(latitude) * Math.sin(longtitude)
        target.z = Math.cos(latitude) * Math.cos(longtitude)

        let numCycles = 6
        let hue = numCycles * latitude
        while(hue < TAU)
            hue -= TAU
        target.setHSL(hue, 1., 1.)
    }
}

if(0) {
    let vertexShaderHeader = [
        'varying vec2 d;', //domain
        'varying vec3 r;', //range

        //could have these, which you then use:
        //'attribute mat3 mm1'
        //but if you're compiling every frame...

        'void main() {',
        '	d = position.xy;',
        '	r = vec3(d.xy,0.);', //initialization
        '   ',
    ].join("\n")
    let vertexShaderFooter = [
        '',
        '	gl_Position = projectionMatrix * modelViewMatrix * vec4(r, 1.0);',
        '}',
    ].join("\n")

    let fragmentShaderHeader = [
        'varying vec2 d;',
        'varying vec3 r;',
        'void main() {',
        '   float h = 0.;', //hue
        '   ',
    ].join("\n")
    let fragmentShaderFooter = [
        '',
        '   h = fract(h);',

        '	gl_FragColor = vec4(0., 0., 0., 1.);',
        '	float hexant = floor(h * 6.);',
        '	float factor = h * 6. - hexant;',

        '   gl_FragColor.r = ',
        '       hexant == 2. || hexant == 3. ? 0. :',
        '       hexant == 0. || hexant == 5. ? 1. :',
        '       hexant == 4. ? factor : 1.-factor;',
        '   gl_FragColor.g = ',
        '       hexant == 4. || hexant == 5. ? 0. :',
        '       hexant == 1. || hexant == 2. ? 1. :',
        '       hexant == 0. ? factor : 1.-factor;',
        '   gl_FragColor.b = ',
        '       hexant == 0. || hexant == 1. ? 0. :',
        '       hexant == 3. || hexant == 4. ? 1. :',
        '       hexant == 2. ? factor : 1.-factor;',
        '}'

        //then lerp towards (1.,1.,1.) if you want to reduce saturation
        //THEN lerp towards (0.,0.,0.) if you want to reduce value
    ].join("\n")

    let geo = new THREE.PlaneBufferGeometry(1., 1., 255, 255)
    geo.translate(.5, .5, 0.)

    ShaderMesh = (vertexString, fragmentString) => {
        let material = new THREE.ShaderMaterial({});
        material.vertexShader = vertexShaderHeader + (vertexString||"") + vertexShaderFooter
        material.fragmentShader = fragmentShaderHeader + (fragmentString||"") + fragmentShaderFooter
        return new THREE.Mesh(geo, material);
    }

    let mandelbrotShader = [
        'float threshold = 4.;',
        'vec2 z = vec2(0.,0.);',

        'float scale = 2.5;',
        'vec2 center = vec2(0.8,0.5);',

        'float x0 = (d.x - center.x) * scale;',
        'float y0 = (d.y - center.y) * scale;',

        'float xTemp = 0.;',
        'float iterations = 0.;',
        'int maxIterations = 32;',
        '#pragma unroll_loop_start',
        'for ( int i = 0; i < maxIterations; ++i ) {',
        '    iterations += z.x * z.x + z.y * z.y <= threshold ? 1.: 0.;',
        '    xTemp = z.x * z.x - z.y * z.y + x0;',
        '    z.y = 2. * z.x * z.y + y0;',
        '    z.x = xTemp;',
        '}',
        '#pragma unroll_loop_end',

        'h = iterations / float(maxIterations);'
    ].join("\n")

    let m = ShaderMesh(
        'r.x = 16.*d.x - 8.;\n   r.y = 16.*d.y - 8.;',
        mandelbrotShader
    )
    scene.add(m)
}