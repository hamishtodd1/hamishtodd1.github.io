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
    let boneParentIndices = null
    let standinDqUniform = null
    dw.getInitialMeshAttributes = () => {
        return attributes
    }

    function updateBoneDqs(dqs) {
        let boneIndex = 0
        skeleton.bones.forEach((bone,i) => {
            if(bone.type === "Bone") {
                //calculate the dq 
                dq0.fromPosQuat(bone.position, bone.quaternion)
                if (boneParentIndices[i] === -1)
                    dqs[i].copy(dq0)
                else {
                    dqs[boneParentIndices[i]].mul(dq0, dqs[i])
                }

                ++boneIndex
            }
        })
    }
    
    initGltf()
    let mixer = null

    let meshAppearances = {}
    
    let promise = new Promise(resolve => {
        new GLTFLoader().load('data/Soldier.glb', function (gltf) {
            
            let model = gltf.scene
            mixer = new THREE.AnimationMixer(model)
            
            let initialMesh = model.children[0].children[1]
            attributes = initialMesh.geometry.attributes
            skeleton = initialMesh.skeleton

            let numBones = skeleton.bones.length
            boneParentIndices = Array(numBones)
            boneInverseDqs = Array(numBones)
            skeleton.bones.forEach((bone,i)=>{
                boneInverseDqs[i] = new Dq()
                boneParentIndices[i] = skeleton.bones.indexOf(bone.parent)
            })
            standinDqUniform = Array(numBones)

            updateBoneDqs(boneInverseDqs)
            boneInverseDqs.forEach((boneInverseDq) => {
                boneInverseDq.reverseSelf()
            })
            
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
            meshAppearances.boneMatrices = appearance
        }

        if (name === `boneDqs` && appearance.variable.arrayLength === skeleton.bones.length) {
            // meshAppearances.boneDqs = appearance
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
    let parentWorldPosition = new THREE.Vector3()
    let childWorldPosition = new THREE.Vector3()
    let firstDesiredLength = -1
    updateBoneMeshes = () => {
        skeleton.bones.forEach((bone, i) => {
            let desiredLength = Infinity

            let boneMeshMat = meshAppearances.boneMatrices.meshes[i].matrix
            boneMeshMat.copy(bone.matrixWorld)

            parentWorldPosition.setFromMatrixPosition(bone.matrixWorld)
            bone.children.forEach((child) => {
                childWorldPosition.setFromMatrixPosition(child.matrixWorld)
                let dist = parentWorldPosition.distanceTo(childWorldPosition)
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

    return {
        promise,
        updateAnimation: () => {
            mixer.update(frameDelta)

            if(meshAppearances.boneMatrices !== undefined) {
                skeleton.bones.forEach((bone, i) => {
                    bone.updateMatrixWorld()

                    //what the *shader* calls the bone matrix. Different from bone.matrix
                    let boneMatrix = meshAppearances.boneMatrices.state[i]
                    boneMatrix.multiplyMatrices(bone.matrixWorld, skeleton.boneInverses[i])
                })
            }

            if (meshAppearances.boneDqs !== undefined) {
                skeleton.bones.forEach((bone, i) => {
                    // let boneDq = meshAppearances.boneDqs.state[i]
                    // let boneDq = standinDqUniform[i]
                    // updateBoneDqs(standinDqUniform)

                    // dq0.fromMat4(bone.matrixWorld).mul( boneInverseDqs[i], boneDq)
                })
            }
        }
    }
}