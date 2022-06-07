/* 
    want number line
    but this thing about having the coefficient of e0123

    well even if it is 3D it should have an independent camera

    there's a circle marked, and perhaps you always see the projection onto there

    For the time being, gonna make a "slider" with this, just the real part
    Thereby to find out the impact of this shit
*/
function initStudyDw() {
    let rightSideDist = 4.;
    let orthCamera = new THREE.OrthographicCamera(
        -rightSideDist,
        rightSideDist,
        rightSideDist / camera.aspect, -rightSideDist / camera.aspect,
        camera.near,camera.far)
    orthCamera.position.z = camera.position.length()

    let dw = new Dw("study", false, false, orthCamera)

    {
        const axisMat = new THREE.LineBasicMaterial({
            color: 0x964B00
        })
        dw.addNonMentionChild(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-10., 0., 0.),
            new THREE.Vector3( 10., 0., 0.)]), axisMat))
        dw.addNonMentionChild(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0., 10., 0.),
            new THREE.Vector3(0.,-10., 0.)]), axisMat))
        let circlePoints = []
        for(let i = 0; i < 32; ++i) {
            let v = new THREE.Vector3(1., 0., 0.)
            v.applyAxisAngle(zUnit,TAU/32.*i)
            circlePoints.push(v)
        }
        dw.addNonMentionChild(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(circlePoints), axisMat))

        let bg = new THREE.Mesh(unchangingUnitSquareGeometry,new THREE.MeshBasicMaterial({color:0xFFFDD0}))
        bg.position.z = -1.
        bg.scale.setScalar(999.)
        dw.addNonMentionChild(bg)
    }

    let newValues = Array(2)
    class Vec2 extends Mention {
        #mesh;

        constructor(variable) {
            super(variable)

            let mat = new THREE.MeshBasicMaterial({ color: variable.col })
            this.#mesh = dws.study.NewMesh(pointGeo, mat)
        }

        updateFromShader() {
            this.getShaderOutput(newValues)
            this.#mesh.position.x = newValues[0]
            this.#mesh.position.y = newValues[1]
        }

        overrideFromDrag(dw) {
            if (dw === dws.study) {
                let [xProportion, yProportion] = dw.oldClientToProportion()
                this.#mesh.position.x = orthCamera.left   +      xProportion * (orthCamera.right - orthCamera.left )
                this.#mesh.position.y = orthCamera.bottom + (1.-yProportion) * (orthCamera.top - orthCamera.bottom)
                
                updateOverride(this, (overrideFloats) => {
                    overrideFloats[0] = this.#mesh.position.x;
                    overrideFloats[1] = this.#mesh.position.y;
                })
            }
            else console.error("not in that dw")
        }

        getCanvasPosition(dw) {
            let ndcX = (this.#mesh.position.x-orthCamera.left  ) / (orthCamera.right - orthCamera.left)
            let ndcY = (this.#mesh.position.y-orthCamera.bottom) / (orthCamera.top - orthCamera.bottom)

            return ndcToWindow(ndcX,ndcY,dw)
        }

        getShaderOutputFloatString() {
            return getFloatArrayAssignmentString(this.variable.name, 2)
        }

        getReassignmentPostEquals(useOverrideFloats) {
            if (useOverrideFloats)
                return generateReassignmentText("vec2", true, 2)
            else {
                return generateReassignmentText("vec2", this.#mesh.position.x, this.#mesh.position.y )
            }
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
    types.vec2 = Vec2
}