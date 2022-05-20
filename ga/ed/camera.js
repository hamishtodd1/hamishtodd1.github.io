function initCamera() {
    const fov = 60.
    const aspect = eval(getComputedStyle(topDwEl).aspectRatio)
    const near = .1
    const far = 10.

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

    camera.onMovementFunctions = []

    camera.worldToCanvas = new THREE.Matrix4()
    camera.updateWorldToCanvas = () => {
        camera.updateMatrixWorld()
        camera.worldToCanvas.copy(camera.projectionMatrix).multiply(camera.matrixWorldInverse)
    }

    {
        var fsqMatrix = new THREE.Matrix4()

        var fsqMatrixPreCamera = new THREE.Matrix4()
        let frameHeightOneAway = Math.tan(fov / 2. / 360. * TAU) * 2.
        fsqMatrixPreCamera.makeScale(frameHeightOneAway * aspect, frameHeightOneAway, 1.)

        FullScreenQuad = (mat) => {
            mat.vertexShader = basicVertex

            let fullScreenQuadGeo = new THREE.PlaneGeometry(1., 1.)
            fullScreenQuadGeo.translate(0., 0., -1.)
            let fullScreenQuad = new THREE.Mesh(fullScreenQuadGeo, mat)
            fullScreenQuad.matrixAutoUpdate = false
            fullScreenQuad.matrix = fsqMatrix

            return fullScreenQuad
        }
    }

    let fovHorizontal = otherFov(camera.fov, camera.aspect, true)
    let frameQuatHorizontal = new Mv().fromAxisAngle(e31, -fovHorizontal / 2. * (TAU / 360.))
    let frameQuatVertical = new Mv().fromAxisAngle(e23, -camera.fov / 2. * (TAU / 360.))

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

    let rightClicking = false
    window.oncontextmenu = () => { return false }
    window.addEventListener('mousedown', (event) => {
        if (event.which === 3) {
            event.preventDefault()
            rightClicking = true
        }
    })
    window.addEventListener('mouseup', (event) => {
        if (event.which === 3) {
            event.preventDefault()
            rightClicking = false
        }
    })

    let cameraLat = 0.//-TAU * .05
    let cameraLon = 0.//TAU * .05
    function addToCamerLonLat(lonDiff, latDiff) {
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

        fsqMatrix.copy(fsqMatrixPreCamera)
        fsqMatrix.premultiply(camera.matrix)
        
        camera.mvs.pos.fromVector(camera.position)
        camera.mvs.quat.fromQuaternion(camera.quaternion)
        camera.mvs.motor.fromPosQuat(camera.position, camera.quaternion)

        for (let planeName in camera.frustum) {
            camera.mvs.motor.sandwich(frustumUntransformed[planeName], camera.frustum[planeName])
            camera.frustum[planeName].normalize()
        }

        camera.updateWorldToCanvas()

        camera.onMovementFunctions.forEach((func)=>func())
    }
    addToCamerLonLat(0.,0.)

    document.addEventListener('mousemove', (event) => {
        if (rightClicking) {
            let lonDiff = -.006 * (event.clientX - oldClientX)
            lonDiff = Math.sign(lonDiff) * (Math.min(Math.abs(lonDiff), 1.8))
            let latDiff = -.006 * (event.clientY - oldClientY)
            latDiff = Math.sign(latDiff) * (Math.min(Math.abs(latDiff), 1.8))
            addToCamerLonLat(lonDiff, latDiff)

            //and need to update labels
        }

        oldClientX = event.clientX
        oldClientY = event.clientY
    })

    return camera
}