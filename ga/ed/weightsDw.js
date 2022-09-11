function initWeightsWindow() {
    let dw = new Dw(`weights`, true, camera)

    let verts = [
        new THREE.Vector3( 1., 1., 1.).normalize(),
        new THREE.Vector3( 1.,-1.,-1.).normalize(),
        new THREE.Vector3(-1., 1.,-1.).normalize(),
        new THREE.Vector3(-1.,-1., 1.).normalize(),
    ]
    let wireframeVerts = []
    let meshVerts = []

    let indices = new Uint8Array(12)
    for(let i = 0; i < 4; ++i) {
        for (let j = i+1; j < 4; ++j) {
            wireframeVerts.push(verts[i].clone().multiplyScalar(2.), verts[j].clone().multiplyScalar(2.))
        }
        for(let j = 0; j < 4; ++j) {
            if (j !== i) {
                meshVerts.push(verts[j].clone().multiplyScalar(2.))
            }
        }
    }

    let wireframe = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(wireframeVerts))
    dw.addNonMentionChild(wireframe)

    let meshGeo = new THREE.BufferGeometry().setFromPoints(meshVerts)
    let pyramidMesh = new THREE.Mesh(meshGeo, new THREE.MeshBasicMaterial({
        side:THREE.DoubleSide,
        transparent: true,
        opacity:0.2
    }))
    dw.addNonMentionChild(pyramidMesh)

    class weight4 extends GeneralVector {
        static get mvOffsets() { return [14,13,12,11] }
        static get size() { return 4 }
        constructor() {
            return super(4)
        }
    }

    function getNewUniformValue() {
        return new weight4(4)
    }

    class WeightAppearance extends Appearance {
        #mesh;

        constructor() {
            super()

            this.uniform.value = this.state = getNewUniformValue().set(1., 1., 1., 1.)
            this.stateOld = getNewUniformValue().set(1., 0., 0., 0.)

            let mat = new THREE.MeshPhongMaterial()
            mat.color = this.col
            this.#mesh = dw.NewMesh(pointGeo, mat)
            this.#mesh.scale.setScalar(2.)

            this.meshes = [this.#mesh]
        }
        
        onGrab(dw) {
            if (dw === dw) {
                mv0.fromVec(this.#mesh.position)
                setDragPlane(mv0)
            }
        }

        _updateStateFromDrag(dw) {
            let norm = Math.sqrt(sq(this.state[0]) + sq(this.state[1]) + sq(this.state[2]) + sq(this.state[3]))

            intersectDragPlane(getMouseRay(dw), mv0)
            mv0.toVector(v1)

            for (let i = 0; i < 4; ++i) {
                this.state[i] = v1.dot(verts[i]) * norm
                if (this.state[i] < 0.)
                    this.state[i] = 0.
            }
            let sum = this.state[0] + this.state[1] + this.state[2] + this.state[3]
            for (let i = 0; i < 4; ++i)
                this.state[i] = this.state[i] / sum
        }

        updateMeshesFromState() {
            let sum = this.state[0] + this.state[1] + this.state[2] + this.state[3]
        
            this.#mesh.position.set(0.,0.,0.)
            for(let i = 0; i < 4; ++i) {
                this.#mesh.position.addScaledVector(verts[i], this.state[i] / sum)
            }
        }

        getWorldCenter(dw, target) {
            target.copy(this.#mesh.position)
        }

        _getTextareaManipulationDw() {
            return dw
        }
    }
    new AppearanceType(
        "weight4", 4, WeightAppearance,
        getNewUniformValue,
        [`w0`, `w1`, `w2`, `w3`],
        false )
}