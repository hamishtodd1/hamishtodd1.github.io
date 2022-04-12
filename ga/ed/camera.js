function initCamera() {
    const allVariablesDwElem = topRightDw

    const fov = 60.
    const aspect = eval(getComputedStyle(allVariablesDwElem).aspectRatio)
    const near = 1.
    const far = 100.

    var perspectiveCamera = new THREE.PerspectiveCamera(fov, aspect, near, far)

    FullScreenQuad = (mat) => {
        mat.vertexShader = basicVertex

        let frameHeightAtNearPlane = Math.tan(fov / 2. / 360. * TAU) * near * 2.
        let fullScreenQuadGeo = new THREE.PlaneGeometry(frameHeightAtNearPlane * 2. * aspect, frameHeightAtNearPlane * 2.)
        fullScreenQuadGeo.translate(0., 0., -near * 2.)
        let fullScreenQuad = new THREE.Mesh(fullScreenQuadGeo, mat)
        fullScreenQuad.matrixAutoUpdate = false
        fullScreenQuad.matrix = perspectiveCamera.matrix

        return fullScreenQuad
    }

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

    let cameraLat = -TAU * .05
    let cameraLon = TAU * .05
    function addToCamerLonLat(lonDiff, latDiff) {
        cameraLat += latDiff
        cameraLon += lonDiff

        cameraLat = Math.sign(cameraLat) * Math.min(Math.abs(cameraLat), TAU / 4.01)

        perspectiveCamera.position.set(0., 0., 1.)
        perspectiveCamera.position.applyAxisAngle(xUnit, cameraLat)
        perspectiveCamera.position.applyAxisAngle(yUnit, cameraLon)
        perspectiveCamera.position.setLength(3.7)
        perspectiveCamera.lookAt(0., 0., 0.)
    }
    addToCamerLonLat(0., 0.)

    let oldClientX = 0
    let oldClientY = 0
    document.addEventListener('mousemove', (event) => {
        if (rightClicking) {
            let lonDiff = -.004 * (event.clientX - oldClientX)
            lonDiff = Math.sign(lonDiff) * (Math.min(Math.abs(lonDiff), 1.8))
            let latDiff = -.004 * (event.clientY - oldClientY)
            latDiff = Math.sign(latDiff) * (Math.min(Math.abs(latDiff), 1.8))
            addToCamerLonLat(lonDiff, latDiff)
        }

        oldClientX = event.clientX
        oldClientY = event.clientY
    })

    return perspectiveCamera
}