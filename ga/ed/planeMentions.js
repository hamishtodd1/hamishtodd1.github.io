

function initPlanes() {

    let eDw = dws.euclidean
    let iDw = dws.infinity

    //rotate it in the infinity dw
    //it rotates around the origin in there
    //and in the eDw, it rotates around... a certain specified point
    //when you grab it in eDw, create the line orthogonal to the plane through the grabbed point
    //by 


    //grab a plane somewhere. That point is kept in place
    //move mouse around, rotates to face mouse
    //But mouse in what plane? Some plane parallel to camera, tweak its distance from the point
    //move mouse out of dw and the plane is, still through the same point, rotating to face pts at infinity

    let planeGeo = new THREE.CircleGeometry(1., 31)
    let eNormWhenGrabbed = -1.
    let iNormWhenGrabbed = -1.

    let lastDragPoint = new Mv()
    let ourTranslation = new Mv()
    let planeNewValues = new Float32Array(4)
    class PlaneMention extends Mention {
        #eDwMesh
        #iDwMesh
        #mv = new Mv()

        constructor(variable) {
            super(variable)

            this.#mv.plane(2., 1., 1., 1.)

            let mat = new THREE.MeshPhongMaterial({ color: variable.col, side: THREE.DoubleSide })
            this.#eDwMesh = eDw.NewMesh(planeGeo, mat)
            this.#eDwMesh.scale.setScalar(camera.far)

            this.#iDwMesh = iDw.NewMesh(planeGeo, mat)
            this.#iDwMesh.scale.setScalar(INFINITY_RADIUS)
        }

        updateFromMv() {
            if( this.#mv.hasEuclideanPart() ) {
                e123.projectOn(this.#mv, mv0).toVector(this.#eDwMesh.position)

                let planeOnOrigin = this.#mv.projectOn(e123, mv0)
                let e3ToPlaneMotor = mul(planeOnOrigin, e3, mv2).sqrt(mv3)
                e3ToPlaneMotor.toQuaternion(this.#eDwMesh.quaternion)

                this.#iDwMesh.quaternion.copy(this.#eDwMesh.quaternion)
            }
            else {
                //could make eDwMesh far in the distance, just inside camera clipping
                //and iDwMesh is just a big sphere
            }
        }

        updateFromShader() {
            getShaderOutput(this.mentionIndex, planeNewValues)
            this.#mv.plane(planeNewValues[0], planeNewValues[1], planeNewValues[2], planeNewValues[3])
            
            this.updateFromMv()
        }

        onGrab(dw) {
            if(dw === iDw) {
                eNormWhenGrabbed = this.#mv.eNorm()
                iNormWhenGrabbed = this.#mv.iNorm()
            }
            if(dw === eDw) {
                let mouseRay = getMouseRay(dw)
                lastDragPoint = meet(this.#mv, mouseRay, lastDragPoint).normalize()
            }
        }

        overrideFromDrag(dw) {
            function getFloatsForOverride(overrideFloats) {
                overrideFloats[0] = mv1[1]; overrideFloats[1] = mv1[2]; overrideFloats[2] = mv1[3]; overrideFloats[3] = mv1[4];
            }

            if(dw === eDw) {
                let dragPlane = camera.frustum.far.projectOn(lastDragPoint, mv0)
                let mouseRay = getMouseRay(dw)
                let newDragPoint = meet(dragPlane,mouseRay,mv2).normalize()
                ourTranslation.fromPointToPoint(lastDragPoint, newDragPoint)
                ourTranslation.sandwich(this.#mv, mv1)

                updateOverride(this, getFloatsForOverride)

                lastDragPoint.copy(newDragPoint)
            }
            else if(dw === iDw) {
                iDw.mouseRayIntersection(mv0)
                mv0[14] = 0.
                dual(mv0,mv1)
                mv1.normalize()
                mv1.multiplyScalar(eNormWhenGrabbed)
                mv1[1] = iNormWhenGrabbed

                updateOverride(this, getFloatsForOverride)
            }
            else console.error("not in that dw")
        }

        getWorldSpaceCanvasPosition(target, dw) {
            if (dw === eDw) {
                e123.projectOn(this.#mv, mv0)

                mv0.toVector(target)
                target.w = 1.
            }
            else if (dw === iDw)
                target.set(0.,0.,0.,1.)
            else
                console.error("not in that dw")
        }

        getReassignmentPostEqualsFromCpu() {
            return this.getValuesAssignment(this.#mv[1], this.#mv[2], this.#mv[3], this.#mv[4])
        }

        setVisibility(newVisibility) {
            this.#eDwMesh.visible = newVisibility
            this.#iDwMesh.visible = newVisibility
        }

        isVisibleInDw(dw) {
            if (dw !== eDw && dw !== iDw)
                return false
            
            if(dw === eDw) return this.#eDwMesh.visible
            if(dw === iDw) return this.#iDwMesh.visible
        }

        getTextareaManipulationDw() {
            return iDw
        }

        equals(m) {
            return m.#mv.equals(this.#mv)
        }
    }
    new MentionType("Plane", 4, PlaneMention, [`e0`, `e1`, `e2`, `e3`])
}