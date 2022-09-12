//have the frustum and its view rect on there

function initInfinityDw()
{
    let infinityDwCamera = camera.clone() // because we don't want zooming in and out
    infinityDwCamera.worldToCanvas = new THREE.Matrix4()
    infinityDwCamera.worldToWindow = (worldSpacePosition, dw) => {
        return worldToWindow3dCamera(infinityDwCamera, worldSpacePosition, dw)
    }

    camera.toCopyQuatTo.push(infinityDwCamera)
    function updateOurCamera() {
        infinityDwCamera.position.copy(camera.position)
        infinityDwCamera.position.setLength(2.4)
        updateCameraWorldToCanvas(infinityDwCamera)
    }
    updateOurCamera()
    camera.whenAngleChangeds.push(updateOurCamera)
    let dw = new Dw("infinity", true, infinityDwCamera)

    let exteriorMat = new THREE.MeshPhongMaterial({ transparent:true, opacity:.6, side:THREE.FrontSide})
    let interiorMat = new THREE.MeshPhongMaterial({ transparent:false, side:THREE.BackSide})
    let sphereGeo = new THREE.IcosahedronBufferGeometry(1., 5)
    let theSphere = new THREE.Object3D()
    theSphere.add(new THREE.Mesh(sphereGeo, exteriorMat), new THREE.Mesh(sphereGeo, interiorMat))
    theSphere.scale.setScalar(INFINITY_RADIUS)
    dw.addNonMentionChild(theSphere)

    let euclideanHider = new THREE.Mesh(sphereGeo, new THREE.MeshPhongMaterial({ color: 0x000000 }))
    euclideanHider.scale.setScalar(.1)
    dw.addNonMentionChild(euclideanHider)

    //and the labels for the directions
    let names = [`x`,`y`,`z`]
    for(let i = 0; i < 3; ++i) {
        for(let j = 0; j < 2; ++j) {
            let name = (j === 0 ? `+` : `-`) + names[i]

            let marker = text(name)
            marker.position.setComponent(i,INFINITY_RADIUS * 1.1)
            if(j)
                marker.position.multiplyScalar(-1.)
            marker.scale.multiplyScalar(.45)

            camera.toCopyQuatTo.push(marker)

            dw.addNonMentionChild(marker)
        }
    }

    let threeSphere = new THREE.Sphere(new THREE.Vector3(), INFINITY_RADIUS)
    let frustumOnOrigin = new Mv()

    //possibly needed for vectorspace too
    dw.mouseRayIntersection = (targetMv, fromBehind) => {
        let threeRay = getMouseThreeRay(dw)

        if (fromBehind) {
            threeRay.origin.addScaledVector(threeRay.direction, 999.) //so put it far behind camera
            threeRay.direction.multiplyScalar(-1.)
        }

        let result = threeRay.intersectSphere(threeSphere, v1)
        if(result === null) {
            let mvRay = getMouseRay(dw)
            camera.frustum.far.projectOn(e123, frustumOnOrigin)
            meet(mvRay, frustumOnOrigin, targetMv)
        }
        else
            targetMv.fromVec(v1)
            
        targetMv[14] = 0.
        return targetMv
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