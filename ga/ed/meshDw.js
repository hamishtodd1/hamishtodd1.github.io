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

    let boneInverses = []

    let uniformAppearances = {}
    attemptAppearanceIdentifationWithImportedModelUniform = (appearance, name, uniforms) => {
        if (name === `boneMatrices` && appearance.variable.arrayLength === 65) {
            // uniforms.boneMatrices = boneMatricesUniform
            uniformAppearances.boneMatrices = appearance
        }

        // if(name === `threeBindMatrix`) {
        //     uniformAppearances.threeBindMatrix = appearance
        // }

        //bindMatrix is a uniform. 
        //it's not necessarily this "holder" thing
    }

    attemptAppearanceIdentifationWithImportedModelIn = (appearance, name, geo) => {
        let nameForModel = name === `initialVertex` ? `position` : name
        if (attributes[nameForModel] !== undefined) {
            geo.setAttribute(nameForModel, attributes[nameForModel])
            inAppearances[nameForModel] = appearance
            //might be nice to check whether the setup of the variable in the buffer matches what we have here

            if(name === `skinIndex`) {
                //could point to the correct part of the skeleton
                //seems intuitive!
            }
        }

        // if(nameForModel === `position`)
        //     geo.setIndex(initialMesh.geometry.index)
    }
    
    let promise = new Promise(resolve => {
        new GLTFLoader().load('data/Soldier.glb', function (gltf) {
            
            model = gltf.scene
            log(model)
            
            initialMesh = model.children[0].children[1]
            attributes = initialMesh.geometry.attributes
            
            walkAnimation = gltf.animations[3]
            
            //but is this the same order in which they go in boneMatrices?
            
            firstBone = model.children[0].children[0]
            // firstBone.parent.updateMatrixWorld()
            
            setUpBindMatrix(firstBone)
            // log(firstBone.matrixWorld.getMaxScaleOnAxis())
            // log(v1.setFromMatrixPosition(firstBone.parent.matrixWorld))
            
            mixer = new THREE.AnimationMixer(model)
            let walkAction = mixer.clipAction(walkAnimation)
            walkAction._mixer._activateAction(walkAction)

            // so, maybe the indices are off
            // would be nice to visualize them

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

    let bmIndex = 0
    const identityMatrix = new THREE.Matrix4()
    let ourActualPosition = new THREE.Vector3()
    let childActualPosition = new THREE.Vector3()
    function setUpBindMatrix(bone) {
        bone.updateMatrixWorld()
        boneInverses[bmIndex] = bone.matrixWorld.clone()
        boneInverses[bmIndex].invert()
        // log(boneInverses[bmIndex].elements)
        ++bmIndex
        
        bone.children.forEach((child) => {
            setUpBindMatrix(child)
        })
    }
    let firstDesiredLength = -1
    function updateBoneMeshMatrix( bone ) {
        let bmIndexThisTime = bmIndex
        ++bmIndex

        bone.updateMatrixWorld()        
        let boneMeshMat = uniformAppearances.boneMatrices.meshes[bmIndexThisTime].matrix
        boneMeshMat.copy(bone.matrixWorld)
        
        let shaderMatrix = uniformAppearances.boneMatrices.state[bmIndexThisTime]
        shaderMatrix.multiplyMatrices(bone.matrixWorld, boneInverses[bmIndexThisTime])


        let desiredLength = Infinity
        bone.children.forEach((child)=>{
            updateBoneMeshMatrix(child )
        })
        ourActualPosition.setFromMatrixPosition(bone.matrixWorld)
        bone.children.forEach((child) => {
            childActualPosition.setFromMatrixPosition(child.matrixWorld)
            let dist = ourActualPosition.distanceTo(childActualPosition)
            if ( dist < desiredLength )
                desiredLength = dist
        })

        if(firstDesiredLength === -1)
            firstDesiredLength = desiredLength
        if(desiredLength === Infinity)
            desiredLength = firstDesiredLength

        for (let i = 0; i < 3; ++i) {
            v2.fromArray(boneMeshMat.elements, i * 4)
            v2.setLength(desiredLength )
            v2.toArray(boneMeshMat.elements, i * 4)
        }
    }
    
    paused = false
    return {
        promise,
        updateBones: () => {
            if(!paused)
                mixer.update(frameDelta)
            bmIndex = 0
            firstBone.parent.updateMatrixWorld()
            firstBone.parent.matrixWorld.copy(identityMatrix)
            updateBoneMeshMatrix(firstBone)
        }
    }
}