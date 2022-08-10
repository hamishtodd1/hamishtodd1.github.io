/**
 * Study part
 *  1 + e12 is (1,1)
 *  1 + e01? Surely still (1,1)
 *  1 + e12 + e0123 ?
 * 
 * Or maybe squaring the thing
 */

function initPlanes() {
    ////////////
    // PLANES //
    ////////////

    //what're your plane-editing controls?
    //grab a plane somewhere. That point is kept in place
    //move mouse around, rotates to face mouse
    //But mouse in what plane? Some plane parallel to camera, tweak its distance from the point
    //move mouse out of dw and the plane is, still through the same point, rotating to face pts at infinity

    // let planeMesh = new THREE.Mesh(new THREE.CircleGeometry(2.), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))
    // dw.addMesh(planeMesh)

    // let planeMv = new Mv().plane(2., 1., 1., 1.)
    // planeMv.normalize()
    // updateFunctions.push(() => {

    //     e123.projectOn(planeMv, mv0).toVector(planeMesh.position)

    //     let planeOnOrigin = planeMv.projectOn(e123, mv0)
    //     let e3ToPlaneMotor = mul(planeOnOrigin, e3, mv2).sqrt(mv3)
    //     e3ToPlaneMotor.toQuaternion(planeMesh.quaternion)
    // })
}
//bloch vectors are of course planes

function initPoints() {

    let eDw = dws.euclidean
    let iDw = dws.infinity

    let dragPlane = new Mv()
    let ptNewValues = new Float32Array(4)
    let displayableVersion = new Mv()
    class vec4Mention extends Mention {
        #eDwMesh
        #iDwMesh

        constructor(variable) {
            super(variable)
            this.state = new THREE.Vector4(0.,0.,0.,1.)

            let mat = new THREE.MeshBasicMaterial({ color: variable.col })
            this.#eDwMesh = eDw.NewMesh(pointGeo, mat)
            this.#iDwMesh = iDw.NewMesh(pointGeo, mat)
            
            camera.toUpdateAppearance.push(this)
        }

        equals(m) {
            return m.state.equals(this.state)
        }

        updateStateFromRunResult(floatArray) {
            this.state.fromArray(floatArray)
        }

        onGrab(dw) {
            if(dw === eDw) {
                mv0.fromVec4(this.state)
                if (mv0.hasEuclideanPart())
                    camera.frustum.far.projectOn(mv0, dragPlane)
                else dragPlane.copy(e0)
            }
        }

        updateStateFromDrag(dw) {
            //might be nice to snap to a grid

            if(dw === eDw) {
                let mouseRay = getMouseRay(dw)
                meet(dragPlane, mouseRay, mv0)
                mv0.toVec4(this.state)
            }
            else if(dw === iDw) {
                iDw.mouseRayIntersection(mv0, true)
                mv0.toVec4(this.state)
            }
            else console.error("not in that dw")
        }

        updateOverrideFloatsFromState() {
            this.state.toArray(overrideFloats)
       }

        getLiteralAssignmentFromState() {
            return this.variable.type.getLiteralAssignmentFromValues(this.state.x, this.state.y, this.state.z, this.state.w)
        }

        //-------------

        updateAppearanceFromState() {
            if (this.state.w !== 0.) {
                this.#iDwMesh.position.set(0., 0., 0.)
                this.#eDwMesh.position.copy(this.state).multiplyScalar(1./this.state.w)
            }
            else {
                this.#iDwMesh.position.copy(this.state)
                this.#iDwMesh.position.setLength(INFINITY_RADIUS)

                mv0.fromVec4(this.state)
                mv0.getDisplayableVersion(displayableVersion)
                let isInFrontOfCamera = displayableVersion[14] > 0.
                if (isInFrontOfCamera)
                    displayableVersion.toVectorDisplayable(this.#eDwMesh.position)
                else
                    this.#eDwMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
            }
        }

        getWorldCenter(dw, target) {
            if (dw === eDw) {
                target.copy(this.#eDwMesh.position)
                target.w = 1.
            }
            else if (dw === iDw) {
                target.copy(this.#iDwMesh.position)
                target.w = 1.
            }
            else
                console.error("not in that dw")
        }

        setVisibility(newVisibility) {
            this.#eDwMesh.visible = newVisibility
            this.#iDwMesh.visible = newVisibility
        }

        isVisibleInDw(dw) {
            if (dw !== eDw && dw !== iDw)
                return false
            
            if(dw === eDw)
                return !this.#eDwMesh.position.equals(OUT_OF_SIGHT_VECTOR3) && this.#eDwMesh.visible

            if(dw === iDw)
                return !this.#iDwMesh.position.equals(zeroVector) && this.#iDwMesh.visible
        }

        getTextareaManipulationDw() {
            if(this.state.w === 0.)
                return iDw
            else
                return eDw
        }
    }
    new MentionType("vec4", 4, vec4Mention)
}