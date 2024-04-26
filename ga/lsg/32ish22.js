update32ish22 = ()=>{}

function init32ish22() {

    let apparatus = new THREE.Group()
    scene.add(apparatus)

    camera.position.multiplyScalar(1.6)

    // borders
    {
        let borderGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-limitsUpper.x, -limitsUpper.y, 0.),
            new THREE.Vector3(limitsUpper.x, -limitsUpper.y, 0.),
            new THREE.Vector3(limitsUpper.x, limitsUpper.y, 0.),
            new THREE.Vector3(-limitsUpper.x, limitsUpper.y, 0.),
        ])
        let borderMat = new THREE.LineBasicMaterial({ color: 0xFFFFFF })
        let border = new THREE.LineLoop(borderGeo, borderMat)
        apparatus.add(border)

        // document.addEventListener(`keydown`, event => {
        //     if (event.key === `Control`) {
        //         limitsUpper.z = limitsUpper.z === .1 ? limitsUpper.x : .1
        //     }
        // })
    }

    let numPts = 20
    {
        let ptsAttrUnchanged = new THREE.Float32BufferAttribute(new Float32Array(numPts * 3), 3)
        var ptsUnchanged = ptsAttrUnchanged.array
        var ptsAttrChanged = new THREE.Float32BufferAttribute(new Float32Array(numPts * 3 * 2), 3)
        var ptsChanged = ptsAttrChanged.array
        function randomizePt(index) {
            ptsUnchanged[index * 3 + 0] = (Math.random()-.5) * limitsUpper.x * 2.
            ptsUnchanged[index * 3 + 1] = (Math.random()-.5) * limitsUpper.y * 2.
            ptsUnchanged[index * 3 + 2] = 0.
        }
        for (let i = 0; i < numPts; i++)
            randomizePt(i)

        let unchanged = new THREE.Points(
            new THREE.BufferGeometry().setAttribute('position', ptsAttrUnchanged),
            new THREE.PointsMaterial({ color: 0xFF0000, size: 0.04 }))
        let changed = new THREE.Points(
            new THREE.BufferGeometry().setAttribute('position', ptsAttrChanged),
            new THREE.PointsMaterial({ color: 0xFFFF00, size: 0.04 }))
        apparatus.add(unchanged)
        apparatus.add(changed)
    }

    let components = [_ep]
    let componentCurrent = components[components.length - 1]
    let final = new Tw()
    // final.addScaled(_e10, .02, final)
    // final[0] = 1.

    let sign = null
    function newSign(str) {
        sign = text(str, false, `#000000`)
        sign.scale.multiplyScalar(.2)
        sign.position.y = limitsUpper.y + .2
        scene.add(sign)
    }
    newSign(componentCurrent.toString())

    document.addEventListener(`keydown`,event=>{

        function increment(vec,amt) {
            componentCurrent.addScaled(vec, amt, componentCurrent)
        }

        if(event.key === `Enter`) {
            if(components.length === 4)
                components.length = 0

            components.push(new Tw())

            componentCurrent = components[components.length-1]
        }
        else if(event.key === `q`)
            increment(_em, 1./16.)
        else if(event.key === `a`)
            increment(_em, -1./16.)
        else if(event.key === `w`)
            increment(_ep, 1./16.)
        else if(event.key === `s`)
            increment(_ep, -1./16.)
        else if(event.key === `e`)
            increment(_e1, 1./16.)
        else if(event.key === `d`)
            increment(_e1, -1./16.)
        else if(event.key === `r`)
            increment(_et, 1./16.)
        else if(event.key === `f`)
            increment(_et, -1./16.)

        let oldMat = sign.material
        let signOld = sign
        scene.remove(signOld)
        oldMat.dispose()
        newSign(componentCurrent.toString())
    })
    
    let unchangedBivRay = new Bivec()
    let unchangedTw = new Tw()
    let changedPp = new Trivec()
    _e1t2 = _e1t.mul(_e2)

    update32ish22 = () => {

        // if (frameCount % 100 === 0) {
        //     for (let i = 0; i < numPts; i++) {
        //         randomizePt(i)
        //     }
        //      ptsAttrUnchanged.needsUpdate = true
        // }

        final.copy(oneTw)
        for(let i = 0; i < components.length; ++i) {
            final.mul(components[i], tw0)
            final.copy(tw0)
        }

        for (let i = 0; i < numPts; ++i) {
            e12.addScaled(e01,  ptsUnchanged[i*3 + 1], dq0)
               .addScaled(e02,  ptsUnchanged[i*3 + 0], dq1)
            
            basis1t2.dqToBiv(dq1, unchangedBivRay)
            unchangedBivRay.cast(tw0).meet(_e2, unchangedTw)
            let changedTw = final.mul(unchangedTw, tw1).mulReverse(final, tw2)
            changedTw.cast(changedPp)
            
            basis1t2.ppToGibbsVecs(changedPp, v1, v2)
            v1.x *= -1.;
            v2.x *= -1.; //NO FUCKING IDEA
            // debugger
            v1.toArray(ptsChanged, i*3)
            v2.toArray(ptsChanged, (i+numPts)*3)
        }

        ptsAttrChanged.needsUpdate = true

        components.forEach((component, i) => {
            component.cast(uv0)
            for (let j = 0; j < 6; ++j)
                lsgMat.floats[i*6+j] = uv0[j]
        })
        // log(lsgMat.floats)

        // let pixelWorldPosVec = pointsObj3d.localToWorld(v1.fromArray(startCoords, i * 3))
        // let pixelWorldPos = fl0.pointFromGibbsVec(pixelWorldPosVec)
        // camera.mvs.pos.joinPt(pixelWorldPos, rayDq)

        // rayDq.copy(e13)
        // rayDq.negate()

        // // debugger
        // basis.dqToBiv(rayDq, rayBiv)
        // renderedObj.meet(rayBiv, pp)
        // if (frameCount === 2 && i === 0)
        //     log(pp)
        // basis.ppToGibbsVecs(pp, v1, v2)

        // let oneToUse = v1.distanceToSquared(camera.position) < v2.distanceToSquared(camera.position) ? v1 : v2
        // pointsObj3d.worldToLocal(oneToUse).toArray(coords, i * 3)
    }
}