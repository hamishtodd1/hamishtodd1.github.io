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
    let dw = new Dw(`mesh`, true, camera, false)
    
    let object

    dws.mesh.getCow = () =>{
        return object
    }

    // let boneGeo = new THREE.WireframeGeometry(new THREE.OctahedronGeometry(.2))
    // for (let i = 1, il = boneGeo.attributes.position.array.length; i < il; i+=3) {
    //     if(i % 3 === 1) {
    //         if (boneGeo.attributes.position.array[i] > 0.)
    //             boneGeo.attributes.position.array[i] = 1.
    //         else if (boneGeo.attributes.position.array[i] < 0.)
    //             boneGeo.attributes.position.array[i] = 0.
    //         else
    //             boneGeo.attributes.position.array[i] = .2
    //     }
    // }
    // let bone = new THREE.LineSegments(boneGeo, new THREE.MeshBasicMaterial({ color: 0xFFFFFF }))
    // bone.position.x += 1.5
    // dw.addNonMentionChild(bone)

    focusInExample = (appearance, focussedIndex) => {
        appearance.state.set(
            object.geometry.attributes.position.getX(focussedIndex),
            object.geometry.attributes.position.getY(focussedIndex),
            object.geometry.attributes.position.getZ(focussedIndex), 1. )
        //aaaaaand you probably need updateStateFromAttribute. Awesome
        //but at least the value is the state for vertices

        appearance.updateFromState()
    }

    createIn = (geo, appearance) => {

        let name = appearance.variable.name

        if(name === `initialVertex`) {
            geo.setAttribute('position', object.geometry.attributes.position)
            focusInExample(appearance, 0)
        }
        else if(name === `fragmentPosition`) {
            //you want to hover fragmentPosition and it points to the frag window
            //eg, we cast a ray in that window
            //urgh but the idea of fragments is that they come after the vertex shader
            //render the whole mesh once, but not *shading* fragments
            //instead, every fragment just has "if (fragment.xy == mouse.xy) {something}"
            //"something" will make it on the CPU side you can know... what? the uv?

            //alternatively, just say where in the *untransformed* mesh you'd like to originate from
            //this does actually cover the fullscreen quad case
        }



        // else {
        //     let inArray = new Float32Array(type.numFloats * numVertices)
        //     for (let i = 0, il = inArray.length; i < il; ++i)
        //         inArray[i] = Math.random() - .5
        //     geo.setAttribute(name, new THREE.BufferAttribute(inArray, type.numFloats))
        // }
    }

    dw.mouseRayIntersection = (targetMv) => {
        //mouseRay to threeRay
        let mouseRay = getMouseRay(dw)
        meet(e0, mouseRay, mouseRayDirection).toVector(threeRay.direction)
        threeRay.direction.normalize()

        threeRay.origin.copy(camera.position)

        if (fromBehind) {
            threeRay.origin.addScaledVector(threeRay.direction, 999.) //so put it far behind camera
            threeRay.direction.multiplyScalar(-1.)
        }

        let result = threeRay.intersectSphere(threeSphere, v1)
        if (result === null) {
            camera.frustum.far.projectOn(e123, frustumOnOrigin)
            // frustumOnOrigin.log()
            meet(mouseRay, frustumOnOrigin, targetMv)
        }
        else
            targetMv.fromVec(v1)

        targetMv[14] = 0.
        return targetMv
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
                    // object = new THREE.LineSegments(new THREE.WireframeGeometry(child.geometry),new THREE.MeshBasicMaterial({color:0xFFFFFF}))
                    object = child
                    // object.visible = false
                    // child.geometry.computeVertexNormals()
                    // child.geometry.normalizeNormals()
                }
            })            
        }, onModelLoadProgress, (err) => {
            log(err)
        })
    })
}