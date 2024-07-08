function initGeneral() {

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
    let coords = geo.attributes.position.array

    let pretendCamPos = new Fl()
    pretendCamPos.point(1.,1.,-1.,1.)

    let basis1VecsUnas = [
        new Unavec(), new Unavec(), new Unavec(),
    ]
    
    let basisDops = [
        new Trivec(), new Trivec(), new Trivec()
    ]
    vec3ToDop = (vec3, dop) => {

        for (let i = 0; i < TRI_LEN; ++i) {
            dop[i] = 
                vec3.x * basisDops[0][i] +
                vec3.y * basisDops[1][i] +
                vec3.z * basisDops[2][i]
        }
        return dop
    }
    dopToVec3 = (dop, vec3) => {

        vec3.set(0.,0.,0.)
        for (let i = 0; i < TRI_LEN; ++i) {
            vec3.x += dop[i] * basisDops[0][i] * .5
            vec3.y += dop[i] * basisDops[1][i] * .5
            vec3.z += dop[i] * basisDops[2][i] * .5
        }
        return vec3
    }

    //constant
    let epm = _epm.cast(new Bivec())
    let _eo = new Tw()
    _ep.sub(_em, _eo)
    let e0Una = new Unavec()
    _e0.cast(e0Una)
    
    //fed in
    originPp = new Trivec()
    pss = new Pentavec()
    truePtAtInf = new Quadvec()
    let renderedUna = new Unavec()
    let cameraPosZrs = new Unavec()
    
    let cameraRayDirVec3 = new THREE.Vector3()
    let cameraRayDirDop = new Trivec()
    let cameraRayBiv = new Bivec()
    
    let pp = new Trivec()
    let projectorBiv = new Bivec()
    let zrSphere = new Unavec()
    let tangentPlane = new Unavec()
    let zrCircle = new Bivec()
    let dop0 = new Trivec()
    let unnormalizedPos = new Trivec()
    let posVec3 = new THREE.Vector3()
    let bireflection = new Bireflection()
    bireflection.log()
    //and normals but whatever

    let visibles = [true,true];
    let diffs = [new THREE.Vector3(), new THREE.Vector3()]

    let cgaBasis = [
        _e1.cast(new Unavec),
        _e2.cast(new Unavec),
        _e3.cast(new Unavec),
    ]
    let csta21Basis = [
        _e1.cast(new Unavec),
        _et.cast(new Unavec),
        _e3.cast(new Unavec),
    ]

    let deSitterTransform = new Tw()
    updateGeneral = (transform) => {
        

        transform.sandwich(_et, tw1).cast(renderedUna)
        // _ep.cast(renderedUna)


        // let cstaNess = 1.//0.//.5 + .17 * Math.cos(angle)
        basis1VecsUnas.forEach((b,i)=>{
            b.copy(csta21Basis[i])
            // b.lerpSelf(csta21Basis[i], cstaNess)
        })

        basis1VecsUnas[0].meet(basis1VecsUnas[1], bv0).meet(basis1VecsUnas[2], originPp)
        originPp.inner(epm, pss)
        originPp.inner(e0Una, truePtAtInf)
        // debugger
        //WHAT THE FUCK, INNER PRODUCT??????

        for (let i = 0; i < 3; ++i)
            basis1VecsUnas[i].inner(truePtAtInf, basisDops[i])

        vec3ToDop(camera.position, tv0).cast(tw1)
        // tv0.multiplyScalar(.5,tv0).sub(originPp, tv1)
        // tv0.mulReverse(originPp, tv2)

        originPp.cast(tw0)
        tw1.multiplyScalar(.5, tw1).add(tw0, tw2)
        cameraPosTranslation = tw2.mulReverse(tw0, tw3)
        cameraPosTranslation.sandwich(_eo, tw4).cast(cameraPosZrs)
    }

    updateDebugGrade1 = () => {

        geo.attributes.position.needsUpdate = true

        for(let i = 0; i < numPixels; ++i) {

            let pixelWorldPosVec = pointsObj3d.localToWorld(v1.fromArray(startCoords, i * 3))
            cameraRayDirVec3.subVectors(pixelWorldPosVec, camera.position)
            cameraRayDirVec3.set(0.,0.,-1.)
            
            vec3ToDop( cameraRayDirVec3, cameraRayDirDop )
            cameraPosZrs.inner(cameraRayDirDop, cameraRayBiv)
            
            cameraRayBiv.meet(renderedUna, pp)
            pp.inner(pss, projectorBiv)
            let bivSq = projectorBiv.innerSelfScalar()
            
            projectorBiv.multiplyScalar(.5 / Math.sqrt(bivSq), projectorBiv)

            // pp.inner(truePtAtInf, equidistantUna)

            // if(frameCount === 1 && i%20 === 0)
            //     log(cameraRayDirVec3,cameraRayBiv)

            bireflection[0] = .5
            for(let i = 0; i < 2; ++i) {

                for(let j = 0; j < BIV_LEN; ++j)
                    bireflection[j + 1] = i == 1 ? projectorBiv[j] : -projectorBiv[j];
                bireflection.sandwich(cameraPosZrs, zrSphere)

                // debugger
                // projectorBiv.inner( equidistantUna, zrSphere)
                // for (let j = 0; j < UNA_LEN; ++j)
                //     zrSphere[j] = equidistantUna[j] + zrSphere[j]

                zrSphere.meet(renderedUna, zrCircle)
                zrCircle.innerE0(tangentPlane)

                tangentPlane.meet(cameraRayBiv, unnormalizedPos)
                let upSq = unnormalizedPos.innerSelfScalar()
                unnormalizedPos.multiplyScalar( 1. / Math.sqrt(Math.abs(upSq)), tv0).sub(originPp, dop0)
                dopToVec3(dop0, posVec3)

                //normal part
                // tangentPlane.inner(quadvecAtInfinity, dop0)
                // dopToVec3(dop0, normal)

                let eps = .001;
                let isE0Multiple = zrSphere[3] != 0. && (zrSphere[3] - zrSphere[4]) < eps && Math.abs(zrSphere[0]) < eps && Math.abs(zrSphere[1]) < eps && Math.abs(zrSphere[2]) < eps && Math.abs(zrSphere[5]) < eps;

                diffs[i].subVectors( posVec3, camera.position )
                visibles[i] = diffs[i].dot(cameraRayDirVec3) > 0. && !isE0Multiple;
            }

            let oneToUse =
                visibles[0] && !visibles[1] ? diffs[0] :
                visibles[1] && !visibles[0] ? diffs[1] :
                diffs[0].dot(diffs[0]) < diffs[1].dot(diffs[1]) ? diffs[0] : diffs[1]
            oneToUse.add(camera.position)

            if ((!visibles[0] && !visibles[1]) || bivSq <= 0.)
                oneToUse = outOfSightVec3

            pointsObj3d.worldToLocal(oneToUse).toArray( coords, i*3 )
        }
    }

    updateLsgMat = () => {

        let start = 0
        for (let i = 0; i < UNA_LEN; ++i)
            lsgMat.floats[i] = renderedUna[i]
        start += UNA_LEN
        for (let i = 0; i < TRI_LEN; ++i)
            lsgMat.floats[start + i] = originPp[i]
        start += TRI_LEN
        for (let i = 0; i < PENT_LEN; ++i)
            lsgMat.floats[start + i] = pss[i]
        start += PENT_LEN
        for (let i = 0; i < QUAD_LEN; ++i)
            lsgMat.floats[start + i] = truePtAtInf[i]
        start += QUAD_LEN
        for (let i = 0; i < UNA_LEN; ++i)
            lsgMat.floats[start + i] = cameraPosZrs[i]
        start += UNA_LEN
        for (let i = 0; i < TRI_LEN; ++i)
            lsgMat.floats[start + i] = basisDops[0][i]
        start += TRI_LEN
        for (let i = 0; i < TRI_LEN; ++i)
            lsgMat.floats[start + i] = basisDops[1][i]
        start += TRI_LEN
        for (let i = 0; i < TRI_LEN; ++i)
            lsgMat.floats[start + i] = basisDops[2][i]
        start += TRI_LEN

        if(frameCount === 1)
            truePtAtInf.log()

        lsgMat.extraVec1.copy(limitsLower)
        lsgMat.extraVec2.copy(limitsUpper)
    }

    // camera.add(pointsObj3d)
    // scene.add(camera)
}