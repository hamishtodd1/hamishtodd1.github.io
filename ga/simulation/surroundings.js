function initSurroundings() {

    scene.background = new THREE.Color(0x8F8F8F)

    const urls = ['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg'];
    new THREE.CubeTextureLoader()
        .setPath('data/')
        .load(urls, (cubeTexture) => {
            cubeTexture.generateMipmaps = true;
            cubeTexture.minFilter = THREE.LinearMipmapLinearFilter;
            scene.background = cubeTexture


        })

    const floorGeometry = new THREE.CircleGeometry(5., 31)
    const floorMaterial = new THREE.MeshPhongMaterial()
    textureLoader.load('data/negy.jpg', (texture) => {
        floorMaterial.map = texture
        floorMaterial.needsUpdate = true
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = - Math.PI / 2
    floor.position.y = -.001 //because z fight with y plane
    floor.receiveShadow = true
    scene.add(floor)

    scene.add(new THREE.HemisphereLight(0x808080, 0x606060))

    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(-1., 3., 2.)
    light.lookAt(0.,1.6,0.)
    light.castShadow = true
    let cameraSize = 3.
    light.shadow.camera.top = cameraSize
    light.shadow.camera.bottom = - cameraSize
    light.shadow.camera.right = cameraSize
    light.shadow.camera.left = - cameraSize
    light.shadow.mapSize.set(4096, 4096)
    scene.add(light)

    scene.add(new THREE.AmbientLight(0x222222))
}