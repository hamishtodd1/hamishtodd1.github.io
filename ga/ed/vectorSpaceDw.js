function initVectorSpaceDw($dwEl)
{
    let dw = new Dw("vectorSpace",$dwEl, true)

    //want an RGB cube
    //also, matrices in here. little parallelipipeds with their edges extended past the corners
    
    let shaftRadius = .06
    let headHeight = shaftRadius * 5.
    var headGeo = new THREE.ConeBufferGeometry(shaftRadius * 3., 1.)
    headGeo.translate(0.,-.5,0.)
    var shaftGeo = CylinderBufferGeometryUncentered(shaftRadius, 1., 8, true)
    
    let newValues = new Float32Array(3)
    let asVec = new THREE.Vector3()
    let dragPlane = new Mv()
    let draggedPoint = new Mv()
    class Arrow extends Mention {
        #vMesh
        #iMesh

        constructor(variable) {
            super(variable)

            let viz = new THREE.Object3D()
            this.#vMesh = viz
            viz.visible = false
            dws.vectorSpace.scene.add(viz)

            viz.updateFromAsVec = () => {
                let shaftVec = v1.copy(asVec).setLength(asVec.length() - headHeight)
                setRotationallySymmetricMatrix(shaftVec.x, shaftVec.y, shaftVec.z, viz.shaft.matrix)
                let headVec = v1.copy(asVec).setLength(headHeight)
                setRotationallySymmetricMatrix(headVec.x, headVec.y, headVec.z, viz.head.matrix)
                viz.head.matrix.setPosition(asVec)
            }

            let mat = new THREE.MeshPhongMaterial({ color: variable.col })
            viz.head = new THREE.Mesh(headGeo, mat)
            viz.head.castShadow = true
            viz.head.matrixAutoUpdate = false
            viz.shaft = new THREE.Mesh(shaftGeo, mat)
            viz.shaft.matrixAutoUpdate = false
            viz.shaft.castShadow = true
            viz.add(viz.head, viz.shaft)

            let iMesh = new THREE.Mesh(pointGeo, mat)
            this.#iMesh = iMesh
            iMesh.castShadow = true
            iMesh.visible = false
            dws.infinity.scene.add(iMesh)
        }

        updateViz(shaderWithMentionReadout) {
            getShaderOutput(shaderWithMentionReadout, newValues)
            asVec.fromArray(newValues)
            this.#vMesh.updateFromAsVec()

            this.#iMesh.position.fromArray(newValues)
            this.#iMesh.position.setLength(INFINITY_RADIUS)
        }

        respondToDrag(dw) {
            camera.frustum.far.projectOn(e123, dragPlane)
            let mouseRay = getMouseRay(dw)
            meet(dragPlane, mouseRay, draggedPoint)
            draggedPoint.toVector(asVec)
            this.#vMesh.updateFromAsVec()

            this.#iMesh.position.fromArray(asVec)
            this.#iMesh.position.setLength(INFINITY_RADIUS)
        }

        getCanvasPositionWorldSpace(target, dw) {
            
            if (dw === dws.vectorSpace) {
                asVec.setFromMatrixPosition(this.#vMesh.head.matrix)
                target.copy(asVec)
                target.multiplyScalar(.5)
                target.w = 1.
            }
            else if (dw === dws.infinity) {
                target.copy(this.#iMesh.position)
                target.w = 1.
            }
            else
                console.error("not in that dw")
        }

        getShaderOutputFloatString(variableName) {
            return getFloatArrayAssignmentString(this.variable.name, 3)
        }

        getReassignmentText() {
            asVec.setFromMatrixPosition(this.#vMesh.head.matrix)
            return generateReassignmentText(this.variable.name,"vec3", asVec.x, asVec.y, asVec.z)
        }

        setVisibility(newVisibility) {
            this.#vMesh.visible = newVisibility
            this.#iMesh.visible = newVisibility
        }

        isVisibleInDw(dw) {
            return (this.#vMesh.visible && this.#vMesh.parent === dw.scene) ||
                   (this.#iMesh.visible && this.#iMesh.parent === dw.scene)
        }
    }
    types.vec3 = Arrow
}