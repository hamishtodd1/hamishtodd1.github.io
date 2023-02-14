function initVec3s() {

    let vDw = dws.vectorSpace
    let iDw = dws.infinity
    let sDw = dws.scalar
    
    // let dashedLineMat = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: .1, gapSize: .1 })
    let lineMat = new THREE.LineBasicMaterial({color:0xFFFFFF})

    function getNewUniformDotValue() {
        return new THREE.Vector3()
    }

    let whenGrabbed = new THREE.Vector3()
    class vec3Appearance extends Appearance {
        #vMesh
        #iMesh
        #boxLines = [Array(3), Array(3), Array(3)]

        constructor() {
            super()
            
            this.uniform.value = this.state = getNewUniformDotValue().set(1., 1., 1.)
            this.stateOld = getNewUniformDotValue()

            let scalarMat = new THREE.MeshBasicMaterial()
            scalarMat.color = this.col

            let mat = new THREE.MeshPhongMaterial()
            mat.color = this.col
            this.#iMesh = iDw.NewMesh(pointGeo, mat)
            this.#iMesh.scale.multiplyScalar(.5)
            
            this.#vMesh = vDw.ArrowHeadAndShaft(mat)

            for (let i = 0; i < 3; ++i) {
                for (let j = 0; j < 3; ++j) {
                    this.#boxLines[i][j] = new THREE.Line(
                        new THREE.BufferGeometry().setFromPoints([v1, v2]),
                        lineMat)
                    this.#vMesh.add(this.#boxLines[i][j])
                    // camera.scalesToChange.push(this.#boxLines[i][j].scale)
                }
            }
            // let self = this
            // camera.whenZoomChangeds.push((amt)=>{
                // dashedLineMat.dashSize *= amt
                // dashedLineMat.gapSize *= amt

                // for (let edgeTrioIndex = 0; edgeTrioIndex < 3; ++edgeTrioIndex) {
                //     //the set of 3 that ends up in the edgeTrio-plane, eg with arr[edgeTrio] set to 0
                //     for (let k = 0; k < 3; ++k) {
                //         self.#boxLines[edgeTrioIndex][k].computeLineDistances()
                //         self.#boxLines[edgeTrioIndex][k].geometry.attributes.position.needsUpdate = true
                //     }
                // }
            // })

            this.meshes.push( this.#vMesh, this.#iMesh )

            impartScalarMeshes(this, scalarMat)
        }

        onGrab(dw) {
            whenGrabbed.copy(this.state)

            if (dw === vDw) {
                mv0.fromVec(this.state)
                setDragPlane(mv0)
            }
        }
        onLetGo() {
            whenGrabbed.set(0.,0.,0.) // a hacky way of saying "you're not being dragged"
        }

        _updateStateFromDrag(dw) {
            if (dw === sDw) {
                getOldClientWorldPosition(dw, v1)

                this.state.copy(whenGrabbed)
                this.state.normalize()
                this.state.multiplyScalar(v1.x)
            }
            else if(dw === vDw) {
                intersectDragPlane(getMouseRay(dw),mv0)
                mv0.toVector(this.state)
            }
            else if (dw === iDw) {
                iDw.mouseRayIntersection(mv0, false)
                mv0.toVector(this.state)
                this.state.setLength(whenGrabbed.length())
            }
            else return false
        }

        updateMeshesFromState() {

            if (isGrabbed(this))
                updateScalarMeshes(this, this.state.length() * Math.sign(whenGrabbed.dot(this.state)))
            else
                updateScalarMeshes(this, this.state.length() )

            this.#iMesh.position.copy(this.state)
            this.#iMesh.position.setLength(INFINITY_RADIUS)
            //haha, and maybe there should be a plane through the origin as well?
            //hell, why not a line through the origin, and a line at infinity

            this.#vMesh.setVec(this.state, zeroVector)

            if (this.state.equals(zeroVector)) {
                for (let edgeTrio = 0; edgeTrio < 3; ++edgeTrio) {
                    for (let i = 0; i < 3; ++i)
                        this.#boxLines[edgeTrio][i].position.copy(OUT_OF_SIGHT_VECTOR3)
                }
            }
            else {
                for (let edgeTrioIndex = 0; edgeTrioIndex < 3; ++edgeTrioIndex) {
                    //the set of 3 that ends up in the edgeTrio-plane, eg with arr[edgeTrio] set to 0
                    for (let i = 0; i < 3; ++i) {
                        let dashedLine = this.#boxLines[edgeTrioIndex][i]
                            // camera.whenZoomChangeds
                        let arr = dashedLine.geometry.attributes.position.array

                        v1.copy(this.state)
                        v1.setComponent(edgeTrioIndex, 0.)
                        v1.toArray(arr, 0)

                        if (i === 0)
                            this.state.toArray(arr, 3)
                        else {
                            v1.copy(this.state)
                            v1.setComponent(edgeTrioIndex, 0.)
                            let definitelyANotYetZeroedComponent = (edgeTrioIndex + i) % 3
                            v1.setComponent(definitelyANotYetZeroedComponent, 0.)
                            v1.toArray(arr, 3)
                        }

                        // dashedLine.computeLineDistances()
                        dashedLine.geometry.attributes.position.needsUpdate = true
                    }
                }
            }
        }

        getWorldCenter(dw, target) {
            
            if(dw === sDw)
                getScalarMeshesPosition(this,target)
            else if (dw === vDw) {
                target.copy(this.state)
                target.multiplyScalar(.5)
                target.w = 1.
            }
            else if (dw === iDw) {
                target.copy(this.#iMesh.position)
                target.w = 1.
            }
        }

        _getTextareaManipulationDw() {
            return iDw
        }
    }

    new AppearanceType("vec3", 3, vec3Appearance, getNewUniformDotValue)
}