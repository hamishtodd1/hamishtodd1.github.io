//if there's a translation part and an e0123 part, that's just a translation
//probably should be on a cylinder
//could move the camera in the window? Yeesh
function initDqs() {

    let cases = [
        `IDENTITY`,
        `ROTATION`,
        `ROTATION_AXIS`,
        `TRANSLATION`,
        `TRANSLATION_AXIS`,
        `SCREW`,
        `SCREW_AXIS`,
    ]
    let str = ``
    cases.forEach((theCase,i)=>{
        str += `let DQ_` + theCase + ` = ` + i + `;`
    })

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
    class ArcCurve extends THREE.Curve {
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
    let theArcCurve = new ArcCurve()

    let numMsVerts = 31
    let mobiusStripGeo = new THREE.PlaneBufferGeometry(1.,1.,1,numMsVerts-1)
    let stripWidthHalved = .1
    let stripRadius = INFINITY_RADIUS * .5
    let complexMat = new THREE.MeshPhongMaterial({ color: 0xAAAAAA, side: THREE.DoubleSide })
    {
        let makinRotor = new Mv()
        function toMobiusEdge(side, t, target) {
            mv0.point(side ? stripWidthHalved : -stripWidthHalved, 0., 0., 1.)

            makinRotor.fromAxisAngle(e12, t / 2.)
            makinRotor.sandwich(mv0, mv1)
            mv1[13] += stripRadius

            makinRotor.fromAxisAngle(e31, -t )
            makinRotor.sandwich(mv1, target)

            return target
        }

        mobiusStripGeo.translate(0., .5, 0.)
        let msgArr = mobiusStripGeo.attributes.position.array
        for (let i = 0; i < numMsVerts*2; ++i) {
            let side = msgArr[i * 3 + 0] < 0.
            let t = msgArr[i * 3 + 1]

            toMobiusEdge(side, t * TAU, mv2)
            mv2.toVectorArray(msgArr, i)
        }
        mobiusStripGeo.computeVertexNormals()
    }

    let rimCurveAngle = TAU / 2.
    class RimCurve extends THREE.Curve {
        getPoint(t, optionalTarget = new THREE.Vector3()) {
            toMobiusEdge(true,t*rimCurveAngle, mv2)
            //need to copy in the rotor of the line
            mv2.toVector(optionalTarget)
            if (isNaN(optionalTarget.x) || isNaN(optionalTarget.y) || isNaN(optionalTarget.z)) {
                debugger
                toMobiusEdge(true, t * rimCurveAngle, mv2)
            }
            
            return optionalTarget
        }
    }
    let theRimCurve = new RimCurve()

    class RingCurve extends THREE.Curve {
        getPoint(t, optionalTarget = new THREE.Vector3()) {
            optionalTarget.set(INFINITY_RADIUS / 2.,0.,0.)
            optionalTarget.applyAxisAngle(yUnit,t*rimCurveAngle)

            return optionalTarget
        }
    }
    let theRingCurve = new RingCurve()

    //want a tube geometry and an arrow head (that shrinks)

    let tubeRadius = .03
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

    let eLineGeo = new THREE.CylinderGeometry(.03, .03, 500.)
    let iLineGeo = new THREE.CylinderGeometry(.03, .03, INFINITY_RADIUS*2.)
    let dotGeo = new THREE.CircleBufferGeometry(.1, 32)
    let ringGeo = new THREE.TorusGeometry(INFINITY_RADIUS, .03, 7, 62)

    let tipLength = tubeRadius * 5.
    let arrowTipGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius * 5., tipLength)
    arrowTipGeo.translate(0., -tipLength / 2.,0.)
    arrowTipGeo.rotateX(-TAU / 4.)

    let displayedLineMv = new Mv()
    let linePart = new Mv() //bivector?
    let newLinePart = new Mv()
    let idealLineDual = new Mv()
    let labelPoint = new Mv()
    let iDwIntersection = new Mv()
    class DqAppearance extends Appearance {
        #mat2d
        #mat3d

        #cDwMesh
        #arcMesh

        // #mobiusStripMesh
        // #rimMesh
        #windingMesh
        #windingMeshTip

        #eDwMesh
        #iDwLineMesh
        #iDwRingMesh

        linePartWhenGrabbedNormalized = new Mv()
        #complexWhenGrabbed = new THREE.Vector2()

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

            this.#eDwMesh = eDw.NewMesh(eLineGeo, this.#mat3d)
            // camera.scalesToChange.push(this.#eDwMesh.scale)
            this.#iDwLineMesh = iDw.NewMesh(iLineGeo, this.#mat3d)
            this.#iDwRingMesh = iDw.NewMesh(ringGeo,  this.#mat3d)
            
            this.#cDwMesh = cDw.NewMesh(dotGeo, this.#mat2d)
            this.#arcMesh = cDw.NewMesh(OurTubeGeo(theArcCurve), this.#mat2d)

            // this.#mobiusStripMesh = iDw.NewMesh(mobiusStripGeo, complexMat) //possibly only one of these is needed
            // this.#rimMesh = iDw.NewMesh(OurTubeGeo(theRimCurve), this.#mat3d)

            this.#windingMesh = iDw.NewMesh(OurTubeGeo(theRingCurve), this.#mat3d)
            this.#windingMeshTip = iDw.NewMesh(arrowTipGeo, this.#mat3d)

            camera.toUpdateAppearance.push(this)

            this.meshes = [
                this.#eDwMesh, this.#cDwMesh, 
                this.#iDwLineMesh, this.#iDwRingMesh,
                this.#arcMesh,
                this.#windingMesh,
                this.#windingMeshTip
                // this.#mobiusStripMesh,  
                // this.#rimMesh
            ]
        }

        onGrab(dw) {
            if (dw === eDw) {
                this.state.getBivectorPartToMv(linePart)
                setDragPlane(linePart)
            }

            if(dw === cDw) {
                this.state.getBivectorPartToMv(this.linePartWhenGrabbedNormalized)
                this.linePartWhenGrabbedNormalized.normalize()
                this.#complexWhenGrabbed.copy(this.#cDwMesh.position)
            }
        }
        
        onLetGo() {
            this.linePartWhenGrabbedNormalized.copy(zeroMv)
            this.#complexWhenGrabbed.set(0.,0.)
        }

        _updateStateFromDrag(dw) {
            this.state.getBivectorPartToMv(linePart)

            if (dw === cDw) {
                if (this.state[7] !== 0.)
                    console.error("todo figure this out!")

                getOldClientWorldPosition(dw, this.#cDwMesh.position)

                if(this.linePartWhenGrabbedNormalized.norm() === 0.) {
                    this.#cDwMesh.position.y = 0.
                }
                else {
                    if (this.#cDwMesh.position.y === 0.)
                        this.#cDwMesh.position.y = .001

                    if (Math.abs(this.#cDwMesh.position.x) < 1.) //rotation
                        this.#cDwMesh.position.normalize()
                    else                                         //translation
                        this.#cDwMesh.position.x = 1. * Math.sign(this.#cDwMesh.position.x)

                    this.state[0] = this.#cDwMesh.position.x
                    this.state.setBivectorPartFromMvAndScalarMultiple(this.linePartWhenGrabbedNormalized, this.#cDwMesh.position.y)
                }
            }
            else if (dw === eDw) {
                let oldJoinedWithCamera = join(linePart, camera.mvs.pos, mv0)
                let joinedWithCamera = oldJoinedWithCamera.projectOn(getMouseRay(dw), mv1)
                intersectDragPlane(joinedWithCamera, newLinePart)

                newLinePart.normalize()
                this.state.setBivectorPartFromMvAndScalarMultiple(newLinePart, linePart.norm())
            }
            else if (dw === iDw) {
                
                iDw.mouseRayIntersection(iDwIntersection,false)
                let lineIsInfinite = !linePart.hasEuclideanPart()

                if ( lineIsInfinite ) {
                    let intersectionJoinedWithOrigin = join(iDwIntersection, e123)

                    let oldJoinedWithOrigin = join(linePart, e123, mv1)
                    let joinedWithOrigin = oldJoinedWithOrigin.projectOn(intersectionJoinedWithOrigin, mv2)

                    meet(joinedWithOrigin, e0, newLinePart)
                }
                else {
                    let currentOrthPlane = inner(linePart,e123,  mv0).normalize()
                    let intendedOrthPlane = dual(iDwIntersection,mv1).normalize()
                    mul(intendedOrthPlane, currentOrthPlane, mv2)
                    mv2.sqrtSelf()
                    mv2.sandwich(linePart,newLinePart)
                }
                
                newLinePart.normalize()
                this.state.setBivectorPartFromMvAndScalarMultiple(newLinePart, linePart.norm())
            }
            else return false
        }

        updateMeshesFromState() {
            this.state.getBivectorPartToMv(linePart)

            let eNormLinePart = linePart.eNorm()
            let iNormLinePart = linePart.iNorm()

            this.#cDwMesh.position.x = this.state[0]
            this.#cDwMesh.position.y = linePart.norm()
            this.#cDwMesh.position.normalize()

            let isGrabbedAndWoundBackward = false
            if (!this.linePartWhenGrabbedNormalized.equals(zeroMv)) {
                let indicator = inner(linePart, reverse(this.linePartWhenGrabbedNormalized,mv0), mv1)[0]
                
                if( indicator === 0.) //it's a null line so it tells you nothing
                    indicator = inner(dual(linePart,mv2), dual(reverse(this.linePartWhenGrabbedNormalized, mv0),mv3), mv1)[0]

                isGrabbedAndWoundBackward = indicator < 0.
            }
            if (isGrabbedAndWoundBackward)
                this.#cDwMesh.position.y *= -1.

            //TODO this is the code that you used when you had a grabbedDuplicate
            // let proportionOfComparison = -1. * inner(linePart, grabbedDuplicate.linePartWhenGrabbedNormalized, mv0)[0]
            // this.#cDwMesh.position.y = proportionOfComparison

            if ( linePart.approxEquals(zeroMv) ) {
                //it's either the identity or 0.
                this.#iDwRingMesh.position.copy(OUT_OF_SIGHT_VECTOR3)

                this.#iDwLineMesh.position.copy(OUT_OF_SIGHT_VECTOR3)

                this.#eDwMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
                //and the motor window is the only place you see that this thing has a scalar value
                return
            }
            else if (eNormLinePart !== 0.) {
                this.#iDwRingMesh.position.copy(OUT_OF_SIGHT_VECTOR3)

                getQuaternionToProjectionOnOrigin(linePart, this.#iDwLineMesh.quaternion)
                this.#iDwLineMesh.position.set(0., 0., 0.)

                getQuaternionToProjectionOnOrigin(linePart, this.#eDwMesh.quaternion)
                e123.projectOn(linePart, mv0).toVector(this.#eDwMesh.position)

                this.#eDwMesh.scale.setScalar(.2 * camera.position.distanceTo(this.#eDwMesh.position))
            }
            else if (iNormLinePart !== 0.) {
                //default mv is e02
                this.#iDwRingMesh.position.set(0.,0.,0.)
                join(e123, linePart, joinedWithOrigin)
                joinedWithOrigin.normalize()
                mul(joinedWithOrigin, e3, quatToOriginVersion)
                quatToOriginVersion.sqrtSelf()
                quatToOriginVersion.toQuaternion(this.#iDwRingMesh.quaternion)

                this.#iDwLineMesh.position.copy(OUT_OF_SIGHT_VECTOR3)

                linePart.getDisplayableVersion(displayedLineMv)
                getQuaternionToProjectionOnOrigin(displayedLineMv, this.#eDwMesh.quaternion)
                e123.projectOn(displayedLineMv, mv0).toVector(this.#eDwMesh.position)

                this.#eDwMesh.scale.setScalar(.2 * camera.position.distanceTo(this.#eDwMesh.position))
            }

            if (this.#cDwMesh.position.y === 0.)
                this.#arcMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
            else {
                this.#arcMesh.position.set(0., 0., 0.)
                arcCurveDest.set(this.#cDwMesh.position.x, this.#cDwMesh.position.y, 0.)
                updateTubeGeo(this.#arcMesh.geometry, theArcCurve)

                if (eNormLinePart !== 0) {
                    //curve 
                    rimCurveAngle = (isGrabbedAndWoundBackward?-1.:1.) * Math.atan2(eNormLinePart, this.state[0]) * 2.
                    updateTubeGeo(this.#windingMesh.geometry, theRingCurve)

                    this.#windingMesh.quaternion.copy(this.#iDwLineMesh.quaternion)

                    //you want it pointing along -z
                    if (isGrabbedAndWoundBackward) {
                        this.#windingMeshTip.quaternion.setFromAxisAngle(yUnit, 0. - TAU / 32.)
                        theRingCurve.getPoint(0., this.#windingMeshTip.position)
                    }
                    else {
                        this.#windingMeshTip.quaternion.setFromAxisAngle(yUnit, rimCurveAngle - TAU / 32.)
                        theRingCurve.getPoint(1., this.#windingMeshTip.position)
                    }
                    this.#windingMeshTip.quaternion.premultiply(this.#iDwLineMesh.quaternion)
                    this.#windingMeshTip.position.applyQuaternion(this.#iDwLineMesh.quaternion)
                }
                else {
                    //straight line... meant to be proportional to length I guess, pity it's in iDw
                    //Coooould have a pair of squares connecting it to the axis
                    //iDw is easier and it's easy to change. Just be fakey unless it's clearly useful to see the dist
                }
            }
        }

        getWorldCenter(dw, target) {
            if (dw === cDw)
                target.copy( this.#cDwMesh.position )
            else {
                if (dw === eDw) {
                    target.copy(this.#eDwMesh.position)
                    target.w = 1.
                }
                else if (dw === iDw) {
                    if(!this.linePartWhenGrabbedNormalized.equals(zeroMv))
                        linePart.copy( this.linePartWhenGrabbedNormalized )
                    else
                        this.state.getBivectorPartToMv(linePart)

                    if (linePart.hasEuclideanPart())
                        target.copy(this.#windingMeshTip.position)
                    else {
                        // log(frameCount)
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
            return cDw
        }
    }
    
    new AppearanceType("Dq", 8, DqAppearance, getNewUniformDotValue, [ `scalar`, `e01`, `e02`, `e03`, `e12`, `e31`, `e23`, `I` ])
}