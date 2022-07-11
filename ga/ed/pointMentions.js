/**
 * Study part
 *  1 + e12 is (1,1)
 *  1 + e01? Surely still (1,1)
 *  1 + e12 + e0123 ?
 * 
 * Or maybe squaring the thing
 */

function initPoints() {

    let eDw = dws.euclidean
    let iDw = dws.infinity
    let sDw = dws.mobius

    let outOfTheWayPosition = new THREE.Vector3(camera.far * 999., camera.far * 999., camera.far * 999.)

    let dragPlane = new Mv()

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

    
    ////////////
    // POINTS //
    ////////////
    
    let draggedPoint = new Mv()
    let ptNewValues = new Float32Array(4)
    class Point extends Mention {
        #eDwMesh;
        #iDwMesh;
        #mv = new Mv();

        constructor(variable) {
            super(variable)

            let mat = new THREE.MeshBasicMaterial({ color: variable.col })
            this.#eDwMesh = eDw.NewMesh(pointGeo, mat)
            this.#iDwMesh = iDw.NewMesh(pointGeo, mat)
            
            camera.toHaveUpdateFromMvCalled.push(this)
        }

        updateFromMv() {
            if (this.#mv[14] !== 0.)
                this.#mv.toVector(this.#eDwMesh.position)
            else {
                this.#mv.toVector(this.#iDwMesh.position)
                this.#iDwMesh.position.setLength(INFINITY_RADIUS)
                
                this.#mv.getDisplayableVersion(mv0)
                if (mv0[14] > 0.)
                    mv0.toVectorDisplayable(this.#eDwMesh.position)
                else {
                    //actually should be a differently oriented point!
                    this.#eDwMesh.position.copy(outOfTheWayPosition)
                }
            }
        }

        updateFromShader() {
            this.getShaderOutput(ptNewValues)
            this.#mv.point(ptNewValues[0], ptNewValues[1], ptNewValues[2], ptNewValues[3])
            this.updateFromMv()
        }

        onGrab(dw) {
            if(dw === eDw) {
                if (this.#mv.hasEuclideanPart())
                    camera.frustum.far.projectOn(this.#mv, dragPlane)
                else dragPlane.copy(e0)
            }
        }

        overrideFromDrag(dw) {
            //might be nice to snap to a grid

            function getFloatsForOverride(overrideFloats) {
                overrideFloats[0] = mv0[13]; overrideFloats[1] = mv0[12]; overrideFloats[2] = mv0[11]; overrideFloats[3] = mv0[14]
            }

            if(dw === eDw) {
                let mouseRay = getMouseRay(dw)
                meet(dragPlane, mouseRay, mv0)
                updateOverride(this, getFloatsForOverride)
            }
            else if(dw === iDw) {
                iDw.mouseRayIntersection(mv0)
                updateOverride(this, getFloatsForOverride)
            }
            else console.error("not in that dw")
        }

        getWorldSpaceCanvasPosition(target, dw) {
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

        getReassignmentPostEquals(useOverrideFloats) {
            if (useOverrideFloats)
                return generateReassignmentText("vec4", true, 4)
            else {
                let m = this.#mv
                return generateReassignmentText("vec4", m[13], m[12], m[11], m[14])
            }
        }

        getShaderOutputFloatString() {
            return getFloatArrayAssignmentString(this.variable.name, 4)
        }

        setVisibility(newVisibility) {
            this.#eDwMesh.visible = newVisibility
            this.#iDwMesh.visible  = newVisibility && this.#mv[14] === 0.
        }

        isVisibleInDw(dw) {
            if (dw !== eDw && dw !== iDw)
                return false
            let m = dw === eDw ? this.#eDwMesh : this.#iDwMesh
            return m.visible
        }

        getTextareaManipulationDw() {
            if(this.#mv[14] === 0.)
                return iDw
            else
                return eDw
        }
    }
    mentionClasses.vec4 = Point
    mentionClassNumFloats.vec4 = 4
}