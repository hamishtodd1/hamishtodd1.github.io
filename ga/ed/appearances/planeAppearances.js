function threejsPlaneTransformFromPlaneMv(mesh,mv) {

    let displayableVersion = mv.getDisplayableVersion(mv4)
    e123.projectOn(displayableVersion, mv0).toVector(mesh.position)

    let planeOnOrigin = displayableVersion.projectOn(e123, mv0)
    let e3ToPlaneMotor = mul(planeOnOrigin, e3, mv2).sqrt(mv3)
    e3ToPlaneMotor.toQuaternion(mesh.quaternion)
}

function initPlanes() {

    let eDw = dws.euclidean
    let iDw = dws.infinity

    let planeGeo = new THREE.CircleGeometry(1., 31)
    let sphereGeo = new THREE.IcosahedronBufferGeometry(1., 5)
    let eNormWhenGrabbed = -1.
    let iNormWhenGrabbed = -1.

    impartPlaneMeshes = (appearance, mat) => {
        appearance.eDwPlaneMesh = eDw.NewMesh(planeGeo, mat)
        appearance.eDwPlaneMesh.scale.setScalar(camera.far * 2.)

        appearance.iDwPlaneMesh = iDw.NewMesh(planeGeo, mat)
        appearance.iDwPlaneMesh.scale.setScalar(INFINITY_RADIUS)

        appearance.sphereMesh = iDw.NewMesh(sphereGeo, mat)
        appearance.sphereMesh.scale.setScalar(INFINITY_RADIUS * .98)

        appearance.meshes.push( appearance.eDwPlaneMesh, appearance.iDwPlaneMesh, appearance.sphereMesh )
    }

    updatePlaneMeshes = (appearance, planeMv) => {
        let isZero = (planeMv[1] === 0. && planeMv[2] === 0. && planeMv[3] === 0. && planeMv[4] === 0.)
        if (isZero) {
            appearance.eDwPlaneMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
            appearance.iDwPlaneMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
            appearance.sphereMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
        }
        else {
            //eDw part
            threejsPlaneTransformFromPlaneMv(appearance.eDwPlaneMesh, planeMv)

            if( !planeMv.hasEuclideanPart() ) {
                appearance.sphereMesh.position.set(0., 0., 0.)
                appearance.iDwPlaneMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
            }
            else {
                appearance.sphereMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
                appearance.iDwPlaneMesh.position.set(0., 0., 0.)

                appearance.iDwPlaneMesh.quaternion.copy(appearance.eDwPlaneMesh.quaternion)
            }
        }
    }

    function getNewUniformDotValue() {
        return new Float32Array(4)
    }

    let lastDragPoint = new Mv()
    let ourTranslation = new Mv()
    let whenGrabbed = new Mv()
    class PlaneAppearance extends Appearance {

        constructor() {
            super()
            
            this.state = new Mv().plane(0., 0., 0., 0.)
            this.stateOld = new Mv()

            let mat = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide })
            mat.color = this.col
            
            camera.toUpdateAppearance.push(this)

            let scalarMat = new THREE.MeshBasicMaterial()
            scalarMat.color = this.col

            impartScalarMeshes(this, scalarMat)
            impartPlaneMeshes(this, mat)
        }

        onGrab(dw) {
            eNormWhenGrabbed = this.state.eNorm()
            iNormWhenGrabbed = this.state.iNorm()
            whenGrabbed.copy(this.state)
            
            if(dw === eDw) {
                let mouseRay = getMouseRay(dw)
                lastDragPoint = meet(this.state, mouseRay, lastDragPoint).normalize()
            }
        }

        _updateStateFromDrag(dw) {
            if(dw === eDw) {
                //can maybe implement editing e0
                //if you do, need to fix the problem that you're not even "grabbing" the plane in eDw when it's e0
                    
                setDragPlane(lastDragPoint)
                let newDragPoint = intersectDragPlane(getMouseRay(dw),mv2)
                ourTranslation.fromPointToPoint(lastDragPoint, newDragPoint)
                ourTranslation.sandwich(this.state, this.state)

                lastDragPoint.copy(newDragPoint)
            }
            else if(dw === iDw) {
                iDw.mouseRayIntersection(mv0, false)
                mv0[14] = 0.
                dual(mv0,this.state)
                this.state.normalize()

                let clobberEntirelyBecauseThisWasE0 = eNormWhenGrabbed === 0.
                if (!clobberEntirelyBecauseThisWasE0) {
                    this.state.multiplyScalar(eNormWhenGrabbed)
                    this.state[1] = whenGrabbed[1]
                }
            }
            else if(dw === dws.scalar) {
                getOldClientWorldPosition(dw, v1)

                this.state.copy(whenGrabbed)
                this.state.normalize()
                let nonZeroValue = v1.x === 0. ? 0.00001 : v1.x
                this.state.multiplyScalar(nonZeroValue)
            }
            else return false
        }

        updateMeshesFromState() {
            
            if(isGrabbed(this))
                updateScalarMeshes(this,this.state.norm() * Math.sign(inner(this.state, whenGrabbed, mv0)[0]) )
            else
                updateScalarMeshes(this,this.state.norm())
            
            updatePlaneMeshes(this, this.state)
        }

        getWorldCenter(dw, target) {
            if (dw === dws.scalar)
                getScalarMeshesPosition(this,target)
            else if (dw === eDw) {
                e123.projectOn(this.state, mv0)

                mv0.toVector(target)
                target.w = 1.
            }
            else if (dw === iDw)
                target.set(0., 0., 0., 1.)
            else
                console.error("not in that dw")
        }

        _getTextareaManipulationDw() {
            if (this.state.hasEuclideanPart())
                return iDw
            else if (this.state.hasInfinitePart())
                return eDw
        }

        //-------------

        //we do this because it's nicer having the state be a multivector. And then, gotta convert, so this off-by-one thing
        stateToFloatArray(floatArray) {
            floatArray[0] = this.state[1]; floatArray[1] = this.state[2]; floatArray[2] = this.state[3]; floatArray[3] = this.state[4];
        }
        floatArrayToState(floatArray) {
            this.state.plane(floatArray[0], floatArray[1], floatArray[2], floatArray[3])
        }
        updateUniformFromState() {
            this.stateToFloatArray(this.uniform.value)
        }
    }

    new AppearanceType(
        "Plane", 4, PlaneAppearance,
        getNewUniformDotValue,
        [`e0`, `e1`, `e2`, `e3`],
        false)

    //so they all need these "getNewUniformDotValue" functions
    //possibly you should make state and stateOld with them, by default
}