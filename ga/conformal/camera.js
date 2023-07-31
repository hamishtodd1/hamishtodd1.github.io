function initCamera() {

    camera.position.set(-.25, 1.6, 3.7)
    orbitControls = new OrbitControls(camera, container)
    orbitControls.target.set(0, 1.6, 0)
    orbitControls.update()
    orbitControls.enableZoom = false //change whenever you like!

    camera.frustum = {
        left: new Ega(),
        right: new Ega(),
        bottom: new Ega(),
        top: new Ega(),
        far: new Ega(),
        near: new Ega()
    }
    camera.mvs = {
        pos: new Ega(),
        quat: new Dq(),
        motor: new Dq(),
    }

    let fovHorizontal = otherFov(camera.fov, camera.aspect, true)
    let frameQuatHorizontal = dq0.fromEgaAxisAngle(e31e, -fovHorizontal / 2. * (TAU / 360.) ).cast(new Ega())
    let frameQuatVertical   = dq0.fromEgaAxisAngle(e23e,    -camera.fov / 2. * (TAU / 360.) ).cast(new Ega())

    let frustumUntransformed = {}
    for (let planeName in camera.frustum)
        frustumUntransformed[planeName] = new Ega()

    frustumUntransformed.far.plane(camera.far * .8, 0., 0., 1.) //eyeballed. Which is not great.
    frustumUntransformed.near.plane(camera.near * -1.03, 0., 0., 1.)
    frameQuatHorizontal.sandwich( e1e, frustumUntransformed.left )
    frameQuatVertical.sandwich(   e2e, frustumUntransformed.bottom )
    frameQuatHorizontal[0] *= -1.
    frameQuatVertical[0] *= -1.
    frameQuatHorizontal.sandwich(e1e, frustumUntransformed.right )
    frameQuatVertical.sandwich(  e2e, frustumUntransformed.top )

    updateCameraMvs = () => {
        camera.mvs.pos.pointFromVec3(   camera.position )
        camera.mvs.quat.fromQuaternion( camera.quaternion )
        camera.mvs.motor.fromPosQuat(   camera.position, camera.quaternion )

        for (let planeName in camera.frustum) {
            camera.mvs.motor.sandwich(frustumUntransformed[planeName], camera.frustum[planeName])
            camera.frustum[planeName].normalize()
        }
    }
}