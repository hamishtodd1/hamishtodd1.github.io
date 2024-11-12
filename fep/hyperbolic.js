/*
    TODO
        Show the flow of a transformation
        gauges?
 */

function initHyperbolic() {

    let curveThickness = .02
    
    ///////////////
    // Gaussians //
    ///////////////
    {
        let gaussiansGroup = new THREE.Group()
        gaussiansGroup.position.x = -.8
        // scene.add(gaussiansGroup)

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
    }

    {
        var scalingLine = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }))
        scalingLine.scale.x = 400.
        scalingLine.scale.y = curveThickness
        // scene.add(scalingLine)

        let ptGeo = new THREE.SphereGeometry(.02)
        let ptMat = new THREE.MeshBasicMaterial({ color: 0x0000ff })
        var pt = new THREE.Mesh(ptGeo, ptMat)
        scene.add(pt)

        let circlePoints = []
        for (let i = 0; i < 100; ++i) {
            let angle = i / 100 * Math.PI * 2.
            circlePoints.push(new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0))
        }
        let circleGeo = new THREE.BufferGeometry(1., 100).setFromPoints(circlePoints)
        let circles = []
        for(let i = 0; i < 2; ++i) {
            circles[i] = new THREE.LineLoop(circleGeo, new THREE.LineBasicMaterial({ color: 0x00ff00 }))
            scene.add(circles[i])
        }
    }

    {
        let numPts = 4096
        let initialPoints = Array(numPts)
        let domainWidth = 0.;
        let domainHeight = 0.;
        updateDomainSizes = () => {
            domainHeight = 2. * camera.position.z * Math.tan(camera.fov / 2. * (TAU / 360.))
            domainWidth = domainHeight * camera.aspect
        }
        window.addEventListener('resize', updateDomainSizes)
        function randomizeInDomain(v) {
            v.set(
                Math.random() * domainWidth  - domainWidth  / 2.,
                Math.random() * domainHeight - domainHeight / 2., 0.)
            return v
        }
        for (let i = 0; i < numPts; ++i) {
            initialPoints[i] = randomizeInDomain(new THREE.Vector3())
            initialPoints[i].z = Math.random()
        }

        let existenceDuration = 1.
        function updatePoints() {
            for (let i = 0; i < numPts; ++i) {
                initialPoints[i].z += .01
                if(initialPoints[i].z > existenceDuration) {
                    initialPoints[i].z = 0.
                    randomizeInDomain(initialPoints[i])
                }
            }
            updateGeometry()
        }

        let geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(numPts * 3), 3))
        function updateGeometry() {
            for (let i = 0; i < numPts; ++i)
                initialPoints[i].toArray(geo.attributes.position.array, i * 3)
            geo.attributes.position.needsUpdate = true
        }
        updateGeometry()

        var pointsBiv = new Mv()

        var bivMat4 = new THREE.Matrix4().set( 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0. )
        
        var pointsMat = new THREE.ShaderMaterial({
            uniforms:
            {
                "bivMat4": { value: bivMat4 },
            },
            vertexShader: glsl31 + `
                uniform mat4 bivMat4;

                void main (void) {
                
                    float[16] asZrc; vecToZrc( position, asZrc );
                    
                    float[16] biv = float[16](bivMat4[0][0], bivMat4[0][1], bivMat4[0][2], bivMat4[0][3], bivMat4[1][0], bivMat4[1][1], bivMat4[1][2], bivMat4[1][3], bivMat4[2][0], bivMat4[2][1], bivMat4[2][2], bivMat4[2][3], bivMat4[3][0], bivMat4[3][1], bivMat4[3][2], bivMat4[3][3] );
                    float[16] bivMultiple; multiplyScalar( biv, position.z, bivMultiple );
                    float[16] rotor; exp31(bivMultiple, rotor);
                    float[16] moved; sandwich(rotor, asZrc, moved);

                    vec3 pos; circlePosToVec( moved, pos );

                    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
                    gl_PointSize = 3.5;
                }`,
            fragmentShader: `
                precision highp float;
                void main (void) {
                    gl_FragColor = vec4( 0, 0., 0., 1. );
                }`
        });

        var study = new Mv()
        study[0] = .4
        study[15] = 0.
        _e1p.mul(study, pointsBiv)
        // pointsBiv.copy(_e1m)
        pointsBiv.log()
        
        bivMat4.fromArray(pointsBiv)

        // pointsMat.needsUpdate = true

        let mesh = new THREE.Points(geo, pointsMat)
        scene.add(mesh)
    }

    let start = new Mv()
    let end = new Mv()

    let holding = false
    document.addEventListener('mousedown', (event) => {
        start.vecToZrc(mousePos)
        holding = true
    })

    document.addEventListener('mouseup', (event) => {
        holding = false
    })

    document.addEventListener('mousewheel', (event) => {
        study[15] += event.deltaY * .001
    })

    updateHyperbolic = () => {

        pt.position.copy(mousePos)
        if ( .06 > Math.abs(pt.position.y - scalingLine.position.y))
            pt.position.y = scalingLine.position.y

        if(holding) {
            end.vecToZrc(mousePos)
            if(!start.equals(end)) {
                let boostPp = start.wedge(end, mv0)
                boostPp.cheapNormalize(boostPp)
                mv0.mul(study, pointsBiv)
                bivMat4.fromArray(pointsBiv)
            }
        }

        updatePoints()

        //want the two circles to cross at point
        //by default, they are diagonal at the point

        //let's say it's e1p
        //inner with e0 to get vertical line
        //inner of it with THAT to get the other circle
        //rotate them 45 degrees
        //extract center with e0
        //extract radius

    }
}