function initCamera() {
    const fov = 60.
    const aspect = eval(getCssVar('dwAspect'))
    let near = 1.
    let far = 600.

    OUT_OF_SIGHT_VECTOR3 = new THREE.Vector3(far * 999., far * 999., far * 999.)

    var fsqMatrixPreCamera = new THREE.Matrix4()
    let frameHeightOneAway = Math.tan(fov / 2. / 360. * TAU) * 2.
    fsqMatrixPreCamera.makeScale(frameHeightOneAway * aspect, frameHeightOneAway, 1.)

    const dragPlane = new Mv()
    setDragPlane = (thingToProjectOn) => {
        if (thingToProjectOn.hasEuclideanPart())
            camera.frustum.far.projectOn(thingToProjectOn, dragPlane)            
        else dragPlane.copy(e0)
    }
    intersectDragPlane = (thingToIntersect, target) => {
        meet(dragPlane, thingToIntersect, target).normalize()
        //could normalize
        return target
    }

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
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

    camera.toUpdateAppearance = []
    camera.toCopyQuatTo = []
    camera.whenAngleChangeds = []
    camera.scalesToChange = []

    camera.worldToCanvas = new THREE.Matrix4()
    updateCameraWorldToCanvas = (theCamera) => {
        theCamera.updateMatrixWorld()
        theCamera.worldToCanvas.copy(theCamera.projectionMatrix).multiply(theCamera.matrixWorldInverse)
    }

    camera.pointInFront = (pt) => {
        let a = camera.frustum.near
        let b = pt
        let meetPss = b[14] * a[1] + b[13] * a[2] + b[12] * a[3] + b[11] * a[4]
        return meetPss < 0.
    }

    let fovHorizontal = otherFov(camera.fov, camera.aspect, true)
    let frameQuatHorizontal = new Mv().fromAxisAngle(e31, -fovHorizontal / 2. * (TAU / 360.))
    let frameQuatVertical   = new Mv().fromAxisAngle(e23, -camera.fov / 2. * (TAU / 360.))

    let frustumUntransformed = {}
    for (let planeName in camera.frustum)
        frustumUntransformed[planeName] = new Mv()

    frustumUntransformed.far.plane(camera.far * .97, 0., 0., 1.)
    frustumUntransformed.near.plane(camera.near * 1.03, 0., 0., 1.)
    frameQuatHorizontal.sandwich(e1, frustumUntransformed.left)
    frameQuatVertical.sandwich(e2, frustumUntransformed.bottom)
    frameQuatHorizontal[0] *= -1.
    frameQuatVertical[0]   *= -1.
    frameQuatHorizontal.sandwich(e1, frustumUntransformed.right)
    frameQuatVertical.sandwich(e2, frustumUntransformed.top)

    window.oncontextmenu = () => { return false }

    function whenCameraChanged() {
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

        updateCameraWorldToCanvas(camera)

        camera.toUpdateAppearance.forEach((appearance)=>{
            appearance.updateMeshesFromState()
        })
    }

    camera.whenZoomChangeds = []
    zoomCameraOutByAmount = (amt) => {
        camera.position.multiplyScalar(amt)

        whenCameraChanged()

        camera.whenZoomChangeds.forEach((func) => func(amt))
        camera.scalesToChange.forEach((scale) => {
            scale.multiplyScalar(amt)
        })
    }
    document.addEventListener('wheel', (event) => {
        if(event.ctrlKey)
            return //makes it so window resize with trackpad doesn't count

        let amt = event.deltaY > 0. ? 1.07 : 1. / 1.07
        if (camera.position.length() * amt < 3.)
            amt = 3. / camera.position.length()
        if (camera.position.length() * amt > 420.)
            amt = 420. / camera.position.length()

        zoomCameraOutByAmount(amt)

        // event.preventDefault()
    })

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

        let cameraDist = camera.position.length() || 3.7 //everything has been set up with 3.7 in mind
        camera.position.set(0., 0., 1.)
        camera.position.applyAxisAngle(xUnit, cameraLat)
        camera.position.applyAxisAngle(yUnit, cameraLon)
        camera.position.setLength(cameraDist)
        camera.lookAt(0., 0., 0.)

        whenCameraChanged()

        camera.toCopyQuatTo.forEach((object3d) => {
            object3d.quaternion.copy(camera.quaternion)
        })
        camera.whenAngleChangeds.forEach((func) => func())
    }

    let rightSideDist = 4.;
    camera2d = new THREE.OrthographicCamera(
        -rightSideDist,
        rightSideDist,
        rightSideDist / camera.aspect, -rightSideDist / camera.aspect,
        camera.near, camera.far)
    camera2d.position.z = 1.

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

    worldToWindow3dCamera = (theCamera, worldSpacePosition, dw) => {
        worldSpacePosition.applyMatrix4(theCamera.worldToCanvas)
        let canvasX = worldSpacePosition.x / worldSpacePosition.w
        let canvasY = worldSpacePosition.y / worldSpacePosition.w

        let ndcX = canvasX / 2. + .5
        let ndcY = canvasY / 2. + .5

        return ndcToWindow(ndcX, ndcY, dw)
    }

    camera2d.worldToWindow = (worldSpacePosition, dw) => {
        let ndcX = (worldSpacePosition.x - camera2d.left  ) / (camera2d.right - camera2d.left  )
        let ndcY = (worldSpacePosition.y - camera2d.bottom) / (camera2d.top   - camera2d.bottom)

        return ndcToWindow(ndcX, ndcY, dw)
    }

    camera.worldToWindow = (worldSpacePosition, dw)=>{
        return worldToWindow3dCamera(camera, worldSpacePosition, dw )
    }
}