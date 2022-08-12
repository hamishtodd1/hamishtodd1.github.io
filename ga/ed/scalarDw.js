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

    class floatAppearance extends Appearance {
        #mesh

        constructor(variable) {
            super(variable)
            this.state = new Float32Array(1)
            this.state[0] = 1.

            let mat = new THREE.MeshBasicMaterial()
            this.#mesh = sDw.NewMesh(downwardPyramidGeo, mat)
        }

        setColor(col) {
            this.#mesh.material.color.copy(col)
            this.#mesh.material.needsUpdate = true
        }

        equals(m) {
            return m.state[0] === this.state[0]
        }

        updateStateFromRunResult(floatArray) {
            this.state[0] = floatArray[0]
        }

        updateStateFromDrag(dw) {
            if (dw === sDw) {
                camera2d.getOldClientWorldPosition(dw, v1)
                this.state[0] = v1.x
            }
            else console.error("not in that dw")
        }

        updateOverrideFloatsFromState() {
            overrideFloats[0] = this.state[0]
        }

        updateUniformFromState() {
            this.uniform.value = this.state[0]
        }

        getLiteralAssignmentFromState() {
            return parseFloat(this.state[0].toFixed(2))
        }

        //-------------

        updateAppearanceFromState() {
            this.#mesh.position.set(this.state[0], 0.,0.)
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
    
    let mentionType = new AppearanceType("float", 1, floatAppearance)
    mentionType.literalAssignmentFromOverride = `overrideFloats[0]`
    mentionType.outputAssignmentPropts = [``]
}