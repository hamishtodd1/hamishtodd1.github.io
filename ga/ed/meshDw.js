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
    // dw.elem.style.display = 'none'
    
    let attributes = null
    let skeleton = null
    let boneInverseDqs = null
    let boneMeshes = null
    dw.getInitialMeshAttributes = () => {
        return attributes
    }

    let boneMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
    let boneGeo = new THREE.WireframeGeometry(new THREE.OctahedronGeometry(1.))
    {
        let arr = boneGeo.attributes.position.array
        for (let i = 1, il = arr.length; i < il; i += 3) {
            if (i % 3 === 1) { //y coordinate
                if (arr[i] < 0.) arr[i] = 0.
                else if (arr[i] === 0.) {
                    arr[i] = .2
                    arr[i - 1] *= .2
                    arr[i + 1] *= .2
                }
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

            let boneMeshMat = boneMeshes[i].matrix
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

    function getBoneDqs(targetDqs) {
        skeleton.bones.forEach((bone,i) => {
            if(bone.type === "Bone") {
                dq0.fromPosQuat(bone.position, bone.quaternion)
                let boneParentIndex = skeleton.bones.indexOf(bone.parent)
                if (boneParentIndex === -1)
                    targetDqs[i].copy(dq0)
                else
                    targetDqs[boneParentIndex].mul(dq0, targetDqs[i])
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

            boneMeshes = Array(skeleton.bones.length)
            for (let i = 0; i < numBones; ++i) {
                boneMeshes[i] = new THREE.LineSegments(boneGeo, boneMat)
                dws.untransformed.addNonMentionChild(boneMeshes[i])
                boneMeshes[i].matrixAutoUpdate = false
            }

            boneInverseDqs = Array(numBones)
            skeleton.bones.forEach((bone,i)=>{
                boneInverseDqs[i] = new Dq()
            })
            getBoneDqs(boneInverseDqs)
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
        if (name === `boneMatrices` || name === `boneDqs` ) {
            let correctLength = appearance.variable.arrayLength === skeleton.bones.length
            if(correctLength)
                meshAppearances[name] = appearance
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

    return {
        promise,
        updateAnimation: () => {
            mixer.update(frameDelta)

            updateBoneMeshes()

            if(meshAppearances.boneMatrices !== undefined) {
                skeleton.bones.forEach((bone, i) => {
                    bone.updateMatrixWorld()

                    let boneMatrix = meshAppearances.boneMatrices.state[i]
                    boneMatrix.multiplyMatrices(bone.matrixWorld, skeleton.boneInverses[i])
                })
            }

            if (meshAppearances.boneDqs !== undefined) {
                getBoneDqs(meshAppearances.boneDqs.state)
                skeleton.bones.forEach((bone, i) => {
                    let boneDq = meshAppearances.boneDqs.state[i]
                    dq0.copy(boneDq)
                    dq0.mul(boneDq, boneInverseDqs[i])
                })
            }
        }
    }
}