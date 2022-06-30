function initMeshDw() {
    let dw = new Dw("mesh", false,true)
    
    let object
    let texture
    function whenBothLoaded() {
        object.geometry.scale(1.9, 1.9, 1.9)
        object.geometry.rotateY(TAU / 4.)

        object.material.map = texture

        dw.addNonMentionChild(object)
    }

    return new Promise( resolve => {
        function onModelLoadProgress(xhr) {
            if (xhr.lengthComputable) {
                const percentComplete = xhr.loaded / xhr.total * 100
                console.log('model ' + Math.round(percentComplete, 2) + '% downloaded')
            }
        }
        
        function onManagerFinish() {
            whenBothLoaded()
            resolve()
        }
        const manager = new THREE.LoadingManager(onManagerFinish)
        const textureLoader = new THREE.TextureLoader(manager)
        const objLoader = new THREE.OBJLoader(manager)
        
        textureLoader.load('data/spot_texture.png',(tex)=>{
            texture = tex
        })
        objLoader.load('data/spot_control_mesh.obj', function (obj) {
            obj.traverse(function (child) {
                if (child.isMesh)
                    object = child
            })            
        }, onModelLoadProgress, (err) => {
            log(err)
        })
    })
}