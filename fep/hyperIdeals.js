/*
    Just want to try this coloration idea
    3 colors: red, blue, purple

    To visualize H,
        A pair of points p1 and p2 should have the same color if H p1 -H

    Perlin noise?

    Alright so there's a cube! three corners are red white and blue
*/

function initHyperIdeals() {
    
    let mat = new THREE.ShaderMaterial({
        uniforms:
        {
        },
        vertexShader: `
            precision highp float;

            out vec4 pos;

            void main (void) {

                pos = modelMatrix * vec4( position, 1.0 );

                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`,
        fragmentShader: `
            precision highp float;

            in vec4 pos;

            void main (void) {

                gl_FragColor = vec4( pos.xy, 0., 1. );

            }`
    });
    
    //full screen quad
    let fsq = new THREE.Mesh(new THREE.PlaneBufferGeometry(1., 1.), mat)
    scene.add(fsq)

    updateHyperIdeals = () => {
        fsq.scale.y = 2. * camera.position.z * centerToFrameDistanceAtOneUnitAway(camera.fov)
        fsq.scale.x = fsq.scale.y * camera.aspect
        // log("yo")
    }
}