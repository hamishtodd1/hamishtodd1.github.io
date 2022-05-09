function initCamera() {
    const fov = 60.
    const aspect = eval(getComputedStyle(topDwEl).aspectRatio)
    const near = .1
    const far = 20.

    camera = new THREE.PerspectiveCamera(fov, aspect, near, far)

    let fsqMatrix = new THREE.Matrix4()
    
    let fsqMatrixPreCamera = new THREE.Matrix4()
    let frameHeightOneAway = Math.tan(fov / 2. / 360. * TAU) * 2.
    fsqMatrixPreCamera.makeScale(frameHeightOneAway * aspect, frameHeightOneAway,1.)

    FullScreenQuad = (mat) => {
        mat.vertexShader = basicVertex

        let fullScreenQuadGeo = new THREE.PlaneGeometry(1.,1.)
        fullScreenQuadGeo.translate(0., 0., -1.)
        let fullScreenQuad = new THREE.Mesh(fullScreenQuadGeo, mat)
        fullScreenQuad.matrixAutoUpdate = false
        fullScreenQuad.matrix = fsqMatrix

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
    }
    addToCamerLonLat(0., 0.)

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

    return camera
}