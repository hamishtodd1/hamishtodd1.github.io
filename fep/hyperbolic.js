/*
    Generate a fuckload of gaussians. See their graphs and their points
    Apply a bayesian update to them. You know what it looks like for the points, what about for the graphs?

    THIS IS A WASTE OF TIME UNTIL YOU HAVE A SCALAR FIELD ON THIS SPACE!

    Can show:
        a "rotation around" some gaussians - solenoidal - free-energy-constant
        a bunch of gaussians "reflect
        reflecting in a, er, geodesic of gaussians? Call it "line" of gaussians
            Simple: some that vary by standard deviation but same mean
                Reflection in a vertical line, has ddinf
            Complicated: circular arc. Could say defined by two dirac delta
            Metaphysically fucked: reflection in 
 */

function initWorldMaps() {
    let mrh = new THREE.PlaneGeometry(2.,1.,256,256)
    new THREE.TextureLoader().load('https://hamishtodd1.github.io/ga/mr2/data/earthColor.png', map => {

        let mat = new THREE.ShaderMaterial({
            uniforms:
            {
                map: { value: map },
            },
            vertexShader: glsl31 + `
                uniform mat4 bivMat4;

                out vec2 vUv;

                #define PI 3.1415926535897932384626433832795

                void main (void) {

                    vUv = uv;

                    vec3 pos;
                    float lon = PI * position.x;
                    float lat = PI * position.y;

                    // mercator
                    // if(abs(position.y) * 2. > 15./16.)
                    //     lat = sign(lat) * 1./128.;
                    // pos.x = lon;
                    // pos.y = log( tan( PI / 4. + lat / 2. ) );
                    // pos *= .5;

                    // azimuthal equal area
                    float lat0 = PI/2.;
                    float k = sqrt(2./(1.+sin(lat0)*sin(lat)+cos(lat0)*cos(lat)*cos(lon)));
                    pos.x = k * cos(lat) * sin(lon);
                    pos.y = k * (cos(lat0)*sin(lat) - sin(lat0)*cos(lat)*cos(lon));
                    pos *= .7;

                    // perspective
                    // pos.y = sin(lat);
                    // pos.x = cos(lat) * sin(lon);
                    // pos.z = cos(lat) * cos(lon);
                
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
                    gl_PointSize = 3.5;
                }`,
            fragmentShader: `
                precision highp float;

                in vec2 vUv;
                uniform sampler2D map;

                void main (void) {

                    vec2 uv = vUv;

                    gl_FragColor = texture2D( map, uv );
                }`
        });
        let perspective = new THREE.Mesh(mrh, mat)
        scene.add(perspective)
    })
}

updateHyperbolic = () => { }
function initHyperbolic() {

    initWorldMaps()

    initVizes()

    //upper half plane
    let uhpPss = new CircleViz(0xFF0000)
    uhpPss.mv.copy(_e2)

    initFlowViz()
    return
    
    ///////////////
    // Gaussians //
    ///////////////
    {
        let gaussiansGroup = new THREE.Group()
        gaussiansGroup.position.x = -.8
        scene.add(gaussiansGroup)

        let numSamples = 100
        let geo = new THREE.PlaneGeometry(1., 1., numSamples, 1)
        geo.translate(0., 0.5, 0.)
        let arr = geo.attributes.position.array
        for (let i = 0, il = arr.length / 3; i < il; ++i) {
            v1.fromArray(arr, i * 3)

            if (v1.y > 0.) {
                let x = 6. * v1.x
                v1.y = Math.exp(-(x * x))
            }

            v1.toArray(arr, i * 3)
        }
        let gaussianMesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x00ff00 }))
        gaussiansGroup.add(gaussianMesh)

        return
    }

    // let cv = new CircleViz()
    // cv.mv.copy(_e1)

    // let mousePpViz = new PtPairViz(true)
    // mousePpViz.mv.copy(_e1p)

    function setToMousePosPp(mv) {
        let mouseZrc = mv0.vecToZrc(mousePos)
        mouseZrc.wedge(_e2, mv1).inner(_e12pm, mv) //so it's a rotation pp
        mv.cheapNormalize(mv)
    }

    document.addEventListener('mousedown', e => {
        if (e.button === 0) {
            let ppv = new PtPairViz(false)
            setToMousePosPp(ppv.mv)
        }
    })
    document.addEventListener('mouseup', e => {
        if (e.button === 0) {
            let ppv = new PtPairViz(false)
            setToMousePosPp(ppv.mv)
        }
    })

    // let pp = new Mv()
    // pp.copy(_e1p)

    // let r = new Mv()
    // let angle = .01
    // r[0] = Math.cos(angle)
    // r.addScaled(_e1p, Math.sin(angle), r)

    // let ppCs = [new CircleViz(), new CircleViz()]

    updateHyperbolic = () => {

        // setToMousePosPp(mousePpViz.mv)

        // pt.position.copy(mousePos)
        // if ( .06 > Math.abs(pt.position.y - scalingLine.position.y)) {
        //     pt.position.y = scalingLine.position.y
        // }

        // pp.inner(_e0, ppCs[0])
        // ppCs[0].inner(pp, ppCs[1])

        // cv.mv.copy(_e1)
        // r.sandwich(cv.mv, cv.mv)

        updateFlowViz()

        //want the two circles to cross at point
        //by default, they are diagonal at the point
        //or, maybe they should slowly circulate

        //rotate them 45 degrees
        //extract center with e0
        //extract radius
    }
}