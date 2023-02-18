function initPoints() {

    let eDw = dws.euclidean
    let iDw = dws.infinity
    let uDw = dws.untransformed
    let sDw = dws.scalar

    function getNewUniformDotValue() {
        return new THREE.Vector4()
    }

    let zeroVector4 = new THREE.Vector4(0.,0.,0.,0.)
    let asMv = new Mv()
    let displayableVersion = new Mv()
    let asVec4 = new THREE.Vector4()
    impartPointMeshes = (appearance, mat) => {
        appearance.eDwPointMesh = eDw.NewMesh(pointGeo, mat)
        appearance.iDwPointMesh = iDw.NewMesh(pointGeo, mat)
        appearance.meshes.push(appearance.eDwPointMesh, appearance.iDwPointMesh)
    }

    updatePointMeshes = (appearance, x, y, z, w) => {
        asVec4.set(x, y, z, w)
        asMv.fromVec4(asVec4)

        if (asVec4.w !== 0.) {
            appearance.iDwPointMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
            // appearance.iDwPointMesh.position.set(0., 0., 0.) //arguably makes more sense but is confusing

            appearance.eDwPointMesh.position.copy(asVec4).multiplyScalar(1. / asVec4.w)
            appearance.eDwPointMesh.scale.setScalar(1.)
            appearance.eDwPointMesh.scale.setScalar(.2 * camera.position.distanceTo(appearance.eDwPointMesh.position))
        }
        else if (!asVec4.equals(zeroVector4)) {
            appearance.iDwPointMesh.position.copy(asVec4)
            appearance.iDwPointMesh.position.setLength(INFINITY_RADIUS)

            asMv.getDisplayableVersion(displayableVersion)
            let isInFrontOfCamera = displayableVersion[14] > 0.
            if (isInFrontOfCamera)
                displayableVersion.toVectorDisplayable(appearance.eDwPointMesh.position)
            else
                appearance.eDwPointMesh.position.copy(OUT_OF_SIGHT_VECTOR3)

            appearance.eDwPointMesh.scale.setScalar(.2 * camera.position.distanceTo(appearance.eDwPointMesh.position))
        }
        else {
            appearance.iDwPointMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
            appearance.eDwPointMesh.position.copy(OUT_OF_SIGHT_VECTOR3)
        }
    }

    getPointMeshesPosition = (appearance, target, dw) => {
        if (dw === eDw || dw === uDw)
            target.copy(appearance.eDwPointMesh.position)
        else if (dw === iDw)
            target.copy(appearance.iDwPointMesh.position)
        target.w = 1.
    }

    let whenGrabbed = new THREE.Vector4()
    class vec4Appearance extends Appearance {
        constructor() {
            super()
            
            this.uniform.value = this.state = getNewUniformDotValue().set(0.,0.,0.,1.)
            this.stateOld = getNewUniformDotValue().set(0.,0.,0.,1.)

            let mat = new THREE.MeshBasicMaterial() //Too small for phong
            mat.color = this.col

            camera.toUpdateAppearance.push(this)
            
            impartPointMeshes(this, mat)
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
                updateScalarMeshes(this,asMv.norm() * Math.sign(whenGrabbed.dot(this.state)))
            else
                updateScalarMeshes(this,asMv.norm())

            updatePointMeshes(this, this.state.x, this.state.y, this.state.z, this.state.w)
        }

        getWorldCenter(dw, target) {
            if (dw === sDw)
                getScalarMeshesPosition(this, target)
            else if (dw === eDw || dw === uDw || dw === iDw)
                getPointMeshesPosition(this, target, dw)
            else
                console.error("not in that dw")
        }

        _getTextareaManipulationDw() {
            log(this.state)
            if(this.state.equals(zeroVector4))
                return sDw
            else if(this.state.w === 0.)
                return iDw
            else
                return eDw
        }
    }
    new AppearanceType("vec4", 4, vec4Appearance, getNewUniformDotValue)
}