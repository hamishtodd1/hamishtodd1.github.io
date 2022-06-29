function initDqs() {

    let eDw = dws.euclidean
    let iDw = dws.infinity
    let sDw = dws.study

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
    let dotGeo = new THREE.CircleBufferGeometry(.1, 32)
    let ringGeo = new THREE.TorusGeometry(INFINITY_RADIUS, .05, 7, 62)
    let dwNewValues = new Float32Array(8)
    let newDq = new Dq()
    let displayedLineMv = new Mv()
    let linePart = new Mv() //bivector?
    let dragPlane = new Mv() //maybe two drag planes
    let newLinePart = new Mv()
    let dragPoint = new Mv()
    let idealLineDual = new Mv()
    let labelPoint = new Mv()
    let worldSpaceCameraPosition = new THREE.Vector4()
    class DqMention extends Mention {
        #eDwMesh;
        #sDwMesh;
        #iDwLineMesh;
        #iDwRingMesh;
        textareaManipulationDw = eDw;
        #mv = new Mv();
        
        constructor(variable) {
            super(variable)

            let mat = new THREE.MeshPhongMaterial({ color: variable.col })

            this.#eDwMesh = eDw.NewMesh(eLineGeo, mat)
            this.#iDwLineMesh = iDw.NewMesh(iLineGeo, mat)
            this.#iDwRingMesh = iDw.NewMesh(ringGeo,  mat)
            this.#sDwMesh = sDw.NewMesh(dotGeo, new THREE.MeshBasicMaterial({ color: variable.col }))

            camera.toHaveUpdateFromMvCalled.push(this)
        }

        updateFromMv() {
            
            //but the problem with study space is that eg (1+e12)'s study number is just a scalar
            // this.#mv.reverse(mv0)
            // mul(this.#mv,mv0,studyPart)
            // this.#sDwMesh.position.x = studyPart[0]
            // this.#sDwMesh.position.y = studyPart[15]

            //more like: it's a mobius strip. 
            //And by the way, it's angled in 3D space such that your line is through it
            //But when you hover that window, the mobius strip unravels
            //The full circle is more about creating rotations than looking at current ones

            // this.#mv.getNormalization(normalization)
            // normalization.dqLog(normalizationLogarithm)
            // let eNorm = normalizationLogarithm.eNorm()
            // if(eNorm === 0.) {
            //     //use the scalar part and the iNorm of the linepart
            // }
            // else {
            //     log(this.variable.name)
            //     this.#mv.log()
            //     normalization.log()
            //     normalizationLogarithm.log()
            //     log(eNorm)
            //     this.#sDwMesh.position.x = Math.cos(eNorm)
            //     this.#sDwMesh.position.y = Math.sin(eNorm)
            //     log(this.#sDwMesh.position)
            // }

            this.#mv.selectGrade(2, linePart)
            if(linePart.approxEquals(zeroMv)) {
                this.#eDwMesh.position.copy(outOfTheWayPosition)
                this.#iDwRingMesh.position.copy(outOfTheWayPosition)
                this.#iDwLineMesh.position.copy(outOfTheWayPosition)
                //and the motor window is the only place you see this
                return
            }

            if (linePart.eNorm() !== 0.) //ring / infinity mesh
                getQuaternionToProjectionOnOrigin(linePart, this.#iDwLineMesh.quaternion)
            else { // euclidean mesh
                //default mv is e02
                join(e123, linePart, joinedWithOrigin)
                mul(joinedWithOrigin, e3, quatToOriginVersion)
                quatToOriginVersion.sqrtSelf()
                quatToOriginVersion.toQuaternion(this.#iDwRingMesh.quaternion)
            }

            linePart.getDisplayableVersion(displayedLineMv)
            getQuaternionToProjectionOnOrigin(displayedLineMv, this.#eDwMesh.quaternion)
            e123.projectOn(displayedLineMv, mv0).toVector(this.#eDwMesh.position)
        }

        updateFromShader() {
            this.getShaderOutput(dwNewValues)
            newDq.copy(dwNewValues)
            newDq.toMv(this.#mv)
            // if (this.variable.name === "infRotation")  {
            //     log(dwNewValues)
            //     log(newDq)
            //     log(this.#mv)
            // }

            this.updateFromMv()
        }

        onGrab(dw) {
            if (dw === eDw) {
                if (this.#mv.hasEuclideanPart())
                    camera.frustum.far.projectOn(this.#mv, dragPlane)
                else dragPlane.copy(e0)
            }
        }

        overrideFromDrag(dw) {

            if (dw === sDw) {
                camera2d.oldClientToPosition(dw, this.#sDwMesh.position)
                console.error("TODO figure out how to change #mv!")
            }
            else if (dw === eDw) {
                this.#mv.selectGrade(2, linePart)
                let oldENorm = linePart.eNorm()
                if(oldENorm !== 0.) {
                    let mouseRay = getMouseRay(dw)

                    meet(dragPlane,mouseRay,dragPoint)
                    mv0.copy(linePart).projectOn(dragPoint,newLinePart)
                    newLinePart.normalize()
                    
                    for (let i = 5; i < 11; ++i)
                        this.#mv[i] = newLinePart[i] * oldENorm

                    //if mouse goes somewhere more than 45 degrees from the line, translate it
                    //if less than 45, turn it
                }
                else {
                    //it's at infinity
                }
            }
            else if (dw === iDw) {
                
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

            //will be cool to edit at infinity. Probably yes, one point of it is stuck, an

            updateOverride(this, (overrideFloats) => {
                dq0.fromMv(this.#mv)
                for(let i = 0; i < 8; ++i)
                    overrideFloats[i] = dq0[i]
            })
        }

        setVisibility(newVisibility) {
            this.#eDwMesh.visible = newVisibility
            this.#sDwMesh.visible = newVisibility

            this.#mv.selectGrade(2, linePart)
            let hasEuclideanPart = linePart.hasEuclideanPart()
            this.#iDwLineMesh.visible =  hasEuclideanPart && newVisibility            
            this.#iDwRingMesh.visible = !hasEuclideanPart && newVisibility
        }

        getCanvasPosition(dw) {
            if (dw === sDw)
                return camera2d.positionToWindow(this.#sDwMesh.position,dw)
            else {
                if (dw === eDw) {
                    worldSpaceCameraPosition.copy(this.#eDwMesh.position)
                    worldSpaceCameraPosition.w = 1.
                }
                else if (dw === iDw) {
                    this.#mv.selectGrade(2, linePart)
                    if (linePart.hasEuclideanPart()) {
                        //probably want something about its intersection with the top
                        //ideally taking account of directedness
                        //probably e12 corresponds to e012
                        meet(linePart, e0, labelPoint)
                        labelPoint.multiplyScalar(-1.)
                        let vec3Part = labelPoint.toVector(v1)
                        vec3Part.setLength(INFINITY_RADIUS)
                        worldSpaceCameraPosition.copy(vec3Part)
                        worldSpaceCameraPosition.multiplyScalar(.5)
                        worldSpaceCameraPosition.w = 1.
                    }
                    else {
                        dual(linePart, idealLineDual)
                        let planeToIntersect = join(camera.mvs.pos, idealLineDual, mv0)
                        meet(planeToIntersect, linePart, labelPoint)
                        let vec3Part = labelPoint.toVector(v1)
                        vec3Part.setLength(INFINITY_RADIUS)
                        worldSpaceCameraPosition.copy(vec3Part)
                        worldSpaceCameraPosition.w = 1.
                    }
                }
                return camera.positionToWindow(worldSpaceCameraPosition,dw)
            }
        }

        isVisibleInDw(dw) {
            return  (dw === eDw && this.#eDwMesh.visible) ||
                    (dw === sDw && this.#sDwMesh.visible) ||
                    (dw === iDw && (this.#iDwLineMesh.visible || this.#iDwRingMesh.visible) )
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
        // eDw.addNonMentionChild(mousePoint)
        // eDw.elem.addEventListener('mousemove', (event) => {
        //     let mouseRay = getMouseRay(eDw)

        //     meet(e0, mouseRay, mv0).toVectorDisplayable(mousePoint.position)
        // })
    // }
}