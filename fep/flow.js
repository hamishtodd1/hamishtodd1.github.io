/*
    Might be nice to have them fade in and out
 */

function updateFlowViz() {}
function updateDomainSizes() {}

function initFlowViz() {

    let existenceDuration = 1.

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
            Math.random() * domainWidth - domainWidth / 2.,
            Math.random() * domainHeight - domainHeight / 2., 0.)
        return v
    }
    for (let i = 0; i < numPts; ++i) {
        initialPoints[i] = randomizeInDomain(new THREE.Vector3())
        initialPoints[i].z = Math.random() * existenceDuration
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

    var bivMat4 = new THREE.Matrix4().set(0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0., 0.)

    var flowMat = new THREE.ShaderMaterial({
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

    // flowMat.needsUpdate = true

    let mesh = new THREE.Points(geo, flowMat)
    scene.add(mesh)

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

    updateFlowViz = () => {

        if (holding) {
            end.vecToZrc(mousePos)
            if (!start.equals(end)) {
                let boostPp = start.wedge(end, mv0)
                boostPp.cheapNormalize(boostPp)
                mv0.mul(study, pointsBiv)
                bivMat4.fromArray(pointsBiv)
            }
        }

        for (let i = 0; i < numPts; ++i) {
            initialPoints[i].z += .01
            if (initialPoints[i].z > existenceDuration) {
                initialPoints[i].z = 0.
                randomizeInDomain(initialPoints[i])
            }
        }
        updateGeometry()
    }
}