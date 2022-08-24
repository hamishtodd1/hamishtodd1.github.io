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

    let raycaster = new THREE.Raycaster()

    let eDw = dws.euclidean
    let iDw = dws.infinity
    let mDw = dws.mesh
    let sDw = dws.scalar

    let dragPlane = new Mv()
    let displayableVersion = new Mv()
    let zeroVector4 = new THREE.Vector4()
    class vec4Appearance extends Appearance {
        #eDwMesh
        #iDwMesh
        #sMesh
        whenGrabbed = new THREE.Vector4()
        
        constructor() {
            super()
            this.state = new THREE.Vector4(0.,0.,0.,1.) //maybe better off as an mv?
            this.uniform.value = this.state

            let mat = new THREE.MeshBasicMaterial() //why not phong?
            mat.color = this.col
            this.#eDwMesh = eDw.NewMesh(pointGeo, mat)
            this.#iDwMesh = iDw.NewMesh(pointGeo, mat)

            this.#sMesh = sDw.NewMesh(downwardPyramidGeo, new THREE.MeshBasicMaterial())
            this.#sMesh.material.color = this.col
            
            camera.toUpdateAppearance.push(this)

            this.toHaveVisibilitiesSet.push(this.#eDwMesh, this.#iDwMesh, this.#sMesh)
        }

        onGrab(dw) {
            this.whenGrabbed.copy(this.state)
            if(dw === eDw) {
                mv0.fromVec4(this.state)
                if (mv0.hasEuclideanPart())
                    camera.frustum.far.projectOn(mv0, dragPlane)
                else dragPlane.copy(e0)
            }
        }
        onLetGo(){
            this.whenGrabbed.copy(zeroVector4)
        }

        updateInFromDrag() {
            raycaster.ray.copy(getMouseThreeRay(dws.mesh))
            let cow = dws.mesh.getCow()
            let intersection = raycaster.intersectObject(cow, false)[0]
            if (intersection !== undefined)
                focusInExample(this, intersection.face.a)
        }

        _updateStateFromDrag(dw) {
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
            else if(dw === sDw) {
                camera2d.getOldClientWorldPosition(dw, v1)

                mv0.fromVec4(this.whenGrabbed)
                mv0.multiplyScalar((v1.x === 0.? 0.00001 : v1.x) / mv0.norm())
                mv0.toVec4(this.state)
            }
            else return false
        }

        

        //-------------

        updateMeshesFromState() {
            
            mv0.fromVec4(this.state)
            
            let currentlyGrabbed = !this.whenGrabbed.equals(zeroVector4)
            this.#sMesh.position.x = mv0.norm() // = sqrt(sq(.w))
            if (currentlyGrabbed && !this.variable.isIn )
                this.#sMesh.position.x *= this.whenGrabbed.dot(this.state) > 0. ? 1. : -1.
            
            if (this.state.w !== 0.) {
                this.#iDwMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
                this.#eDwMesh.position.copy(this.state).multiplyScalar(1./this.state.w)

                //an alternative way to do this kind of thing (which also happens with dual quats...)
                //would be to say: these windows do not give the current value
                //they are message-sending devices. Their state comes not from the shader
                //their INITIAL state may come from the shader. And you may use that for insight
                //but they won't override the state you're holding the thing at
            }
            else {
                this.#iDwMesh.position.copy(this.state)
                this.#iDwMesh.position.setLength(INFINITY_RADIUS)
                
                mv0.getDisplayableVersion(displayableVersion)
                let isInFrontOfCamera = displayableVersion[14] > 0.
                if (isInFrontOfCamera)
                    displayableVersion.toVectorDisplayable(this.#eDwMesh.position)
                else
                    this.#eDwMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
            }
        }

        getWorldCenter(dw, target) {
            if (dw === sDw) {
                target.copy(this.#sMesh.position)
            }
            else if (dw === eDw || dw === mDw) {
                target.copy(this.state)
            }
            else if (dw === iDw) {
                target.copy(this.#iDwMesh.position)
                target.w = 1.
            }
            else
                console.error("not in that dw")
        }

        //----------

        _isVisibleInDw(dw) {
            if(dw === eDw)
                return !this.#eDwMesh.position.equals(OUT_OF_SIGHT_VECTOR3) && this.#eDwMesh.visible
            else if(dw === iDw)
                return !this.#iDwMesh.position.equals(OUT_OF_SIGHT_VECTOR3) && this.#iDwMesh.visible
            else if(dw === sDw)
                return this.#sMesh.visible
            else return false
        }

        _getTextareaManipulationDw() {
            if (this.variable.name === `initialVertex`)
                return mDw
            else if(this.state.w === 0.)
                return iDw
            else
                return eDw
        }
    }
    new AppearanceType("vec4", 4, vec4Appearance)
}