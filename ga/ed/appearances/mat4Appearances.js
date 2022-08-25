function initMat4s() {

    //maybe nice if it has a big triangle in the iDw
    //dotted lines connecting the arrow tips to the origin's unit vectors 
    let vDw = dws.vectorSpace

    class complexAppearance extends Appearance {
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

        _updateStateFromDrag(dw) {
            if (dw === vDw) {
                
            }
            else return false
        }

        updateMeshesFromState() {
            v1.setFromMatrixColumn(this.state, 0)
            this.#xMesh.setVec(v1)
            v1.setFromMatrixColumn(this.state, 1)
            this.#yMesh.setVec(v1)
            v1.setFromMatrixColumn(this.state, 2)
            this.#zMesh.setVec(v1)
        }

        getWorldCenter(dw, target) {
            target.setFromMatrixPosition(this.state)
        }

        _getTextareaManipulationDw() {
            return vDw
        }
    }
    new AppearanceType("vec2", 2, complexAppearance)
}