function initMeshDw() {
    let dw = new Dw("mesh", false)

    let object

    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4)
    dw.addNonMentionChild(ambientLight)

    const pointLight = new THREE.PointLight(0xffffff, 0.8)
    pointLight.position.z = 250. //that's where the chuffing camera was
    dw.addNonMentionChild(pointLight)

    const manager = new THREE.LoadingManager()

    const textureLoader = new THREE.TextureLoader(manager)
    const texture = textureLoader.load('data/spot_texture.png')

    function onModelLoadProgress(xhr) {
        if (xhr.lengthComputable) {
            const percentComplete = xhr.loaded / xhr.total * 100
            console.log('model ' + Math.round(percentComplete, 2) + '% downloaded')
        }
    }

    return new Promise(resolve => {
        const loader = new THREE.OBJLoader(manager)
        loader.load('data/spot_control_mesh.obj', function (obj) {
            obj.traverse(function (child) {
                if (child.isMesh)
                    child.material.map = texture
            })
            dw.addNonMentionChild(obj)
            resolve()
        }, onModelLoadProgress, (err) => {
            log(err)
        })
    })
}