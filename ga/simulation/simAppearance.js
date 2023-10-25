/*
    Long term
        It's the electromagnetic field
        Control the color scheme
        Could be "patchy" even, not continuously varying. You could control the limits of "red colored"

    You want to get this working, but there are two research avenues for reformulating this
        STAP
        (possibly the same as STAP) PgaDyn style where derivative is commutator product somehow
        CGA interpretation - surely dipoles are involved in electromagnetic field...

    There might be some interesting isosurfaces and isolines to be considered.
        Put your hand somewhere, consider the three lines and planes running through it at right angles
        draw the surface/curve that is tangent to the planes at that point
 */

updateSim = ()=>{}

async function initSimAppearance() {
    
    let boxGeo = new THREE.BoxGeometry(1., 1., 1.)
    boxGeo.translate(.5,.5,.5)

    // let mat = new THREE.MeshBasicMaterial({ color: 0xFF0000 })
    // let a = new THREE.Mesh(boxGeo, mat)
    // a.position.copy(wireframeCube.position)
    // scene.add(a)

    let mat = new THREE.ShaderMaterial({
        blending: 0, //prevent default premultiplied alpha values
        uniforms:
        {
            simulationTexture: { value: null },
        },
        vertexShader: `
            precision highp float;
            varying vec4 entry;
            varying vec4 rayDirection;

            void main (void) {
                entry = vec4( position, 1.0 );

                mat4 modelMatrixInverse = inverse( modelMatrix );
                vec4 cameraPositionInObjectSpace = modelMatrixInverse * vec4(cameraPosition,1.);
                rayDirection = entry - cameraPositionInObjectSpace;
                rayDirection.w = 0.;

                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`,
        fragmentShader: `
            precision highp float;
            varying vec4 entry;
            varying vec4 rayDirection;

            uniform sampler2D simulationTexture;
            
            `+ tSpaceESpaceConversion + egaVerboseGlsl + egaGlsl + `

            float sampleSimulation(vec4 pos) {
                //debug
                // float distToCenter = length(pos.xyz - vec3(0.5,0.5,0.5));
                // return distToCenter > 0.2 ? 0. : 1.;

                vec2 tSpace = eSpaceToTSpace( pos.xyz / pos.w );
                vec4 ret = texture2D( simulationTexture, tSpace );
                return ret.r;
            }

            void main (void) {

                gl_FragColor = vec4( 1., 0., 0., 0. );

                float numSteps = 30.;
                float stepLength = 1.75 / numSteps; // max thickness of cube is sqrt(3) = 1.75ish
                vec4 stepVec = stepLength * normalize(rayDirection);

                for(float i = 0.; i < numSteps; ++i) {

                    vec4 p = entry + (i+1.) * stepVec; //+1 solved a problem with wrapping. Can change back if you find a different solution

                    float val = sampleSimulation( p );
                    bool stillInCube = p.x >= 0. && p.x <= 1. && p.y >= 0. && p.y <= 1. && p.z >= 0. && p.z <= 1.;
                    if(val > 0.1 && stillInCube)
                        gl_FragColor.a = 1.;

                }

                if(gl_FragColor.a == 0.)
                    discard;

            }`
    });

    let simBox = new THREE.Mesh(boxGeo, mat)
    scene.add(simBox)
    simBox.scale.setScalar(1.9)
    simBox.position.y = 1.6 - .5 * simBox.scale.y
    simBox.position.x = 0.
    simBox.position.z = 0. - .5 * simBox.scale.y

    const wireframeGeo = new THREE.WireframeGeometry(boxGeo);
    const wireframeCube = new THREE.LineSegments(wireframeGeo);
    simBox.add(wireframeCube);

    return simBox
}