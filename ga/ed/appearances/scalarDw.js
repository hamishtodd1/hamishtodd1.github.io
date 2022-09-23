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
            marker.scale.multiplyScalar(.8)
            marker.position.y -= marker.scale.y * .7
            sDw.addNonMentionChild(marker)

            let notch = new THREE.Line(notchGeo, axisMat)
            notch.position.x = i
            sDw.addNonMentionChild(notch)
        }
    }

    //could make little disks going along the vector space's notches as a way of poking fun

    function getNewUniformDotValue() {
        return 0.
    }

    class floatAppearance extends Appearance {
        #mesh

        constructor() {
            super()
            
            this.state = new ScalarMv(1) //because it is nice to have the "float(3.2)" thing, in case it's an int
            this.stateOld = new ScalarMv(1)
            this.stateOld[0] = 1.

            this.#mesh = sDw.NewMesh(downwardPyramidGeo, new THREE.MeshBasicMaterial())
            this.#mesh.material.color = this.col

            this.meshes = [this.#mesh]
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

        updateUniformFromState() {
            this.uniform.value = this.state[0]
        }
    }

    new AppearanceType("float", 1, floatAppearance, getNewUniformDotValue, [``], true)
}