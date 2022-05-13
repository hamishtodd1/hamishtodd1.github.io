function initVec3Dw($dwEl)
{
    let dw = new Dw($dwEl, true)
    dws.second = dw

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
    types.vec3 = {
        dw,
        getFreshViz: (col) => {

            let viz = new THREE.Object3D()

            viz.updateFromAsVec = () => {
                let shaftVec = v1.copy(asVec).setLength(asVec.length() - headHeight)
                setRotationallySymmetricMatrix(shaftVec.x, shaftVec.y, shaftVec.z, viz.shaft.matrix)
                let headVec = v1.copy(asVec).setLength(headHeight)
                setRotationallySymmetricMatrix(headVec.x, headVec.y, headVec.z, viz.head.matrix)
                viz.head.matrix.setPosition(asVec)
            }
            
            let mat = new THREE.MeshPhongMaterial({ color: col })
            viz.head = new THREE.Mesh(headGeo, mat)
            viz.head.matrixAutoUpdate = false
            viz.shaft = new THREE.Mesh(shaftGeo, mat)
            viz.shaft.matrixAutoUpdate = false
            viz.add(viz.head, viz.shaft)

            return viz
        },
        getOutputFloatString: (variableName) => {
            return getFloatArrayAssignmentString(variableName, 3)
        },
        respondToDrag: () => {
            camera.frustum.far.projectOn(e123, dragPlane)
            let mouseRay = getMouseRay(dw)
            meet(dragPlane, mouseRay, draggedPoint)
            draggedPoint.toVector(asVec)
            grabbedMention.viz.updateFromAsVec()
        },
        onGrab: () => {
            log("grabbed")
        },
        updateVizAndCanvasPos: (mention, shaderWithMentionReadout) => {
            
            getShaderOutput(shaderWithMentionReadout, newValues)
            mention.canvasPosWorldSpace.fromArray(newValues)
            mention.canvasPosWorldSpace.w = 1.

            asVec.fromArray(newValues)
            mention.viz.updateFromAsVec()

            //!! bug !! try having it initially commented out then uncomment it
        },
        getReassignmentText: () => {
            asVec.setFromMatrixPosition(grabbedMention.viz.head.matrix)
            return "\n    " + grabbedMention.variable.name + " = vec3(" +
                asVec.x.toFixed(2) + "," +
                asVec.y.toFixed(2) + "," +
                asVec.z.toFixed(2) + ");\n"
        }
    }
}