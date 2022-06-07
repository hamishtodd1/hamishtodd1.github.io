// matrices in here. little parallelipipeds with their edges extended past the corners
async function initVectorSpaceDw()
{
    let dw = new Dw("vectorSpace", true)
    
    let shaftRadius = .06
    let headHeight = shaftRadius * 5.
    var headGeo = new THREE.ConeBufferGeometry(shaftRadius * 3., 1.)
    headGeo.translate(0.,-.5,0.)
    var shaftGeo = CylinderBufferGeometryUncentered(shaftRadius, 1., 8, true)

    let rgbCube = new THREE.Mesh(new THREE.BoxGeometry(1.,1.,1.), new THREE.ShaderMaterial())
    rgbCube.geometry.translate(.5, .5, .5)
    rgbCube.material.vertexShader = basicVertex
    rgbCube.material.fragmentShader = await getTextFile('rgbCube.glsl')
    rgbCube.material.transparent = true
    dw.addNonMentionChild(rgbCube)
    
    let valuesArray = new Float32Array(3)
    let asVec = new THREE.Vector3()
    let dragPlane = new Mv()
    let draggedPoint = new Mv()
    let lengthWhenGrabbed = 1.
    let threeRay = new THREE.Ray()
    let threeSphere = new THREE.Sphere(new THREE.Vector3(), INFINITY_RADIUS)
    class Arrow extends Mention {
        #vMesh
        #iMesh
        textareaManipulationDw = dws.infinity;

        constructor(variable) {
            super(variable)

            let mat = new THREE.MeshPhongMaterial({ color: variable.col })
            this.#iMesh = dws.infinity.NewMesh(pointGeo, mat)    
            
            let viz = dws.vectorSpace.NewObject3D()
            this.#vMesh = viz

            viz.head = new THREE.Mesh(headGeo, mat)
            viz.shaft = new THREE.Mesh(shaftGeo, mat)
            viz.add(viz.head, viz.shaft)
            viz.head.castShadow = true
            viz.shaft.castShadow = true
            viz.head.matrixAutoUpdate = false
            viz.shaft.matrixAutoUpdate = false

            this.updateFromAsVec = () => {
                let shaftVec = v1.copy(asVec).setLength(asVec.length() - headHeight)
                setRotationallySymmetricMatrix(shaftVec.x, shaftVec.y, shaftVec.z, viz.shaft.matrix)
                let headVec = v1.copy(asVec).setLength(headHeight)
                setRotationallySymmetricMatrix(headVec.x, headVec.y, headVec.z, viz.head.matrix)
                viz.head.matrix.setPosition(asVec)

                this.#iMesh.position.copy(asVec)
                this.#iMesh.position.setLength(INFINITY_RADIUS)
            }
        }

        updateFromShader() {
            this.getShaderOutput( valuesArray)
            asVec.fromArray(valuesArray)
            this.updateFromAsVec()
        }

        onGrab() {
            lengthWhenGrabbed = asVec.setFromMatrixPosition(this.#vMesh.head.matrix).length()
        }

        overrideFromDrag(dw) {

            function getFloatsForOverride(overrideFloats) {
                asVec.toArray(overrideFloats)
            }

            if(dw === dws.vectorSpace) {
                camera.frustum.far.projectOn(e123, dragPlane)
                let mouseRay = getMouseRay(dw)
                meet(dragPlane, mouseRay, draggedPoint)
                draggedPoint.toVector(asVec)
                
                updateOverride(this, getFloatsForOverride)
            }
            else if(dw === dws.infinity) {
                threeRay.origin.copy(camera.position)
                let mouseRay = getMouseRay(dw)
                meet(e0, mouseRay, draggedPoint).toVector(threeRay.direction)
                threeRay.direction.normalize()

                let intersectionResult = threeRay.intersectSphere(threeSphere, asVec)
                if(intersectionResult !== null) {
                    asVec.setLength(lengthWhenGrabbed)
                    
                    updateOverride(this, getFloatsForOverride)
                }
            }
        }

        getWorldSpaceCanvasPosition(target, dw) {
            
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
                console.error("not in dw: " + keyOfProptInObject(dw, dws))
        }

        getShaderOutputFloatString() {
            return getFloatArrayAssignmentString(this.variable.name, 3)
        }

        getReassignmentPostEquals(useOverrideFloats) {
            if (useOverrideFloats)
                return generateReassignmentText("vec3", true, 3)
            else {
                asVec.setFromMatrixPosition(this.#vMesh.head.matrix)
                return generateReassignmentText("vec3", asVec.x, asVec.y, asVec.z)
            }
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