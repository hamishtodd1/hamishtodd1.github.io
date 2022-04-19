async function initPga()
{
    var apparatus = new THREE.Object3D()
    let fsq = FullScreenQuad(new THREE.ShaderMaterial())
    apparatus.add(fsq)
    fsq.material.fragmentShader = await getTextFile('pga.glsl') + `
        void main() {
            raycast();
        }`

    let grid = GridAndSpike(8, 8, 1./4.)
    grid.rotation.x = TAU / 4.
    apparatus.add(grid)
    
    // fsq.material.lights = true
    // fsq.material.depthTest = true

    return apparatus
}