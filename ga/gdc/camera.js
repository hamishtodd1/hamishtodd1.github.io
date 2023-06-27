function initCamera() {
    camera.frustum = {
        left: new Mv(),
        right: new Mv(),
        bottom: new Mv(),
        top: new Mv(),
        far: new Mv(),
        near: new Mv()
    }
    camera.mvs = {
        pos: new Mv(),
        quat: new Mv(),
        motor: new Mv(),
    }
    
    let untransformedFrustum = {}
    for (let planeName in camera.frustum)
        untransformedFrustum[planeName] = new Mv()
        
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

        {
            let fovHorizontal = otherFov(camera.fov, camera.aspect, true)
            let frameQuatHorizontal = new Mv().fromAxisAngle(e31, -fovHorizontal / 2. * (TAU / 360.))
            let frameQuatVertical = new Mv().fromAxisAngle(e23, -camera.fov / 2. * (TAU / 360.))

            frameQuatHorizontal.sandwich(e1, untransformedFrustum.left)
            frameQuatVertical.sandwich(e2, untransformedFrustum.bottom)
            frameQuatHorizontal[0] *= -1.
            frameQuatVertical[0] *= -1.
            frameQuatHorizontal.sandwich(e1, untransformedFrustum.right)
            frameQuatVertical.sandwich(e2, untransformedFrustum.top)

            untransformedFrustum.far.plane(0., 0., 1., camera.far * .97)
            untransformedFrustum.near.plane(0., 0., 1., camera.near * 1.03)
        }
    }
    onWindowResize()
    window.addEventListener('resize', onWindowResize);

    function updateCameraMvs() {
        camera.mvs.pos.fromVec(camera.position)
        camera.mvs.quat.fromQuaternion(camera.quaternion)
        camera.mvs.motor.fromPosQuat(camera.position, camera.quaternion)

        for (let planeName in camera.frustum) {
            camera.mvs.motor.sandwich(untransformedFrustum[planeName], camera.frustum[planeName])
            camera.frustum[planeName].normalize()
        }
    }

    return updateCameraMvs
}