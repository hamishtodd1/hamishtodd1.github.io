function initCamera() {

    // camera.position.set(-.25, 1.6, 3.7)
    camera.position.set( 0., 1.6, 3.7)
    orbitControls = new OrbitControls(camera, container)
    orbitControls.target.set(0, 0., 0)
    orbitControls.update()
    orbitControls.enableZoom = false //change whenever you like!

    camera.lookAtAngle = 0.

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

    let frustumUntransformed = {}
    for (let planeName in camera.frustum)
        frustumUntransformed[planeName] = new Fl()

    frustumUntransformed.far.plane(camera.far * .8, 0., 0., 1.) //eyeballed. Which is not great.
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

        camera.lookAtAngle = Math.atan2(camera.position.x, camera.position.z)

        for (let planeName in camera.frustum) {
            camera.mvs.dq.sandwich(frustumUntransformed[planeName], camera.frustum[planeName])
            camera.frustum[planeName].normalize()
        }
    }

    //should have mouse in here
}