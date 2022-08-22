function initEuclideanDw() {
    let dw = new Dw(`euclidean`, true)
    
    // let skyBgGeo = new THREE.SphereGeometry(camera.far * .9)
    // let skyBgMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(.18431372, .18431372, .18431372), side: THREE.BackSide })
    let pedestalDimension = 4.
    let pedestalGeo = new THREE.BoxGeometry(pedestalDimension, .01, pedestalDimension)
    let pedestalMat = new THREE.MeshPhongMaterial({ color: 0x999999, specular: 0x101010 })

    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat)
    pedestal.position.y = -1.
    pedestal.receiveShadow = true
    dw.addNonMentionChild(pedestal)
}