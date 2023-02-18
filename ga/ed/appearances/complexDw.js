/* 
    want number line
    but this thing about having the coefficient of I

    well even if it is 3D it should have an independent camera

    there's a circle marked, and perhaps you always see the projection onto there

    For the time being, gonna make a "slider" with this, just the real part
    Thereby to find out the impact of this shit
*/

function initComplexDw() {

    let ourCamera = new THREE.OrthographicCamera(
        -2.5 * camera.aspect,
        2.5 * camera.aspect,
        2.5,
        -2.5,
        0.1, 40.)
    ourCamera.position.z = 2.

    let ourDw = new Dw("complex", false, ourCamera)
    ourDw.border.matrix = new THREE.Matrix4().identity()
    ourDw.border.scale.x = ourCamera.left * 2.
    ourDw.border.scale.y = ourCamera.top  * 2.
    ourDw.border.updateMatrix()

    const axisMat = new THREE.LineBasicMaterial({
        color: 0xFFFFFF
    })
    function addLineWithEnds(v1,v2) {
        ourDw.addNonMentionChild(new THREE.Line(new THREE.BufferGeometry().setFromPoints([ v1, v2]), axisMat))
    }
    //YOU SHOULDN'T HAVE AXES! YOU SHOULDN'T EVEN HAVE MAGNITUDE IN THERE, ONLY RATIOS MATTER!
    addLineWithEnds(
        new THREE.Vector3(  1., 10., 0.),
        new THREE.Vector3(  1.,-10., 0.))
    addLineWithEnds(
        new THREE.Vector3( 0., 0., 0.),
        new THREE.Vector3(1.2, 0., 0.))
    addLineWithEnds(
        new THREE.Vector3(0., 0., 0.),
        new THREE.Vector3(0., 1.2, 0.))

    let circlePoints = []
    for(let i = 0; i < 32; ++i) {
        let v = new THREE.Vector3(1., 0., 0.)
        v.applyAxisAngle(zUnit,TAU/32.*i)
        circlePoints.push(v)
    }
    ourDw.addNonMentionChild(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(circlePoints), axisMat))
}

function initComplexNumbers() {

    let dotGeo = new THREE.CircleBufferGeometry(.1, 32)

    let ourDw = dws.complex

    function getNewUniformDotValue() {
        return new THREE.Vector2()
    }

    class complexAppearance extends Appearance {
        #mesh;

        constructor() {
            super()
            
            this.uniform.value = this.state = getNewUniformDotValue().set(1.,0.)
            this.stateOld = getNewUniformDotValue()

            let mat = new THREE.MeshBasicMaterial()
            mat.color = this.col
            this.#mesh = ourDw.NewMesh(dotGeo, mat)
            
            this.meshes.push(this.#mesh)
        }

        _updateStateFromDrag(dw) {
            if (dw === ourDw)
                getOldClientWorldPosition(dw, this.state)
            else return false
        }

        updateMeshesFromState() {
            this.#mesh.position.x = this.state.x
            this.#mesh.position.y = this.state.y
        }

        getWorldCenter(dw, target) {
            target.copy( this.#mesh.position )
        }

        _getTextareaManipulationDw() {
            return ourDw
        }
    }
    new AppearanceType("vec2", 2, complexAppearance, getNewUniformDotValue)
}