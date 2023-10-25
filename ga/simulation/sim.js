/*
    Long term
        It's the electromagnetic field
        Control the color scheme
        Could be "patchy" even, not continuously varying. You could control the limits of "red colored"

    You want to get this working, but there are two research avenues for reformulating this
        STAP
        (possibly the same as STAP) PgaDyn style where derivative is commutator product somehow
        CGA interpretation - surely dipoles are involved in electromagnetic field...
 */

updateSim = ()=>{}

async function initSim() {
    
    let boxGeo = new THREE.BoxGeometry(1., 1., 1.)
    boxGeo.translate(.5,.5,.5)
    const wireframeGeo = new THREE.WireframeGeometry(boxGeo);
    const wireframeCube = new THREE.LineSegments(wireframeGeo);
    wireframeCube.position.y = 1.1
    wireframeCube.position.x = 0.
    wireframeCube.position.z = 0.8
    scene.add(wireframeCube);

    // let mat = new THREE.MeshBasicMaterial({ color: 0xFF0000 })
    // let a = new THREE.Mesh(boxGeo, mat)
    // a.position.copy(wireframeCube.position)
    // scene.add(a)

    /////////
    // SIM //
    /////////

    let voxelsWide = 64
    let w = voxelsWide.toString() + `.`
    let tSpaceESpaceConversion = `

vec2 eSpaceToTSpace(in vec3 eSpace ) {

    float sx = eSpace.x + floor(eSpace.z * ` + w + `); //stacked space
    float tx = sx / ` + w + `;
    return vec2( tx, eSpace.y );

}
vec3 tSpaceToESpace(in vec2 tSpace ) {

    float sx = tSpace.x * ` + w + `;
    float ex = sx - floor(sx);
    float ez = (floor(sx) + 0.5) / ` + w + `;
    return vec3(ex, tSpace.y, ez);

}
`
    let jsStr = tSpaceESpaceConversion
        .replaceAll(`in vec2`, ``).replaceAll(`in vec3`, ``)
        .replaceAll(`float`, `let`)
        .replaceAll(`\nvec2`, `\nfunction`).replaceAll(`\nvec3`, `\nfunction`)
        .replaceAll(`    vec2`, `    let`).replaceAll(`    vec3`, `    let`)
        .replaceAll(`floor`, `Math.floor`)
        .replaceAll(`vec3`, `v1.set`).replaceAll(`vec2`, `v1_2d.set`)
    eval(jsStr)

    // function doSampling(pos) {
    //     let tSpace = eSpaceToTSpace(pos);
    //     let ret = texture2D(simulationTexture, tSpace);
    //     return ret.r;
    // }
    // doSampling()

    let dimensions = new THREE.Vector2(voxelsWide * voxelsWide, voxelsWide);
    let initialState = new Float32Array(dimensions.x * dimensions.y * 4)
    let tCoords = new THREE.Vector2()
    for (let row = 0; row < dimensions.y; row++) {
        for (let column = 0; column < dimensions.x; column++) {

            tCoords.set( (column+.5) / dimensions.x, (row+.5) / dimensions.y )

            // debugger
            tSpaceToESpace(tCoords) //now in v1

            // log(v1.clone().multiplyScalar(voxelsWide))
            let val = v1.distanceTo(v2.set( 0.5, 0.5, 0.5 )) < 0.25 ? 1. : 0.

            let firstIndex = (row * dimensions.x + column) * 4
            initialState[firstIndex + 0] = val //Math.random()
            initialState[firstIndex + 1] = 0.
            initialState[firstIndex + 2] = 0.
            initialState[firstIndex + 3] = 0.
            
        }
    }

    let displayMaterial = new THREE.ShaderMaterial({
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

            float doSampling(vec4 pos) {
                // float distToCenter = length(pos.xyz - vec3(0.5,0.5,0.5));
                // return distToCenter > 0.2 ? 0. : 1.;

                vec2 tSpace = eSpaceToTSpace( pos.xyz / pos.w );
                vec4 ret = texture2D( simulationTexture, tSpace );
                return ret.r;
            }

            void main (void) {

                gl_FragColor = vec4( 1., 0., 0., 0. );

                float numSteps = 40.;
                float stepLength = 1.75 / numSteps; // max thickness of cube is sqrt(3) = 1.75ish
                vec4 stepVec = stepLength * normalize(rayDirection);

                for(float i = 0.; i < numSteps; ++i) {

                    vec4 p = entry + i * stepVec;

                    float val = doSampling( p );
                    bool stillInCube = p.x >= 0. && p.x <= 1. && p.y >= 0. && p.y <= 1. && p.z >= 0. && p.z <= 1.;
                    if(val > 0.1 && stillInCube)
                        gl_FragColor.a = 1.;

                }

                if(gl_FragColor.a == 0.)
                    discard;

            }`
    });

    // log(displayMaterial.fragmentShader)

    let numStepsPerFrame = 1;
    await Simulation(dimensions, `basicSimulation`, `clamped`, initialState, numStepsPerFrame, displayMaterial.uniforms.simulationTexture)

    let displayBox = new THREE.Mesh(boxGeo, displayMaterial)
    displayBox.position.copy(wireframeCube.position)
    scene.add(displayBox)

    v1.copy(camera.position)
    displayBox.worldToLocal(v1)
}