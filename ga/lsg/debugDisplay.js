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

    let pretendCamPos = new Fl()
    pretendCamPos.point(1.,1.,-1.,1.)

    let basis1VecsUnas = [
        new Unavec(), new Unavec(), new Unavec(),
    ]
    
    let basisDops = [
        new Trivec(), new Trivec(), new Trivec()
    ]
    let NUM_TRIVEC_COEFS = tv0.length
    //make sure these are normalized
    function vec3ToDop(vec3, dop) {
        for (let i = 0; i < NUM_TRIVEC_COEFS; ++i) {
            dop[i] = 
                vec3.x * basisDops[0][i] +
                vec3.y * basisDops[1][i] +
                vec3.z * basisDops[2][i]
        }
        return dop
    }
    function dopToVec3(dop, vec3) {
        vec3.set(0.,0.,0.)
        //not entirely sure about this
        for (let i = 0; i < NUM_TRIVEC_COEFS; ++i) {
            //posssssibly *.5 is the wrong sort of thing here
            vec3.x += dop[i] * basisDops[0][i] * .5
            vec3.y += dop[i] * basisDops[1][i] * .5
            vec3.z += dop[i] * basisDops[2][i] * .5
        }
        return vec3
    }

    let epm = _epm.cast(new Bivec())
    let originPp = new Trivec()
    let pss = new Pentavec()
    let truePtAtInf = new Quadvec()

    let _eo = new Tw()
    _ep.sub(_em, _eo)
    let e0Una = new Unavec()
    _e0.cast(e0Una)
    
    let cameraPosZrs = new Unavec()
    let renderedUna = new Unavec()
    let cameraRayDirDop = new Trivec()
    let cameraRayDirVec3 = new THREE.Vector3()
    let cameraRayBiv = new Bivec()
    
    let projectorBiv = new Bivec()
    let zrs = new Unavec()
    let tangentPlane = new Unavec()
    let dop0 = new Trivec()
    let unnormalizedPos = new Trivec()
    let posVec3s = [new THREE.Vector3(), new THREE.Vector3()]
    //and normals but whatever

    updateDebugDisplay = () => {

        geo.attributes.position.needsUpdate = true

        // let angle = frameCount * .01
        //.multiplyScalar(Math.cos(angle), tw0).addScaled(_e1, Math.sin(angle), tw1).cast(renderedObj)
        _ep.cast(renderedUna)

        _e1.cast(basis1VecsUnas[0])
        _e2.cast(basis1VecsUnas[1])
        _e3.cast(basis1VecsUnas[2])
        basis1VecsUnas[0].meet(basis1VecsUnas[1], bv0).meet(basis1VecsUnas[2], originPp)
        originPp.inner(epm, pss)
        originPp.inner(e0Una, truePtAtInf)

        for(let i = 0; i < 3; ++i)
            basis1VecsUnas[i].inner(truePtAtInf, basisDops[i] )

        vec3ToDop( camera.position, tv0 ).cast(tw1)
        // tv0.multiplyScalar(.5,tv0).sub(originPp, tv1)
        // tv0.mulReverse(originPp, tv2)

        originPp.cast(tw0)
        tw1.multiplyScalar(.5, tw1).add(tw0, tw2)
        cameraPosTranslation = tw2.mulReverse(tw0, tw3)
        cameraPosTranslation.sandwich(_eo, tw4).cast(cameraPosZrs)

        for(let i = 0; i < numPixels; ++i) {

            let pixelWorldPosVec = pointsObj3d.localToWorld(v1.fromArray(startCoords, i * 3))
            cameraRayDirVec3.subVectors(pixelWorldPosVec, camera.position)
            // cameraRayDirVec3.set(0.,0.,-1.)
            
            vec3ToDop(cameraRayDirVec3, cameraRayDirDop )
            cameraPosZrs.inner(cameraRayDirDop, cameraRayBiv)
            
            cameraRayBiv.meet(renderedUna, tv0).inner(pss, projectorBiv)
            let bivSq = projectorBiv.innerSelfScalar()
            projectorBiv.multiplyScalar(1. / Math.sqrt(bivSq), projectorBiv)
            
            for(let i = 0; i < 2; ++i) {
                if(i)
                    projectorBiv.multiplyScalar(-1., projectorBiv)
            
                cameraPosZrs.inner(projectorBiv, zrs)
                zrs.add(cameraPosZrs, zrs)

                zrs.meet(renderedUna, bv0).innerE0(tangentPlane)

                tangentPlane.meet(cameraRayBiv, unnormalizedPos)
                let upSq = unnormalizedPos.innerSelfScalar()
                unnormalizedPos.multiplyScalar( 1. / Math.sqrt(Math.abs(upSq)), tv0).sub(originPp, dop0)
                dopToVec3(dop0, posVec3s[i])

                //normal part
                // tangentPlane.inner(quadvecAtInfinity, dop0)
                // dopToVec3(dop0, normal)
            }

            let posDop0 = v1.subVectors(posVec3s[0], camera.position)
            let posDop1 = v2.subVectors(posVec3s[1], camera.position)
            let inFront0 = cameraRayDirVec3.dot(posDop0) > 0.
            let inFront1 = cameraRayDirVec3.dot(posDop1) > 0.
            let oneToUse = 
                inFront0 && inFront1 ? 
                    (posDop0.lengthSq() < posDop1.lengthSq() ? posVec3s[0] : posVec3s[1]) :
                inFront0 ? posVec3s[0] :
                inFront1 ? posVec3s[1] :
                outOfSightVec3
            if(bivSq <= 0.)
                oneToUse = outOfSightVec3

            pointsObj3d.worldToLocal(oneToUse).toArray( coords, i*3 )
        }
    }
}