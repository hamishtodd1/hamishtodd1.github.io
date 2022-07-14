//have the frustum and its view rect on there

function initInfinityDw()
{
    let dw = new Dw("infinity", false, true)

    let exteriorMat = new THREE.MeshPhongMaterial({ transparent:true, opacity:.6, side:THREE.FrontSide})
    let interiorMat = new THREE.MeshPhongMaterial({ transparent:false, side:THREE.BackSide})
    let sphereGeo = new THREE.IcosahedronBufferGeometry(1., 5)
    let theSphere = new THREE.Object3D()
    theSphere.add(new THREE.Mesh(sphereGeo, exteriorMat), new THREE.Mesh(sphereGeo, interiorMat))
    theSphere.scale.setScalar(INFINITY_RADIUS)
    dw.addNonMentionChild(theSphere)

    let euclideanHider = new THREE.Mesh(sphereGeo, new THREE.MeshPhongMaterial({color:0x000000}))
    euclideanHider.scale.setScalar(.15)
    dw.addNonMentionChild(euclideanHider)

    let threeRay = new THREE.Ray()
    let threeSphere = new THREE.Sphere(new THREE.Vector3(), INFINITY_RADIUS)
    let mouseRayDirection = new Mv()
    let frustumOnOrigin = new Mv()

    //possibly needed for vectorspace too
    dw.mouseRayIntersection = (mv) => {
        //mouseRay to threeRay
        threeRay.origin.copy(camera.position)
        let mouseRay = getMouseRay(dw)
        meet(e0, mouseRay, mouseRayDirection).toVector(threeRay.direction)
        threeRay.direction.normalize()

        let result = threeRay.intersectSphere(threeSphere, v1)
        if(result === null) {
            camera.frustum.far.projectOn(e123, frustumOnOrigin)
            meet(mouseRay, frustumOnOrigin, mv)
        }
        else
            mv.fromVec(v1)
            
        mv[14] = 0.
        return mv
    }

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