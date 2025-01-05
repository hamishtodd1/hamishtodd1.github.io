function initShm() {
    let shmGroup = new THREE.Group()
    scene.add(shmGroup)

    shmGroup.position.y = .7

    // let bg = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0x000000 }))
    // shmGroup.add(bg)
    // bg.position.y -= .8
    // bg.scale.setScalar(1.5)
    // let phasePt = new THREE.Mesh(new THREE.CircleGeometry(.03), new THREE.MeshBasicMaterial({ color: 0xFF0000 }))
    // bg.add(phasePt)
    
    let pendulum = new THREE.Group()
    shmGroup.add(pendulum)
    let pendulumTop = new THREE.Mesh(new THREE.CircleBufferGeometry(.3), new THREE.MeshBasicMaterial({color: 0x000000}))
    shmGroup.add(pendulumTop)
    let bottom = new THREE.Mesh(new THREE.CircleBufferGeometry(.3), new THREE.MeshBasicMaterial({ color: 0x000000 }))
    pendulum.add(top)

    
    updateShm = () => {
    }
}

