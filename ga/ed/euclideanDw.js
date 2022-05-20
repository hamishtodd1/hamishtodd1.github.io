function initPgaVizes() {

    let dragPlane = new Mv()

    
    let toHaveUpdateMvCalled = []
    camera.onMovementFunctions.push(()=>{
        for(let i = 0, il = toHaveUpdateMvCalled.length; i < il; ++i)
            toHaveUpdateMvCalled[i].updateFromMv()
    })
    
    ////////////
    // POINTS //
    ////////////
    const pointRadius = .1
    let pointGeo = new THREE.SphereBufferGeometry(pointRadius, 32, 16)

    let draggedPoint = new Mv()
    let ptNewValues = new Float32Array(4)
    let outOfTheWayPosition = new THREE.Vector3(camera.far * 999., camera.far * 999., camera.far * 999.)
    class Point extends Mention {
        #eMesh;
        #iMesh;
        #mv = new Mv();

        constructor(variable) {
            super(variable)

            let mat = new THREE.MeshBasicMaterial({ color: variable.col })
            let eMesh = new THREE.Mesh(pointGeo, mat)
            this.#eMesh = eMesh
            eMesh.castShadow = true
            eMesh.visible = false
            dws.euclidean.scene.add(eMesh)

            let iMesh = new THREE.Mesh(pointGeo, mat)
            this.#iMesh = iMesh
            iMesh.castShadow = true
            iMesh.visible = false
            dws.infinity.scene.add(iMesh)

            toHaveUpdateMvCalled.push(this)
        }

        updateFromMv() {
            if (this.#mv[14] !== 0.) {
                this.#mv.toVector(this.#eMesh.position)

                this.#iMesh.position.copy(outOfTheWayPosition)
            }
            else {
                this.#mv.toVectorDisplayable(this.#eMesh.position)

                this.#mv.toVector(this.#iMesh.position)
                this.#iMesh.position.setLength(INFINITY_RADIUS)
            }
        }

        updateViz(shaderWithMentionReadout) {
            getShaderOutput(shaderWithMentionReadout, ptNewValues)
            this.#mv.point(ptNewValues[0], ptNewValues[1], ptNewValues[2], ptNewValues[3])
            this.updateFromMv()
        }

        onGrab(dw) {
            if(dw === dws.euclidean) {
                let initialPosition = mv0
                initialPosition.fromVector(this.#eMesh.position)
                camera.frustum.far.projectOn(initialPosition, dragPlane)
            }
        }

        respondToDrag(dw) {
            //might be nice to snap to a grid

            if(dw === dws.euclidean) {
                let mouseRay = getMouseRay(dw)
                meet(dragPlane, mouseRay, draggedPoint)
                draggedPoint.toVector(this.#eMesh.position)
            }
            else if(dw === dws.infinity) {
                console.log("handle this!")
            }
            else console.error("not in that dw")
        }

        getCanvasPositionWorldSpace(target, dw) {
            if (dw === dws.euclidean) {
                target.copy(this.#eMesh.position)
                target.w = 1.
            }
            else if (dw === dws.infinity) {
                target.copy(this.#iMesh.position)
                target.w = 1.
            }
            else
                console.error("not in that dw")
        }

        setVisibility(newVisibility) {
            this.#eMesh.visible = newVisibility
            this.#iMesh.visible = newVisibility
        }

        isVisibleInDw(dw) {
            if(dw === dws.euclidean)
                return this.#eMesh.visible
            else if(dw === dws.infinity)
                return this.#iMesh.visible && !this.#iMesh.position.equals(outOfTheWayPosition)
        }

        getReassignmentText() {
            let isIdeal = this.#eMesh.position.equals(outOfTheWayPosition)
            let p = isIdeal ? this.#iMesh.position : this.#eMesh.position
            return generateReassignmentText(this.variable.name, "vec4", p.x, p.y, p.z, isIdeal ? 0. : 1.)
        }

        getShaderOutputFloatString() {
            return getFloatArrayAssignmentString(this.variable.name, 4)
        }
    }
    types.vec4 = Point

    /////////
    // DQs //
    /////////
    let lineGeo = new THREE.CylinderGeometry(.03, .03, 500.)
    let dwNewValues = new Float32Array(8)
    let newDq = new Dq()
    let displayedLineMv = new Mv()
    let linePart = new Mv() //bivector?
    class DqMention extends Mention {
        #lineMesh;
        #mv = new Mv();
        
        constructor(variable) {
            super(variable)

            this.#lineMesh = new THREE.Mesh(lineGeo, new THREE.MeshPhongMaterial({ color: variable.col }))
            this.#lineMesh.visible = false
            dws.euclidean.scene.add(this.#lineMesh)
            this.castShadow = true

            toHaveUpdateMvCalled.push(this)
        }

        updateFromMv() {
            linePart.copy(this.#mv)
            linePart[0] = 0.
            linePart[15] = 0.
            linePart.getDisplayableVersion(displayedLineMv)

            let pos = e123.projectOn(displayedLineMv, mv2)
            pos.toVector(this.#lineMesh.position)

            let projectedOnOrigin = displayedLineMv.projectOn(e123, mv0).normalize()
            let quatToProjOnOrigin = mul(projectedOnOrigin, e31, mv1)
            quatToProjOnOrigin.sqrtSelf()
            quatToProjOnOrigin.toQuaternion(this.#lineMesh.quaternion)
        }

        updateViz(shaderWithMentionReadout) {
            getShaderOutput(shaderWithMentionReadout, dwNewValues)
            newDq.copy(dwNewValues)
            newDq.toMv(this.#mv)

            this.updateFromMv()
        }

        respondToDrag(dw) {
            //line editing controls
            //move mouse left right up down and it translates
            //press a toggle and 

            //Alternatively, it pivots around where you grabbed it
            //unless you move the mouse to the edge of the window
            //if moving mouse outside window, it's the pivot joined with that point at infinity
        }

        getCanvasPositionWorldSpace(target, dw) {
            if (dw === dws.euclidean) {
                target.copy(this.#lineMesh.position)
                target.w = 1.
            }
            else if (dw === dws.infinity) {
                
            }
            else
                console.error("not in that dw")
        }

        setVisibility(newVisibility) {
            this.#lineMesh.visible = newVisibility
        }

        isVisibleInDw(dw) {
            return this.#lineMesh.visible && this.#lineMesh.parent === dw.scene
        }

        getReassignmentText() {
            return generateReassignmentText(this.variable.name, "Dq", 1., 0., 0., 0., 0., 0., 0., 0.)
        }

        getShaderOutputFloatString() {
            let ret = `
            outputFloats[0] = ` + this.variable.name + `.scalar;
            outputFloats[1] = ` + this.variable.name + `.e01;
            outputFloats[2] = ` + this.variable.name + `.e02;
            outputFloats[3] = ` + this.variable.name + `.e03;
            outputFloats[4] = ` + this.variable.name + `.e12;
            outputFloats[5] = ` + this.variable.name + `.e31;
            outputFloats[6] = ` + this.variable.name + `.e23;
            outputFloats[7] = ` + this.variable.name + `.e0123;
                `
            return ret
        }
    }
    types.Dq = DqMention
}

function initEuclideanDw($dwEl)
{
    let dw = new Dw("euclidean", $dwEl, true)

    

    // if(0)
    {
        //what're your plane-editing controls?
        //grab a plane somewhere. That point is kept in place
        //move mouse around, rotates to face mouse
        //But mouse in what plane? Some plane parallel to camera, tweak its distance from the point
        //move mouse out of dw and the plane is, still through the same point, rotating to face pts at infinity

        let planeMesh = new THREE.Mesh(new THREE.CircleGeometry(2.), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))
        dw.scene.add(planeMesh)

        let planeMv = new Mv().plane(2., 1., 1., 1.)
        planeMv.normalize()
        updateFunctions.push(() => {

            e123.projectOn(planeMv, mv0).toVector(planeMesh.position)

            let planeOnOrigin = planeMv.projectOn(e123, mv0)
            let e3ToPlaneMotor = mul(planeOnOrigin, e3, mv2).sqrt(mv3)
            e3ToPlaneMotor.toQuaternion(planeMesh.quaternion)
        })
    }
}