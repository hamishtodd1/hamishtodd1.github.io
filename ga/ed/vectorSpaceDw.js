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
    let sDw = dws.scalar
    
    let shaftRadius = .06
    let headHeight = shaftRadius * 5.
    let headGeo = new THREE.ConeBufferGeometry(shaftRadius * 3., 1.)
    headGeo.translate(0.,-.5,0.)
    let shaftGeo = CylinderBufferGeometryUncentered(shaftRadius, 1., 8, true)

    let downwardPyramidGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0., 0., 0.),
        new THREE.Vector3(.3, .3, 0.),
        new THREE.Vector3(-.3, .3, 0.),
    ])

    let dashedLineMat = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: .1, gapSize: .1 })

    let dragPlane = new Mv()
    let whenGrabbed = new THREE.Vector3()
    class vec3Mention extends Mention {
        #vMesh
        #iMesh
        #sMesh

        //points are double covered because e123 can be -1 or 1
        //elliptic geometry does not have a double cover. Points that have gone to the other side really are there

        constructor(variable) {
            super(variable)
            this.state = new THREE.Vector3(1.,1.,1.)

            let scalarMat = new THREE.MeshBasicMaterial({ color: variable.col })
            this.#sMesh = sDw.NewMesh(downwardPyramidGeo, scalarMat)

            let mat = new THREE.MeshPhongMaterial({ color: variable.col })
            this.#iMesh = iDw.NewMesh(pointGeo, mat)    
            
            this.#vMesh = vDw.NewObject3D()

            let dashedLines = [[],[],[]]
            for(let i = 0; i < 3; ++i) {
                for(let j = 0; j < 3; ++j) {
                    dashedLines[i][j] = new THREE.Line(
                        new THREE.BufferGeometry().setFromPoints([v1,v2]),
                        dashedLineMat)
                    this.#vMesh.add(dashedLines[i][j])
                }
            }

            let head = new THREE.Mesh(headGeo, mat)
            let shaft = new THREE.Mesh(shaftGeo, mat)
            this.#vMesh.head = head; this.#vMesh.shaft = shaft; this.#vMesh.dashedLines = dashedLines;

            this.#vMesh.add(head, shaft)
            head.castShadow = true
            shaft.castShadow = true
            head.matrixAutoUpdate = false
            shaft.matrixAutoUpdate = false
        }

        updateStateFromRunResult(floatArray) {
            this.state.fromArray(floatArray)
        }

        onGrab(dw) {
            whenGrabbed.copy(this.state)

            if (dw === vDw) {
                mv0.fromVec(this.state)
                camera.frustum.far.projectOn(mv0, dragPlane)
            }
        }
        onLetGo() {
            whenGrabbed.set(0.,0.,0.) // a hacky way of saying "you're not being dragged"
        }

        updateStateFromDrag(dw) {
            if (dw === sDw) {
                camera2d.getOldClientWorldPosition(dw, v1)

                this.state.copy(whenGrabbed)
                this.state.normalize()
                this.state.multiplyScalar(v1.x)
            }
            else if(dw === vDw) {
                let mouseRay = getMouseRay(dw)
                meet(dragPlane, mouseRay, mv0)
                mv0.toVector(this.state)
            }
            else if (dw === iDw) {
                iDw.mouseRayIntersection(mv0, false)
                mv0.toVector(this.state)
                this.state.setLength(whenGrabbed.length())
            }
        }

        updateOverrideFloatsFromState() {
            this.state.toArray(overrideFloats)
        }

        getLiteralAssignmentFromState() {
            return this.getLiteralAssignmentFromValues(this.state.x, this.state.y, this.state.z)
        }

        //-------------

        updateAppearanceFromState() {
            this.#iMesh.position.copy(this.state)
            this.#iMesh.position.setLength(INFINITY_RADIUS)

            this.#sMesh.position.x = this.state.length()
            if ( !whenGrabbed.equals(zeroVector) && this.state.dot(whenGrabbed) < 0.)
                this.#sMesh.position.x *= -1.

            let head = this.#vMesh.head
            let shaft = this.#vMesh.shaft
            let dashedLines = this.#vMesh.dashedLines

            let shaftVec = v1.copy(this.state).setLength(this.state.length() - headHeight)
            setRotationallySymmetricMatrix(shaftVec.x, shaftVec.y, shaftVec.z, shaft.matrix)
            let headVec  = v1.copy(this.state).setLength(headHeight)
            setRotationallySymmetricMatrix(headVec.x, headVec.y, headVec.z, head.matrix)
            head.matrix.setPosition(this.state)

            let edgeAttachedToVec = 0
            for (let edgeTrio = 0; edgeTrio < 3; ++edgeTrio) {
                //the set of 3 that ends up in the edgeTrio-plane, eg with arr[edgeTrio] set to 0
                for (let i = 0; i < 3; ++i) {
                    let arr = dashedLines[edgeTrio][i].geometry.attributes.position.array

                    v1.copy(this.state)
                    v1.setComponent(edgeTrio,0.)
                    v1.toArray(arr, 0)

                    if(i === edgeAttachedToVec)
                        this.state.toArray(arr,3)
                    else {
                        v1.copy(this.state)
                        v1.setComponent(edgeTrio,0.)
                        let definitelyANotYetZeroedComponent = (edgeTrio + i) % 3
                        v1.setComponent(definitelyANotYetZeroedComponent, 0.)
                        v1.toArray(arr, 3)
                    }

                    dashedLines[edgeTrio][i].computeLineDistances()
                    dashedLines[edgeTrio][i].geometry.attributes.position.needsUpdate = true
                }
            }
        }

        getWorldCenter(dw, target) {
            
            if(dw === sDw) {
                target.copy(this.#sMesh.position)
            }
            else {
                if (dw === vDw) {
                    target.copy(this.state)
                    target.multiplyScalar(.5)
                    target.w = 1.
                }
                else if (dw === iDw) {
                    target.copy(this.#iMesh.position)
                    target.w = 1.
                }
            }
        }

        setVisibility(newVisibility) {
            this.#vMesh.visible = newVisibility
            this.#iMesh.visible = newVisibility
            this.#sMesh.visible = newVisibility
        }

        isVisibleInDw(dw) {
            return (this.#vMesh.visible && dw === vDw) ||
                   (this.#iMesh.visible && dw === iDw) ||
                   (this.#sMesh.visible && dw === sDw)
        }

        getTextareaManipulationDw() {
            return iDw
        }

        equals(m) {
            return m.state.equals(this.state)
        }
    }

    new MentionType("vec3", 3, vec3Mention)
}