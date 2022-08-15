/*
    the shader just has vertices, a p

    the shader takes inputs and gives outputs
    Could just focus on the vertices
    Texture mapping is no big deal

    Yeah you want to have a vertex shader, that's what current project is about!
 */

function initMeshDw() {
    let dw = new Dw("mesh", false, true, camera, false)
    
    let object
    let inAppearance = null

    let currentFocussedAttributeExample = 0
    incrementFocussedAttributeExample = () => {
        ++currentFocussedAttributeExample
        if (currentFocussedAttributeExample >= object.geometry.attributes.position.count)
            currentFocussedAttributeExample = 0
        focusAttributeExample(currentFocussedAttributeExample)
    }

    focusAttributeExample = (focussedIndex) => {
        inAppearance.uniform.value.set(
            object.geometry.attributes.position.getX(focussedIndex),
            object.geometry.attributes.position.getY(focussedIndex),
            object.geometry.attributes.position.getZ(focussedIndex), 1. )
        inAppearance.updateAppearanceFromState()
        //aaaaaand you probably need updateStateFromAttribute. Awesome
        //but at least the value is the state for vertices
    }

    createIn = (geo, outputterUniforms, name, appearance) => {

        if(name === `initialVertex`) {
            geo.setAttribute('position', object.geometry.attributes.position)
            outputterUniforms[name + `Outputter`] = appearance.uniform
        }

        inAppearance = appearance

        focusAttributeExample(currentFocussedAttributeExample)

        // else {
        //     let inArray = new Float32Array(type.numFloats * numVertices)
        //     for (let i = 0, il = inArray.length; i < il; ++i)
        //         inArray[i] = Math.random() - .5
        //     geo.setAttribute(name, new THREE.BufferAttribute(inArray, type.numFloats))
        // }
    }

    let texture
    function whenBothLoaded() {
        object.geometry.scale(1.9, 1.9, 1.9)
        object.geometry.rotateY(TAU *.5)

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
                if (child.isMesh) {
                    object = new THREE.LineSegments(new THREE.WireframeGeometry(child.geometry),new THREE.MeshBasicMaterial({color:0xFFFFFF}))
                    // object = child
                    // child.geometry.computeVertexNormals()
                    // child.geometry.normalizeNormals()
                }
            })            
        }, onModelLoadProgress, (err) => {
            log(err)
        })
    })
}