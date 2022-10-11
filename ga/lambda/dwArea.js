function initDwArea() {

    // {
    //     const curve = new THREE.CubicBezierCurve3(
    //         new THREE.Vector3(-10, 0, 0),
    //         new THREE.Vector3(-5, 15, 0),
    //         new THREE.Vector3(20, 15, 0),
    //         new THREE.Vector3(10, 0, 0)
    //     );

    //     const points = curve.getPoints(50);
    //     const geometry = new THREE.BufferGeometry().setFromPoints(points);

    //     const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    //     // Create the final object to add to the scene
    //     const curveObject = new THREE.Line(geometry, material);
    // }

    scene.add(dwArea)
    dwArea.position.z = .1

    let bg = new THREE.Mesh(new THREE.PlaneGeometry(100.,4.5), new THREE.MeshBasicMaterial({color:0x333333}))
    dwArea.add(bg)

    const downwardPyramidGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0., 0., 0.),
            new THREE.Vector3(.3, .3, 0.),
            new THREE.Vector3(-.3, .3, 0.),
        ])

    let markerMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF })

    {
        let headLen = .5
        let headRadius = .3
        let headGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0., 0., 0.),
            new THREE.Vector3(-headLen,  headRadius / 2., 0.),
            new THREE.Vector3(-headLen, -headRadius / 2., 0.),
        ])
        let shaftGeo = new THREE.PlaneGeometry(1., headRadius / 2.)
        shaftGeo.translate(-.5, 0., 0.)
        let numArrows = 0
        getArrowStackY = (i) => {
            return -headRadius * 2. * (i + .5)
        }
        Arrow = () => {
            let head = new THREE.Mesh(headGeo, markerMat)
            
            let shaft = new THREE.Mesh(shaftGeo, markerMat)
            head.add(shaft)
            shaft.position.x = -headLen

            dwArea.add(head)
            ++numArrows

            head.setLength = (len) => {
                shaft.scale.x = len - headLen
            }
            head.setOrigin = (x,y,z=0.) => {
                let len = shaft.scale.x + headLen
                head.position.set(x + len,y,z)
            }

            return head
        }
    }

    addNamedMarker = (name) => {
        let markerMesh = new THREE.Mesh(downwardPyramidGeo, markerMat)
        dwArea.add(markerMesh)

        let label = text(name, false)
        label.scale.multiplyScalar(.6)
        label.position.y = .3 + label.scale.y / 2.
        markerMesh.add(label)

        return markerMesh
    }


    let axisGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-12.5, 0., 0.),
        new THREE.Vector3(12.5, 0., 0.)])
    let notchGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0., 0., 0.),
        new THREE.Vector3(0., -.15, 0.)])

    const axisMat = new THREE.LineBasicMaterial({
        color: 0xFFFFFF
    })
    dwArea.add(new THREE.Line(axisGeo, axisMat))

    let furthestMarkers = 12
    for (let i = -furthestMarkers; i <= furthestMarkers; ++i) {
        let notchNumber = text(i.toString())
        notchNumber.position.x = i
        notchNumber.scale.multiplyScalar(.5)
        notchNumber.position.y -= notchNumber.scale.y * .7
        dwArea.add(notchNumber)

        let notch = new THREE.Line(notchGeo, axisMat)
        notch.position.x = i
        dwArea.add(notch)
    }

    dwArea.position.y = -3.2

    dwArea.scale.multiplyScalar(.36)

    return dwArea
}