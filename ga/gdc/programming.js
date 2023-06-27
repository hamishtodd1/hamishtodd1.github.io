function initProgramming() {
    let thickness = .03
    let geo = new THREE.CylinderGeometry(.4, .4, thickness,31)
    geo.translate(0.,thickness*.5,0.)

    let thingy = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color:0x303030}))
    thingy.rotation.x = -TAU / 4.
    scene.add(thingy)
    thingy.position.set(-.8,1.6,0.)

    
}