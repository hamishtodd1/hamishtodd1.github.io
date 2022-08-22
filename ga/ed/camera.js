function initCamera() {
    const fov = 60.
    const aspect = eval(getCssVar('dwAspect'))
    const near = .1
    const far = 10.

    OUT_OF_SIGHT_VECTOR3 = new THREE.Vector3(far * 999., far * 999., far * 999.)

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

    camera.toUpdateAppearance = []
    camera.toCopyQuatTo = []

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
    frameQuatVertical[0]   *= -1.
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

        camera.toCopyQuatTo.forEach((object3d)=>{
            object3d.quaternion.copy(camera.quaternion)
        })
    }
    addToCameraLonLat(0.,0.)

    let rightSideDist = 4.;
    camera2d = new THREE.OrthographicCamera(
        -rightSideDist,
        rightSideDist,
        rightSideDist / camera.aspect, -rightSideDist / camera.aspect,
        camera.near, camera.far)
    camera2d.position.z = camera.position.length()

    camera2d.getOldClientWorldPosition = (dw,target) => {
        let [xProportion, yProportion] = oldClientToDwNdc(dw)
        target.x = camera2d.left + xProportion * (camera2d.right - camera2d.left)
        target.y = camera2d.bottom + (1. - yProportion) * (camera2d.top - camera2d.bottom)
        return target
    }

    ndcToWindow = (ndcX, ndcY, dw) => {
        let dwRect = dw.elem.getBoundingClientRect()

        let actuallyOnScreen = 0. <= ndcX && ndcX <= 1. &&
            0. <= ndcY && ndcY <= 1.
        if (actuallyOnScreen) {
            return [
                dwRect.x + dwRect.width * ndcX,
                dwRect.y + dwRect.height * (1. - ndcY)
            ]
        }
        else
            return [Infinity, Infinity]
    }

    camera2d.worldToWindow = (worldSpacePosition, dw) => {
        let ndcX = (worldSpacePosition.x - camera2d.left  ) / (camera2d.right - camera2d.left  )
        let ndcY = (worldSpacePosition.y - camera2d.bottom) / (camera2d.top   - camera2d.bottom)

        return ndcToWindow(ndcX, ndcY, dw)
    }

    camera.worldToWindow = (worldSpacePosition, dw)=>{
        worldSpacePosition.applyMatrix4(camera.worldToCanvas)
        let canvasX = worldSpacePosition.x / worldSpacePosition.w
        let canvasY = worldSpacePosition.y / worldSpacePosition.w

        let ndcX = canvasX / 2. + .5
        let ndcY = canvasY / 2. + .5

        return ndcToWindow(ndcX, ndcY, dw)
    }
}