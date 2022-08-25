function initMat4s() {

    //maybe nice if it has a big triangle in the iDw
    //dotted lines connecting the arrow tips to the origin's unit vectors 
    let vDw = dws.vectorSpace
    let sDw = dws.scalar

    let origin = new THREE.Vector3()
    let basisVector = new THREE.Vector3()
    let whenGrabbed = new THREE.Matrix4()
    class mat4Appearance extends Appearance {
        #xMesh
        #yMesh
        #zMesh
        #determinantMesh

        constructor() {
            super()
            this.state = new THREE.Matrix4()
            this.stateOld = new THREE.Matrix4()
            this.stateOld.elements[0] = 2.
            this.uniform.value = this.state

            let mat = new THREE.MeshPhongMaterial()
            mat.color = this.col

            this.#xMesh = vDw.ArrowHeadAndShaft(mat)
            this.#yMesh = vDw.ArrowHeadAndShaft(mat)
            this.#zMesh = vDw.ArrowHeadAndShaft(mat)

            this.#determinantMesh = sDw.NewMesh(downwardPyramidGeo, new THREE.MeshBasicMaterial())
            this.#determinantMesh.material.color = this.col
            
            this.toHaveVisibilitiesSet.push(this.#xMesh, this.#yMesh, this.#zMesh, this.#determinantMesh)
        }

        onGrab(dw) {
            if (dw === vDw) {
                v1.setFromMatrixPosition(this.state)
                mv0.fromVec(v1)
                setDragPlane(mv0)
            }
            else if(dw === sDw) {
                whenGrabbed.copy(this.state)
            }
            else return false
        }

        _updateStateFromDrag(dw) {
            if (dw === vDw) {
                intersectDragPlane(getMouseRay(dw), mv0)
                mv0.toVector(v1)
                this.state.setPosition(v1)
            }
            if(dw === sDw) {
                camera2d.getOldClientWorldPosition(dw, v1)
                let desiredDeterminant = v1.x
                if( desiredDeterminant === 0.)
                    desiredDeterminant = .0001

                let oldDeterminant = whenGrabbed.determinant()
                let multiple = Math.sqrt(Math.sqrt(Math.abs(desiredDeterminant) / Math.abs(oldDeterminant)))
                multiple *= Math.sign(desiredDeterminant) / Math.sign(oldDeterminant)
                this.state.copy(whenGrabbed).multiplyScalar(multiple)
            }
            else return false
        }

        updateMeshesFromState() {
            origin.setFromMatrixPosition(this.state)

            basisVector.setFromMatrixColumn(this.state, 0)
            this.#xMesh.setVec(basisVector,origin)
            basisVector.setFromMatrixColumn(this.state, 1)
            this.#yMesh.setVec(basisVector,origin)
            basisVector.setFromMatrixColumn(this.state, 2)
            this.#zMesh.setVec(basisVector,origin)

            this.#determinantMesh.position.x = this.state.determinant()
        }

        getWorldCenter(dw, target) {
            if (dw === sDw)
                target.copy(this.#determinantMesh.position)
            else if(dw === vDw) {
                v1.setFromMatrixPosition(this.state)
                target.set(v1.x,v1.y,v1.z,1.)
            }
        }

        _getTextareaManipulationDw() {
            return vDw
        }

        //------------

        floatArrayToState(floatArray) {
            this.state.fromArray(floatArray)
        }
        stateToFloatArray(floatArray) {
            this.state.toArray(floatArray)
        }
    }
    new AppearanceType("mat4", 16, mat4Appearance, [
        //row major!
        `[0][0]`, `[1][0]`, `[2][0]`, `[3][0]`,
        `[0][1]`, `[1][1]`, `[2][1]`, `[3][1]`,
        `[0][2]`, `[1][2]`, `[2][2]`, `[3][2]`,
        `[0][3]`, `[1][3]`, `[2][3]`, `[3][3]`], true)
}