function initColumn2d() {
    let fourDDw = new Dw(2, 0)
    let sign = text("? 4D :( ?", false)
    fourDDw.scene.add(sign)
    
    let sphereDw = new Dw(2, 1)
    {
        let sphereMat = new THREE.MeshPhongMaterial({
            transparent: true,
            opacity: .4,
            color: 0xFF0000
        })
        let sphere = new THREE.Mesh(new THREE.SphereGeometry(), sphereMat)
        sphereDw.scene.add(sphere)
    }
    
    
}