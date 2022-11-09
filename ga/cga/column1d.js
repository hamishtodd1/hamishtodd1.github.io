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

    {
        function applyToGrid(rotor) {
            gridMvs.forEach((gmv) => {
                rotor.sandwich(gmv, mv1)
                gmv.copy(mv1)
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
                applyToGrid(rotorsArr[i])
            })
        })

        bindButton(",", () => { }, ``, () => {
            mv0.copy(freeAxis).naieveAxisToRotor(.01)
            applyToGrid(mv0)
        })
        bindButton(".", () => { }, ``, () => {
            mv0.copy(freeAxis).naieveAxisToRotor(-.01)
            applyToGrid(mv0)
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

    let bottomClippingPlane = new THREE.Plane(new THREE.Vector3(0.,1.,0.),0.)
    let nIClippingPlane = new THREE.Plane(new THREE.Vector3(0., 1., -1.), .01)
    // let nOClippingPlane = new THREE.Plane(new THREE.Vector3(0., 1.,-1.), .01) //set to a big number to set more back planes
    let ourNoClippingPlane = new THREE.Plane(new THREE.Vector3(), .01)
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
        let numHorizontals = 7
        for (let i = 0; i < numHorizontals; ++i) {
            let zeroToOne = i / (numHorizontals - 1)
            let ourTranslation = mv0.copy(spineMv).naieveAxisToRotor((zeroToOne - .5) * 2.)
            gridMvs[i] = new Mv()
            ourTranslation.sandwich(e1, gridMvs[i])
        }
        // gridMvs.push(ePlus.clone())
        // gridMvs.push(ePlus.clone().sub(nI))
        // gridMvs.push(ePlus.clone().add(nO))
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

        let parabolicAxisMv = AxisAndBall()
        parabolicAxisMv.copy(spineMv)
        let hyperbolixAxisMv = AxisAndBall()
        hyperbolixAxisMv.copy(ePlusMinus)
        let zollyAxisMv = AxisAndBall()
        zollyAxisMv.copy(e1Plus).addScaled(e1Minus, -1.)
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
        ambient.scene.add(eye)
        
        var freeAxis = AxisAndBall()
        freeAxis.copy(e1Plus)
        function setFreeAxis(x,y) {
            freeAxis.copy(ePlusMinus)
                .multiplyScalar(hyperbolicFov * x)
                .addScaled(e1Minus, hyperbolicFov*y)
            if (Math.abs(x) < .5 && Math.abs(y) < .5)
                freeAxis.addScaled(e1Plus, 1.)
        }
        hyperbolic.onClick = (x, y) => {
            setFreeAxis(x,y)
        }
        hyperbolic.onDrag = (x,y)=>{
            setFreeAxis(x,y)
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

        let nOLine = new THREE.Mesh(cylGeo,new THREE.MeshBasicMaterial({color:0xFF0000}))
        nOLine.matrixAutoUpdate = false
        conformal.scene.add(nOLine)

        conformal.updateCamera = () => {
            getNoDirectionVector(v1)
            conformal.camera.lookAt(v1)
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

        let gridPointsMat = new THREE.MeshBasicMaterial({ color: 0x0000FF })
        var gridPoints = new THREE.InstancedMesh(pointGeo, gridPointsMat, gridCount)
        conformal.scene.add(gridPoints)
    }

    function planeMvToNormalVector(planeMv, target) {
        return target.set(planeMv.e1(), planeMv.eMinus(), -planeMv.ePlus())
    }

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
                ambientLineMvToUnitVecDirection(mv1, v1).multiplyScalar(100.)
                setRotationallySymmetricMatrix(v1.x, v1.y, v1.z, m1)

                hyperbolicOrigin.projectOn(gmv, mv2).normalize()
                ambientLineMvToUnitVecDirection(mv2, v1)
                m1.setPosition(mv2.ePlusMinus() / mv2.e1Plus(), 1., mv2.e1Minus() / mv2.e1Plus())

                gridLines.setMatrixAt(i, m1)
            }

            {
                //nO may be a name worth changing. Maybe So, for sphere at origin. Or why not eo? e0 has the slash
                meet(gmv, ourNo, mv0)
                ambientLineMvToUnitVecDirection(mv0, v1)
                v1.multiplyScalar(1./v1.y) //or maybe it could be related to look direction
                m1.identity().setPosition(v1)
                gridPoints.setMatrixAt(i,m1)
            }
        })
        gridPlanes.instanceMatrix.needsUpdate = true
        gridLines.instanceMatrix.needsUpdate = true
        gridPoints.instanceMatrix.needsUpdate = true
    })
}