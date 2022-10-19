function initColumn2d() {
    let ambient = new Dw(2, 0)
    let sign = text("? 4D :( ?", false)
    sign.scale.multiplyScalar(2.)
    ambient.scene.add(sign)
    
    {
        let hyperbolic = new Dw(2, 1)
        //in this space, the y plane is ePlus
        let origin = mul(e12,ePlus)
        {
            let sphereMat = new THREE.MeshPhongMaterial({
                transparent: true,
                opacity: .4,
                color: 0xFF0000
            })
        let sphere = new THREE.Mesh(new THREE.SphereGeometry(1.), sphereMat)
        sphere.renderOrder = 1
        hyperbolic.scene.add(sphere)
        }

        let xOld = 0.
        let yOld = 0.
        hyperbolic.onRightClick = (x,y) =>{ xOld = x; yOld = y }
        hyperbolic.onRightDrag = (x,y) => {
            moveCamera(hyperbolic.camera.position, true,  -.1 * (x - xOld))
            moveCamera(hyperbolic.camera.position, false, .1 * (y - yOld))
            hyperbolic.camera.lookAt(0.,0.,0.)
            xOld = x
            yOld = y
        }

        hyperbolic.camera.position.y = 1.
        hyperbolic.camera.lookAt(zeroVector)

        bindButton(`o`, () => { }, ``, () => {
            hyperbolic.camera.position.applyAxisAngle(yUnit, .05)
            hyperbolic.camera.lookAt(0., 0., 0.)
        })
        bindButton(`p`, () => { }, ``, () => {
            hyperbolic.camera.position.applyAxisAngle(yUnit, -.05)
            hyperbolic.camera.lookAt(0., 0., 0.)
        })

        let floorPlane = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), new THREE.MeshPhongMaterial({ color: 0x0000FF, side: THREE.DoubleSide, transparent: true, opacity: .4 }))
        floorPlane.rotation.x = TAU / 4.
        floorPlane.position.y = -1.
        hyperbolic.scene.add(floorPlane)

        let someRotation = mul(e1, nI)
        someRotation[0] = 1.

        let gridCount = 3
        let initialGridMvs = Array(3)
        let spacerTranslation = mul(nI, e1)
        spacerTranslation.multiplyScalar(.1)
        spacerTranslation[0] = 1.
        for (let i = 0; i < gridCount; ++i) {
            let ourTranslation = mv0.copy(oneMv)
            for (let j = 0; j < i; ++j) {
                mul(ourTranslation, spacerTranslation, mv1)
                ourTranslation.copy(mv1).normalize()
            }

            initialGridMvs[i] = new Mv()
            ourTranslation.sandwich(e1, initialGridMvs[i])
        }

        let circleGeo = new THREE.CircleGeometry(90.)
        let gridPlanes = new THREE.InstancedMesh(circleGeo, new THREE.MeshPhongMaterial({ color: 0x00FF00 }))
        hyperbolic.scene.add(gridPlanes)
        updateFunctions.push(() => {
            //a "plane" is a grade 1 element
            //its position depends on "which way we are looking"
            //so there is a variable nI and nO 
            //both of those are nontrivial
            for (let i = 0; i < gridCount; ++i) {
                origin.projectOn(initialGridMvs[i], mv0) //grade 3 part is the position
                mv0.selectGrade(3)
                // if (frameCount === 2)
                //     mv0.log()
                // m1.setPosition(mv0.e)

                initialGridMvs[i].projectOn(origin, mv0)
                mul(e3, mv0, mv1).naieveSqrt()
                //minus sign here is a guess!
                q1.set(-mv0.e1Plus(), mv0.e12, mv0.e2Plus(), mv0[0])
                // if (frameCount === 2)
                //     mv1.log()

                //bear in mind the different modes



                // gridPlanes.
                // gridPlanes.setMatrixAt(i,m1)
            }
            gridPlanes.instanceMatrix.needsUpdate = true
        })
    }
}