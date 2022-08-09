

function initPlanes() {

    let eDw = dws.euclidean
    let iDw = dws.infinity

    let planeGeo = new THREE.CircleGeometry(1., 31)
    let sphereGeo = new THREE.IcosahedronBufferGeometry(1., 5)
    let eNormWhenGrabbed = -1.
    let iNormWhenGrabbed = -1.

    let lastDragPoint = new Mv()
    let ourTranslation = new Mv()
    let planeNewValues = new Float32Array(4)
    class PlaneMention extends Mention {
        #eDwMesh
        #iDwMesh
        #sphereMesh
        state

        constructor(variable) {
            super(variable)
            this.state = new Mv()

            this.state.plane(2., 1., 1., 1.)

            let mat = new THREE.MeshPhongMaterial({ color: variable.col, side: THREE.DoubleSide })
            this.#eDwMesh = eDw.NewMesh(planeGeo, mat)
            this.#eDwMesh.scale.setScalar(camera.far * 2.)

            this.#iDwMesh = iDw.NewMesh(planeGeo, mat)
            this.#iDwMesh.scale.setScalar(INFINITY_RADIUS)

            this.#sphereMesh = iDw.NewMesh(sphereGeo, mat)
            this.#sphereMesh.scale.setScalar(INFINITY_RADIUS * .98)

            camera.toUpdateAppearance.push(this)
        }

        equals(m) {
            return m.state.equals(this.state)
        }

        updateStateFromRunResult(floatArray) {
            this.state.plane(floatArray[0], floatArray[1], floatArray[2], floatArray[3])
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

        updateStateFromDrag(dw) {
            if(dw === eDw) {
                //can maybe implement editing e0
                //if you do, need to fix the problem that you're not even "grabbing" the plane in eDw when it's e0
                
                let dragPlane = camera.frustum.far.projectOn(lastDragPoint, mv0)
                let mouseRay = getMouseRay(dw)
                let newDragPoint = meet(dragPlane,mouseRay,mv2).normalize()
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
            else console.error("not in that dw")
        }

        updateOverrideFloatsFromState() {
            overrideFloats[0] = this.state[1]; overrideFloats[1] = this.state[2]; overrideFloats[2] = this.state[3]; overrideFloats[3] = this.state[4];
        }

        getLiteralAssignmentFromState() {
            return this.getLiteralAssignmentFromValues(this.state[1], this.state[2], this.state[3], this.state[4])
        }

        //-------------

        updateAppearanceFromState() {
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

        setVisibility(newVisibility) {
            this.#eDwMesh.visible = newVisibility
            this.#iDwMesh.visible = newVisibility
            this.#sphereMesh.visible = newVisibility
        }

        isVisibleInDw(dw) {
            if (dw !== eDw && dw !== iDw)
                return false
            
            if(dw === eDw) return this.#eDwMesh.visible
            if(dw === iDw) return this.#iDwMesh.visible
        }

        getTextareaManipulationDw() {
            if(this.state.hasEuclideanPart() )
                return iDw
            else if (this.state.hasInfinitePart())
                return eDw
        }
    }
    new MentionType("Plane", 4, PlaneMention, [`e0`, `e1`, `e2`, `e3`])
}