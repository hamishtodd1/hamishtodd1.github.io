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
        let shaftRadius = .08
        let headHeight = shaftRadius * 5.
        let headRimRadius = shaftRadius * 3.
        let headGeo = new THREE.ConeBufferGeometry(1., 1.)
        headGeo.translate(0., -.5, 0.)
        let shaftGeo = CylinderBufferGeometryUncentered(1., 1., 8, true)

        camera.whenZoomChangeds.push((amt) => {
            shaftRadius *= amt
            headRimRadius = shaftRadius * 3.
            headHeight = shaftRadius * 5.
        })

        vDw.ArrowHeadAndShaft = (mat) => {
            let ret = vDw.NewGroup()

            let head = new THREE.Mesh(headGeo, mat)
            let shaft = new THREE.Mesh(shaftGeo, mat)
            let currentVec = new THREE.Vector3()
            let currentOrigin = new THREE.Vector3()
            ret.add(head, shaft)

            head.castShadow = true
            shaft.castShadow = true
            head.matrixAutoUpdate = false
            shaft.matrixAutoUpdate = false

            camera.whenZoomChangeds.push((amt) => {
                ret.setVec(currentVec,currentOrigin)
            })

            ret.setVec = (newVec, origin) => {
                currentOrigin.copy(origin)
                currentVec.copy(newVec)
                if (newVec.equals(zeroVector)) {
                    head.matrix.setPosition(OUT_OF_SIGHT_VECTOR3)
                    shaft.matrix.setPosition(OUT_OF_SIGHT_VECTOR3)
                }
                else {
                    let shaftVec = v1.copy(newVec).setLength(newVec.length() - headHeight).multiplyScalar(1./shaftRadius)
                    setRotationallySymmetricMatrix(shaftVec.x, shaftVec.y, shaftVec.z, shaft.matrix)
                    shaft.matrix.multiplyScaleScalar(shaftRadius)
                    shaft.matrix.setPosition(origin)

                    let headVec = v1.copy(newVec).setLength(headHeight).multiplyScalar(1. / headRimRadius)
                    setRotationallySymmetricMatrix(headVec.x, headVec.y, headVec.z, head.matrix)
                    head.matrix.multiplyScaleScalar(headRimRadius)

                    let tipPosition = v1.copy(newVec).add(origin)
                    head.matrix.setPosition(tipPosition)
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
    camera.scalesToChange.push(yAxis.scale)
    let xAxis = new THREE.Mesh(axisGeo, axisMat)
    xAxis.rotation.x = TAU / 4.
    vDw.addNonMentionChild(xAxis)
    camera.scalesToChange.push(xAxis.scale)
    let zAxis = new THREE.Mesh(axisGeo, axisMat)
    zAxis.rotation.z = TAU / 4.
    vDw.addNonMentionChild(zAxis)
    camera.scalesToChange.push(zAxis.scale)

    let markers = []
    let axisNames = ["x", "y", "z"]
    let markerHeight = .4

    let numbersToMark = [1,-1]
    for (let i = 1; i < 126; i *= 10) {
        for (let j = i, jl = i * 10; j < jl; j += i) {
            numbersToMark.push(j, -j)
        }
    }

    numbersToMark.forEach((num,i) => {
        for (let j = 0; j < 3; ++j) {
            let marker = text(num.toString())
            marker.scale.multiplyScalar(markerHeight)
            marker.position[axisNames[j]] = num
            marker.position.y -= .5 * markerHeight
            vDw.addNonMentionChild(marker)
            markers[i*3+j] = marker
        }
    })
    
    markers.forEach((marker) => {
        camera.toCopyQuatTo.push(marker)
    })
    camera.whenZoomChangeds.push((amt)=>{
        let cameraDist = camera.position.length()
        markerHeight *= amt
        numbersToMark.forEach((num, i) => {
            for (let j = 0; j < 3; ++j) {
                let marker = markers[i * 3 + j]
                marker.scale.multiplyScalar(amt)
                marker.position.set(0.,-.5*markerHeight,0.)
                marker.position[axisNames[j]] += num
                let dist = Math.abs(marker.position.manhattanLength())
                marker.visible = cameraDist > dist && dist > .1 * cameraDist
            }
        })
    })
}