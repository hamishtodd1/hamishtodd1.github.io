// matrices in here. little parallelipipeds with their edges extended past the corners

async function initVectorSpaceDw() {

    let vDw = new Dw("vectorSpace", true)

    // let rgbCube = new THREE.Mesh(new THREE.BoxGeometry(1.,1.,1.), new THREE.ShaderMaterial())
    // rgbCube.geometry.translate(.5, .5, .5)
    // rgbCube.material.vertexShader = basicVertex
    // rgbCube.material.fragmentShader = await getTextFile('shaders/rgbCube.glsl')
    // rgbCube.material.transparent = true
    // dw.addNonMentionChild(rgbCube)

    let axisRadius = .02
    let axisMat = new THREE.MeshPhongMaterial({ color: 0xCCCCCC })
    let axisGeo = new THREE.CylinderBufferGeometry(axisRadius, axisRadius, 20.,);

    let yAxis = new THREE.Mesh(axisGeo, axisMat)
    vDw.addNonMentionChild(yAxis)
    let xAxis = new THREE.Mesh(axisGeo, axisMat)
    xAxis.rotation.x = TAU / 4.
    vDw.addNonMentionChild(xAxis)
    let zAxis = new THREE.Mesh(axisGeo, axisMat)
    zAxis.rotation.z = TAU / 4.
    vDw.addNonMentionChild(zAxis)

    let markers = []
    let axisNames = ["x", "y", "z"]
    let markerHeight = .3

    let furthestMarkers = 8
    for (let i = -furthestMarkers; i <= furthestMarkers; ++i) {
        for (let j = 0; j < (i === 0 ? 1 : 3); ++j) {
            let marker = text(i.toString())
            marker.scale.multiplyScalar(markerHeight)
            marker.position[axisNames[j]] = i
            marker.position.y -= .5 * markerHeight
            vDw.addNonMentionChild(marker)
            markers.push(marker)
        }
    }
    updateFunctions.push(() => {
        markers.forEach((marker) => {
            marker.quaternion.copy(camera.quaternion)
        })
    })
}

function initVec3s()
{
    let vDw = dws.vectorSpace
    let iDw = dws.infinity
    
    let shaftRadius = .06
    let headHeight = shaftRadius * 5.
    let headGeo = new THREE.ConeBufferGeometry(shaftRadius * 3., 1.)
    headGeo.translate(0.,-.5,0.)
    let shaftGeo = CylinderBufferGeometryUncentered(shaftRadius, 1., 8, true)

    let dashedLineMat = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: .1, gapSize: .1 })

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

        constructor(variable) {
            super(variable)

            let mat = new THREE.MeshPhongMaterial({ color: variable.col })
            this.#iMesh = iDw.NewMesh(pointGeo, mat)    
            
            let viz = vDw.NewObject3D()
            this.#vMesh = viz

            let dashedLines = [[],[],[]]
            for(let i = 0; i < 3; ++i) {
                for(let j = 0; j < 3; ++j) {
                    dashedLines[i][j] = new THREE.Line(
                        new THREE.BufferGeometry().setFromPoints([v1,v2]),
                        dashedLineMat)
                    viz.add(dashedLines[i][j])
                }
            }

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

                for (let i = 0; i < 3; ++i) {
                    //the set of 3 that ends up in the i-plane, eg with arr[i] set to 0
                    for(let j = 0; j < 3; ++j) {
                        let arr = dashedLines[i][j].geometry.attributes.position.array

                        if(j === 0) { // the one not attached to the axes
                            asVec.toArray(arr, 0)
                            arr[i] = 0.
                            
                            asVec.toArray(arr, 3)
                        }
                        else {
                            asVec.toArray(arr, 0)
                            arr[i] = 0.

                            let coordThatGetsSomething = (i+j)%3
                            arr[3+coordThatGetsSomething] = asVec.getComponent(coordThatGetsSomething)
                        }

                        dashedLines[i][j].computeLineDistances()
                        dashedLines[i][j].geometry.attributes.position.needsUpdate = true
                    }
                }

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

            if(dw === vDw) {
                camera.frustum.far.projectOn(e123, dragPlane)
                let mouseRay = getMouseRay(dw)
                meet(dragPlane, mouseRay, draggedPoint)
                draggedPoint.toVector(asVec)
                
                updateOverride(this, getFloatsForOverride)
            }
            else if (dw === iDw) {
                iDw.mouseRayIntersection(mv0)
                mv0.toVector(asVec)
                asVec.setLength(lengthWhenGrabbed)
                updateOverride(this, getFloatsForOverride)
            }
        }

        getWorldSpaceCanvasPosition(target, dw) {
            
            if (dw === vDw) {
                asVec.setFromMatrixPosition(this.#vMesh.head.matrix)
                target.copy(asVec)
                target.multiplyScalar(.5)
                target.w = 1.
            }
            else if (dw === iDw) {
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
            return (this.#vMesh.visible && dw === vDw) ||
                   (this.#iMesh.visible && dw === iDw)
        }

        getTextareaManipulationDw() {
            return vDw
        }
    }
    mentionClasses.vec3 = Arrow
}