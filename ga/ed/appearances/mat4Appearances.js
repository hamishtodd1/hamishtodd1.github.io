function initMat4s() {

    //maybe nice if it has a big triangle in the iDw
    //dotted lines connecting the arrow tips to the origin's unit vectors 
    let vDw = dws.vectorSpace

    logMat4 = (mat4)=>{
        for(let i = 0; i< 4; ++i) {
            let row = ``
            for(let j = 0; j < 4; ++j)
                row += mat4.elements[i*4+j] + `,`
            log(row)
        }
    }

    let origin = new THREE.Vector3()
    let basisVector = new THREE.Vector3()

    class mat4Appearance extends Appearance {
        #xMesh
        #yMesh
        #zMesh

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
            
            this.toHaveVisibilitiesSet.push(this.#xMesh, this.#yMesh, this.#zMesh)
        }

        onGrab(dw) {
            if (dw === vDw) {
                v1.setFromMatrixPosition(this.state)
                mv0.fromVec(v1)
                setDragPlane(mv0)
            }
            else return false
        }

        _updateStateFromDrag(dw) {
            if (dw === vDw) {
                intersectDragPlane(getMouseRay(dw), mv0)
                mv0.toVector(v1)
                this.state.setPosition(v1)
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
        }

        getWorldCenter(dw, target) {
            v1.setFromMatrixPosition(this.state)
            target.set(v1.x,v1.y,v1.z,1.)
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