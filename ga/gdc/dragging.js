function initDragging(planeVizes) {
    let numWaves = 40
    let waveMat = new THREE.MeshPhongMaterial({ transparent: true, opacity: .3, color: 0xFFFFFF })
    let waveGeo = new THREE.SphereGeometry(.2, 12, 4, 0, TAU, 0., .3)
    let waves = new THREE.InstancedMesh(waveGeo, waveMat, numWaves)
    let wavesLookDummy = new THREE.Object3D()
    scene.add(waves)
    waves.visible = false

    let dragGroupOrigin = new Mv()
    let dragGroupColor = new THREE.Color(1., 1., 1.)

    let grabbedViz = null
    let grabIndicator = new THREE.Mesh(new THREE.SphereGeometry(.05))
    let dragPlane = new Mv()
    let initialGrabPosition = new THREE.Vector3()
    scene.add(grabIndicator)
    bindButton(`a`,
        () => {
            let closestDist = Infinity
            planeVizes.forEach((pv) => {
                meet(mouseRay, pv.state, mv0).toVec(v1)
                if (v1.distanceTo(pv.mesh.position) < .4 && v1.distanceTo(camera.position) < closestDist) {
                    camera.frustum.near.projectOn(mv0, dragPlane)

                    closestDist = v1.distanceTo(camera.position)

                    grabIndicator.position.copy(v1)
                    grabIndicator.visible = true
                    grabbedViz = pv

                    dragGroupOrigin.copy(grabbedViz.groupOrigin)

                    initialGrabPosition.copy(v1)

                    // waves.visible = true
                    // wavesLookDummy.position.copy(initialGrabPosition)
                }
            })
        },
        () => {
            if (grabbedViz !== null) {
                meet(dragPlane, mouseRay, mv0).toVec(grabIndicator.position)

                // wavesLookDummy.lookAt(grabIndicator.position)
                // for (let i = 0; i < numWaves; ++i) {
                // 	// m1.makeRotationFromQuaternion(wavesLookDummy.quaternion)
                // 	m1.identity()
                // 	v1.subVectors(grabIndicator.position, initialGrabPosition)
                // 	v1.setLength(1. - i * .05)
                // 	v1.add(initialGrabPosition)
                // 	m1.setPosition(v1)
                // 	waves.setMatrixAt(i, m1)
                // }
                // waves.instanceMatrix.needsUpdate = true
            }
        },
        () => {
            if (grabbedViz !== null) {
                let constGroupDist = constGroupOrigin.toVec(v1).distanceTo(grabIndicator.position)
                let workBoxDist = workBox.position.distanceTo(grabIndicator.position)

                if (workBoxDist < constGroupDist) {
                    let translator = mv0.fromPointToPoint(grabbedViz.groupOrigin, workBox.groupOrigin)
                    grabbedViz.state.applyTransformation(translator)
                    grabbedViz.groupOrigin = workBox.groupOrigin
                }

                waves.visible = false
                grabIndicator.visible = false
            }
        }
    )
}