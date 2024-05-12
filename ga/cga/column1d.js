//this project may interest slehar, keenan crane, Bobenko, Stefan, Penrose, CFT, Michael from huawei
function initColumn1d() {
    let coneTopRadius = 1.
    let coneDiagonalLength = Math.sqrt(2.) * coneTopRadius

    let pointGeo = new THREE.SphereGeometry(tubeRadius * 3.)

    let ourPss = mul(e1Plus, eMinus)
    let ourNo = nO.clone()

    //right, it's confusing as fuck because if you want:
    // y plane, eMinus, is oriented up
    // z plane, ePlus, is oriented towards us
    // then nI = ePlus+eMinus is oriented towards positive x, positive y
    // and its dual, the spine, is -z, +y. Fucking CGA dual
    let spineMv = new Mv()
    mul(e1, nI, spineMv)

    let freeAxisDual = new Mv()

    {
        function applyToEverything(rotor) {
            gridMvs.forEach((gmv) => {
                rotor.sandwich(gmv, mv1)
                gmv.copy(mv1)
            })

            freeAxes.forEach(fa=>{
                rotor.sandwich(fa, mv1)
                fa.copy(mv1)
            })
        }

        let rotorDown = ePlusMinus.clone().naieveAxisToRotor(.02)
        let rotorUp = ePlusMinus.clone().naieveAxisToRotor(-.02)
        let rotorLeft = spineMv.clone().naieveAxisToRotor(-.03)
        let rotorRight = spineMv.clone().naieveAxisToRotor(.03)
        let rotorsArr = [rotorUp, rotorDown, rotorRight, rotorLeft]

        rotorsArr.push(mul(nO, e1).naieveAxisToRotor(-.01))
        rotorsArr.push(mul(nO, e1).naieveAxisToRotor( .01))
        
        let buttonsArr = [`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `PageDown`,`PageUp`]
        buttonsArr.forEach((button,i)=> {
            bindButton(button, () => { }, ``, () => {
                applyToEverything(rotorsArr[i])
            })
        })

        bindButton(",", () => { }, ``, () => {
            mv0.copy(freeAxis).naieveAxisToRotor(.01)
            applyToEverything(mv0)
        })
        bindButton(".", () => { }, ``, () => {
            mv0.copy(freeAxis).naieveAxisToRotor(-.01)
            applyToEverything(mv0)
        })

        //this breaks the planes because it's not attacking the rotor
        //point is, 
        // bindButton(`q`, () => { }, ``, () => {
        //     mv0.copy(e1Plus)
        //     mv0[0] = 99.
        //     mv0.normalize()
        //     ourNo.applyRotor(mv0)
        // })
        // bindButton(`w`, () => { }, ``, () => {
        //     mv0.copy(e1Plus)
        //     mv0[0] = -99.
        //     mv0.normalize()
        //     ourNo.applyRotor(mv0)
        // })
    }

    let ambientOrdinaryModeCameraPosition = new THREE.Vector3()
    let ambient = new Dw(1, 0, true, true, ambientOrdinaryModeCameraPosition)

    {
        ambient.updateCamera = () => {
            ambient.camera.position.copy(ambientOrdinaryModeCameraPosition)
            ambient.camera.position.multiplyScalar(1.-ambient.cameraUnusualness)

            let lookDirection = v1.set(0., 1., 0.).multiplyScalar(Math.pow(ambient.cameraUnusualness,1./5.))
            ambient.camera.lookAt(lookDirection)
            ambient.camera.rotation.z *= 1.-ambient.cameraUnusualness

            let fov = getFov(2. + ambient.cameraUnusualness * 2.)
            ambient.camera.fov = fov
            ambient.camera.updateProjectionMatrix()
            
            // camera.position.set()
            //yeah set the field of view too
        }
        // ambient.onRightClick = (x, y) => { xOld = x; yOld = y }
        // ambient.onRightDrag = (x, y) => {
        //     if(this.unusualCameraMode)
        //         return
        //     moveCamera(ambientOrdinaryModeCameraPosition, true, -.1 * (x - xOld))
        //     moveCamera(ambientOrdinaryModeCameraPosition, false, .1 * (y - yOld))
        //     xOld = x
        //     yOld = y
        // }
        let cameraDist = 1.3 * ambient.camera.position.length()
        ambientOrdinaryModeCameraPosition.set(1., 1.6, 2.).setLength(cameraDist)
        
        function ambientLineMvToUnitVecDirection(mv, target) {
            //this is based on wanting spine to be going up (0, 1, 1)
            target.x = mv.ePlusMinus()
            target.y = mv.e1Plus()
            target.z = mv.e1Minus()
            return target.normalize()
        }
    }

    let diagonalClippingPlanesDist = 99.
    let nIClippingPlane = new THREE.Plane(new THREE.Vector3(0., 1., -1.), diagonalClippingPlanesDist)
    let ourNoClippingPlane = new THREE.Plane(new THREE.Vector3(), diagonalClippingPlanesDist)
    let bottomClippingPlane = new THREE.Plane(new THREE.Vector3(0.,1.,0.),0.)
    // let nOClippingPlane = new THREE.Plane(new THREE.Vector3(0., 1.,-1.), .01) //set to a big number to set more back planes
    let topClippingPlane = new THREE.Plane(new THREE.Vector3(0., -1., 0.), coneTopRadius)
    
    let unitHeightCylGeo = CylinderBufferGeometryUncentered(tubeRadius, 1., 8, 1, true)
    let cylGeo = new THREE.CylinderBufferGeometry(tubeRadius, tubeRadius, 2., 8, 1, true)
    let axisMat = new THREE.MeshPhongMaterial({ color: 0x00FF00 })
    
    {
        let coneMat = new THREE.MeshPhongMaterial({
            color: 0x777777,
            transparent: true,
            opacity: .8,
            side: THREE.DoubleSide,
        })

        var coneRadialSegments = 64
        let coneGeo = new THREE.ConeGeometry(coneTopRadius, coneTopRadius, coneRadialSegments, 1, true, TAU / 4.)
        coneGeo.rotateX(Math.PI)
        coneGeo.translate(0., coneTopRadius / 2., 0.)

        let cone = new THREE.Mesh(coneGeo, coneMat)
        cone.renderOrder = 1
        ambient.scene.add(cone)
    }

    let gridMvs = []
    {
        let numHorizontals = 4
        for (let i = 0; i < numHorizontals; ++i) {
            let zeroToOne = i / (numHorizontals - 1)
            let ourTranslation = mv0.copy(spineMv).naieveAxisToRotor((zeroToOne - .5) * .4)
            gridMvs[i] = new Mv()
            ourTranslation.sandwich(e1, gridMvs[i])
        }
        // gridMvs.push(freeAxisDual) //an interesting thing to have
        // gridMvs.push(ePlus.clone().normalize())
        // gridMvs.push(ePlus.clone().sub(nI).normalize())
        // gridMvs.push(ePlus.clone().add(nO).normalize())
        gridMvs.push(nI.clone())
        var gridCount = gridMvs.length

        let rectMat = new THREE.MeshPhongMaterial({
            clippingPlanes: [bottomClippingPlane, topClippingPlane, nIClippingPlane, ourNoClippingPlane],
            transparent: true,
            opacity: .9,
            color: 0x00FFFF,
            side: THREE.DoubleSide
        })
        let rectGeo = new THREE.PlaneGeometry(10., 10.)
        //normal needs to be the y vector because we use RotationallySymmetricMatrix
        rectGeo.rotateX(TAU / 4.)
        // rectGeo.translate(rectWidth * .5, rectHeight * .5, 0.)

        var gridPlanes = new THREE.InstancedMesh(rectGeo, rectMat, gridCount)
        ambient.scene.add(gridPlanes)
        // let nOPlane = new THREE.Mesh(rectGeo,new THREE.MeshBasicMaterial({color:0x000000}))
        // ambient.scene.add(nOPlane)
        //lower cameras should look at nODual
    }

    function AxisAndBall() {
        let mv = new Mv()

        let axis = new THREE.Mesh(cylGeo, axisMat)
        ambient.scene.add(axis)
        axis.matrixAutoUpdate = false

        let ball = new THREE.Mesh(pointGeo, axisMat)
        ball.scale.multiplyScalar(1.05)
        hyperbolic.scene.add(ball)

        updateFunctions.push(() => {
            let axisLen = 0.
            if(mv.e1Plus() === 0.) {
                ball.visible = false
                axisLen = 999.
            }
            else {
                ball.visible = true
                let yPart = mv.e1Minus() / mv.e1Plus() //but it goes in z
                let xPart = mv.ePlusMinus() / mv.e1Plus()
                ball.position.set(xPart, 1., yPart)
                axisLen = ball.position.length()
            }

            ambientLineMvToUnitVecDirection(mv, v1)
            v1.multiplyScalar(axisLen)
            setRotationallySymmetricMatrix(v1.x, v1.y, v1.z, axis.matrix)
        })

        return mv
    }

    let hyperbolic = new Dw(1,1, true, false)
    {
        // in this context, the x and y directions (ultra ideal points) are ePlusMinus and e1Minus

        // let parabolicAxisMv = AxisAndBall()
        // parabolicAxisMv.copy(spineMv)
        // let hyperbolixAxisMv = AxisAndBall()
        // hyperbolixAxisMv.copy(ePlusMinus)
        // let zollyAxisMv = AxisAndBall()
        // zollyAxisMv.copy(e1Plus).addScaled(e1Minus, -1.)
        //-1, -1

        var hyperbolicOrigin = e1Plus

        hyperbolic.camera.rotation.x = TAU / 4.
        hyperbolic.camera.position.set(0.,0.,0.)
        let hyperbolicFov = 8.
        hyperbolic.camera.fov = getFov(8.)
        hyperbolic.camera.updateProjectionMatrix()

        hyperbolic.updateCamera = () => {
            let lookDirection = v1
            getNoDirectionVector(lookDirection)
            lookDirection.lerp(yUnit,1.-hyperbolic.cameraUnusualness)
            hyperbolic.camera.lookAt(lookDirection)

            eye.rotation.copy(hyperbolic.camera.rotation)
        }

        let eye = createEye()
        // ambient.scene.add(eye)
        
        var freeAxes = []
        // for(let i = 0; i < 2; ++i)
        //     freeAxes[i] = AxisAndBall()
        // freeAxes[0].copy(e1Plus).addScaled(e1Minus, 1.).addScaled(ePlusMinus,3.6)
        // freeAxes[0].normalize().multiplyScalar(2.)
        // freeAxes[1].copy(e1Plus)
        // freeAxis.copy(e1Minus)

        // let mulAxis = AxisAndBall()
        // updateFunctions.push(()=>{
        //     mul(freeAxes[0], freeAxes[1], mulAxis)
        // })

        var freeAxis = freeAxes[0]
        function setFreeAxis(x,y) {
            freeAxis.copy(zeroMv)
                .addScaled(ePlusMinus,hyperbolicFov * x)
                .addScaled(e1Minus,   hyperbolicFov*y)
            if (Math.abs(x) < .5 && Math.abs(y) < .5)
                freeAxis.addScaled(e1Plus, 1.)
            
            let snapRadius = .1
            for(let i = 0; i < 32; ++i) {
                if (Math.abs(freeAxis[i] -  0.) < snapRadius)
                    freeAxis[i] = 0.
                if (Math.abs(freeAxis[i] -  1.) < snapRadius)
                    freeAxis[i] = 1.
                if (Math.abs(freeAxis[i] - -1.) < snapRadius)
                    freeAxis[i] = -1.
                if (Math.abs(freeAxis[i] - -2.) < snapRadius)
                    freeAxis[i] = -2.
                if (Math.abs(freeAxis[i] -  2.) < snapRadius)
                    freeAxis[i] = 2.
            }
            freeAxis.normalize()

            mul(freeAxis, ourPss, freeAxisDual)
            //then we were going to have something about multiplying them. Which will def get you a spinor
            //But where? Will it be a camera transform of some kind?
        }
        hyperbolic.onClick = (x, y) => {
            let distSq0 = sq(freeAxes[0].ePlusMinus() / hyperbolicFov - x ) + sq(freeAxes[0].e1Minus() / hyperbolicFov - y)
            let distSq1 = sq(freeAxes[1].ePlusMinus() / hyperbolicFov - x ) + sq(freeAxes[1].e1Minus() / hyperbolicFov - y)
            log(distSq0, distSq1)
            freeAxis = distSq0 < distSq1 ? freeAxes[0] : freeAxes[1]

            setFreeAxis( x, y )
        }
        hyperbolic.onDrag = (x,y)=>{
            setFreeAxis( x, y )
        }

        // let eye2 = createEye()
        // hyperbolic.scene.add(eye2)
        // eye2.rotation.x = -TAU / 4.
        // eye2.scale.z *= .1
        // eye2.position.set(0.,1.,1.)

        let rimMat = new THREE.MeshPhongMaterial({ color: 0xFFFF00 })
        let rim = new THREE.Mesh(new THREE.TorusGeometry(1., tubeRadius, coneRadialSegments, 32), rimMat)
        rim.geometry.rotateX(-TAU / 4.)
        rim.position.y = 1.
        hyperbolic.scene.add(rim)

        let gridLineMat = new THREE.MeshBasicMaterial({
            color: 0xFF00FF,
            clippingPlanes: [nIClippingPlane, ourNoClippingPlane]
        })
        var gridLines = new THREE.InstancedMesh(cylGeo, gridLineMat, gridCount)
        hyperbolic.scene.add(gridLines)
    }

    function getNoDirectionVector(target) {
        let ourNoDual = mul(ourNo, ourPss, mv1)
        ambientLineMvToUnitVecDirection(ourNoDual, v1)
        v1.multiplyScalar(1. / v1.y)        
    }

    let conformal = new Dw(1, 2)
    {
        //could take the meet of each of the planes with your "looking plane"
        conformal.camera.position.set(0.,0.,0.)
        conformal.camera.fov = getFov(4.)
        conformal.camera.updateProjectionMatrix()
        conformal.camera.rotation.x = TAU / 8. //???

        let nOLine = new THREE.Mesh(cylGeo,new THREE.MeshBasicMaterial({color:0xFF8000}))
        nOLine.matrixAutoUpdate = false
        conformal.scene.add(nOLine)

        conformal.updateCamera = () => {
            getNoDirectionVector(v1)
            conformal.camera.lookAt(v1)
        }

        conformal.onClick = (x,y)=>{
            log("yo")
        }
        conformal.onDrag = (x,y) => {
            log("yaaa")
        }

        updateFunctions.push(()=>{
            meet(ourNo,eMinus,mv0)
            ambientLineMvToUnitVecDirection(mv0, v1)
            v1.multiplyScalar(100.)
            setRotationallySymmetricMatrix(v1.x, v1.y, v1.z, m1)

            getNoDirectionVector(v1)
            m1.setPosition(v1)

            nOLine.matrix.copy(m1)

            planeMvToNormalVector( ourNo, ourNoClippingPlane.normal)
            ourNoClippingPlane.normal.multiplyScalar(-1.)
        })

        let floorGridPointsMat = new THREE.MeshBasicMaterial({ color: 0x0000FF })
        var floorGridPoints = new THREE.InstancedMesh(pointGeo, floorGridPointsMat, gridCount)
        conformal.scene.add(floorGridPoints)
        let circleGridPointsMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 })
        var circleGridPoints = new THREE.InstancedMesh(pointGeo, circleGridPointsMat, gridCount*2)
        hyperbolic.scene.add(circleGridPoints)
    }

    function planeMvToNormalVector(planeMv, target) {
        return target.set(planeMv.e1(), planeMv.eMinus(), -planeMv.ePlus())
    }

    // let midPoint = new THREE.Vector3()
    // let directionToMoveInMv = new Mv()
    // let directionToMoveInVec = new THREE.Vector3()
    // function ptPairPtPosition(mv, positive, target) {
    //     getPositionVector(mv, midPoint)
    //     let distanceToSurface = Math.sqrt(1. - midPoint.lengthSq())

    

    //     meet(mv, eMinus, directionToMoveInMv)
    //     hyperbolicGrade3ToPositionVector(directionToMoveInMv, directionToMoveInVec)

    //     target.copy(midPoint).addScaledVector(directionToMoveInVec, distanceToSurface * (positive ? 1. : -1.))
    //     return target
    // }

    let cylinderPosition = new THREE.Vector3()
    let cylinderDirection = new THREE.Vector3()
    updateFunctions.push(() => {
        gridMvs.forEach((gmv, i) => {
            {
                //no, it's not the dual. The dual is NOT the line orthogonal to the plane and through the origin
                planeMvToNormalVector(gmv, v1)
                setRotationallySymmetricMatrix(v1.x,v1.y,v1.z,m1)
                gridPlanes.setMatrixAt(i, m1)
            }

            {
                m1.identity()

                meet(gmv, eMinus, mv1).normalize()
                ambientLineMvToUnitVecDirection(mv1, cylinderDirection).multiplyScalar(100.)
                setRotationallySymmetricMatrix(cylinderDirection.x, cylinderDirection.y, cylinderDirection.z, m1)

                hyperbolicOrigin.projectOn(gmv, mv2).normalize()
                cylinderPosition.set(mv2.ePlusMinus() / mv2.e1Plus(), 1., mv2.e1Minus() / mv2.e1Plus())
                m1.setPosition(cylinderPosition)

                gridLines.setMatrixAt(i, m1)
            }

            {
                //nO may be a name worth changing. Maybe So, for sphere at origin. Or why not eo? e0 has the slash
                meet(gmv, ourNo, mv0)
                ambientLineMvToUnitVecDirection(mv0, v1)
                v1.multiplyScalar(1./v1.y) //or maybe it could be related to look direction
                m1.identity().setPosition(v1)
                floorGridPoints.setMatrixAt(i, m1)

                //for the point pair
                cylinderPosition.y = 0.
                let midPointToHorosphereDist = diskInUnitSphereRadius(cylinderPosition)
                cylinderPosition.y = 1.
                if (isNaN(midPointToHorosphereDist)) {
                    m1.setPosition(999.,999.,999.)
                    circleGridPoints.setMatrixAt(i + gridCount, m1)
                    circleGridPoints.setMatrixAt(i, m1)
                }
                else {
                    cylinderDirection.setLength(midPointToHorosphereDist)

                    v1.copy(cylinderPosition).add(cylinderDirection)
                    m1.setPosition(v1)
                    circleGridPoints.setMatrixAt(i + gridCount, m1)
                    v1.copy(cylinderPosition).addScaledVector(cylinderDirection, -1.)
                    m1.setPosition(v1)
                    circleGridPoints.setMatrixAt(i, m1)
                }
            }
        })
        gridPlanes.instanceMatrix.needsUpdate = true
        gridLines.instanceMatrix.needsUpdate = true
        floorGridPoints.instanceMatrix.needsUpdate = true
        circleGridPoints.instanceMatrix.needsUpdate = true
    })
}