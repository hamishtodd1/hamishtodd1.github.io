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
                if(this.#mv.eNorm() !== 0.)
                    camera.frustum.far.projectOn(this.#mv, dragPlane)
                else dragPlane.copy(e0)
            }
        }

        respondToDrag(dw) {
            //might be nice to snap to a grid

            if(dw === dws.euclidean) {
                let mouseRay = getMouseRay(dw)
                meet(dragPlane, mouseRay, this.#mv) //so, #mv is not what's in the shader! Override goes here
                this.updateFromMv()
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
    generalShaderPrefix += `
struct Dq {
    float scalar;
    float e12; float e31; float e23;
    float e01; float e02; float e03;
    float e0123;
};`

    let projectedOnOrigin = new Mv()
    let quatToOriginVersion = new Mv()
    let joinedWithOrigin = new Mv()
    function getQuaternionToProjectionOnOrigin(model, target) {
        model.projectOn(e123, projectedOnOrigin).normalize()
        mul(projectedOnOrigin, e31, quatToOriginVersion)
        quatToOriginVersion.sqrtSelf()
        quatToOriginVersion.toQuaternion(target)
    }

    let eLineGeo = new THREE.CylinderGeometry(.03, .03, 500.)
    let iLineGeo = new THREE.CylinderGeometry(.03, .03, INFINITY_RADIUS*2.)
    let ringGeo = new THREE.TorusGeometry(INFINITY_RADIUS, .05, 7, 62)
    let dwNewValues = new Float32Array(8)
    let newDq = new Dq()
    let displayedLineMv = new Mv()
    let linePart = new Mv() //bivector?
    class DqMention extends Mention {
        #eMesh;
        #iMesh;
        #ringMesh;
        #mv = new Mv();
        
        constructor(variable) {
            super(variable)

            this.#iMesh = new THREE.Mesh(iLineGeo, new THREE.MeshPhongMaterial({ color: variable.col }))
            this.#iMesh.visible = false
            dws.infinity.scene.add(this.#iMesh)
            this.#iMesh.castShadow = true

            this.#eMesh = new THREE.Mesh(eLineGeo, new THREE.MeshPhongMaterial({ color: variable.col }))
            this.#eMesh.visible = false
            dws.euclidean.scene.add(this.#eMesh)
            this.#eMesh.castShadow = true

            this.#ringMesh = new THREE.Mesh(ringGeo, new THREE.MeshPhongMaterial({ color: variable.col }))
            this.#ringMesh.visible = false
            dws.infinity.scene.add(this.#ringMesh)
            this.#ringMesh.castShadow = true

            //there was some bug involving hovering the variable just under the grey line
            //and that showed up but no others did

            toHaveUpdateMvCalled.push(this)
        }

        updateFromMv() {
            linePart.copy(this.#mv)
            linePart[0] = 0.
            linePart[15] = 0.

            if(linePart.eNorm() !== 0.) {
                getQuaternionToProjectionOnOrigin(linePart, this.#iMesh.quaternion)
            }
            else {
                // getQuaternionToProjectionOnOrigin(linePart, this.#iMesh.quaternion)
                //default mv is e02
                join(e123,linePart,joinedWithOrigin)
                mul(joinedWithOrigin, e3, quatToOriginVersion)
                quatToOriginVersion.sqrtSelf()
                quatToOriginVersion.toQuaternion(this.#ringMesh.quaternion)
            }

            linePart.getDisplayableVersion(displayedLineMv)
            getQuaternionToProjectionOnOrigin(displayedLineMv, this.#eMesh.quaternion)
            e123.projectOn(displayedLineMv, mv0).toVector(this.#eMesh.position)
        }

        updateViz(shaderWithMentionReadout) {
            getShaderOutput(shaderWithMentionReadout, dwNewValues)
            newDq.copy(dwNewValues)
            newDq.toMv(this.#mv)

            this.setVisibility(this.#eMesh.visible)

            this.updateFromMv()
        }

        onGrab() {
            log("grab started")
        }

        respondToDrag(dw) {
            log("dragging")
            //line editing controls
            //move mouse left right up down and it translates
            //press a toggle and 

            //Alternatively, it pivots around where you grabbed it
            //unless you move the mouse to the edge of the window
            //if moving mouse outside window, it's the pivot joined with that point at infinity

            //will be cool to edit at infinity. Probably yes, one point of it is stuck, an
        }

        getCanvasPositionWorldSpace(target, dw) {
            if (dw === dws.euclidean) {
                target.copy(this.#eMesh.position)
                target.w = 1.
            }
            else if (dw === dws.infinity) {
                target.set(0.,0.,0.)
                target.w = 1.

                if(this.#mv.hasEuclideanPart()) {
                    //probably want something about its intersection with the top
                }
                else {
                    //you kinda want the closest point on the sphere
                }
            }
            else
                console.error("not in that dw")
        }

        setVisibility(newVisibility) {
            this.#eMesh.visible = newVisibility

            let hasEuclideanPart = this.#mv.eNorm() !== 0.
            this.#iMesh.visible = hasEuclideanPart && newVisibility
            this.#ringMesh.visible = !hasEuclideanPart && newVisibility
        }

        isVisibleInDw(dw) {
            return  this.#eMesh.parent === dw.scene && this.#eMesh.visible ||
                    (this.#iMesh.parent === dw.scene && (this.#iMesh.visible || this.#ringMesh.visible) )
        }

        getReassignmentText() {
            let m = this.#mv
            return generateReassignmentText(this.variable.name, "Dq", m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7])
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

    if(0)
    {
        let mousePoint = new THREE.Mesh(new THREE.SphereBufferGeometry(.1, 32, 16), new THREE.MeshBasicMaterial({ color: 0xFFFFFF }))
        mousePoint.position.copy(outOfTheWayPosition)
        dws.euclidean.addNonMentionChild(mousePoint)
        dws.euclidean.elem.addEventListener('mousemove', (event) => {
            let mouseRay = getMouseRay(dws.euclidean)

            meet(e0, mouseRay, mv0).toVectorDisplayable(mousePoint.position)
        })
    }
}

function initEuclideanDw($dwEl)
{
    

    // if(0)
    {
        //what're your plane-editing controls?
        //grab a plane somewhere. That point is kept in place
        //move mouse around, rotates to face mouse
        //But mouse in what plane? Some plane parallel to camera, tweak its distance from the point
        //move mouse out of dw and the plane is, still through the same point, rotating to face pts at infinity

        // let planeMesh = new THREE.Mesh(new THREE.CircleGeometry(2.), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))
        // dw.scene.add(planeMesh)

        // let planeMv = new Mv().plane(2., 1., 1., 1.)
        // planeMv.normalize()
        // updateFunctions.push(() => {

        //     e123.projectOn(planeMv, mv0).toVector(planeMesh.position)

        //     let planeOnOrigin = planeMv.projectOn(e123, mv0)
        //     let e3ToPlaneMotor = mul(planeOnOrigin, e3, mv2).sqrt(mv3)
        //     e3ToPlaneMotor.toQuaternion(planeMesh.quaternion)
        // })
    }
}