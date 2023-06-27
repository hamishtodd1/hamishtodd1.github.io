/*
    Circuit viz
    specifying a point
    a line reflection
    a glide reflection even

    Do want to be able to pull camera back and see that it's actually 3D, lines are circles

    Options for presentation
        mixedReality style
            Putting camera inside globe is difficult
        zeimLight style
            can't easily do 
        Split-screen style, zarth or whatever his name is
            Could be very easy
*/

async function initOneQubit() {

    camera.fov = 90.
    camera.updateProjectionMatrix()

    let loader = new THREE.TextureLoader().setCrossOrigin(true)
    loader.load("data/earthColor.png", function (texture) {
        let mat = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        })

        let mesh = new THREE.Mesh(new THREE.SphereBufferGeometry(.1),mat)
        scene.add(mesh)



        updateFunctions.push( () => {
            mesh.position.copy(camera.position)
        })
    })
}