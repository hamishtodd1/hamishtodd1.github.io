function initStudyDw($dwEl) {
    let dw = new Dw("study", $dwEl, false)

    const points = []
    points.push(new THREE.Vector3(-10., 0., 0.))
    points.push(new THREE.Vector3( 10., 0., 0.))

    const geo = new THREE.BufferGeometry().setFromPoints(points)

    const mat = new THREE.LineBasicMaterial({
        color: 0x0000ff
    })
    dw.addNonMentionChild(new THREE.Line(geo, mat))

    //there's a circle marked, and perhaps you always get the projection onto there
    //for the study number: cylinder
}

function initPgaVizes() {

    let dragPlane = new Mv()
    
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
        #mv = new Mv();

        constructor(variable) {
            super(variable)

            let mat = new THREE.MeshBasicMaterial({ color: variable.col })
            let eMesh = new THREE.Mesh(pointGeo, mat)
            this.#euclideanDwMesh = eMesh
            eMesh.castShadow = true
            eMesh.visible = false
            dws.euclidean.scene.add(eMesh)
            camera.toHaveUpdateFromMvCalled.push(this)

            let iMesh = new THREE.Mesh(pointGeo, mat)
            this.#infinityDwMesh = iMesh
            iMesh.castShadow = true
            iMesh.visible = false
            dws.infinity.scene.add(iMesh)
        }

        updateFromMv() {
            if (this.#mv[14] !== 0.) {
                this.#mv.toVector(this.#euclideanDwMesh.position)
            }
            else {
                this.#mv.toVector(this.#infinityDwMesh.position)
                this.#infinityDwMesh.position.setLength(INFINITY_RADIUS)

                this.#infinityDwMesh.visible = true
                
                this.#mv.getDisplayableVersion(mv0)
                if (mv0[14] > 0.)
                    mv0.toVectorDisplayable(this.#euclideanDwMesh.position)
                else {
                    //actually should be a differently oriented point!
                    this.#euclideanDwMesh.position.copy(outOfTheWayPosition)
                }
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
                threeRay.origin.copy(camera.position)
                let mouseRay = getMouseRay(dw)
                meet(e0, mouseRay, draggedPoint).toVector(threeRay.direction)
                threeRay.direction.normalize()

                let intersectionResult = threeRay.intersectSphere(threeSphere,v1)
                if(intersectionResult !== null) {
                    this.#mv.fromVector(v1)
                    this.#mv[14] = 0.

                    this.updateFromMv()
                }
            }
            else console.error("not in that dw")
        }

        getCanvasPositionWorldSpace(target, dw) {
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

        getReassignmentText() {
            return generateReassignmentText(this.variable.name, "vec4", this.#mv[13], this.#mv[12], this.#mv[11], this.#mv[14])
        }

        getOverrideValues(overrideFloats) {
            overrideFloats[0] = this.#mv[13]; overrideFloats[1] = this.#mv[12]; overrideFloats[2] = this.#mv[11]; overrideFloats[3] = this.#mv[14]
        }

        getShaderOutputFloatString() {
            return getFloatArrayAssignmentString(this.variable.name, 4)
        }

        getOverrideText() {
            return `vec4(overrideFloats[0],overrideFloats[1],overrideFloats[2],overrideFloats[3]);`
        }

        setVisibility(newVisibility) {
            this.#euclideanDwMesh.visible = newVisibility
            this.#infinityDwMesh.visible = newVisibility && this.#mv[14] === 0.
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
    generalShaderPrefix += `
struct Dq {
    float scalar;
    float e01; float e02; float e03;
    float e12; float e31; float e23;
    float e0123;
};

vec4 applyDqToPt(in Dq dq, in vec4 pt) {
    float a1 = dq.e01, a2 = dq.e02, a3 = dq.e03, a4 = dq.e12, a5 = dq.e31, a6 = dq.e23;
    float _2a0 = 2. * dq.scalar, _2a4 = 2. * a4, _2a5 = 2. * a5, a0a0 = dq.scalar * dq.scalar, a4a4 = a4 * a4, a5a5 = a5 * a5, a6a6 = a6 * a6, _2a6 = 2. * a6, _2a0a4 = _2a0 * a4, _2a0a5 = _2a0 * a5, _2a0a6 = _2a0 * a6, _2a4a5 = _2a4 * a5, _2a4a6 = _2a4 * a6, _2a5a6 = _2a5 * a6;
    float n0 = (_2a0 * a3 + _2a4 * dq.e0123 - _2a6 * a2 - _2a5 * a1), x0 = (a0a0 + a4a4 - a5a5 - a6a6), y0 = (_2a4a5 + _2a0a6), z0 = (_2a4a6 - _2a0a5);
    float n1 = (_2a4 * a1 - _2a0 * a2 - _2a6 * a3 + _2a5 * dq.e0123), x1 = (_2a4a5 - _2a0a6), y1 = (a0a0 - a4a4 + a5a5 - a6a6), z1 = (_2a0a4 + _2a5a6);
    float n2 = (_2a0 * a1 + _2a4 * a2 + _2a5 * a3 + _2a6 * dq.e0123), x2 = (_2a0a5 + _2a4a6), y2 = (_2a5a6 - _2a0a4), z2 = (a0a0 - a4a4 - a5a5 + a6a6);
    float n3 = (a0a0 + a4a4 + a5a5 + a6a6);

    vec4 ret = vec4(
        x0*pt.x + y0*pt.y + z0*pt.z + n0*pt.w,
        x1*pt.x + y1*pt.y + z1*pt.z + n1*pt.w,
        x2*pt.x + y2*pt.y + z2*pt.z + n2*pt.w,
        n3*pt.w
    );
    return ret;
}
`

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
    let cameraPosProjectedOnSphere = e021.clone()
    let idealLineDual = new Mv()
    let labelPoint = new Mv()
    class DqMention extends Mention {
        #euclideanDwMesh;
        #infinityDwMesh;
        #ringMesh;
        #mv = new Mv();
        
        constructor(variable) {
            super(variable)

            this.#infinityDwMesh = new THREE.Mesh(iLineGeo, new THREE.MeshPhongMaterial({ color: variable.col }))
            this.#infinityDwMesh.visible = false
            dws.infinity.scene.add(this.#infinityDwMesh)
            this.#infinityDwMesh.castShadow = true

            this.#euclideanDwMesh = new THREE.Mesh(eLineGeo, new THREE.MeshPhongMaterial({ color: variable.col }))
            this.#euclideanDwMesh.visible = false
            dws.euclidean.scene.add(this.#euclideanDwMesh)
            this.#euclideanDwMesh.castShadow = true

            this.#ringMesh = new THREE.Mesh(ringGeo, new THREE.MeshPhongMaterial({ color: variable.col }))
            this.#ringMesh.visible = false
            dws.infinity.scene.add(this.#ringMesh)
            this.#ringMesh.castShadow = true

            //there was some bug involving hovering the variable just under the grey line
            //and that showed up but no others did

            camera.toHaveUpdateFromMvCalled.push(this)
        }

        updateFromMv() {
            linePart.copy(this.#mv)
            linePart[0] = 0.
            linePart[15] = 0.

            if(linePart.eNorm() !== 0.) {
                getQuaternionToProjectionOnOrigin(linePart, this.#infinityDwMesh.quaternion)
            }
            else {
                //default mv is e02
                join(e123,linePart,joinedWithOrigin)
                mul(joinedWithOrigin, e3, quatToOriginVersion)
                quatToOriginVersion.sqrtSelf()
                quatToOriginVersion.toQuaternion(this.#ringMesh.quaternion)
            }

            linePart.getDisplayableVersion(displayedLineMv)
            getQuaternionToProjectionOnOrigin(displayedLineMv, this.#euclideanDwMesh.quaternion)
            e123.projectOn(displayedLineMv, mv0).toVector(this.#euclideanDwMesh.position)
        }

        updateViz(shaderWithMentionReadout) {
            getShaderOutput(shaderWithMentionReadout, dwNewValues)
            newDq.copy(dwNewValues)
            newDq.toMv(this.#mv)

            this.setVisibility(this.#euclideanDwMesh.visible)

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
            return  this.#euclideanDwMesh.parent === dw.scene && this.#euclideanDwMesh.visible ||
                    (this.#infinityDwMesh.parent === dw.scene && (this.#infinityDwMesh.visible || this.#ringMesh.visible) )
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