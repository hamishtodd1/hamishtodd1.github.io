//this project may interest slehar, keenan crane, Bobenko, Stefan, Penrose, CFT, Michael from huawei
function initColumn1d() {
    let coneTopRadius = 1.
    let coneDiagonalLength = Math.sqrt(2.) * coneTopRadius

    let ourPss = mul(e1Plus, eMinus)
    let ourNo = nO.clone()

    //possible here since there's only one axis a translation can be around
    function setTranslation(amt, target) {
        target.copy(spineMv)
        target.multiplyScalar(amt)
        target[0] = 1.
        target.normalize()
        return target
    }

    {
        function applyToGrid(rotor) {
            gridMvs.forEach((gmv) => {
                rotor.sandwich(gmv, mv1)
                gmv.copy(mv1)
            })
        }

        let rotorUp = ePlusMinus.clone().multiplyScalar(-.01)
        let rotorDown = ePlusMinus.clone().multiplyScalar(.01)
        rotorUp[0] = 1.
        rotorDown[0] = 1.
        rotorUp.normalize()
        rotorDown.normalize()

        let rotorSpling = mul(nO,e1)
        rotorSpling.multiplyScalar(.01)
        rotorSpling[0] = 1.
        rotorSpling.normalize()
        let rotorSplong = mul(nO, e1)
        rotorSplong.multiplyScalar(-.01)
        rotorSplong[0] = 1.
        rotorSplong.normalize()
        bindButton(`PageDown`, () => { }, ``, () => {
            applyToGrid(rotorSplong)
        })
        bindButton(`PageUp`, () => { }, ``, () => {
            applyToGrid(rotorSpling)
        })

        bindButton(`ArrowUp`, () => { }, ``, () => {
            applyToGrid(rotorUp)
        })
        bindButton(`ArrowDown`, () => { }, ``, () => {
            applyToGrid(rotorDown)
        })
        bindButton(`ArrowLeft`, () => { }, ``, () => {
            let verySlightTranslation = setTranslation(-.05, mv0)
            applyToGrid(verySlightTranslation)
        })
        bindButton(`ArrowRight`, () => { }, ``, () => {
            let verySlightTranslation = setTranslation(.05, mv0)
            applyToGrid(verySlightTranslation)
        })

        bindButton(`g`, () => { }, ``, () => {
            mv0.copy(e1Plus)
            mv0[0] = 99.
            mv0.normalize()
            ourNo.applyRotor(mv0)
        })
        bindButton(`h`, () => { }, ``, () => {
            mv0.copy(e1Plus)
            mv0[0] = -99.
            mv0.normalize()
            ourNo.applyRotor(mv0)
        })
    }

    let ambient = new Dw(1, 0, true, true)

    {
        let ordinaryModeCameraPosition = new THREE.Vector3()
        ambient.updateCamera = () => {
            ambient.camera.position.copy(ordinaryModeCameraPosition)
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
        ambient.onRightClick = (x, y) => { xOld = x; yOld = y }
        ambient.onRightDrag = (x, y) => {
            if(this.unusualCameraMode)
                return
            moveCamera(ordinaryModeCameraPosition, true, -.1 * (x - xOld))
            moveCamera(ordinaryModeCameraPosition, false, .1 * (y - yOld))
            xOld = x
            yOld = y
        }
        let cameraDist = 1.3 * ambient.camera.position.length()
        ordinaryModeCameraPosition.set(0., 0., 1.).setLength(cameraDist)
        
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
    
    //right, it's confusing as fuck because if you want:
    // y plane, eMinus, is oriented up
    // z plane, ePlus, is oriented towards us
    // then nI = ePlus+eMinus is oriented towards positive x, positive y
    // and its dual, the spine, is -z, +y. Fucking CGA dual
    let spineMv = new Mv()
    mul(e1, nI, spineMv)

    let unitHeightCylGeo = CylinderBufferGeometryUncentered(tubeRadius, 1., 8, 1, true)
    let cylGeo = new THREE.CylinderBufferGeometry(tubeRadius, tubeRadius, 2., 8, 1, true)
    
    {
        let coneMat = new THREE.MeshPhongMaterial({
            color: 0x00FF00,
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

        let spineMat = new THREE.MeshPhongMaterial({color:0xFF0000})
        let spine = new THREE.Mesh(cylGeo, spineMat)
        ambient.scene.add(spine)
        
        spine.matrixAutoUpdate = false
        ambientLineMvToUnitVecDirection(spineMv,v1)
        v1.multiplyScalar(coneDiagonalLength * 2.)
        spine.matrix.makeBasis(xUnit,v1,zUnit)
    }

    const gridCount = 40
    let gridMvs = Array(gridCount)
    {
        let spacerTranslation = setTranslation(.2, new Mv())
        for (let i = 0; i < gridCount; ++i) {
            let ourTranslation = setTranslation((i/gridCount-.5)*12., mv0)
            gridMvs[i] = new Mv()
            ourTranslation.sandwich(e1, gridMvs[i])
        }

        let rectMat = new THREE.MeshPhongMaterial({
            clippingPlanes: [bottomClippingPlane, topClippingPlane, nIClippingPlane, ourNoClippingPlane],
            transparent: true,
            opacity: .9,
            color: 0xFF0000,
            side: THREE.DoubleSide
        })
        let rectHeight = 1.
        let rectWidth = coneDiagonalLength
        let rectGeo = new THREE.PlaneGeometry(10., 10.)
        // rectGeo.translate(rectWidth * .5, rectHeight * .5, 0.)

        var gridPlanes = new THREE.InstancedMesh(rectGeo, rectMat, gridCount)
        ambient.scene.add(gridPlanes)
        // let nOPlane = new THREE.Mesh(rectGeo,new THREE.MeshBasicMaterial({color:0x000000}))
        // ambient.scene.add(nOPlane)
        //lower cameras should look at nODual
    }

    let hyperbolic = new Dw(1,1, true, true)
    {
        // in this context, the x and y directions (ultra ideal points) are ePlusMinus and e1Minus

        hyperbolic.camera.rotation.x = TAU / 4.
        hyperbolic.camera.position.set(0.,0.,0.)

        hyperbolic.updateCamera = () => {
            let lookDirection = v1
            getNoDirectionVector(lookDirection)
            lookDirection.lerp(yUnit,1.-hyperbolic.cameraUnusualness)
            hyperbolic.camera.lookAt(lookDirection)

            eye.rotation.copy(hyperbolic.camera.rotation)
        }

        

        let eye = createEye()
        ambient.scene.add(eye)

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

        let nOLine = new THREE.Mesh(cylGeo,new THREE.MeshBasicMaterial({color:0x00FFFF}))
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

        let gridPointsGeo = new THREE.SphereGeometry(tubeRadius * 3.)
        let gridPointsMat = new THREE.MeshBasicMaterial({ color: 0x0000FF })
        var gridPoints = new THREE.InstancedMesh(gridPointsGeo, gridPointsMat, gridCount)
        conformal.scene.add(gridPoints)
    }

    function planeMvToNormalVector(planeMv, target) {
        return target.set(planeMv.e1(), planeMv.eMinus(), -planeMv.ePlus())
    }

    updateFunctions.push(() => {
        gridMvs.forEach((gmv, i) => {
            {
                let spineDirection = ambientLineMvToUnitVecDirection(spineMv, v1).normalize()
                //no, it's not the dual. The dual is NOT the line orthogonal to the plane and through the origin
                let normal = planeMvToNormalVector(gmv, v2)
                let xDirection = v3.copy(spineDirection).cross(normal).normalize()

                m1.makeBasis(xDirection, spineDirection, normal)
                gridPlanes.setMatrixAt(i, m1)
            }

            {
                m1.identity()

                meet(gmv, eMinus, mv1).normalize()
                ambientLineMvToUnitVecDirection(mv1, v1).multiplyScalar(100.)
                setRotationallySymmetricMatrix(v1.x, v1.y, v1.z, m1)

                //e1Plus is the origin/center of the circle
                e1Plus.projectOn(gmv, mv2).normalize()
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