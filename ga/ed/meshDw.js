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
    let dw = new Dw(`mesh`, true, camera, false) //really should be "initialMesh"
    
    let initialMesh = null
    dw.getInitialMesh = () => { return initialMesh }

    let mixer = null
    initGltf()
    let promise = new Promise(resolve => {
        new GLTFLoader().load('data/Soldier.glb', function (gltf) {
            //for now just get the vertices in there
            
            let model = gltf.scene
            initialMesh = model.children[0].children[1]
            
            let firstBone = model.children[0].children[0]
            
            let walkAnimation = gltf.animations[3]
            //the tracks are all in walkAnimation.tracks

            // mixer = new THREE.AnimationMixer(model)
            // let walkAction = mixer.clipAction(walkAnimation)
            // walkAction._mixer._activateAction(walkAction)

            resolve()
        })
    })

    setInVertexFromInitialMesh = (appearance, focussedIndex) => {
        const initialMeshVertices = initialMesh.geometry.attributes.position
        appearance.state.set(
            initialMeshVertices.getX(focussedIndex),
            initialMeshVertices.getY(focussedIndex),
            initialMeshVertices.getZ(focussedIndex), 1. )
    }

    createIn = (geo, appearance) => {
        let name = appearance.variable.name

        if(name === `initialVertex`) {
            geo.setAttribute('position', initialMesh.geometry.attributes.position)
            setInVertexFromInitialMesh(appearance, 0)
        }
    }

    return {
        promise,
        update: () => {
            // mixer.update(frameDelta)
        }
    }
}