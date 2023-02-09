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
        -1.5 * camera.aspect,
        1.5 * camera.aspect,
        1.5,
        -1.5,
        0.1, 40.)
    ourCamera.position.z = 2.

    let ourDw = new Dw("complex", false, ourCamera)

    const axisMat = new THREE.LineBasicMaterial({
        color: 0xFFFFFF
    })
    function addLineWithEnds(v1,v2) {
        ourDw.addNonMentionChild(new THREE.Line(new THREE.BufferGeometry().setFromPoints([ v1, v2]), axisMat))
    }
    //YOU SHOULDN'T HAVE AXES! YOU SHOULDN'T EVEN HAVE MAGNITUDE IN THERE, ONLY RATIOS MATTER!
    // addLineWithEnds(
    //     new THREE.Vector3(  1., 10., 0.),
    //     new THREE.Vector3(  1.,-10., 0.))

    // let circlePoints = []
    // for(let i = 0; i < 32; ++i) {
    //     let v = new THREE.Vector3(1., 0., 0.)
    //     v.applyAxisAngle(zUnit,TAU/32.*i)
    //     circlePoints.push(v)
    // }
    // ourDw.addNonMentionChild(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(circlePoints), axisMat))

    BOOG = false
    let numDivisions = 32
    let numVerts = numDivisions * 2 + 1
    let mobiusHug = new THREE.Line(new THREE.BufferGeometry(), axisMat)
    ourDw.addNonMentionChild(mobiusHug)
    let animationProgress = 0. //of each arm
    let coords = new Float32Array(numVerts*3)
    mobiusHug.geometry.setAttribute('position', new THREE.BufferAttribute(coords, 3))

    CROSSOVER_HEIGHT = .2
    function getEdgePosition(angle, target) {
        let z = Math.abs(angle) < TAU / 2. ?
            CROSSOVER_HEIGHT * (angle / (TAU / 2.)) :
            CROSSOVER_HEIGHT * ((TAU - Math.abs(angle)) / (TAU / 2.)) * Math.sign(angle)
        let radius = 1.
        if (Math.abs(angle) > TAU / 2.)
            radius += CROSSOVER_HEIGHT * (Math.abs(angle) - TAU / 2.) / (TAU / 2.)

        target.set(radius, 0., z)
        target.applyAxisAngle(zUnit, angle)
    }

    // let mobius = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({color:0xFF0000}))
    // ourDw.addNonMentionChild(mobius)
    // let mobiusCoords = new Float32Array(numDivisions * 2 * 3 * 3)
    // let angleAdditionsAtQuadVertices = [
    //     0, TAU / numDivisions,
    //     TAU, TAU+TAU/numDivisions
    // ]
    // let quadVerticesIndices = [
    //     0,1,3,
    //     0,3,2
    // ]
    // let soFar = 0
    // for(let division = 0; division < numDivisions; ++division) {
    //     let divisionAngle = TAU * division/numDivisions
    //     quadVerticesIndices.forEach((index)=>{
    //         let vertexAngle = divisionAngle + angleAdditionsAtQuadVertices[index]
    //         getEdgePosition(vertexAngle, v1)
    //         mobiusCoords[soFar * 3 + 0] = v1.x
    //         mobiusCoords[soFar * 3 + 1] = v1.y
    //         mobiusCoords[soFar * 3 + 2] = v1.z
    //         ++soFar
    //     })

    //     for(let triangle = 0; triangle < 2; ++triangle) {
    //         for(let verte)
    //     }
    //     let division = 
    //     mobiusCoords[]
    // }

    updateFunctions.push(()=> {
        if(BOOG)
            animationProgress += .01
        else
            animationProgress -= .01
        animationProgress = clamp(animationProgress, 0., 1.)

        mobiusHug.rotation.y = TAU / 12. * animationProgress

        for (let i = 0; i < numVerts; ++i) {
            let t = i / (numVerts - 1)
            let angle = (t * 2. - 1.) * (TAU/2. + TAU / 2. * animationProgress)
            // log(angle)
            
            getEdgePosition(angle, v1)
            coords[i * 3 + 0] = v1.x
            coords[i * 3 + 1] = v1.y
            coords[i * 3 + 2] = v1.z
        }
        mobiusHug.geometry.attributes.position.needsUpdate = true
    })

    
    


    // let bg = new THREE.Mesh(unchangingUnitSquareGeometry,new THREE.MeshBasicMaterial({color:0xFFFDD0}))
    // bg.position.z = -1.
    // bg.scale.setScalar(999.)
    // ourDw.addNonMentionChild(bg)
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
            
            this.meshes = [this.#mesh]
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