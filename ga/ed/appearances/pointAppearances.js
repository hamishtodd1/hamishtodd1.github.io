/**
 * Study part
 *  1 + e12 is (1,1)
 *  1 + e01? Surely still (1,1)
 *  1 + e12 + I ?
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

function initPoints() {

    let eDw = dws.euclidean
    let iDw = dws.infinity
    let uDw = dws.untransformed
    let sDw = dws.scalar

    function getNewUniformDotValue() {
        return new THREE.Vector4()
    }

    let displayableVersion = new Mv()
    let zeroVector4 = new THREE.Vector4()
    let whenGrabbed = new THREE.Vector4()
    let asMv = new Mv()
    class vec4Appearance extends Appearance {
        #eDwMesh
        #iDwMesh
        
        constructor() {
            super()
            
            this.uniform.value = this.state = getNewUniformDotValue().set(0.,0.,0.,1.)
            this.stateOld = getNewUniformDotValue().set(0.,0.,0.,1.)

            let mat = new THREE.MeshBasicMaterial() //Too small for phong
            mat.color = this.col
            this.#eDwMesh = eDw.NewMesh(pointGeo, mat)
            this.#iDwMesh = iDw.NewMesh(pointGeo, mat)

            camera.toUpdateAppearance.push(this)
            
            this.meshes = [this.#eDwMesh, this.#iDwMesh]
            impartScalarMeshes(this, mat)
        }

        onGrab(dw) {
            whenGrabbed.copy(this.state)
            if(dw === eDw) {
                mv0.fromVec4(this.state)
                setDragPlane(mv0)
            }
        }

        _updateStateFromDrag(dw) {
            if(dw === eDw) {
                intersectDragPlane(getMouseRay(dw),mv0)
                mv0.toVec4(this.state)
            }
            else if(dw === iDw) {
                iDw.mouseRayIntersection(mv0, true)
                mv0.toVec4(this.state)
            }
            else if(dw === sDw) {
                getOldClientWorldPosition(dw, v1)

                mv0.fromVec4(whenGrabbed)
                mv0.normalize()
                let nonZeroValue = v1.x === 0. ? 0.00001 : v1.x
                mv0.multiplyScalar(nonZeroValue)
                mv0.toVec4(this.state)
            }
            else return false
        }

        updateMeshesFromState() {
            
            asMv.fromVec4(this.state)
            
            if (isGrabbed(this) ) //&& !this.variable.isIn) // LOOK HERE IF BUGS!! Why in the name of god would being an In matter? Skin weight?
                this.updateScalarMeshes(asMv.norm() * Math.sign(whenGrabbed.dot(this.state)))
            else
                this.updateScalarMeshes(asMv.norm())
            
            if (this.state.w !== 0.) {
                this.#iDwMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
                this.#eDwMesh.position.copy(this.state).multiplyScalar(1. / this.state.w)
                this.#eDwMesh.scale.setScalar(1.)
                this.#eDwMesh.scale.setScalar(.2 * camera.position.distanceTo(this.#eDwMesh.position))
            }
            else if (!this.state.equals(zeroVector4)) {
                this.#iDwMesh.position.copy(this.state)
                this.#iDwMesh.position.setLength(INFINITY_RADIUS)
                
                asMv.getDisplayableVersion(displayableVersion)
                let isInFrontOfCamera = displayableVersion[14] > 0.
                if (isInFrontOfCamera)
                    displayableVersion.toVectorDisplayable(this.#eDwMesh.position)
                else
                    this.#eDwMesh.position.copy(OUT_OF_SIGHT_VECTOR3)

                this.#eDwMesh.scale.setScalar(.2 * camera.position.distanceTo(this.#eDwMesh.position))
            }
            else {
                this.#iDwMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
                this.#eDwMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
            }
        }

        getWorldCenter(dw, target) {
            if (dw === sDw)
                this.getScalarMeshesPosition(target)
            else if (dw === eDw || dw === uDw)
                target.copy(this.state)
            else if (dw === iDw) {
                target.copy(this.#iDwMesh.position)
                target.w = 1.
            }
            else
                console.error("not in that dw")
        }

        _getTextareaManipulationDw() {
            if(this.state.equals(zeroVector4))
                return sDw
            if(this.state.w === 0.)
                return iDw
            else
                return eDw
        }
    }
    new AppearanceType("vec4", 4, vec4Appearance, getNewUniformDotValue)
}