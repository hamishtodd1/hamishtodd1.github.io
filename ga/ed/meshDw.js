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

    let boneMeshes = []

    initGltf()
    let mixer = null
    let model = null
    let walkAnimation = null
    let firstBone = null
    
    let promise = new Promise(resolve => {
        new GLTFLoader().load('data/Soldier.glb', function (gltf) {
            
            model = gltf.scene

            // log(model.children[0].children[0])

            //so these fucking bones, aka model.children[0].children[0], are getting their position and quaternion updated
            initialMesh = model.children[0].children[1]
            attributes = initialMesh.geometry.attributes
            attributes.skinIndex
            log(attributes.skinIndex)
            // log(initialMesh.geometry.attributes)
            //scale: could getBoundingBox, zoom camera out that far (but not in infinityDw!)
            
            //current plan is to try to DIY. Need to find out how names get used
            
            walkAnimation = gltf.animations[3]
            let tracks = walkAnimation.tracks
            log(walkAnimation)

            let skeleton = new THREE.SkeletonHelper(model)
            //but is this the same order in which they go in boneMatrices?

            firstBone = model.children[0].children[0]
            firstBone.traverse((bone)=>{
                let boneMesh = BoneMesh()
                dw.addNonMentionChild(boneMesh)
                boneMeshes.push( boneMesh )
                boneMesh.matrixAutoUpdate = false
                log(bone)
            })
            
            mixer = new THREE.AnimationMixer(model)
            let walkAction = mixer.clipAction(walkAnimation)
            walkAction._mixer._activateAction(walkAction)

            //the hard part is attribution

            resolve()
        })
    })

    let appearances = {}
    setInIndex = (focussedIndex) => {
        
        //need to scale this shit too, if you're going to scale
        if(appearances.position !== undefined) {
            appearances.position.state.set(
                attributes.position.getX(focussedIndex),
                attributes.position.getY(focussedIndex),
                attributes.position.getZ(focussedIndex), 1. )
        }
        // if(appearances.skinIndex !== undefined) {
        //     appearances.skinIndex.state.set(
        //         attributes.skinIndex


        //         attributes.position.getX(focussedIndex),
        //         attributes.position.getY(focussedIndex),
        //         attributes.position.getZ(focussedIndex),
        //         attributes.position.getW(focussedIndex)
        //     )
        // }

        //gotta put skinWeight in there too

        //plan:
        // you need to interpolate keyframes yourself anyway. 
        //So, extract all this stuff
    }

    
    attemptAppearanceIdentifationWithImportedModelIn = (appearance, name, geo) => {
        let nameForModel = name === `initialVertex` ? `position` : name
        if (attributes[nameForModel] !== undefined) {
            geo.setAttribute(nameForModel, attributes[nameForModel])
            appearances[nameForModel] = appearance
            //might be nice to check whether the setup of the variable in the buffer matches what we have here
        }

        // if(nameForModel === `position`)
        //     geo.setIndex(initialMesh.geometry.index)
    }

    attemptAppearanceIdentifationWithImportedModelUniform = (appearance, name) => {
        let firstBone = model.children[0].children[0]
        if(name === `skinMatrices`) {
            // model.skinnedM
            
        }
    }

    let q1 = new THREE.Quaternion()
    let q2 = new THREE.Quaternion()
    let q3 = new THREE.Quaternion()

    let bmIndex = 0
    let identityMatrix = new THREE.Matrix4()
    function updateBoneMeshMatrix( bone, parentTransform ) {
        let bm = boneMeshes[bmIndex]
        v1.copy(bone.position)
        v1.multiplyScalar(.03)
        bm.matrix.compose(v1, bone.quaternion, oneOneOne)
        bm.matrix.premultiply(parentTransform)
        ++bmIndex
        bone.children.forEach((child)=>{
            updateBoneMeshMatrix(child, bm.matrix)
        })
    }

    let oneOneOne = new THREE.Vector3().setScalar(1.)
    
    let animationTime = 0.
    return {
        promise,
        update: () => {
            mixer.update(frameDelta)
            
            bmIndex = 0
            updateBoneMeshMatrix(firstBone, identityMatrix)
            




            // animationTime += frameDelta
            // if(animationTime > walkAnimation.duration)
            //     animationTime -= walkAnimation.duration
            // let tracks = walkAnimation.tracks
            // boneMeshes.forEach((bm,i)=>{
            //     let posiTrack = tracks[trackIndices[i]]
            //     let quatTrack = tracks[trackIndices[i]+1]

            //     let trackTimes = posiTrack.times
            //     let startIndex = -1
            //     for(let j = 0, jl = trackTimes.length; j < jl-1; ++j) {
            //         if (trackTimes[j] <= animationTime && animationTime < trackTimes[j+1]) {
            //             startIndex = j
            //             break
            //         }
            //     }
            //     let proportion = (animationTime - trackTimes[startIndex]) / (trackTimes[startIndex+1]-trackTimes[startIndex])
            //     // debugger
            //     v2.set(posiTrack.values[ startIndex    * 3 + 0], posiTrack.values[ startIndex    * 3 + 1], posiTrack.values[ startIndex    * 3 + 2])
            //     v3.set(posiTrack.values[(startIndex+1) * 3 + 0], posiTrack.values[(startIndex+1) * 3 + 1], posiTrack.values[(startIndex+1) * 3 + 2])
            //     v1.lerpVectors(v2, v3, proportion)

            //     q2.set(quatTrack.values[ startIndex    * 3 + 0], quatTrack.values[ startIndex    * 3 + 1], quatTrack.values[ startIndex    * 3 + 2], quatTrack.values[ startIndex    * 3 + 3])
            //     q3.set(quatTrack.values[(startIndex+1) * 3 + 0], quatTrack.values[(startIndex+1) * 3 + 1], quatTrack.values[(startIndex+1) * 3 + 2], quatTrack.values[(startIndex+1) * 3 + 3])
            //     q1.slerpQuaternions(q2, q3, proportion)
            //     // if(i===0)log(proportion)

            //     boneMeshes[i].position.copy(v1).multiplyScalar(.01)
            //     boneMeshes[i].quaternion.copy(q1)
            // })
        }
    }
}