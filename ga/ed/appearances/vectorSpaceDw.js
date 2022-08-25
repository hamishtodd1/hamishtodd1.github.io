// matrices in here. little parallelipipeds with their edges extended past the corners

async function initVectorSpaceDw() { 

    let vDw = new Dw("vectorSpace", true)

    // let rgbCube = new THREE.Mesh(new THREE.BoxGeometry(1.,1.,1.), new THREE.ShaderMaterial())
    // rgbCube.geometry.translate(.5, .5, .5)
    // rgbCube.material.vertexShader = basicVertex
    // rgbCube.material.fragmentShader = await getTextFile('shaders/rgbCube.glsl')
    // rgbCube.material.transparent = true
    // dw.addNonMentionChild(rgbCube)

    {
        let shaftRadius = .06
        let headHeight = shaftRadius * 5.
        let headGeo = new THREE.ConeBufferGeometry(shaftRadius * 3., 1.)
        headGeo.translate(0., -.5, 0.)
        let shaftGeo = CylinderBufferGeometryUncentered(shaftRadius, 1., 8, true)

        vDw.ArrowGroup = (mat) => {
            let ret = vDw.NewGroup()

            let head = new THREE.Mesh(headGeo, mat)
            let shaft = new THREE.Mesh(shaftGeo, mat)
            ret.add(head, shaft)

            head.castShadow = true
            shaft.castShadow = true
            head.matrixAutoUpdate = false
            shaft.matrixAutoUpdate = false

            ret.setVec = (newVec) => {
                if (newVec.equals(zeroVector)) {
                    head.matrix.setPosition(OUT_OF_SIGHT_VECTOR3)
                    shaft.matrix.setPosition(OUT_OF_SIGHT_VECTOR3)
                }
                else {
                    let shaftVec = v1.copy(newVec).setLength(newVec.length() - headHeight)
                    setRotationallySymmetricMatrix(shaftVec.x, shaftVec.y, shaftVec.z, shaft.matrix)
                    let headVec = v1.copy(newVec).setLength(headHeight)
                    setRotationallySymmetricMatrix(headVec.x, headVec.y, headVec.z, head.matrix)
                    head.matrix.setPosition(newVec)
                }
            }

            return ret
        }
    }

    let axisRadius = .02
    let axisMat = new THREE.MeshPhongMaterial({ color: 0xCCCCCC })
    let axisGeo = new THREE.CylinderBufferGeometry(axisRadius, axisRadius, 20.,);

    let yAxis = new THREE.Mesh(axisGeo, axisMat)
    vDw.addNonMentionChild(yAxis)
    let xAxis = new THREE.Mesh(axisGeo, axisMat)
    xAxis.rotation.x = TAU / 4.
    vDw.addNonMentionChild(xAxis)
    let zAxis = new THREE.Mesh(axisGeo, axisMat)
    zAxis.rotation.z = TAU / 4.
    vDw.addNonMentionChild(zAxis)

    let markers = []
    let axisNames = ["x", "y", "z"]
    let markerHeight = .3

    let furthestMarkers = 8
    for (let i = -furthestMarkers; i <= furthestMarkers; ++i) {
        for (let j = 0; j < (i === 0 ? 1 : 3); ++j) {
            let marker = text(i.toString())
            marker.scale.multiplyScalar(markerHeight)
            marker.position[axisNames[j]] = i
            marker.position.y -= .5 * markerHeight
            vDw.addNonMentionChild(marker)
            markers.push(marker)
        }
    }
    markers.forEach((marker) => {
        camera.toCopyQuatTo.push(marker)
    })
}