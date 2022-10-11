function initColumn1d() {
    let usualCgaAmbient = new Dw(1, 0)
    
    let coneMat = new THREE.MeshPhongMaterial({
        color: 0x00FFFF,
        transparent: true,
        opacity: .8
    })

    let coneTopRadius = 1.
    let coneRadialSegments = 64
    let coneGeo = new THREE.ConeGeometry(coneTopRadius, coneTopRadius, coneRadialSegments, 1, true, TAU / 4.)
    coneGeo.rotateX(Math.PI)
    coneGeo.translate(0., coneTopRadius / 2., 0.)

    let cone = new THREE.Mesh(coneGeo,coneMat)
    usualCgaAmbient.scene.add(cone)

    new Dw(1, 1)
}