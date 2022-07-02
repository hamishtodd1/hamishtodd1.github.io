/*
    the shader just has vertices, a p

    the shader takes inputs and gives outputs
    Could just focus on the vertices
    Texture mapping is no big deal

    Yeah you want to have a vertex shader, that's what current project is about!
 */

function initMeshDw() {
    let dw = new Dw("mesh", false,true, camera, false)
    
    let object
    let texture
    function whenBothLoaded() {
        object.geometry.scale(1.9, 1.9, 1.9)
        object.geometry.rotateY(TAU *.5)

        log(object.material)
        log(object.geometry)

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