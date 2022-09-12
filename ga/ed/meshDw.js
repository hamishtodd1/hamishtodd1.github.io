/*
    the shader just has vertices, a p

    the shader takes inputs and gives outputs
    Could just focus on the vertices
    Texture mapping is no big deal

    Yeah you want to have a vertex shader, that's what current project is about!
 */

/*
    how to treat Vertex attribs?
        vec2s are uvs on a texture
        vec3s / normals are arrows sticking out of that spot
        Tangents?

        One way of visualizing weights would be proximity to the bones
        4D tetrahedron?
        floats are colors
        weights are visualized on the texture (probably)
        Note that normal map is a texture
        occlusion, roughness, metallic, normal
*/

function initMeshDw() {
    let dw = new Dw(`untransformed`, true, camera, false) //really should be "initialMesh"
    
    let initialMesh = null
    let attributes = null
    dw.getInitialMesh = () => {
        return initialMesh
    }
    
    initGltf()
    let mixer = null
    let model = null
    let walkAnimation = null
    let firstBone = null

    let holder = new THREE.Object3D()
    holder.rotation.x -= TAU / 4.
    holder.position.y -= 2.
    holder.scale.setScalar(.02)
    dw.addNonMentionChild(holder)
    
    let promise = new Promise(resolve => {
        new GLTFLoader().load('data/Soldier.glb', function (gltf) {
            
            model = gltf.scene

            initialMesh = model.children[0].children[1]
            attributes = initialMesh.geometry.attributes
            
            walkAnimation = gltf.animations[3]

            //but is this the same order in which they go in boneMatrices?

            firstBone = model.children[0].children[0]
            
            mixer = new THREE.AnimationMixer(model)
            let walkAction = mixer.clipAction(walkAnimation)
            walkAction._mixer._activateAction(walkAction)

            //the hard part is attribution

            resolve()
        })
    })

    let inAppearances = {}
    let arrayGetter = new Float32Array(4)
    let coordGetters = [`getX`, `getY`, `getZ`, `getW`]
    setInIndex = (focussedIndex) => {
        
        Object.keys(inAppearances).forEach((key)=>{
            let appearance = inAppearances[key]
            for(let i = 0; i < appearance.variable.type.numFloats; ++i)
                arrayGetter[i] = attributes[key][coordGetters[i]](focussedIndex)
            if(key === `position`)
                arrayGetter[3] = 1. //getW will have been attempted but resulted in garbage
            appearance.floatArrayToState(arrayGetter)
        })
    }

    
    attemptAppearanceIdentifationWithImportedModelIn = (appearance, name, geo) => {
        let nameForModel = name === `initialVertex` ? `position` : name
        if (attributes[nameForModel] !== undefined) {
            geo.setAttribute(nameForModel, attributes[nameForModel])
            inAppearances[nameForModel] = appearance
            //might be nice to check whether the setup of the variable in the buffer matches what we have here
        }

        // if(nameForModel === `position`)
        //     geo.setIndex(initialMesh.geometry.index)
    }

    let uniformAppearances = {}
    attemptAppearanceIdentifationWithImportedModelUniform = (appearance, name, uniforms) => {
        if(name === `boneMatrices` ) {
            // uniforms.boneMatrices = boneMatricesUniform
            uniformAppearances.boneMatrices = appearance
        }
        
        //bindMatrix is a uniform. 
        //it's not necessarily this "holder" thing
    }

    let bmIndex = 0
    let identityMatrix = new THREE.Matrix4()
    let ourActualPosition = new THREE.Vector3()
    let childActualPosition = new THREE.Vector3()
    let oneOneOne = new THREE.Vector3().setScalar(1.)
    function updateBoneMeshMatrix( bone, parentTransform ) {
        if (uniformAppearances.boneMatrices === undefined)
            return

        let targetMatrix = uniformAppearances.boneMatrices.meshes[bmIndex].matrix
        v1.copy(bone.position)
        targetMatrix.compose(v1, bone.quaternion, oneOneOne)
        targetMatrix.premultiply(parentTransform)
        ++bmIndex

        let desiredLength = Infinity
        bone.children.forEach((child)=>{
            let childMatrix = updateBoneMeshMatrix(child, targetMatrix)
            ourActualPosition.setFromMatrixPosition(targetMatrix)
            childActualPosition.setFromMatrixPosition(childMatrix)
            let dist = ourActualPosition.distanceTo(childActualPosition)
            if ( dist < desiredLength )
                desiredLength = dist
        })
        if( desiredLength === Infinity)
            desiredLength = 1.

        //set the y vector for the appearance of the thing
        for(let i = 0; i < 3; ++i) {
            v2.fromArray(targetMatrix.elements, i*4)
            v2.setLength(desiredLength) //purely an appearance thing
            v2.toArray(  targetMatrix.elements, i*4)
        }

        return targetMatrix
    }
    
    return {
        promise,
        updateBones: () => {
            mixer.update(frameDelta)
            bmIndex = 0
            updateBoneMeshMatrix(firstBone, identityMatrix)
        }
    }
}