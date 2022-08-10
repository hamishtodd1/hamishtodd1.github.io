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
        new THREE.Vector3( 0., 0., 0.),
        new THREE.Vector3( .3, .3, 0.),
        new THREE.Vector3(-.3, .3, 0.),
    ])

    let newValues = Array(1)
    class floatMention extends Mention {
        #mesh

        constructor(variable) {
            super(variable)
            this.state = 0.

            let mat = new THREE.MeshBasicMaterial({ color: variable.col })
            this.#mesh = sDw.NewMesh(downwardPyramidGeo, mat)
        }

        equals(m) {
            return m.state === this.state
        }

        updateStateFromRunResult(floatArray) {
            this.state = floatArray[0]
        }

        updateStateFromDrag(dw) {
            if (dw === sDw) {
                camera2d.getOldClientWorldPosition(dw, v1)
                this.state = v1.x
            }
            else console.error("not in that dw")
        }

        updateOverrideFloatsFromState() {
            overrideFloats[0] = this.state
        }

        getLiteralAssignmentFromState() {
            return parseFloat(this.state.toFixed(2))
        }

        //-------------

        updateAppearanceFromState() {
            this.#mesh.position.set(this.state, 0.)
        }

        getWorldCenter(dw, target) {
            return target.copy(this.#mesh.position)
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
    }

    //the variable encompasses every use of the name
    //the mention is all about the individual appearance of the name. They share one variable
    //the appearance can be ascribed to multiple mentions
    //if it's a uniform variable, it has just the one appearance
    //this is premature optimization
    
    let mentionType = new MentionType("float", 1, floatMention)
    mentionType.literalAssignmentFromOverride = `overrideFloats[0]`
    mentionType.outputAssignmentPropts = [``]
}