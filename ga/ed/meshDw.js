/*
    The skin indices indicate bones
    Would be intuitive to point to the correct bone in the window

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

setInIndex = () => {}
attemptAppearanceIdentifationWithImportedModelIn = () => {}

attemptAppearanceIdentifationWithImportedModelUniform = () => {}

function initMeshDw(wantAnimation) {
    let inAppearances = {}
    let arrayGetter = new Float32Array(4)
    let coordGetters = [`getX`, `getY`, `getZ`, `getW`]
    setInIndex = (focussedIndex) => {
        Object.keys(inAppearances).forEach((key) => {
            let appearance = inAppearances[key]
            for (let i = 0; i < appearance.variable.type.numFloats; ++i)
                arrayGetter[i] = initialMeshData[key][coordGetters[i]](focussedIndex)
            if (key === `position`)
                arrayGetter[3] = 1. //getW will have been attempted, but will have resulted in garbage
            appearance.floatArrayToState(arrayGetter)
        })
    }

    attemptAppearanceIdentifationWithImportedModelIn = (appearance, name, geo) => {
        if (initialMeshData === null)
            return

        let nameForModel = name === `initialVertex` ? `position` : name
        if (initialMeshData[nameForModel] !== undefined) {
            geo.setAttribute(nameForModel, initialMeshData[nameForModel])
            inAppearances[nameForModel] = appearance
            //might be nice to check whether the setup of the variable in the buffer matches what we have here
        }
    }

    if (wantAnimation)
        return initAnimatedGltf()
    else
        return initStaticObj()
}

function initStaticObj() {

    let geo
    let texture

    function whenBothLoaded() {
        geo.scale(1.9, 1.9, 1.9)
        geo.rotateY(TAU * .5)
        
        initialMeshData = geo.attributes
        
        initialMeshData.texture = texture
    }

    let promise = new Promise(resolve => {
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

        textureLoader.load('data/spot_texture.png', (tex) => {
            texture = tex
        })
        objLoader.load('data/spot_control_mesh.obj', function (object) {
            object.traverse(function (child) {
                if (child.isMesh)
                    geo = child.geometry
            })
        }, onModelLoadProgress, (err) => {
            log(err)
        })
    })

    // let promise = new Promise(resolve => {
    //     let loader = new THREE.OBJLoader()
    //     loader.load('https://hamishtodd1.github.io/ga/ed/data/heart.obj', function (obj) {

    //         let geo = obj.children[0].geometry //new THREE.WireframeGeometry(obj.children[0].geometry)
    //         geo.scale(.03,.03,.03)
    //         geo.translate(-.1,-1.05,0.)
    //         initialMeshData = geo.attributes

    //         resolve()
    //     }, () => { }, (e) => { console.error(e) })
    // })

    return {
        promise,
        updateAnimation: () => {}
    }
}

function initAnimatedGltf() {
    zoomCameraToDist(260.)

    let skeleton = null
    let boneInverseDqs = null
    let boneMeshes = null

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
    function updateBoneMeshes() {
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
        let loader = new GLTFLoader()
        loader.load('https://hamishtodd1.github.io/ga/ed/data/Soldier.glb', function (gltf) {
            
            let model = gltf.scene
            mixer = new THREE.AnimationMixer(model)
            
            let initialMesh = model.children[0].children[1]
            initialMeshData = initialMesh.geometry.attributes

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
        },()=>{},(e)=>{console.error(e)})
    })

    

    attemptAppearanceIdentifationWithImportedModelUniform = (appearance, name, uniforms) => {        
        if (name === `boneMatrices` || name === `boneDqs` ) {
            let correctLength = appearance.variable.arrayLength === skeleton.bones.length
            if(correctLength)
                meshAppearances[name] = appearance
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