/*
    Just do magntidue of F

    Long term
        It's the electromagnetic field
        Control the color scheme
        Could be "patchy" scheme, not continuously varying
            You could control the limits of "red colored"
        Show Gauss's law for magnetism:
            you can make a surface with your hands,
            and color at each point based on the flux through that point,
            and the colors will "add up" to 0

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
            handPosition: { value: new THREE.Vector3() }
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
            
            uniform vec3 handPosition;
            uniform sampler2D simulationTexture;
            
            `+ tSpaceESpaceConversion + egaVerboseGlsl + egaGlsl + `

            vec4 doubleSample(in vec3 eSpace) {

                float ezw = eSpace.z * `+ voxelsWide + `.;

                float sxAddition1 = floor(ezw);
                float sxAddition2 = sxAddition1 + 1.;
                float tx1 = (eSpace.x + sxAddition1) / `+ voxelsWide + `.;
                float tx2 = (eSpace.x + sxAddition2) / `+ voxelsWide + `.;
                vec4 ret1 = texture2D( simulationTexture, vec2(tx1, eSpace.y) );
                vec4 ret2 = texture2D( simulationTexture, vec2(tx2, eSpace.y) );

                return mix( ret1, ret2, fract( ezw ) );
            }

            vec3 sampleSimulation(vec4 pos) {

                //debug
                // float distToCenter = length(pos.xyz - vec3(0.5,0.5,0.5));
                // return distToCenter > 0.2 ? 0. : 1.;

                //single sample
                // vec2 tSpace = eSpaceToTSpace( pos.xyz / pos.w );
                // vec4 ret = texture2D( simulationTexture, tSpace );
                // return ret.r;

                //double sample
                vec4 ret = doubleSample(pos.xyz / pos.w);
                return ret.xyz;
            }

            void main (void) {

                gl_FragColor = vec4( 0., 0., 0., 1. );

                float numSteps = 30.;
                float stepLength = 1.75 / numSteps; // max thickness of cube is sqrt(3) = 1.75ish
                vec4 stepVec = stepLength * normalize(rayDirection);

                for(float i = 0.; i < numSteps; ++i) {

                    vec4 p = entry + (i+1.) * stepVec; //+1 solved a problem with wrapping. Can change back if you find a different solution
                    bool stillInCube = p.x >= 0. && p.x <= 1. && p.y >= 0. && p.y <= 1. && p.z >= 0. && p.z <= 1.;

                    //did/did not hit
                    // float val = sampleSimulation( p );
                    // if(val > 0.1 && stillInCube)
                    //     gl_FragColor = vec4(1.,0.,0.,1.);

                    //gas
                    vec3 val = sampleSimulation( p );
                    if(stillInCube)
                        gl_FragColor.rgb += val.rgb;

                }

                if(gl_FragColor.xyz == vec3(0.,0.,0.))
                    discard;

            }`
    });

    let simBox = new THREE.Mesh(boxGeo, mat)
    scene.add(simBox)
    simBox.scale.setScalar(1.9)
    simBox.position.y = 1.6 - .5 * simBox.scale.y
    simBox.position.x = 0.
    simBox.position.z = 0. - .5 * simBox.scale.y

    simBox.onBeforeRender = () => {
        if (!painting)
            mat.uniforms.handPosition.value.set(-.5, -.5, -.5)
        else {
            handPosition.pointToVertex(v3)
            simBox.worldToLocal(v3)
            mat.uniforms.handPosition.value.copy(v3)
        }
    }

    const wireframeGeo = new THREE.WireframeGeometry(boxGeo);
    // let geo = new THREE.BufferAttribute
    const wireframeCube = new THREE.LineSegments(wireframeGeo);
    wireframeCube.scale.setScalar(1.006)
    wireframeCube.position.setScalar(-0.5 * (wireframeCube.scale.x - 1.))
    simBox.add(wireframeCube);
    let backs = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide }))
    // backs.scale.setScalar(1.003)
    // backs.position.setScalar(-0.5 * (backs.scale.x - 1.))
    simBox.add(backs)

    return simBox
}