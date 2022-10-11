function initColumn0d() {
    let line2dGeo = new THREE.PlaneGeometry(.05, 999.)
    let cylGeo = new THREE.CylinderBufferGeometry(.05, .05, 999., 8, 1, true)

    let spacetimeDiagram = new Dw(0, 0)
    {
        let line2dMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
        let e1Line = new THREE.Mesh(cylGeo, line2dMat)
        spacetimeDiagram.scene.add(e1Line)
        let e2Line = new THREE.Mesh(cylGeo, line2dMat)
        e2Line.rotation.z = TAU / 4.
        spacetimeDiagram.scene.add(e2Line)
    }
}