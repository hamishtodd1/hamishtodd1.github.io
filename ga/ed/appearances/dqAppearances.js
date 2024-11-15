//"what is the conversion, for this point at this distance from this line, between a radian and a meter?"

//could have it be that the y axis of the complexDw is always set by the things being the inner product of some blade

//if there's a translation part and an e0123 part, that's just a translation
//probably should be on a cylinder
//could move the camera in the window? Yeesh
function initDqs() {

    let eDw = dws.euclidean
    let iDw = dws.infinity
    let cDw = dws.complex

    let projectedOnOrigin = new Mv()
    let quatToOriginVersion = new Mv()
    let joinedWithOrigin = new Mv()
    let initialLineMeshMv = e31.clone().multiplyScalar(-1.)
    function getQuaternionToProjectionOnOrigin(model, target) {
        model.projectOn(e123, projectedOnOrigin).normalize()
        mul(projectedOnOrigin, initialLineMeshMv, quatToOriginVersion)
        quatToOriginVersion.sqrtSelf()
        quatToOriginVersion.toQuaternion(target)
    }

    // let torusGeo = new THREE.TorusGeometry(1.,.1,4,31, 3./4.*TAU)
    // log(torusGeo)
    // let torus = new THREE.Mesh ( torusGeo, new THREE.MeshBasicMaterial({color:0xFF0000}) )
    // cDw.addNonMentionChild(torus)

    let arcCurveDest = new THREE.Vector3(1.,2.,0.)
    class ComplexArc extends THREE.Curve {
        getPoint(t, optionalTarget = new THREE.Vector3()) {
            let modulusLog = Math.log( Math.sqrt(sq(arcCurveDest.x)+sq(arcCurveDest.y)) )
            let argument = Math.atan2(arcCurveDest.y,arcCurveDest.x)

            let ourModulusLog = t * modulusLog
            let ourArgument = t * argument

            optionalTarget.set(Math.cos(ourArgument), Math.sin(ourArgument), 0.)
            optionalTarget.multiplyScalar(Math.exp(ourModulusLog) )

            return optionalTarget
        }
    }
    let theComplexArc = new ComplexArc()

    let winderLog = new Biv().set(0., 0., 0., 1., 1., 1.)
    let winderLogT = new Biv()
    winderRadius = INFINITY_RADIUS / 3.
    let winderStart = new THREE.Vector3().set( winderRadius, 0., 0.) //have to initialize to something reasonable
    let winder = new Dq()

    function updateWinderStartFromPlaneToBeIn(plane) {
        
        let projectedOnPlane = ((mv2.fromVec(iDw.camera.position)).projectOn(plane, mv3))
        projectedOnPlane.toVector(winderStart)
        winderStart.negate()
        if (winderStart.lengthSq() === 0.)
            winderStart.copy(iDw.camera.up).applyQuaternion(iDw.camera.quaternion)

        winderStart.setLength( winderRadius )
    }
    // hackyAddition = 0.
    // rehack = (addn) => {
    //     hackyAddition += addn
    //     camera.toUpdateAppearance.forEach((appearance) => {
    //         appearance.updateMeshesFromState()
    //     })
    // }
    class InfinityArc extends THREE.Curve {
        getPoint(t, optionalTarget = new THREE.Vector3()) {
            
            winderLogT.copy(winderLog).multiplyScalar(t)
            winderLogT.exp(winder)
            
            optionalTarget.copy(winderStart)
            winder.applyToThreeVec(optionalTarget)

            return optionalTarget
        }
    }
    let theInfinityArc = new InfinityArc()

    let dotGeo = new THREE.CircleBufferGeometry(.15, 32)
    impartArcMeshes = (appearance, mat) => {
        appearance.cDwCurved   = cDw.NewMesh(dotGeo, mat)
        appearance.cDwStraight = cDw.NewMesh(dotGeo, mat)
        appearance.arcCurved   = cDw.NewMesh(OurTubeGeo(theComplexArc), mat)
        appearance.arcStraight = cDw.NewMesh(straightArcGeo, mat)

        //yeah you should have winding too

        appearance.meshes.push( appearance.cDwCurved, appearance.cDwStraight, appearance.arcCurved, appearance.arcStraight )
    }

    //want a tube geometry and an arrow head (that shrinks)

    let tubeRadius = .04
    let straightArcGeo = new THREE.CylinderGeometry(tubeRadius,tubeRadius,1.,8,1,true)
    function OurTubeGeo(curve) {
        return new THREE.TubeBufferGeometry(curve, 31, tubeRadius, 7, false)
    }
    function updateTubeGeo(geo, curve) {
        let tempGeo = OurTubeGeo(curve)
        let arr = geo.attributes.position.array
        for (let i = 0, il = arr.length; i < il; ++i)
            arr[i] = tempGeo.attributes.position.array[i]
        tempGeo.dispose()
        geo.attributes.position.needsUpdate = true
    }

    function getNewUniformDotValue() {
        return new Dq()
    }

    let eLineGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, 500.)
    let iLineGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, INFINITY_RADIUS*2.)
    let ringGeo = new THREE.TorusGeometry(INFINITY_RADIUS, tubeRadius, 7, 62)

    let tipLength = tubeRadius * 4.
    let arrowTipGeo = new THREE.CylinderGeometry(tubeRadius, tipLength, tipLength, 14)
    arrowTipGeo.translate(0., -tipLength / 2.,0.)
    arrowTipGeo.rotateX(-TAU / 4.)

    function squash(minusInfinityToInfinity) {
        return Math.atan(minusInfinityToInfinity) / (TAU / 4.)
    }

    {
        // let booM = new THREE.MeshPhongMaterial({ color: 0xFF0000 })
        // let boo = new THREE.Mesh(OurTubeGeo(theInfinityArc), booM)
        // let booTip = new THREE.Mesh(arrowTipGeo, booM)
        // iDw.addNonMentionChild(boo)
        // iDw.addNonMentionChild(booTip)

        // winderStart.set(0., 0., 0.)
        // add(e02,e01,mv0)
        // winderLog.fromMv(mv0).multiplyScalar(-.25)
        // updateTubeGeo(boo.geometry, theInfinityArc)

        // theInfinityArc.getPoint(.99, v1)
        // theInfinityArc.getPoint(1., v2)
        // booTip.position.copy(v2)
        // booTip.lookAt(v1)
    }

    let displayedLineMv = new Mv()
    let linePart = new Mv() //bivector?
    let newLinePart = new Mv()
    let idealLineDual = new Mv()
    let labelPoint = new Mv()
    let iDwIntersection = new Mv()
    let rotationAxis = new Biv()
    let translationAxis = new Biv()
    let whenGrabbed = new Dq()
    let asMv = new Mv()
    class DqAppearance extends Appearance {
        #mat2d
        #mat3d

        #windingMesh
        #windingMeshTip

        #eDwLineMesh
        #eDwRingMesh
        #iDwLineMesh
        #iDwRingMesh

        linePartWhenGrabbedNormalized = new Mv()

        constructor() {
            super()
            
            this.uniform.value = this.state = getNewUniformDotValue()
            this.stateOld = new Dq()
            this.stateOld[7] = 1.

            //default value
            {
                this.state[0] = -1. / Math.sqrt(2.)
                this.state[4] = 1. / Math.sqrt(2.)
            }

            this.#mat3d = new THREE.MeshPhongMaterial()
            this.#mat3d.color = this.col
            this.#mat2d = new THREE.MeshBasicMaterial({ side:THREE.DoubleSide })
            this.#mat2d.color = this.col

            this.#eDwLineMesh = eDw.NewMesh( eLineGeo, this.#mat3d)
            this.#eDwRingMesh = eDw.NewMesh( eLineGeo, this.#mat3d)
            // camera.scalesToChange.push(this.#eDwLineMesh.scale)
            this.#iDwLineMesh = iDw.NewMesh( iLineGeo, this.#mat3d)
            this.#iDwRingMesh = iDw.NewMesh( ringGeo,  this.#mat3d)

            this.#windingMesh = iDw.NewMesh( OurTubeGeo(theInfinityArc), this.#mat3d)
            this.#windingMeshTip = iDw.NewMesh(arrowTipGeo, this.#mat3d)

            camera.toUpdateAppearance.push(this)

            this.meshes.push(
                this.#eDwLineMesh, this.#eDwRingMesh,
                this.#iDwLineMesh, this.#iDwRingMesh,
                this.#windingMesh,
                this.#windingMeshTip,
            )

            impartArcMeshes(this, this.#mat2d)
            impartScalarMeshes(this, this.#mat2d)
        }

        displayLineAtInfinity(lineMv) {
            this.#iDwRingMesh.position.set(0., 0., 0.)
            join(e123, lineMv, joinedWithOrigin)
            joinedWithOrigin.normalize()
            mul(joinedWithOrigin, e3, quatToOriginVersion)
            quatToOriginVersion.sqrtSelf()
            quatToOriginVersion.toQuaternion(this.#iDwRingMesh.quaternion)

            lineMv.getDisplayableVersion(displayedLineMv)
            getQuaternionToProjectionOnOrigin(displayedLineMv, this.#eDwRingMesh.quaternion)
            e123.projectOn(displayedLineMv, mv0).toVector(this.#eDwRingMesh.position)
            this.#eDwRingMesh.scale.setScalar(.2 * camera.position.distanceTo(this.#eDwRingMesh.position))
        }

        onGrab(dw) {
            this.state.getBivectorPartToMv(this.linePartWhenGrabbedNormalized)
            this.linePartWhenGrabbedNormalized.normalize()

            if (dw === eDw) {
                this.state.getBivectorPartToMv(linePart)
                setDragPlane(linePart)
            }

            if(dw === dws.scalar)
                whenGrabbed.copy(this.state)
        }
        
        onLetGo() {
            this.linePartWhenGrabbedNormalized.copy(zeroMv)
        }

        _updateStateFromDrag(dw) {
            this.state.getBivectorPartToMv(linePart)

            if (dw === cDw) {
                
                this.state[7] = 0. //hell no, not thinking about screw motions 

                getOldClientWorldPosition(dw, v1)

                if( this.linePartWhenGrabbedNormalized.norm() === 0.) //if it started a scalar, we're not going to decide for you what its line part should be!
                    v1.y = 0.
                else {
                    if (v1.y === 0.)
                        v1.y = .001

                    if (this.linePartWhenGrabbedNormalized.eNorm() !== 0.) // rotation (or screw axis?)
                        v1.normalize()
                    else                                                   // translation
                        v1.x = 1.

                    this.state[0] = v1.x
                    this.state.setBivectorPartFromMvAndScalarMultiple(this.linePartWhenGrabbedNormalized, v1.y)
                }
            }
            else if(dw === dws.scalar) {
                getOldClientWorldPosition(dw, v1)

                this.state.copy(whenGrabbed)
                this.state.normalize()
                this.state.multiplyScalar(v1.x)
            }
            else if (dw === eDw) {
                let oldJoinedWithCamera = join(linePart, camera.mvs.pos, mv0)
                let joinedWithCamera = oldJoinedWithCamera.projectOn(getMouseRay(dw), mv1)
                intersectDragPlane(joinedWithCamera, newLinePart)

                newLinePart.normalize()
                if(inner(newLinePart,linePart,mv0)[0] > 0.)
                    newLinePart.multiplyScalar(-1.)
                this.state.setBivectorPartFromMvAndScalarMultiple(newLinePart, linePart.norm())
            }
            else if (dw === iDw) {
                
                iDw.mouseRayIntersection(iDwIntersection,false)
                let lineIsInfinite = !linePart.hasEuclideanPart()

                if ( lineIsInfinite ) {
                    iDw.mouseRayIntersection(mv0, false)
                    mv0[14] = 0.
                    meet(dual(mv0, mv1), e0, newLinePart)
                    newLinePart.normalize()
                }
                else {
                    let currentOrthPlane = inner(linePart,e123,  mv0).normalize()
                    let intendedOrthPlane = dual(iDwIntersection,mv1).normalize()
                    mul(intendedOrthPlane, currentOrthPlane, mv2)
                    mv2.sqrtSelf()
                    mv2.sandwich(linePart,newLinePart)
                }
                
                newLinePart.normalize()
                if (inner(dual(newLinePart,mv0), dual(linePart,mv1), mv2)[0] > 0.)
                    newLinePart.multiplyScalar(-1.)
                this.state.setBivectorPartFromMvAndScalarMultiple(newLinePart, linePart.norm())
            }
            else return false
        }

        updateMeshesFromState() {

            // log(this.variable.name,this.state)

            this.state.toMv(asMv)

            //TODO should rotate the thingy arrow so that its origin is as close as possible to camera

            this.state.getBivectorPartToMv(linePart)
            let isGrabbedAndWoundBackward = false
            if (isGrabbed(this)) {
                let indicator = inner(linePart, reverse(this.linePartWhenGrabbedNormalized, mv0), mv1)[0]

                if (indicator === 0.) //it's a null line so it tells you nothing. This is an interesting formula!
                    indicator = inner(dual(linePart, mv2), dual(reverse(this.linePartWhenGrabbedNormalized, mv0), mv3), mv1)[0]

                isGrabbedAndWoundBackward = indicator < 0.
            }

            let eNormLinePart = linePart.eNorm()
            let iNormLinePart = linePart.iNorm()

            // let scalarValue = eNormLinePart > 0.? eNormLinePart : iNormLinePart
            if (isGrabbedAndWoundBackward)
                updateScalarMeshes(this,asMv.norm() * -1.)
            else
                updateScalarMeshes(this,asMv.norm())

            //TODO this is the code that you used when you had a grabbedDuplicate
            // let proportionOfComparison = -1. * inner(linePart, grabbedDuplicate.linePartWhenGrabbedNormalized, mv0)[0]
            // this.cDwCurved.position.y = proportionOfComparison

            //lines
            if (eNormLinePart === 0. && iNormLinePart === 0.)  {
                //it's either the identity or 0.
                this.#iDwRingMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
                this.#iDwLineMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
                this.#eDwLineMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
                this.#eDwRingMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
                //and the motor window is the only place you see that this thing has a scalar value
            }
            else if (eNormLinePart !== 0.) {
                getQuaternionToProjectionOnOrigin(linePart, this.#iDwLineMesh.quaternion)
                this.#iDwLineMesh.position.set(0., 0., 0.)

                getQuaternionToProjectionOnOrigin(linePart, this.#eDwLineMesh.quaternion)
                e123.projectOn(linePart, mv0).toVector(this.#eDwLineMesh.position)

                this.#eDwLineMesh.scale.setScalar(.2 * camera.position.distanceTo(this.#eDwLineMesh.position))

                let studyNumber = meet(linePart, linePart, mv0)
                let squaresToScalar = Math.abs( studyNumber[15] / eNormLinePart ) < .01 
                if (this.state[7] !== 0. || !squaresToScalar ) {
                    //It could be a screw axis AND/OR a screw motion
                    //e12 + e0123 is a qualitatively different thing than e12+e03, but you should probably viz both
                    //screw axis, even with a scalar, is qualitatively similar to having a translation axis without an identity part

                    this.#iDwRingMesh.position.set(0., 0., 0.)
                    mul(linePart,I,mv0)
                    this.displayLineAtInfinity(mv0)
                }
                else {
                    this.#eDwRingMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
                    this.#iDwRingMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
                }
            }
            else if (iNormLinePart !== 0.) {
                //default mv is e02
                this.#iDwLineMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
                this.#eDwLineMesh.position.copy(OUT_OF_SIGHT_VECTOR3)

                this.displayLineAtInfinity(linePart)
            }

            //cDw
            {
                if (eNormLinePart === 0. && this.state[0] !== 0.) {
                    //ordinary translation
                    this.cDwCurved.position.copy(OUT_OF_SIGHT_VECTOR3)

                    this.cDwStraight.position.x = Math.sign(this.state[0])
                    this.cDwStraight.position.y = iNormLinePart * (isGrabbedAndWoundBackward ? -1. : 1.)
                    this.cDwStraight.position.z = 0.
                }
                else if (eNormLinePart === 0.) {
                    // Either 0 or translation axis
                    // Could put at the center, but that's more the scalarDw's job
                    this.cDwCurved.position.copy(OUT_OF_SIGHT_VECTOR3)
                    this.cDwStraight.position.copy(OUT_OF_SIGHT_VECTOR3)
                }
                else if (eNormLinePart !== 0.) {
                    if (this.state[7] === 0.) { //ordinary rotation rotation
                        this.cDwCurved.position.x = this.state[0]
                        this.cDwCurved.position.y = eNormLinePart * (isGrabbedAndWoundBackward ? -1. : 1.)
                        this.cDwCurved.position.z = 0.
                        this.cDwCurved.position.normalize()

                        this.cDwStraight.position.copy(OUT_OF_SIGHT_VECTOR3)
                    }
                    else { // screw motion
                        // isGrabbedAndWoundBackward == true is impossible here
                        // if you're held then we make you into a rotation or translation, so handled above

                        asMv.getTranslationFromScrewMotion(mv1)
                        this.cDwStraight.position.x = Math.sign(mv1[0])
                        this.cDwStraight.position.y = mv1.iNorm() * (isGrabbedAndWoundBackward ? -1. : 1.)
                        this.cDwStraight.position.z = 0.

                        mv1.multiplyScalar(-1.)
                        mv1[0] = 1.
                        let rotationPart = mul(asMv, mv1, mv2)

                        this.cDwCurved.position.x = rotationPart[0]
                        this.cDwCurved.position.y = rotationPart.selectGrade(2, mv3).norm() * (isGrabbedAndWoundBackward ? -1. : 1.)
                        this.cDwCurved.position.z = 0.
                        this.cDwCurved.position.normalize()
                    }
                }

                if (this.cDwCurved.position.y === 0. || this.cDwCurved.position.equals(OUT_OF_SIGHT_VECTOR3))
                    this.arcCurved.position.copy(OUT_OF_SIGHT_VECTOR3)
                else {
                    this.arcCurved.position.set(0., 0., 0.)
                    arcCurveDest.set(this.cDwCurved.position.x, this.cDwCurved.position.y, 0.)
                    updateTubeGeo(this.arcCurved.geometry, theComplexArc)
                }

                if (this.cDwStraight.position.y === 0. || this.cDwStraight.position.equals(OUT_OF_SIGHT_VECTOR3))
                    this.arcStraight.position.copy(OUT_OF_SIGHT_VECTOR3)
                else {
                    this.arcStraight.position.set(this.cDwStraight.position.x, .5 * this.cDwStraight.position.y, 0.)
                    this.arcStraight.scale.y = this.cDwStraight.position.y
                }
            }

            //winding
            {
                if (eNormLinePart !== 0.) {
                    //Rotation or screw motion

                    this.#windingMesh.position.set(0., 0., 0.)

                    dq0.copy(this.state)
                    dq0[1] = 0.; dq0[2] = 0.; dq0[3] = 0.; dq0[7] = 0.
                    dq0.normalize()
                    dq0.logarithm(rotationAxis)

                    let rotationAxisMv = rotationAxis.toMv(mv0)

                    let rotationPlane = mul(rotationAxis.toMv(mv0), e123, mv1)
                    updateWinderStartFromPlaneToBeIn(rotationPlane)

                    let orientedTransformDist = this.state[7] / eNormLinePart
                    let iDwDistance = squash(orientedTransformDist)
                    translationAxis.fromMv(mul(rotationAxisMv, I, mv0).normalize())
                    translationAxis.multiplyScalar( INFINITY_RADIUS / 2. * iDwDistance )

                    add(rotationAxis, translationAxis, winderLog)
                }
                else if (iNormLinePart === 0. && this.state[0] < 0.) {
                    this.#windingMesh.position.set(0., 0., 0.)

                    //Full 360
                    dual(camera.mvs.pos,mv0)
                    mv0[1] = 0.
                    updateWinderStartFromPlaneToBeIn(mv0)
                    join(camera.mvs.pos, e123, mv1).normalize()
                    winderLog.fromMv(mv1)
                    winderLog.multiplyScalar(Math.PI *.99)
                }
                else if (iNormLinePart !== 0. && this.state[0] !== 0. ) {
                    //ordinary translation
                    this.#windingMesh.position.set(0., 0., 0.)
                    
                    let planeIncludingLineAtInfinity = join(linePart, e123, mv0)
                    updateWinderStartFromPlaneToBeIn(planeIncludingLineAtInfinity)

                    winderLog.fromMv(mv0.copy(linePart).normalize())
                    let orientedTransformDist = iNormLinePart / this.state[0]
                    let iDwDistance = squash(orientedTransformDist)
                    winderLog.multiplyScalar(INFINITY_RADIUS / 2. * iDwDistance)

                    
                    
                    //the clever version
                    // let planeFacingAtCamera = dual(mv5.fromDirectionVec( iDw.camera.position ),mv1)
                    // let lineParallelToAxis = meet(planeFacingAtCamera, planeIncludingLineAtInfinity, mv2).normalize()
                    // let linePartNormalized = mv3.copy(linePart).normalize().multiplyScalar( INFINITY_RADIUS )
                    // add(linePartNormalized, lineParallelToAxis, mv4).normalize() //should have correct orientation
                    // winderLog.fromMv(mv4).multiplyScalar(.5 * Math.atan(iNormLinePart / this.state[0]))
                }
                else {
                    //maybe should handle identity situation? It's a full mobius?
                    this.#windingMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
                    this.#windingMeshTip.position.copy(OUT_OF_SIGHT_VECTOR3)
                }

                if (!this.#windingMesh.position.equals(OUT_OF_SIGHT_VECTOR3)) {
                    this.#windingMesh.position.set(0., 0., 0.)
                    updateTubeGeo(this.#windingMesh.geometry, theInfinityArc)
    
                    theInfinityArc.getPoint(.99, v1)
                    theInfinityArc.getPoint(1., v2)
                    this.#windingMeshTip.position.copy(v2)
                    this.#windingMeshTip.lookAt(v1)
                }
            }
        }

        getWorldCenter(dw, target) {
            if (dw === dws.scalar)
                getScalarMeshesPosition(this,target)
            else if (dw === cDw) {
                if (this.cDwCurved.position.lengthSq() < this.cDwStraight.position.lengthSq() )
                    target.copy(this.cDwCurved.position)
                else 
                    target.copy(this.cDwStraight.position)
            }
            else {
                if (dw === eDw) {
                    if(!this.#eDwLineMesh.position.equals(OUT_OF_SIGHT_VECTOR3)) {
                        target.copy(this.#eDwLineMesh.position)
                        target.w = 1.
                    }
                    else if (!this.#eDwRingMesh.position.equals(OUT_OF_SIGHT_VECTOR3)) {
                        target.copy(this.#eDwRingMesh.position)
                        target.w = 1.
                    }
                }
                else if (dw === iDw) {
                    if(!this.linePartWhenGrabbedNormalized.equals(zeroMv))
                        linePart.copy( this.linePartWhenGrabbedNormalized )
                    else
                        this.state.getBivectorPartToMv(linePart)

                    if (linePart.hasEuclideanPart())
                        target.copy(this.#windingMeshTip.position)
                    else {
                        dual(linePart, idealLineDual)
                        let planeToIntersect = join(camera.mvs.pos, idealLineDual, mv0)
                        meet(planeToIntersect, linePart, labelPoint)
                        let vec3Part = labelPoint.toVector(v1)
                        vec3Part.setLength(INFINITY_RADIUS)
                        target.copy(vec3Part)
                        target.w = 1.
                    }
                }
            }
        }

        _getTextareaManipulationDw() {
            this.state.getBivectorPartToMv(linePart)

            if(linePart.equals(zeroMv))
                return dws.scalar
            else if(cDw.visible)
                return cDw
            else if(iDw.visible)
                return iDw
            else
                return eDw
        }
    }
    
    new AppearanceType("Dq", 8, DqAppearance, getNewUniformDotValue, [ `w`, `e01`, `e02`, `e03`, `e12`, `e31`, `e23`, `dxyz` ])
}