function initPgaVizes() {

    let dragPlane = new Mv()

    const pointRadius = .1
    let pointGeo = new THREE.SphereBufferGeometry(pointRadius, 32, 16)
    
    let draggedPoint = new Mv()
    let newValues = new Float32Array(4)
    class Point extends Mention {
        #mesh

        //aka getFreshViz
        constructor(variable) {
            super(variable)

            let mesh = new THREE.Mesh(pointGeo, new THREE.MeshPhongMaterial({ color: variable.col }))
            this.#mesh = mesh
            mesh.castShadow = true
            mesh.visible = false
            dws.euclidean.scene.add(mesh)
        }

        getCanvasPositionWorldSpace(target, dw) {
            target.copy(this.#mesh.position)
            target.w = 1.
            
            if(dw !== dws.euclidean)
                console.error("not in that dw")
        }

        getShaderOutputFloatString() {
            return getFloatArrayAssignmentString(this.variable.name, 4)
        }

        respondToDrag(dw) {
            //might be nice to snap to a grid

            let mouseRay = getMouseRay(dw)
            meet(dragPlane, mouseRay, draggedPoint)
            draggedPoint.toVectorDisplayable(this.#mesh.position)
        }

        onGrab() {
            let initialPosition = mv0
            initialPosition.fromVector(this.#mesh.position)
            camera.frustum.far.projectOn(initialPosition, dragPlane)
        }

        updateViz(shaderWithMentionReadout) {
            getShaderOutput(shaderWithMentionReadout, newValues)
            this.#mesh.position.fromArray(newValues).multiplyScalar(1./newValues[3])
        }

        getReassignmentText() {
            return "\n    " + this.variable.name + " = vec4(" +
                this.#mesh.position.x.toFixed(2) + "," +
                this.#mesh.position.y.toFixed(2) + "," +
                this.#mesh.position.z.toFixed(2) + ",1.);\n"
        }

        setVisibility(newVisibility) {
            this.#mesh.visible = newVisibility
        }

        isVisibleInDw(dw) {
            return this.#mesh.visible && this.#mesh.parent === dw.scene
        }
    }
    types.Point = Point

    //TODO bring this back
    log("TODO bring this back")
    // document.addEventListener('keydown', (event) => {
    //     if (event.key === " " && grabbedMention !== null && grabbedMention.variable.type === types.point)
    //         dragPlane.copy(e0)
    // })
}

function initEuclideanDw($dwEl)
{
    let dw = new Dw("euclidean", $dwEl, true)

    {
        //line editing controls
        //move mouse left right up down and it translates
        //press a toggle and 

        //Alternatively, it pivots around where you grabbed it
        //unless you move the mouse to the edge of the window
        //if moving mouse outside window, it's the pivot joined with that point at infinity

        let lineGeo = new THREE.CylinderGeometry(.1, .1, 500.)

        let displayedLineMv = new Mv()
        class LineViz extends THREE.Mesh {

            constructor(col) {
                if (col === undefined)
                    col = 0xFFFFFF
                super(lineGeo, new THREE.MeshPhongMaterial({ color: col }))
                this.castShadow = true
            }

            setMv(newMv) {
                newMv.getDisplayableVersion(displayedLineMv)

                let pos = e123.projectOn(displayedLineMv, mv2)
                pos.toVector(this.position)

                let projectedOnOrigin = displayedLineMv.projectOn(e123, mv0).normalize()
                let quatToProjOnOrigin = mul(projectedOnOrigin, e31, mv1)
                quatToProjOnOrigin.sqrtSelf()
                quatToProjOnOrigin.toQuaternion(this.quaternion)
            }
        }

        let ourLineViz = new LineViz()
        ourLineViz.setMv(e01)
        dw.addNonMentionChild(ourLineViz)
    }

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