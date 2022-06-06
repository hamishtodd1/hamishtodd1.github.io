//could have two or three lines, lower ones are zoom-ins

function initScalarDw() {
    
    let dw = new Dw("scalar", false, false, orthCamera)

    {
        const axisMat = new THREE.LineBasicMaterial({
            color: 0x964B00
        })
        dw.addNonMentionChild(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-10., 0., 0.),
            new THREE.Vector3( 10., 0., 0.)]), axisMat))

        let bg = new THREE.Mesh( unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({color:0xFFFDD0}) )
        bg.position.z = -1.
        bg.scale.setScalar(999.)
        dw.addNonMentionChild(bg)
    }

    let newValues = Array(1)
    class Float extends Mention {
        #mesh;

        constructor(variable) {
            super(variable)

            let mat = new THREE.MeshBasicMaterial({ color: variable.col })
            this.#mesh = dws.study.NewMesh(pointGeo, mat)
        }

        updateViz(shaderWithMentionReadout) {
            getShaderOutput(shaderWithMentionReadout, newValues)
            this.#mesh.position.x = newValues[0]
        }

        respondToDrag(dw) {
            if (dw === dws.study) {
                let [xProportion, yProportion] = dw.oldClientToProportion()
                this.#mesh.position.x = orthCamera.left + xProportion * (orthCamera.right - orthCamera.left )
            }
            else console.error("not in that dw")
        }

        getCanvasPosition(dw) {
            let ndcX = (this.#mesh.position.x-orthCamera.left) / (orthCamera.right - orthCamera.left)
            let ndcY = .5

            return ndcToWindow(ndcX,ndcY,dw)
        }

        getOverrideFloats(overrideFloats) {
            overrideFloats[0] = this.#mesh.position.x;
        }

        getShaderOutputFloatString() {
            return `\n     outputFloats[0] = ` + this.variable.name + `;\n`
        }

        getReassignmentPostEquals(useOverrideFloats) {
            if (useOverrideFloats)
                return "overrideFloats[0]"
            else
                return this.#mesh.position.x.toFixed(2)
        }

        setVisibility(newVisibility) {
            this.#mesh.visible = newVisibility
        }

        isVisibleInDw(dw) {
            if (dw !== dws.study )
                return false
            return this.#mesh.visible
        }
    }
    types.float = Float
}