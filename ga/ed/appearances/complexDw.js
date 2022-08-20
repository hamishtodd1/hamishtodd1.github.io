/* 
    want number line
    but this thing about having the coefficient of e0123

    well even if it is 3D it should have an independent camera

    there's a circle marked, and perhaps you always see the projection onto there

    For the time being, gonna make a "slider" with this, just the real part
    Thereby to find out the impact of this shit
*/
function initComplexDw() {

    let ourDw = new Dw("mobius", false, false, camera2d)

    const axisMat = new THREE.LineBasicMaterial({
        color: 0xFFFFFF
    })
    ourDw.addNonMentionChild( new THREE.Line( new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-10.,  0., 0.),
        new THREE.Vector3( 10.,  0., 0.)]), axisMat))
    ourDw.addNonMentionChild( new THREE.Line( new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(  0., 10., 0.),
        new THREE.Vector3(  0.,-10., 0.)]), axisMat))
    let circlePoints = []
    for(let i = 0; i < 32; ++i) {
        let v = new THREE.Vector3(1., 0., 0.)
        v.applyAxisAngle(zUnit,TAU/32.*i)
        circlePoints.push(v)
    }
    ourDw.addNonMentionChild(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(circlePoints), axisMat))

    // let bg = new THREE.Mesh(unchangingUnitSquareGeometry,new THREE.MeshBasicMaterial({color:0xFFFDD0}))
    // bg.position.z = -1.
    // bg.scale.setScalar(999.)
    // ourDw.addNonMentionChild(bg)
}

function initComplexNumbers() {

    let dotGeo = new THREE.CircleBufferGeometry(.1, 32)

    let ourDw = dws.mobius

    class complexAppearance extends Appearance {
        #mesh;

        constructor(variable) {
            super(variable)
            this.state = new THREE.Vector2()
            this.uniform.value = this.state

            let mat = new THREE.MeshBasicMaterial()
            this.#mesh = ourDw.NewMesh(dotGeo, mat)
        }

        setColor(col) {
            this.#mesh.material.color.copy(col)
            this.#mesh.material.needsUpdate = true
        }

        equals(m) {
            return m.state.equals(this.state)
        }

        updateStateFromRunResult(floatArray) {
            this.state.x = floatArray[0]
            this.state.y = floatArray[1]
        }

        updateStateFromDrag(dw) {
            if (dw === ourDw)
                camera2d.getOldClientWorldPosition(dw, this.state)
            else console.error("not in that dw")
        }

        updateOverrideFloatsFromState() {
            overrideFloats[0] = this.state.x
            overrideFloats[1] = this.state.y
        }

        getLiteralAssignmentFromState() {
            return this.variable.type.getLiteralAssignmentFromValues(this.state.x, this.state.y)
        }

        //-----------

        updateAppearanceFromState() {
            this.#mesh.position.x = this.state.x
            this.#mesh.position.y = this.state.y
        }

        getWorldCenter(dw, target) {
            target.copy( this.#mesh.position )
        }

        _setVisibility(newVisibility) {
            this.#mesh.visible = newVisibility
        }

        _isVisibleInDw(dw) {
            if (dw !== ourDw )
                return false
            return this.#mesh.visible
        }

        getTextareaManipulationDw() {
            return ourDw
        }
    }
    new AppearanceType("vec2", 2, complexAppearance)
}