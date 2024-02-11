function initCamera(container) {

    const artistDeskAngle = 40. * (TAU / 360.) //cursory googling says artists seem to have 30-55 degrees
    const comfortableLookAngle = TAU/4. - artistDeskAngle //downwards from looking directly forward
    const comfortabledistance = .3 //from personal measurement, between 15cm and 40cm
    
    const lookDownRotationAxis = new Dq()
    e23.addScaled(e03,-1.2,lookDownRotationAxis)
    lookDownRotationAxis.multiplyScalar(0.5*comfortableLookAngle, lookDownRotationAxis)
    const lookDownRotation = lookDownRotationAxis.exp(new Dq())
    
    const posUnrotated = new Fl()
    comfortableLookPos = ( target, x = 0., extraDist = 0. ) => {
        posUnrotated.point(x, 1.2, -(comfortabledistance + extraDist), 1.)
        return lookDownRotation.sandwich( posUnrotated, target )
    }
    const lookToHand = new Dq().translator(0.,-0.22,0.)
    comfortableHandPos = (target, x = 0.) => {
        let lookPos = comfortableLookPos(fl6, x, 0.)
        return lookToHand.sandwich(lookPos, target)
    }

    orbitControls = new OrbitControls(camera, container)
    comfortableLookPos(fl0).pointToGibbsVec(orbitControls.target)
    orbitControls.update()
    orbitControls.enableZoom = false //change whenever you like!
    camera.quaternion.setFromAxisAngle(xUnit, -comfortableLookAngle)

    //we can't be in the exact place the head is since that's on the e3 plane. This is one step back
    camera.position.set(0., 1.2, 0. ) //10cm back because mouse plane is e3
    v1.subVectors(orbitControls.target, camera.position)
    camera.position.sub(v1)

    camera.frustum = {
        left: new Fl(),
        right: new Fl(),
        bottom: new Fl(),
        top: new Fl(),
        far: new Fl(),
        near: new Fl()
    }
    camera.mvs = {
        pos: new Fl(),
        quat: new Dq(),
        dq: new Dq(),
    }

    let fovHorizontal = otherFov(camera.fov, camera.aspect, true)
    let frameQuatHorizontal = new Dq().fromUnitAxisAndSeparation(e31, -fovHorizontal / 2. * (TAU / 360.) )
    let frameQuatVertical   = new Dq().fromUnitAxisAndSeparation(e23,    -camera.fov / 2. * (TAU / 360.) )

    const frustumUntransformed = {}
    for (let planeName in camera.frustum)
        frustumUntransformed[planeName] = new Fl()

    frustumUntransformed.far.plane(camera.far * .45, 0., 0., 1.) //eyeballed. Which is not great.
    frustumUntransformed.near.plane(camera.near * -1.03, 0., 0., 1.)
    frameQuatHorizontal.sandwich( e1, frustumUntransformed.left )
    frameQuatVertical.sandwich(   e2, frustumUntransformed.bottom )
    frameQuatHorizontal[0] *= -1.
    frameQuatVertical[0] *= -1.
    frameQuatHorizontal.sandwich(e1, frustumUntransformed.right )
    frameQuatVertical.sandwich(  e2, frustumUntransformed.top )

    updateCameraMvs = () => {
        camera.mvs.pos.pointFromGibbsVec(   camera.position )
        camera.mvs.quat.fromQuaternion( camera.quaternion )
        camera.mvs.dq.fromPosQuat(   camera.position, camera.quaternion )

        for (let planeName in camera.frustum) {
            camera.mvs.dq.sandwich(frustumUntransformed[planeName], camera.frustum[planeName])
            camera.frustum[planeName].normalize()
        }
    }

    //should have mouse in here
}