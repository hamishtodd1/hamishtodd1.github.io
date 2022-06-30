//could have two or three lines, lower ones are zoom-ins
//possibly when you hover .x, .y .z, you can manipulate them individually here

function initFloats() {
    
    let ourDw = dws.scalar

    {
        const axisMat = new THREE.LineBasicMaterial({
            color: 0x000000
        })
        ourDw.addNonMentionChild(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-10., 0., 0.),
            new THREE.Vector3( 10., 0., 0.)]), axisMat))

        let bg = new THREE.Mesh( unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({color:0xFFFDD0}) )
        bg.position.z = -1.
        bg.scale.setScalar(999.)
        ourDw.addNonMentionChild(bg)

        let furthestMarkers = 3
        for (let i = -furthestMarkers; i <= furthestMarkers; ++i) {
            let marker = text(i.toString())
            marker.position.x = i
            marker.scale.multiplyScalar(.5)
            marker.position.y -= marker.scale.y * .7
            ourDw.addNonMentionChild(marker)
        }
    }

    let geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0., 0., 0.),
        new THREE.Vector3( .3, .3, 0.),
        new THREE.Vector3(-.3, .3, 0.),
    ])

    let newValues = Array(1)
    class Float extends Mention {
        #mesh

        constructor(variable) {
            super(variable)

            let mat = new THREE.MeshBasicMaterial({ color: variable.col })
            this.#mesh = ourDw.NewMesh(geo, mat)
        }

        updateFromShader() {
            this.getShaderOutput( newValues)
            this.#mesh.position.x = newValues[0]
        }

        overrideFromDrag(dw) {
            if (dw === ourDw) {
                let [xProportion, yProportion] = dw.oldClientToProportion()
                this.#mesh.position.x = camera2d.left + xProportion * (camera2d.right - camera2d.left )
                
                updateOverride(this, (overrideFloats) => {
                    overrideFloats[0] = this.#mesh.position.x
                })
            }
            else console.error("not in that dw")
        }

        getCanvasPosition(dw) {
            let ndcX = (this.#mesh.position.x-camera2d.left) / (camera2d.right - camera2d.left)
            let ndcY = .5

            return ndcToWindow(ndcX,ndcY,dw)
        }

        getShaderOutputFloatString() {
            return `\n     outputFloats[0] = ` + this.variable.name + `;\n`
        }

        getReassignmentPostEquals(useOverrideFloats) {
            if (useOverrideFloats)
                return "overrideFloats[0]"
            else
                return parseFloat(this.#mesh.position.x.toFixed(2))
        }

        setVisibility(newVisibility) {
            this.#mesh.visible = newVisibility
        }

        isVisibleInDw(dw) {
            if (dw !== ourDw )
                return false
            return this.#mesh.visible
        }

        getTextareaManipulationDw() {
            return ourDw
        }
    }
    mentionClasses.float = Float
}