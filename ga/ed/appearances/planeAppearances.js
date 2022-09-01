function initPlanes() {

    let eDw = dws.euclidean
    let iDw = dws.infinity

    let planeGeo = new THREE.CircleGeometry(1., 31)
    let sphereGeo = new THREE.IcosahedronBufferGeometry(1., 5)
    let eNormWhenGrabbed = -1.
    let iNormWhenGrabbed = -1.

    function getNewUniformValue() {
        return new Float32Array(4)
    }

    let lastDragPoint = new Mv()
    let ourTranslation = new Mv()
    class PlaneAppearance extends Appearance {
        #eDwMesh
        #iDwMesh
        #sphereMesh
        state

        constructor() {
            super()
            
            this.state = new Mv().plane(0., 1., 0., 0.)
            this.stateOld = new Mv()

            let mat = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide })
            mat.color = this.col
            this.#eDwMesh = eDw.NewMesh(planeGeo, mat)
            this.#eDwMesh.scale.setScalar(camera.far * 2.)

            this.#iDwMesh = iDw.NewMesh(planeGeo, mat)
            this.#iDwMesh.scale.setScalar(INFINITY_RADIUS)

            this.#sphereMesh = iDw.NewMesh(sphereGeo, mat)
            this.#sphereMesh.scale.setScalar(INFINITY_RADIUS * .98)

            camera.toUpdateAppearance.push(this)

            this.meshes = [this.#eDwMesh, this.#iDwMesh, this.#sphereMesh]
        }

        onGrab(dw) {
            if(dw === iDw) {
                eNormWhenGrabbed = this.state.eNorm()
                iNormWhenGrabbed = this.state.iNorm()
            }
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
                    this.state[1] = iNormWhenGrabbed //note: always positive
                }
            }
            else return false
        }

        updateMeshesFromState() {
            let displayableVersion = this.state.getDisplayableVersion(mv4)
            e123.projectOn(displayableVersion, mv0).toVector(this.#eDwMesh.position)
            let planeOnOrigin = displayableVersion.projectOn(e123, mv0)
            let e3ToPlaneMotor = mul(planeOnOrigin, e3, mv2).sqrt(mv3)
            e3ToPlaneMotor.toQuaternion(this.#eDwMesh.quaternion)

            if (!this.state.hasEuclideanPart()) {
                this.#sphereMesh.position.set(0., 0., 0.)
                this.#iDwMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
            }
            else {
                this.#iDwMesh.position.set(0., 0., 0.)
                this.#sphereMesh.position.copy(OUT_OF_SIGHT_VECTOR3)

                this.#iDwMesh.quaternion.copy(this.#eDwMesh.quaternion)
            }
        }

        getWorldCenter(dw, target) {
            if (dw === eDw) {
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

        floatArrayToState(floatArray) {
            this.state.plane(floatArray[0], floatArray[1], floatArray[2], floatArray[3])
        }
        stateToFloatArray(floatArray) {
            //note that it's value[0] = state[1]!
            floatArray[0] = this.state[1]; floatArray[1] = this.state[2]; floatArray[2] = this.state[3]; floatArray[3] = this.state[4];
        }
        updateUniformFromState() {
            this.stateToFloatArray(this.uniform.value)
        }
    }

    new AppearanceType(
        "Plane", 4, PlaneAppearance,
        getNewUniformValue,
        [`e0`, `e1`, `e2`, `e3`],
        false)

    //so they all need these "getNewUniformValue" functions
    //possibly you should make state and stateOld with them, by default
}