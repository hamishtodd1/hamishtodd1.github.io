function initDebugDisplay() {

    let pixelsWide = 40
    // let numPixels = sq(pixelsWide)
    // let spacing = 1 / pixelsWide
    {
        let startGeo = new THREE.PlaneGeometry(.4, .4, pixelsWide, pixelsWide)
        startGeo.translate(0.,0.,-.5)
        var startCoords = startGeo.attributes.position.array
    }
    let numPixels = startCoords.length / 3
    // for (let i = 0; i < pixelsWide; ++i) {
    //     for (let j = 0; j < pixelsWide; ++j) {
    //         let start = 3 * (i * pixelsWide + j)
    //         startCoords[start + 0] = -.5 + (i + .5) * spacing
    //         startCoords[start + 1] = -.5 + (j + .5) * spacing
    //         startCoords[start + 2] = 0.
    //     }
    // }
    
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute( startCoords, 3 ))
    const mat = new THREE.PointsMaterial({ color: 0xFF0000, size: .1 })
    let pointsObj3d = new THREE.Points(geo, mat)
    camera.add(pointsObj3d)
    scene.add(camera)
    let coords = geo.attributes.position.array

    let rayDq = new Dq()
    let rayBiv = new Bivec()
    let renderedObj = _et.cast(new Unavec())//_ep.addScaled( _em, -0.7, tw0 ).cast( new Unavec() ) //slightly smaller than unit sphere
    let basis = basis1t2
    let pp = new Trivec()

    // log(basis123.dqToBiv)

    let pretendCamPos = new Fl()
    pretendCamPos.point(1.,1.,-1.,1.)

    updateDebugDisplay = () => {

        geo.attributes.position.needsUpdate = true

        // let angle = frameCount * .01
        // _ep.multiplyScalar(Math.cos(angle), tw0).addScaled(_e1, Math.sin(angle), tw1).cast(renderedObj)

        for(let i = 0; i < numPixels; ++i) {

            let pixelWorldPosVec = pointsObj3d.localToWorld(v1.fromArray(startCoords, i * 3)) 
            let pixelWorldPos = fl0.pointFromGibbsVec(pixelWorldPosVec)
            camera.mvs.pos.joinPt(pixelWorldPos, rayDq)

            rayDq.copy(e13)
            rayDq.negate()
            
            debugger
            basis.dqToBiv( rayDq, rayBiv )
            renderedObj.meet( rayBiv, pp )
            basis.ppToGibbsVecs( pp, v1, v2 )

            let oneToUse = v1.distanceToSquared(camera.position) < v2.distanceToSquared(camera.position) ? v1 : v2
            pointsObj3d.worldToLocal(oneToUse).toArray( coords, i*3 )
            
        }
    }
}