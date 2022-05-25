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
    dw.addNonMentionChild(theSphere)

    let euclideanHider = new THREE.Mesh(sphereGeo, new THREE.MeshPhongMaterial({color:0x000000}))
    euclideanHider.scale.setScalar(.1)
    dw.addNonMentionChild(euclideanHider)

    //this isn't quite right because the angleHeight is based on latitude lines,
    // let angleWidth = (TAU/360.)*otherFov(camera.fov, camera.aspect, true)
    // let angleHeight = (TAU/360.)*camera.fov
    // let screenImitationGeometry = new THREE.SphereBufferGeometry(INFINITY_RADIUS*.98,31,31,
    //     -TAU/4. - angleWidth/2., angleWidth,
    //     TAU/4. - angleHeight/2., angleHeight )
    // let extra = new THREE.Mesh(screenImitationGeometry,new THREE.MeshBasicMaterial({
    //     color:0xCCCCCC, side:THREE.DoubleSide
    // }))
    // dw.addNonMentionChild(extra)
}