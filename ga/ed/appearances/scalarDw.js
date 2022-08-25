//could have two or three lines, lower ones are zoom-ins
//possibly when you hover .x, .y .z, you can manipulate them individually here

function initFloats() {
    
    let sDw = dws.scalar

    {
        let axisGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-10., 0., 0.),
            new THREE.Vector3(10., 0., 0.)])
        let notchGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0., 0., 0.),
            new THREE.Vector3(0.,-.15, 0.)])

        const axisMat = new THREE.LineBasicMaterial({
            color: 0xFFFFFF
        })
        sDw.addNonMentionChild(new THREE.Line(axisGeo, axisMat))

        let furthestMarkers = 3
        for (let i = -furthestMarkers; i <= furthestMarkers; ++i) {
            let marker = text(i.toString())
            marker.position.x = i
            marker.scale.multiplyScalar(.65)
            marker.position.y -= marker.scale.y * .7
            sDw.addNonMentionChild(marker)

            let notch = new THREE.Line(notchGeo, axisMat)
            notch.position.x = i
            sDw.addNonMentionChild(notch)
        }

        // let bg = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0xFFFDD0 }))
        // bg.position.z = -1.
        // bg.scale.setScalar(999.)
        // sDw.addNonMentionChild(bg)
    }

    class floatAppearance extends Appearance {
        #mesh

        constructor() {
            super()
            this.state = new Float32Array(1)
            this.state[0] = 0.
            this.uniform.value = 0.

            let mat = new THREE.MeshBasicMaterial()
            mat.color = this.col
            this.#mesh = sDw.NewMesh(downwardPyramidGeo, mat)

            this.toHaveVisibilitiesSet.push(this.#mesh)
        }

        _updateStateFromDrag(dw) {
            if (dw === sDw) {
                camera2d.getOldClientWorldPosition(dw, v1)
                this.state[0] = v1.x
            }
            else return false
        }

        updateMeshesFromState() {
            this.#mesh.position.set(this.state[0], 0.,0.)
        }

        getWorldCenter(dw, target) {
            return target.copy(this.#mesh.position)
        }

        _getTextareaManipulationDw() {
            return sDw
        }

        //------------

        equals(m) {
            return m.state[0] === this.state[0]
        }
        updateStateFromRunResult(floatArray) {
            this.state[0] = floatArray[0]
        }
        stateToFloatArray(floatArray) {
            floatArray[0] = this.state[0]
        }
        updateUniformFromState() {
            this.uniform.value = this.state[0]
        }
    }

    let mentionType = new AppearanceType("float", 1, floatAppearance)
    mentionType.outputAssignmentPropts = [``]
}