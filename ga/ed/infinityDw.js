//have the frustum and its view rect on there

function initInfinityDw($dwEl)
{
    let dw = new Dw("infinity",$dwEl, false, true)

    let exteriorMat = new THREE.MeshPhongMaterial({ transparent:true, opacity:.6, side:THREE.FrontSide})
    let interiorMat = new THREE.MeshPhongMaterial({ transparent:false, side:THREE.BackSide})
    let sphereGeo = new THREE.IcosahedronBufferGeometry(1., 5)
    let theSphere = new THREE.Object3D()
    theSphere.add(new THREE.Mesh(sphereGeo, exteriorMat), new THREE.Mesh(sphereGeo, interiorMat))
    theSphere.scale.setScalar(INFINITY_RADIUS)
    dw.scene.add(theSphere)

    let euclideanHider = new THREE.Mesh(sphereGeo, new THREE.MeshPhongMaterial({color:0x000000}))
    euclideanHider.scale.setScalar(.1)
    dw.scene.add(euclideanHider)
}