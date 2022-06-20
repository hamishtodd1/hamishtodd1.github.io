/**
 * Study part
 *  1 + e12 is (1,1)
 *  1 + e01? Surely still (1,1)
 *  1 + e12 + e0123 ?
 * 
 * Or maybe squaring the thing
 */

function initPgaVizes() {

    let dragPlane = new Mv()

    ////////////
    // PLANES //
    ////////////

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

    
    ////////////
    // POINTS //
    ////////////
    
    let threeRay = new THREE.Ray()
    let threeSphere = new THREE.Sphere(new THREE.Vector3(), INFINITY_RADIUS)
    let draggedPoint = new Mv()
    let ptNewValues = new Float32Array(4)
    let outOfTheWayPosition = new THREE.Vector3(camera.far * 999., camera.far * 999., camera.far * 999.)
    class Point extends Mention {
        #euclideanDwMesh;
        #infinityDwMesh;
        textareaManipulationDw = dws.euclidean;
        #mv = new Mv();

        constructor(variable) {
            super(variable)

            let mat = new THREE.MeshBasicMaterial({ color: variable.col })
            this.#euclideanDwMesh = dws.euclidean.NewMesh(pointGeo, mat)
            this.#infinityDwMesh = dws.infinity.NewMesh(pointGeo, mat)
            
            camera.toHaveUpdateFromMvCalled.push(this)
        }

        updateFromMv() {
            if (this.#mv[14] !== 0.)
                this.#mv.toVector(this.#euclideanDwMesh.position)
            else {
                this.#mv.toVector(this.#infinityDwMesh.position)
                this.#infinityDwMesh.position.setLength(INFINITY_RADIUS)
                
                this.#mv.getDisplayableVersion(mv0)
                if (mv0[14] > 0.)
                    mv0.toVectorDisplayable(this.#euclideanDwMesh.position)
                else {
                    //actually should be a differently oriented point!
                    this.#euclideanDwMesh.position.copy(outOfTheWayPosition)
                }
            }
        }

        updateFromShader() {
            this.getShaderOutput(ptNewValues)
            this.#mv.point(ptNewValues[0], ptNewValues[1], ptNewValues[2], ptNewValues[3])
            this.updateFromMv()
        }

        onGrab(dw) {
            if(dw === dws.euclidean) {
                if (this.#mv.hasEuclideanPart())
                    camera.frustum.far.projectOn(this.#mv, dragPlane)
                else dragPlane.copy(e0)
            }
        }

        overrideFromDrag(dw) {
            //might be nice to snap to a grid

            let self = this
            function getFloatsForOverride(overrideFloats) {
                overrideFloats[0] = self.#mv[13]; overrideFloats[1] = self.#mv[12]; overrideFloats[2] = self.#mv[11]; overrideFloats[3] = self.#mv[14]
            }

            if(dw === dws.euclidean) {
                let mouseRay = getMouseRay(dw)
                meet(dragPlane, mouseRay, this.#mv)
                updateOverride(this, getFloatsForOverride)
            }
            else if(dw === dws.infinity) {
                threeRay.origin.copy(camera.position)
                let mouseRay = getMouseRay(dw)
                meet(e0, mouseRay, draggedPoint).toVector(threeRay.direction)
                threeRay.direction.normalize()

                let intersectionResult = threeRay.intersectSphere(threeSphere,v1)
                if(intersectionResult !== null) {
                    this.#mv.fromVec(v1)
                    this.#mv[14] = 0.

                    updateOverride(this, getFloatsForOverride)
                }
            }
            else console.error("not in that dw")
        }

        getWorldSpaceCanvasPosition(target, dw) {
            if (dw === dws.euclidean) {
                target.copy(this.#euclideanDwMesh.position)
                target.w = 1.
            }
            else if (dw === dws.infinity) {
                target.copy(this.#infinityDwMesh.position)
                target.w = 1.
            }
            else
                console.error("not in that dw")
        }

        getReassignmentPostEquals(useOverrideFloats) {
            if (useOverrideFloats)
                return generateReassignmentText("vec4", true, 4)
            else {
                let m = this.#mv
                return generateReassignmentText("vec4", m[13], m[12], m[11], m[14])
            }
        }

        getShaderOutputFloatString() {
            return getFloatArrayAssignmentString(this.variable.name, 4)
        }

        setVisibility(newVisibility) {
            this.#euclideanDwMesh.visible = newVisibility
            this.#infinityDwMesh.visible  = newVisibility && this.#mv[14] === 0.
        }

        isVisibleInDw(dw) {
            if (dw !== dws.euclidean && dw !== dws.infinity)
                return false
            let m = dw === dws.euclidean ? this.#euclideanDwMesh : this.#infinityDwMesh
            return m.visible
        }
    }
    types.vec4 = Point

    /////////
    // DQs //
    /////////

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
    let idealLineDual = new Mv()
    let labelPoint = new Mv()
    class DqMention extends Mention {
        #euclideanDwMesh;
        #infinityDwMesh;
        #ringMesh;
        textareaManipulationDw = dws.euclidean;
        #mv = new Mv();
        
        constructor(variable) {
            super(variable)

            this.#infinityDwMesh = dws.infinity.NewMesh(iLineGeo, new THREE.MeshPhongMaterial({ color: variable.col }))
            this.#euclideanDwMesh = dws.euclidean.NewMesh(eLineGeo, new THREE.MeshPhongMaterial({ color: variable.col }))
            this.#ringMesh = dws.infinity.NewMesh(ringGeo, new THREE.MeshPhongMaterial({ color: variable.col }))

            //there was some bug involving hovering the variable just under the grey line
            //and that showed up but no others did

            camera.toHaveUpdateFromMvCalled.push(this)
        }

        updateFromMv() {
            // if(this.variable.name === "rotation")
            //     debugger

            //visibility is about two things
                
            this.#mv.selectGrade(2,linePart)
            if(linePart.approxEquals(zeroMv)) {
                
                return
            }

            if (linePart.eNorm() !== 0.) //ring / infinity mesh
                getQuaternionToProjectionOnOrigin(linePart, this.#infinityDwMesh.quaternion)
            else { // euclidean mesh
                //default mv is e02
                join(e123, linePart, joinedWithOrigin)
                mul(joinedWithOrigin, e3, quatToOriginVersion)
                quatToOriginVersion.sqrtSelf()
                quatToOriginVersion.toQuaternion(this.#ringMesh.quaternion)
            }

            // if(this.variable.name === "originL")
            //     debugger
            linePart.getDisplayableVersion(displayedLineMv)
            getQuaternionToProjectionOnOrigin(displayedLineMv, this.#euclideanDwMesh.quaternion)
            e123.projectOn(displayedLineMv, mv0).toVector(this.#euclideanDwMesh.position)

            this.setVisibility(this.#euclideanDwMesh.visible)
        }

        updateFromShader() {
            this.getShaderOutput(dwNewValues)
            newDq.copy(dwNewValues)
            newDq.toMv(this.#mv)

            this.updateFromMv()
        }

        overrideFromDrag(dw) {

            if (dw === dws.euclidean) {
                let mouseRay = getMouseRay(dw)
                
                this.#mv.projectOn(mouseRay,mv0)
                this.#mv.copy(mv0)
                //interested in lines projected on lines? Gee, if only you had some kind of platform for doing that!
            }
            else if (dw === dws.infinity) {
                
                // threeRay.origin.copy(camera.position)
                // let mouseRay = getMouseRay(dw)
                // meet(e0, mouseRay, draggedPoint).toVector(threeRay.direction)
                // threeRay.direction.normalize()

                // let intersectionResult = threeRay.intersectSphere(threeSphere, v1)
                // if (intersectionResult !== null) {
                //     this.#mv.fromVec(v1)
                //     this.#mv[14] = 0.

                //     updateOverride(this, getFloatsForOverride)
                // }
            }
            else console.error("not in that dw")

            //line editing controls
            //move mouse left right up down and it translates
            //press a toggle and 

            //want to project line onto the point
            //what's the point? How far down the mouse ray?

            //Alternatively, it pivots around where you grabbed it
            //unless you move the mouse to the edge of the window
            //if moving mouse outside window, it's the pivot joined with that point at infinity

            //will be cool to edit at infinity. Probably yes, one point of it is stuck, an

            updateOverride(this, (overrideFloats) => {
                dq0.fromMv(this.#mv)
                for(let i = 0; i < 8; ++i)
                    overrideFloats[i] = this.#mv[i]
            })
        }

        getWorldSpaceCanvasPosition(target, dw) {
            if (dw === dws.euclidean) {
                target.copy(this.#euclideanDwMesh.position)
                target.w = 1.
            }
            else if (dw === dws.infinity) {

                if(this.#mv.hasEuclideanPart()) {
                    //probably want something about its intersection with the top
                    //ideally taking account of directedness
                    //probably e12 corresponds to e012
                    meet(this.#mv, e0, labelPoint)
                    labelPoint.multiplyScalar(-1.)
                    let vec3Part = labelPoint.toVector(v1)
                    vec3Part.setLength(INFINITY_RADIUS)
                    target.copy(vec3Part)
                    target.multiplyScalar(.5)
                    target.w = 1.
                }
                else {
                    dual(this.#mv, idealLineDual)
                    let planeToIntersect = join(camera.mvs.pos, idealLineDual, mv0)
                    meet(planeToIntersect, this.#mv, labelPoint)
                    let vec3Part = labelPoint.toVector(v1)
                    vec3Part.setLength(INFINITY_RADIUS)
                    target.copy(vec3Part)
                    target.w = 1.
                }
            }
            else
                console.error("not in that dw")
        }

        setVisibility(newVisibility) {
            this.#euclideanDwMesh.visible = newVisibility

            let hasEuclideanPart = this.#mv.hasEuclideanPart()
            this.#infinityDwMesh.visible = hasEuclideanPart && newVisibility
            
            this.#ringMesh.visible = !hasEuclideanPart && newVisibility
        }

        isVisibleInDw(dw) {
            return  (dw === dws.euclidean && this.#euclideanDwMesh.visible) ||
                    (dw === dws.infinity  && (this.#infinityDwMesh.visible || this.#ringMesh.visible) )
        }

        getReassignmentPostEquals(useOverrideFloats) {
            if (useOverrideFloats) 
                return generateReassignmentText("Dq", true, 8)
            else {
                dq0.fromMv(this.#mv)
                return generateReassignmentText("Dq", dq0[0], dq0[1], dq0[2], dq0[3], dq0[4], dq0[5], dq0[6], dq0[7])
            }
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

    // if(0)
    // {
        // let mousePoint = new THREE.Mesh(new THREE.SphereBufferGeometry(.1, 32, 16), new THREE.MeshBasicMaterial({ color: 0xFFFFFF }))
        // mousePoint.position.copy(outOfTheWayPosition)
        // dws.euclidean.addNonMentionChild(mousePoint)
        // dws.euclidean.elem.addEventListener('mousemove', (event) => {
        //     let mouseRay = getMouseRay(dws.euclidean)

        //     meet(e0, mouseRay, mv0).toVectorDisplayable(mousePoint.position)
        // })
    // }
}