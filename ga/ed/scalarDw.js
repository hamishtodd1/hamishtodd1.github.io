//could have two or three lines, lower ones are zoom-ins
//possibly when you hover .x, .y .z, you can manipulate them individually here

function initFloats() {
    
    let sDw = dws.scalar

    {
        const axisMat = new THREE.LineBasicMaterial({
            color: 0x000000
        })
        sDw.addNonMentionChild(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-10., 0., 0.),
            new THREE.Vector3( 10., 0., 0.)]), axisMat))

        let bg = new THREE.Mesh( unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({color:0xFFFDD0}) )
        bg.position.z = -1.
        bg.scale.setScalar(999.)
        sDw.addNonMentionChild(bg)

        let furthestMarkers = 3
        for (let i = -furthestMarkers; i <= furthestMarkers; ++i) {
            let marker = text(i.toString())
            marker.position.x = i
            marker.scale.multiplyScalar(.5)
            marker.position.y -= marker.scale.y * .7
            sDw.addNonMentionChild(marker)
        }
    }

    let downwardPyramidGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0., 0., 0.),
        new THREE.Vector3( .3, .3, 0.),
        new THREE.Vector3(-.3, .3, 0.),
    ])

    let newValues = Array(1)
    class floatMention extends Mention {
        #mesh

        constructor(variable) {
            super(variable)

            let mat = new THREE.MeshBasicMaterial({ color: variable.col })
            this.#mesh = sDw.NewMesh(downwardPyramidGeo, mat)
        }

        updateFromShader() {
            getShaderOutput(this.mentionIndex, newValues )
            this.#mesh.position.x = newValues[0]
        }

        respondToDrag(dw) {
            if (dw === sDw) {
                camera2d.oldClientToPosition(dw, this.#mesh.position)
                this.#mesh.position.y = 0.
                
                updateOverride(this, (overrideFloats) => {
                    overrideFloats[0] = this.#mesh.position.x
                })
            }
            else console.error("not in that dw")
        }

        getWorldCenter(dw, target) {
            return target.copy(this.#mesh.position)
        }

        getReassignmentPostEqualsFromCpu() {
            return parseFloat(this.#mesh.position.x.toFixed(2))
        }

        setVisibility(newVisibility) {
            this.#mesh.visible = newVisibility
        }

        isVisibleInDw(dw) {
            if (dw !== sDw )
                return false
            return this.#mesh.visible
        }

        getTextareaManipulationDw() {
            return sDw
        }

        equals(m) {
            return m.#mesh.position.x === this.#mesh.position.x
        }
    }
    
    let mt = new MentionType("float", 1, floatMention)
    mt.reassignmentPostEqualsFromOverride = "overrideFloats[0]"
    mt.outputAssignmentPropts = [``]
}