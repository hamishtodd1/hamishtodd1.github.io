function initInfinityDw($dwEl)
{
    let dw = new Dw("infinity",$dwEl, false, true)

    let exteriorMat = new THREE.MeshPhongMaterial({ transparent:true, opacity:.3, side:THREE.FrontSide})
    let interiorMat = new THREE.MeshPhongMaterial({ transparent:false, side:THREE.BackSide})
    let sphereGeo = new THREE.IcosahedronBufferGeometry(1.7, 5)
    let theSphere = new THREE.Object3D()
    theSphere.add(new THREE.Mesh(sphereGeo, exteriorMat), new THREE.Mesh(sphereGeo, interiorMat))
    dw.scene.add(theSphere)


}