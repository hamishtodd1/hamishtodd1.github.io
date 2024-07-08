function initDraft() {

    // initSurroundingsAndMaterial()

    function makeSteeringSphere(col) {
        let lod = 16
        const largeGeo = new THREE.OctahedronGeometry(1., lod)
        let large = new THREE.Mesh(largeGeo, new THREE.MeshPhongMaterial({ color: 0x444444, side: THREE.BackSide }))
        large.receiveShadow = true
        large.position.y = 1.3
        large.position.z = -.5
        scene.add(large)

        let bandAngle = .01
        let loopGeo = new THREE.SphereGeometry(1., lod * 4., 2, 0., TAU, TAU / 4. - bandAngle / 2., bandAngle)
        let loopMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.FrontSide })
        {
            function addLoop(rotX, rotY) {
                let loop = new THREE.Mesh(loopGeo, loopMat)
                loop.rotation.x = rotX
                loop.rotation.z = rotY
                large.add(loop)
            }
            addLoop(0., 0.)
            for (let i = 0; i < 8; ++i)
                addLoop(TAU / 4., TAU / 8. * i)
        }

        let smallMat = new THREE.MeshPhongMaterial({
            color: col,
            shininess: 100,
        })
        let small = new THREE.Mesh(largeGeo, smallMat)
        small.castShadow = true
        small.scale.set(Math.random(), Math.random(), Math.random()).multiplyScalar(.5)
        small.position.set(Math.random() - .5, Math.random() - .5, Math.random() * -.5)
        small.rotation.set(TAU * Math.random(), TAU * Math.random(), TAU * Math.random())
        large.add(small)

        let eyeRadius = .04
        let eyes = Array(2)
        let laggingHandPosition = new Fl()
        {
            let whitesMat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF })
            let pupilsMat = new THREE.MeshPhongMaterial({ color: 0x000000 })
            for (let i = 0; i < 2; ++i) {
                eyes[i] = new THREE.Mesh(largeGeo, whitesMat)
                let eye = eyes[i]
                eye.scale.setScalar(eyeRadius)
                scene.add(eye)

                let pupil = new THREE.Mesh(largeGeo, pupilsMat)
                pupil.scale.setScalar(.4)
                pupil.scale.z = .2
                pupil.position.z = 1.
                eye.add(pupil)
            }

            large.update = () => {
                eyes.forEach((eye, i) => {
                    //no, you want to go toward camera
                    v1.subVectors(camera.position, small.position).normalize()
                    v1.add(small.position).add(large.position)
                    small.worldToLocal(v1)
                    v1.normalize() //put it on the surface
                    small.localToWorld(v1)
                    eye.position.copy(v1)
                    eye.position.x += eyeRadius * (i ? 1. : -1.)

                    //wanna put them at the point on the sphere with z = max. Aaand then probably a little further out from there

                    laggingHandPosition.lerpSelf(handPosition, .04)
                    eye.lookAt(laggingHandPosition.pointToVertex(v1))
                })
            }
        }

        return large
    }

    let steeringSpheres = []
    steeringSpheres[0] = makeSteeringSphere(0xFFAA00)
    steeringSpheres[0].position.x = 1.3
    steeringSpheres[1] = makeSteeringSphere(0xFF0000)
    steeringSpheres[1].position.x = -1.3

    updateSteeringSpheres = () => {
        steeringSpheres[0].update()
        steeringSpheres[1].update()
    }
}

// async function initSurroundingsAndMaterial() {

//     renderer.outputEncoding = THREE.sRGBEncoding

//     await new Promise(resolve => {
//         new RGBELoader().load('data/pedestrian_overpass_1k.hdr', function (texture) {

//             texture.mapping = THREE.EquirectangularReflectionMapping;

//             niceMat = (hue, extraParams) => {
//                 const diffuseColor = new THREE.Color().setHSL(hue, 0.5, 0.25)

//                 let params = {
//                     color: diffuseColor,
//                     metalness: 0,
//                     roughness: 0.5,
//                     clearcoat: 1.,
//                     clearcoatRoughness: 0.,
//                     reflectivity: 1.,
//                     envMap: texture,

//                     side: THREE.DoubleSide
//                 }
//                 Object.assign(params, extraParams)
//                 let mat = new THREE.MeshPhysicalMaterial(params)

//                 return mat
//             }

//             resolve()
//         })
//     })
// }