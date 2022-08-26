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
    let stripWidthHalved = .2
    let stripRadius = .8
    let complexMat = new THREE.MeshPhongMaterial({ color: 0xAAAAAA, side: THREE.DoubleSide })
    {
        let makinRotor = new Mv()
        function toMobiusEdge(side, t, target) {
            mv0.point(side ? stripWidthHalved : -stripWidthHalved, 0., 0., 1.)

            makinRotor.fromAxisAngle(e12, t * TAU / 2.)
            makinRotor.sandwich(mv0, mv1)
            mv1[13] += stripRadius

            makinRotor.fromAxisAngle(e31, -t * TAU)
            makinRotor.sandwich(mv1, target)

            return target
        }

        mobiusStripGeo.translate(0., .5, 0.)
        let msgArr = mobiusStripGeo.attributes.position.array
        for (let i = 0; i < numMsVerts*2; ++i) {
            let side = msgArr[i * 3 + 0] < 0.
            let t = msgArr[i * 3 + 1]

            toMobiusEdge(side, t, mv2)
            mv2.toVectorArray(msgArr, i)
        }
        mobiusStripGeo.computeVertexNormals()
    }

    let rimCurveFullAngle = TAU / 2.
    class RimCurve extends THREE.Curve {
        getPoint(t, optionalTarget = new THREE.Vector3()) {
            toMobiusEdge(true,t*rimCurveFullAngle, mv2)
            //need to copy in the rotor of the line
            mv2.toVector(optionalTarget)
            if (isNaN(optionalTarget.x) || isNaN(optionalTarget.y) || isNaN(optionalTarget.z)) {
                debugger
                toMobiusEdge(true, t * rimCurveFullAngle, mv2)
            }
            
            return optionalTarget
        }
    }
    let theRimCurve = new RimCurve()

    function OurTubeGeo(curve) {
        return new THREE.TubeBufferGeometry(curve, 31, .1, 7, false)
    }
    function updateTubeGeo(geo, curve) {
        let tempGeo = OurTubeGeo(curve)
        let arr = geo.attributes.position.array
        for (let i = 0, il = arr.length; i < il; ++i)
            arr[i] = tempGeo.attributes.position.array[i]
        tempGeo.dispose()
        geo.attributes.position.needsUpdate = true
    }

    let eLineGeo = new THREE.CylinderGeometry(.03, .03, 500.)
    let iLineGeo = new THREE.CylinderGeometry(.03, .03, INFINITY_RADIUS*2.)
    let dotGeo = new THREE.CircleBufferGeometry(.1, 32)
    let ringGeo = new THREE.TorusGeometry(INFINITY_RADIUS, .05, 7, 62)
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

        #mobiusStripMesh
        #rimMesh

        #eDwMesh
        #iDwLineMesh
        #iDwRingMesh

        linePartWhenGrabbedNormalized = new Mv()
        #complexWhenGrabbed = new THREE.Vector2()

        constructor() {
            super()
            this.state = new Dq()
            this.stateOld = new Dq()
            this.uniform.value = this.state

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
            this.#iDwLineMesh = iDw.NewMesh(iLineGeo, this.#mat3d)
            this.#iDwRingMesh = iDw.NewMesh(ringGeo,  this.#mat3d)
            
            this.#cDwMesh = cDw.NewMesh(dotGeo, this.#mat2d)
            this.#arcMesh = cDw.NewMesh(OurTubeGeo(theArcCurve), this.#mat2d)

            this.#mobiusStripMesh = iDw.NewMesh(mobiusStripGeo, complexMat) //possibly only one of these is needed
            this.#rimMesh = iDw.NewMesh(OurTubeGeo(theRimCurve), this.#mat3d)

            camera.toUpdateAppearance.push(this)

            this.toHaveVisibilitiesSet.push(this.#eDwMesh, this.#cDwMesh,  this.#mobiusStripMesh,  this.#iDwLineMesh, this.#iDwRingMesh,
                this.#arcMesh,
                this.#rimMesh)
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
        }

        _updateStateFromDrag(dw) {
            this.state.getBivectorPartToMv(linePart)

            if (dw === cDw) {
                if (this.state[7] !== 0.)
                    console.error("todo figure this out!")

                camera2d.getOldClientWorldPosition(dw, this.#cDwMesh.position)
                if (this.#complexWhenGrabbed.x === 0.)
                    this.#cDwMesh.position.x = 0.
                else if(linePart.norm() === 0.)
                    this.#cDwMesh.position.y = 0.
                
                this.state[0] = this.#cDwMesh.position.x
                this.state.setBivectorPartFromMvAndMagnitude(this.linePartWhenGrabbedNormalized, this.#cDwMesh.position.y )
            }
            else if (dw === eDw) {
                let oldJoinedWithCamera = join(linePart, camera.mvs.pos, mv0)
                let joinedWithCamera = oldJoinedWithCamera.projectOn(getMouseRay(dw), mv1)
                intersectDragPlane(joinedWithCamera, newLinePart)

                newLinePart.normalize()
                this.state.setBivectorPartFromMvAndMagnitude(newLinePart, linePart.norm())
            }
            else if (dw === iDw) {
                
                iDw.mouseRayIntersection(iDwIntersection,false)
                let lineIsInfinite = !linePart.hasEuclideanPart()

                if ( lineIsInfinite) {
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
                this.state.setBivectorPartFromMvAndMagnitude(newLinePart, linePart.norm())
            }
            else return false
        }

        updateMeshesFromState() {
            this.state.getBivectorPartToMv(linePart)

            this.#cDwMesh.position.x = this.state[0]

            let grabbedDuplicate = this.duplicates.find((duplicate) => !duplicate.linePartWhenGrabbedNormalized.equals(zeroMv))
            // log(this.duplicates)
            if (grabbedDuplicate !== undefined) {
                let proportionOfComparison = -1. * inner(linePart, grabbedDuplicate.linePartWhenGrabbedNormalized, mv0)[0]
                this.#cDwMesh.position.y = proportionOfComparison
            }
            else
                this.#cDwMesh.position.y = linePart.norm()

            //more like: it's a complex strip
            //And by the way, it's angled in 3D space such that your line is through it
            //when you hover the window, it switches to being a "top" down view
            //where the top is the view such that the rotation is anticlockwise from the identity

            if (linePart.approxEquals(zeroMv)) {
                this.#iDwRingMesh.position.copy(OUT_OF_SIGHT_VECTOR3)

                this.#iDwLineMesh.position.copy(OUT_OF_SIGHT_VECTOR3)

                this.#eDwMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
                //and the motor window is the only place you see that this thing has a scalar value
                return
            }
            else if (linePart.eNorm() !== 0.) {
                this.#iDwRingMesh.position.copy(OUT_OF_SIGHT_VECTOR3)

                getQuaternionToProjectionOnOrigin(linePart, this.#iDwLineMesh.quaternion)
                this.#iDwLineMesh.position.set(0., 0., 0.)

                getQuaternionToProjectionOnOrigin(linePart, this.#eDwMesh.quaternion)
                e123.projectOn(linePart, mv0).toVector(this.#eDwMesh.position)

                if(this.variable.name === `line3`)
                    log(this.#eDwMesh.position)
            }
            else if(linePart.iNorm() !== 0.) {
                //default mv is e02
                join(e123, linePart, joinedWithOrigin)
                joinedWithOrigin.normalize()
                mul(joinedWithOrigin, e3, quatToOriginVersion)
                quatToOriginVersion.sqrtSelf()
                quatToOriginVersion.toQuaternion(this.#iDwRingMesh.quaternion)

                this.#iDwLineMesh.position.copy(OUT_OF_SIGHT_VECTOR3)

                linePart.getDisplayableVersion(displayedLineMv)
                getQuaternionToProjectionOnOrigin(displayedLineMv, this.#eDwMesh.quaternion)
                e123.projectOn(displayedLineMv, mv0).toVector(this.#eDwMesh.position)
            }

            {
                //actually, when it's a translation, it should go around the iDwMesh... or something
                this.#mobiusStripMesh.quaternion.copy(this.#iDwLineMesh.quaternion)
                this.#rimMesh.quaternion.copy(this.#iDwLineMesh.quaternion)
    
                arcCurveDest.set(this.#cDwMesh.position.x, this.#cDwMesh.position.y, 0.)
                updateTubeGeo(this.#arcMesh.geometry, theArcCurve)
    
                rimCurveFullAngle = Math.atan2(this.#cDwMesh.position.y, this.#cDwMesh.position.x) / TAU * 2.
                updateTubeGeo(this.#rimMesh.geometry, theRimCurve)
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
                    this.state.getBivectorPartToMv(linePart)
                    if (linePart.hasEuclideanPart()) {

                        //can bring this back once you've sorted out which lines are clockwise in this comparative sense
                        //eg make the complex interface
                        // meet(linePart, e0, labelPoint)
                        // labelPoint.multiplyScalar(-1.)
                        // let vec3Part = labelPoint.toVector(v1)
                        // vec3Part.setLength(INFINITY_RADIUS)
                        // target.copy(vec3Part)
                        // // target.multiplyScalar(.5)
                        // target.w = 1.

                        target.set(0.,0.,0.,1.)
                    }
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
            return cDw
        }
    }
    
    new AppearanceType("Dq", 8, DqAppearance, [ `scalar`, `e01`, `e02`, `e03`, `e12`, `e31`, `e23`, `e0123` ])
}