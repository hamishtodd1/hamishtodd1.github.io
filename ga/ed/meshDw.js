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
    
    let attributes = null
    let skeleton = null
    let boneInverseDqs = null
    dw.getInitialMeshAttributes = () => {
        return attributes
    }
    
    initGltf()
    let mixer = null

    let uniformAppearances = {}
    
    let promise = new Promise(resolve => {
        new GLTFLoader().load('data/Soldier.glb', function (gltf) {
            
            let model = gltf.scene
            mixer = new THREE.AnimationMixer(model)
            
            let initialMesh = model.children[0].children[1]
            attributes = initialMesh.geometry.attributes
            skeleton = initialMesh.skeleton
            
            let walkAnimation = gltf.animations[3]
            let walkAction = mixer.clipAction(walkAnimation)
            walkAction._mixer._activateAction(walkAction)

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
                arrayGetter[3] = 1. //getW will have been attempted, but will have resulted in garbage
            appearance.floatArrayToState(arrayGetter)
        })
    }

    attemptAppearanceIdentifationWithImportedModelUniform = (appearance, name, uniforms) => {
        if (name === `boneMatrices` && appearance.variable.arrayLength === skeleton.bones.length) {
            // uniforms.boneMatrices = boneMatricesUniform
            uniformAppearances.boneMatrices = appearance
        }

        if (name === `boneDqs` && appearance.variable.arrayLength === skeleton.bones.length) {
            skeleton.bones.forEach((bone, i) => {
                boneDqs[i] = new Dq()
                boneInverseDqs[i] = new Dq()

                bone.updateMatrixWorld()
                m1.copy(bone.matrixWorld).invert() //will be a bit more satisfying to invert the dq (reverse)
                boneInverseDqs[i].fromMat4(m1)
            })
        }
    }

    attemptAppearanceIdentifationWithImportedModelIn = (appearance, name, geo) => {
        let nameForModel = name === `initialVertex` ? `position` : name
        if (attributes[nameForModel] !== undefined) {
            geo.setAttribute(nameForModel, attributes[nameForModel])
            inAppearances[nameForModel] = appearance
            //might be nice to check whether the setup of the variable in the buffer matches what we have here

            if (name === `skinIndex`) {
                //could point to the correct bone mesh in the skeleton
                //seems intuitive!
            }
        }
    }

    //for updating bone meshes
    let ourActualPosition = new THREE.Vector3()
    let childActualPosition = new THREE.Vector3()
    let firstDesiredLength = -1
    
    return {
        promise,
        updateBones: () => {
            mixer.update(frameDelta)

            skeleton.bones.forEach((bone,i)=>{
                bone.updateMatrixWorld()

                //what the *shader* calls the bone matrix. Different from bone.matrix
                let boneMatrix = uniformAppearances.boneMatrices.state[i]
                boneMatrix.multiplyMatrices(bone.matrixWorld, skeleton.boneInverses[i])

                // let boneDq = uniformAppearances.boneDqs.state[i]
                // dq0.fromMat4(bone.matrixWorld).mul( boneInverseDqs[i], boneDq)
            })

            skeleton.bones.forEach((bone, i) => {
                let desiredLength = Infinity

                let boneMeshMat = uniformAppearances.boneMatrices.meshes[i].matrix
                boneMeshMat.copy(bone.matrixWorld)
                
                ourActualPosition.setFromMatrixPosition(bone.matrixWorld)
                bone.children.forEach((child) => {
                    childActualPosition.setFromMatrixPosition(child.matrixWorld)
                    let dist = ourActualPosition.distanceTo(childActualPosition)
                    if (dist < desiredLength)
                        desiredLength = dist
                })

                if (firstDesiredLength === -1)
                    firstDesiredLength = desiredLength
                if (desiredLength === Infinity)
                    desiredLength = firstDesiredLength

                for (let i = 0; i < 3; ++i) {
                    v2.fromArray(boneMeshMat.elements, i * 4)
                    v2.setLength(desiredLength)
                    v2.toArray(boneMeshMat.elements, i * 4)
                }
            })
        }
    }
}