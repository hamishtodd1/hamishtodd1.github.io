function initDqs() {

    let eDw = dws.euclidean
    let iDw = dws.infinity
    let mDw = dws.mobius

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
    // mDw.addNonMentionChild(torus)

    let arcCurveDest = new THREE.Vector3(1.,2.,0.)
    class ArcCurve extends THREE.Curve {
        constructor() {
            super()
        }
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
    let mobiusMat = new THREE.MeshPhongMaterial({ color: 0xAAAAAA, side: THREE.DoubleSide })
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

            toMobiusEdge(side, t, mv0)
            mv0.toVectorArray(msgArr, i)
        }
        mobiusStripGeo.computeVertexNormals()
    }

    let rimCurveFullAngle = TAU / 2.
    class RimCurve extends THREE.Curve {
        constructor() {
            super()
        }
        getPoint(t, optionalTarget = new THREE.Vector3()) {
            toMobiusEdge(true,t*rimCurveFullAngle, mv0)
            //need to copy in the rotor of the line
            mv0.toVector(optionalTarget)
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
    let dwNewValues = new Float32Array(8)
    let newDq = new Dq()
    let displayedLineMv = new Mv()
    let linePart = new Mv() //bivector?
    let dragPlane = new Mv() //maybe two drag planes
    let newLinePart = new Mv()
    let idealLineDual = new Mv()
    let labelPoint = new Mv()
    let worldSpaceCameraPosition = new THREE.Vector4()
    let iDwIntersection = new Mv()
    class DqMention extends Mention {
        #mDwMesh
        #arcMesh

        #mobiusStripMesh
        #rimMesh

        #eDwMesh
        #iDwLineMesh
        #iDwRingMesh

        linePartWhenGrabbedNormalized = new Mv()
        #complexWhenGrabbed = new THREE.Vector2()
        mv = new Mv()

        equals(m) {
            return m.mv.equals(this.mv)
        }
        
        constructor(variable) {
            super(variable)

            let mat = new THREE.MeshPhongMaterial({ color: variable.col })

            this.#eDwMesh = eDw.NewMesh(eLineGeo, mat)
            this.#iDwLineMesh = iDw.NewMesh(iLineGeo, mat)
            this.#iDwRingMesh = iDw.NewMesh(ringGeo,  mat)
            
            let mat2d = new THREE.MeshBasicMaterial({ color: variable.col, side:THREE.DoubleSide })
            this.#mDwMesh = mDw.NewMesh(dotGeo, mat2d)
            this.#arcMesh = mDw.NewMesh(OurTubeGeo(theArcCurve), mat2d)

            this.#mobiusStripMesh = iDw.NewMesh(mobiusStripGeo, mobiusMat) //possibly only one of these is needed
            this.#rimMesh = iDw.NewMesh(OurTubeGeo(theRimCurve), mat)

            camera.toHaveUpdateFromMvCalled.push(this)
        }

        updateFromMv() {
            this.mv.selectGrade(2, linePart)

            this.#mDwMesh.position.x = this.mv[0]

            //the really nice thing would be to say that these mentions... are actually the same unless they're
            //assigned to
            //check their values, if they're the same - they're the same!

            let grabbedDuplicate = this.duplicates.find((duplicate) => !duplicate.linePartWhenGrabbedNormalized.equals(zeroMv))
            if (grabbedDuplicate !== undefined) {
                let proportionOfComparison = -1. * inner(linePart, grabbedDuplicate.linePartWhenGrabbedNormalized, mv0)[0]
                this.#mDwMesh.position.y = proportionOfComparison
            }
            else
                this.#mDwMesh.position.y = linePart.norm()

            arcCurveDest.set(this.#mDwMesh.position.x, this.#mDwMesh.position.y, 0.)
            updateTubeGeo(this.#arcMesh.geometry,theArcCurve)

            rimCurveFullAngle = Math.atan2(this.#mDwMesh.position.y, this.#mDwMesh.position.x) / TAU * 2.
            updateTubeGeo(this.#rimMesh.geometry,theRimCurve)

            //more like: it's a mobius strip
            //And by the way, it's angled in 3D space such that your line is through it
            //when you hover the window, it switches to being a "top" down view
            //where the top is the view such that the rotation is anticlockwise from the identity

            if (linePart.approxEquals(zeroMv)) {
                this.#eDwMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
                this.#iDwRingMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
                this.#iDwLineMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
                //and the motor window is the only place you see that this thing has a scalar value
                return
            }

            if (linePart.eNorm() !== 0.) {
                this.#iDwRingMesh.position.copy(OUT_OF_SIGHT_VECTOR3)

                getQuaternionToProjectionOnOrigin(linePart, this.#iDwLineMesh.quaternion)
                if(this.variable.name === "rotation") {
                    //THIS IS HOW FAR YOU HAD GOTTEN
                    //THE ROTATION OF MOBIUS STRIP OR PERHAPS JUST THE LINE SEEM A BIT OFF
                    // log(this.#iDwLineMesh.quaternion)
                }

                this.#mobiusStripMesh.quaternion.copy(this.#iDwLineMesh.quaternion)
                this.#rimMesh.quaternion.copy(this.#iDwLineMesh.quaternion)

            }
            else {
                //default mv is e02
                join(e123, linePart, joinedWithOrigin)
                mul(joinedWithOrigin, e3, quatToOriginVersion)
                quatToOriginVersion.sqrtSelf()
                quatToOriginVersion.toQuaternion(this.#iDwRingMesh.quaternion)

                this.#mobiusStripMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
            }

            linePart.getDisplayableVersion(displayedLineMv)
            getQuaternionToProjectionOnOrigin(displayedLineMv, this.#eDwMesh.quaternion)
            e123.projectOn(displayedLineMv, mv0).toVector(this.#eDwMesh.position)
        }

        updateFromShader() {
            getShaderOutput(this.mentionIndex, dwNewValues)
            newDq.copy(dwNewValues)
            newDq.toMv(this.mv)

            this.updateFromMv()
        }

        onGrab(dw) {
            if (dw === eDw) {
                this.mv.selectGrade(2, linePart)
                if (linePart.hasEuclideanPart())
                    camera.frustum.far.projectOn(linePart, dragPlane)
                else dragPlane.copy(e0)
            }

            if(dw === mDw) {
                this.mv.selectGrade(2, this.linePartWhenGrabbedNormalized)
                this.linePartWhenGrabbedNormalized.normalize()
                this.#complexWhenGrabbed.copy(this.#mDwMesh.position)
            }
        }
        onLetGo() {
            this.linePartWhenGrabbedNormalized.copy(zeroMv)
        }

        overrideFromDrag(dw) {
            const self = this
            function updateFromNewLinePart(overrideFloats) {
                let normalizer = linePart.norm() / newLinePart.norm()
                overrideFloats[0] = self.mv[0]
                overrideFloats[8] = self.mv[15]
                for (let i = 0; i < 6; ++i)
                    overrideFloats[i + 1] = newLinePart[i + 5] * normalizer
            }

            this.mv.selectGrade(2, linePart)

            if (dw === mDw) {
                if (this.mv[15] !== 0.)
                    console.error("todo figure this out!")

                camera2d.oldClientToPosition(dw, this.#mDwMesh.position)
                if (this.#complexWhenGrabbed.x === 0.)
                    this.#mDwMesh.position.x = 0.
                else if(linePart.norm() === 0.)
                    this.#mDwMesh.position.y = 0.
                
                updateOverride(this, (overrideFloats)=>{
                    overrideFloats[0] = this.#mDwMesh.position.x

                    for (let i = 0; i < 6; ++i)
                        overrideFloats[i + 1] = this.linePartWhenGrabbedNormalized[i + 5] * this.#mDwMesh.position.y
                })
            }
            else if (dw === eDw) {
                let oldJoinedWithCamera = join(linePart, camera.mvs.pos, mv0)
                let joinedWithCamera = oldJoinedWithCamera.projectOn(getMouseRay(dw), mv1)
                meet(joinedWithCamera, dragPlane, newLinePart)
                
                updateOverride(this, updateFromNewLinePart)
            }
            else if (dw === iDw) {
                
                iDw.mouseRayIntersection(iDwIntersection)
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
                updateOverride(this, updateFromNewLinePart)
            }
            else console.error("not in that dw")
        }

        setVisibility(newVisibility) {
            this.#eDwMesh.visible = newVisibility
            
            this.#mDwMesh.visible = newVisibility
            this.#arcMesh.visible = newVisibility

            this.#mobiusStripMesh.visible = newVisibility //this one maybe only in some circumstances
            this.#rimMesh.visible = newVisibility

            this.#iDwLineMesh.visible = newVisibility            
            this.#iDwRingMesh.visible = newVisibility
        }

        getCanvasPosition(dw) {
            if (dw === mDw)
                return camera2d.positionToWindow(this.#mDwMesh.position,dw)
            else {
                if (dw === eDw) {
                    worldSpaceCameraPosition.copy(this.#eDwMesh.position)
                    worldSpaceCameraPosition.w = 1.
                }
                else if (dw === iDw) {
                    this.mv.selectGrade(2, linePart)
                    if (linePart.hasEuclideanPart()) {

                        //can bring this back once you've sorted out which lines are clockwise in this comparative sense
                        //eg make the mobius interface
                        // meet(linePart, e0, labelPoint)
                        // labelPoint.multiplyScalar(-1.)
                        // let vec3Part = labelPoint.toVector(v1)
                        // vec3Part.setLength(INFINITY_RADIUS)
                        // worldSpaceCameraPosition.copy(vec3Part)
                        // // worldSpaceCameraPosition.multiplyScalar(.5)
                        // worldSpaceCameraPosition.w = 1.

                        worldSpaceCameraPosition.set(0.,0.,0.,1.)
                    }
                    else {
                        dual(linePart, idealLineDual)
                        let planeToIntersect = join(camera.mvs.pos, idealLineDual, mv0)
                        meet(planeToIntersect, linePart, labelPoint)
                        let vec3Part = labelPoint.toVector(v1)
                        vec3Part.setLength(INFINITY_RADIUS)
                        worldSpaceCameraPosition.copy(vec3Part)
                        worldSpaceCameraPosition.w = 1.
                    }
                }
                return camera.positionToWindow(worldSpaceCameraPosition,dw)
            }
        }

        isVisibleInDw(dw) {
            return  (dw === eDw && this.#eDwMesh.visible) ||
                    (dw === mDw && this.#mDwMesh.visible) ||
                    (dw === iDw && (this.#iDwLineMesh.visible || this.#iDwRingMesh.visible) )
        }

        getReassignmentPostEqualsFromCpu() {
            dq0.fromMv(this.mv)
            return this.getValuesAssignment(dq0[0], dq0[1], dq0[2], dq0[3], dq0[4], dq0[5], dq0[6], dq0[7])
        }

        getTextareaManipulationDw() {
            return mDw
        }
    }
    
    new MentionType("Dq", 8, DqMention, [ `scalar`, `e01`, `e02`, `e03`, `e12`, `e31`, `e23`, `e0123` ])
}