function initCamera() {
    const fov = 60.
    const aspect = 16./9.
    const near = .1
    const far = 10.

    var fsqMatrixPreCamera = new THREE.Matrix4()
    let frameHeightOneAway = Math.tan(fov / 2. / 360. * TAU) * 2.
    fsqMatrixPreCamera.makeScale(frameHeightOneAway * aspect, frameHeightOneAway, 1.)

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    camera.frustum = {
        left: new Mv(),
        right: new Mv(),
        bottom: new Mv(),
        top: new Mv(),
        far: new Mv()
    }
    camera.mvs = {
        pos: new Mv(),
        quat: new Mv(),
        motor: new Mv(),
    }

    camera.toHaveUpdateFromMvCalled = []

    camera.worldToCanvas = new THREE.Matrix4()
    camera.updateWorldToCanvas = () => {
        camera.updateMatrixWorld()
        camera.worldToCanvas.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse)
    }

    let fovHorizontal = otherFov(camera.fov, camera.aspect, true)
    let frameQuatHorizontal = new Mv().fromAxisAngle(e31, -fovHorizontal / 2. * (TAU / 360.))
    let frameQuatVertical   = new Mv().fromAxisAngle(e23, -camera.fov / 2. * (TAU / 360.))

    let frustumUntransformed = {}
    for (let planeName in camera.frustum)
        frustumUntransformed[planeName] = new Mv()

    frustumUntransformed.far.plane(camera.far * .97, 0., 0., 1.)
    frameQuatHorizontal.sandwich(e1, frustumUntransformed.left)
    frameQuatVertical.sandwich(e2, frustumUntransformed.bottom)
    frameQuatHorizontal[0] *= -1.
    frameQuatVertical[0] *= -1.
    frameQuatHorizontal.sandwich(e1, frustumUntransformed.right)
    frameQuatVertical.sandwich(e2, frustumUntransformed.top)

    window.oncontextmenu = () => { return false }

    let cameraLat = -TAU * .05
    let cameraLon = TAU * .05
    addToCameraLonLat = (changeX, changeY) => {
        let lonDiff = -.006 * changeX
        lonDiff = Math.sign(lonDiff) * (Math.min(Math.abs(lonDiff), 1.8))
        let latDiff = -.006 * changeY
        latDiff = Math.sign(latDiff) * (Math.min(Math.abs(latDiff), 1.8))

        cameraLat += latDiff
        cameraLon += lonDiff

        cameraLat = Math.sign(cameraLat) * Math.min(Math.abs(cameraLat), TAU / 4.01)

        camera.position.set(0., 0., 1.)
        camera.position.applyAxisAngle(xUnit, cameraLat)
        camera.position.applyAxisAngle(yUnit, cameraLon)
        camera.position.setLength(3.7)
        camera.lookAt(0., 0., 0.)

        camera.updateMatrix()
        camera.updateProjectionMatrix()

        FULL_SCREEN_QUAD_MATRIX.copy(fsqMatrixPreCamera)
        FULL_SCREEN_QUAD_MATRIX.premultiply(camera.matrix)

        camera.mvs.pos.fromVec(camera.position)
        camera.mvs.quat.fromQuaternion(camera.quaternion)
        camera.mvs.motor.fromPosQuat(camera.position, camera.quaternion)

        for (let planeName in camera.frustum) {
            camera.mvs.motor.sandwich(frustumUntransformed[planeName], camera.frustum[planeName])
            camera.frustum[planeName].normalize()
        }

        camera.updateWorldToCanvas()

        for (let i = 0, il = camera.toHaveUpdateFromMvCalled.length; i < il; ++i)
            camera.toHaveUpdateFromMvCalled[i].updateFromMv()
    }
    addToCameraLonLat(0.,0.)

    let rightSideDist = 4.;
    orthCamera = new THREE.OrthographicCamera(
        -rightSideDist,
        rightSideDist,
        rightSideDist / camera.aspect, -rightSideDist / camera.aspect,
        camera.near, camera.far)
    orthCamera.position.z = camera.position.length()

    orthCamera.oldClientToPosition = (dw) => {
        let [xProportion, yProportion] = dw.oldClientToProportion()
        let x = orthCamera.left + xProportion * (orthCamera.right - orthCamera.left)
        let y = orthCamera.bottom + (1. - yProportion) * (orthCamera.top - orthCamera.bottom)
        return [x,y]
    }
}