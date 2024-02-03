function initDebugDisplay() {

    let pixelsWide = 9
    // let numPixels = sq(pixelsWide)
    // let spacing = 1 / pixelsWide
    let startCoords = (new THREE.BoxGeometry(2., 2., 2., pixelsWide, pixelsWide, pixelsWide)).attributes.position.array
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
    geo.setAttribute('position', new THREE.Float32BufferAttribute(startCoords, 3))
    const mat = new THREE.PointsMaterial({ color: 0xFFC0CB, size: .1 })
    let pointsObj3d = new THREE.Points(geo, mat)
    scene.add(pointsObj3d)
    let coords = geo.attributes.position.array

    let rayDq = new Dq()
    let ray123 = new Bivec()
    let unavec123 = _ep.addScaled( _em, -0.5, tw0 ).cast( new Unavec ) //slightly smaller than unit sphere
    let pp = new Trivec()

    let pretendCamPos = new Fl()
    pretendCamPos.point(1.,1.,-1.,1.)

    update22 = () => {
        
        // if(frameCount!== 1)
        //     return

        // let indexToFocusOn = Math.floor(Math.random() * pixels.children.length)

        geo.attributes.position.needsUpdate = true
        // return

        for(let i = 0; i < numPixels; ++i) {

            // debugger

            let pixelWorldPosVec = pointsObj3d.localToWorld(v1.fromArray(startCoords, i * 3)) 
            let pixelWorldPos = fl0.pointFromGibbsVec(pixelWorldPosVec)
            camera.mvs.pos.joinPt(pixelWorldPos, rayDq)

            // if(i === 0)
            //     rayDq.log()

            // if( i === indexToUse) {
            //     pretendCamPos.joinPt(pixelWorldPos, debugPluckers[0].dq)
            // }

            //debugging
            // rayDq.copy()
            e23.addScaled(e12, 0, rayDq)
            debugPluckers[0].dq.copy(rayDq)

            basis123.rayDqToBiv( rayDq, ray123 )
            unavec123.meet( ray123, pp )
            // debugger
            basis123.ppToGibbsVecs( pp, v1, v2 )

            let oneToUse = v1.distanceToSquared(camera.position) < v2.distanceToSquared(camera.position) ? v1 : v2
            // // pixel.position.copy(oneToUse)
            oneToUse.toArray( coords, i*3 )
            
            // if (pixelWorldPosVec.length() < .5)
            //     v1.copy(outOfSightVec3)
            // v1.toArray(coords, i * 3)
            
        }
    }
}