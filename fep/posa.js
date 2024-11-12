/*
    The surface's height is the lagrangian's value
        Cooooould make it opacity yes, when there's more dof
    We want directional derivatives, which are little disks, that are 

    Double pendulum
        3-ball slice through state-space
        And another which is immediately in the future

    Could be a very strange space indeed... but just send out geodesics, visualize what's along them?

    For the higher-d ones:
        You can "rotate" to put one of the plane's content at the other

    Full-on visualization of principle of least action
        1+1
            A spring, or whatever
        2+1
            Something
        3+1
            PGA!
        
        
 */

async function initPosa() {

    let geo = new THREE.PlaneGeometry(1.,1.)
    // let mat = new THREE.ShaderMaterial({
    //     uniforms:
    //     {
    //     },
    //     vertexShader: `
    //         precision highp float;

    //         out vec2 vUv;

    //         void main (void) {

    //             vUv = uv;

    //             gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    //         }`,
    //     fragmentShader: `
    //         precision highp float;

    //         in vec2 vUv;

    //         void main (void) {

    //             gl_FragColor = vec4( vUv.x > 0.5 ? 1.:0., 0., 0., 1. );

    //         }`
    // });
    let mat 

    let mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)
}

async function initPosa3d() {

    let boxGeo = new THREE.BoxGeometry(1., 1., 1.)

    let mat = new THREE.ShaderMaterial({
        blending: 0, //prevent default premultiplied alpha values
        uniforms:
        {
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
            
            void main (void) {

                gl_FragColor = vec4( 0., 0., 0., 1. );

                float numSteps = 80.;
                float stepLength = 1.75 / numSteps; // max thickness of cube is sqrt(3) = 1.75ish
                vec4 stepVec = stepLength * normalize(rayDirection);

                for(float i = 0.; i < numSteps; ++i) {

                    vec4 p = entry + (i+1.) * stepVec; //+1 solved a problem with wrapping. Can change back if you find a different solution

                    if(p.x*p.x+p.y*p.y+p.z*p.z < .2)
                        gl_FragColor.rgb += .01;

                }

            }`
    });

    let box = new THREE.Mesh(boxGeo, mat)
    scene.add(box)
    box.scale.setScalar(1.9)

    updatePosa = ()=> {
        box.rotation.y += .001
    }

    const wireframeGeo = new THREE.WireframeGeometry(boxGeo);
    // let geo = new THREE.BufferAttribute
    const wireframeCube = new THREE.LineSegments(wireframeGeo);
    wireframeCube.scale.setScalar(1.006)
    wireframeCube.position.setScalar(-0.5 * (wireframeCube.scale.x - 1.))
    box.add(wireframeCube);
    let backs = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide }))
    // backs.scale.setScalar(1.003)
    // backs.position.setScalar(-0.5 * (backs.scale.x - 1.))
    box.add(backs)

    return box
}