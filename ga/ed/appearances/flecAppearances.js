//you want winding and arc mehes!

function initFlecs() {

    let eDw = dws.euclidean
    let iDw = dws.infinity

    function getNewUniformDotValue() {
        return new Float32Array(8)
    }

    let whenGrabbed = new Mv()
    class FlecAppearance extends Appearance {
        state

        constructor() {
            super()

            this.state = new Mv().flection(0., 0., 0., 0., 0., 0., 0., 0.)
            this.stateOld = new Mv()

            let mat = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide })
            mat.color = this.col

            camera.toUpdateAppearance.push(this)

            let plainMat = new THREE.MeshBasicMaterial()
            plainMat.color = this.col

            impartScalarMeshes(this, plainMat)
            impartPlaneMeshes(this, mat)
            impartPointMeshes(this, plainMat)
        }

        onGrab(dw) {
            whenGrabbed.copy(this.state)
        }

        _updateStateFromDrag(dw) {
            
        }

        updateMeshesFromState() {

            if (isGrabbed(this))
                updateScalarMeshes(this, this.state.norm() * Math.sign(inner(this.state, whenGrabbed, mv0)[0]))
            else
                updateScalarMeshes(this, this.state.norm())

            updatePlaneMeshes( this, this.state )
            // log(this.state[11], this.state[12], this.state[13], this.state[14])
            updatePointMeshes( this, this.state[11], this.state[12], this.state[13], this.state[14] )
            // log(this.iDwPointMesh.position)
        }

        getWorldCenter(dw, target) {
            if (dw === dws.scalar)
                getScalarMeshesPosition(this, target)
            else if (dw === eDw) {
                //bit harder to point specifically at the point
                e123.projectOn(this.state, mv0)

                mv0.toVector(target)
                target.w = 1.
            }
            else if (dw === iDw)
                getPointMeshesPosition(this, target, dw)
            else
                console.error("not in that dw")
        }

        _getTextareaManipulationDw() {
            
        }

        //-------------

        //we do this because it's nicer having the state be a multivector. And then, gotta convert, so this off-by-one thing
        stateToFloatArray(floatArray) {
            floatArray[0] = this.state[ 1]; floatArray[1] = this.state[ 2]; floatArray[2] = this.state[ 3]; floatArray[3] = this.state[ 4];
            floatArray[4] = this.state[11]; floatArray[5] = this.state[12]; floatArray[6] = this.state[13]; floatArray[7] = this.state[14];
        }
        floatArrayToState(floatArray) {
            this.state.flection(floatArray[0], floatArray[1], floatArray[2], floatArray[3], floatArray[4], floatArray[5], floatArray[6], floatArray[7])
        }
        updateUniformFromState() {
            this.stateToFloatArray(this.uniform.value)
        }
    }

    new AppearanceType(
        `Flec`, 8, FlecAppearance,
        getNewUniformDotValue,
        [`e0`, `e1`, `e2`, `e3`, `e032`, `e013`, `e021`, `e123`],
        false)
}