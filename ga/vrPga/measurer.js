function initMeasurer() {
    let measurer = new THREE.Group()
    scene.add(measurer)
    measurer.scale.setScalar(.2)
    measurer.position.y = 1.2
    let bg = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0x000000 }))
    bg.scale.set(7.4,2.,1.)
    bg.position.z = -.01
    measurer.add(bg)

    let axisGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-bg.scale.x/2., 0., 0.),
        new THREE.Vector3(bg.scale.x/2., 0., 0.)])
    let notchGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0., 0., 0.),
        new THREE.Vector3(0., -.15, 0.)])

    const axisMat = new THREE.LineBasicMaterial({
        color: 0xFFFFFF
    })

    measurer.add(new THREE.Line(axisGeo, axisMat))

    let furthestMarkers = 3
    function makeMarkedNotch(string, x, y) {
        let marker = text(string)
        marker.position.x = x
        marker.scale.multiplyScalar(.65)
        marker.position.y = y
        marker.position.y -= marker.scale.y * .7

        let notch = new THREE.Line(notchGeo, axisMat)
        notch.position.y = y
        notch.position.x = x

        return [marker, notch]
    }
    for (let i = -furthestMarkers; i <= furthestMarkers; ++i) {
        let [marker, notch] = makeMarkedNotch(i.toString(), i, 0.)
        measurer.add(marker,notch)
    }
}