function initPgaDw($dwEl)
{
    let dw = new Dw($dwEl, true)
    dws.top = dw

    let dragPlane = new Mv()

    {
        let draggedPoint = new Mv()
        let newValues = new Float32Array(4)
        let settingPointMv = new Mv()
        types.point = {
            dw,
            getFreshViz: (col) => {
                return new PointViz(col)
            },
            getOutputFloatString: (variableName) => {
                return getFloatArrayAssignmentString(variableName, 4)
            },
            respondToDrag: () => {
                let mouseRay = getMouseRay(dw)
                meet(dragPlane, mouseRay, draggedPoint)
                draggedPoint.toVectorDisplayable(grabbedMention.viz.position)
            },
            onGrab: () => {
                let initialPosition = mv0
                initialPosition.fromVector(grabbedMention.viz.position)
                camera.frustum.far.projectOn(initialPosition, dragPlane)
            },
            updateVizAndCanvasPos: (mention, shaderWithMentionReadout) => {
                getShaderOutput(shaderWithMentionReadout, newValues)
                mention.canvasPosWorldSpace.fromArray(newValues)
                settingPointMv.fromVector4(mention.canvasPosWorldSpace)
                mention.viz.setMv(settingPointMv)
            },
            getReassignmentText: () => {
                return "\n    " + grabbedMention.variable.name + " = vec4(" +
                    grabbedMention.viz.position.x.toFixed(2) + "," +
                    grabbedMention.viz.position.y.toFixed(2) + "," +
                    grabbedMention.viz.position.z.toFixed(2) + ",1.);\n"
            }
        }

        document.addEventListener('keydown', (event) => {
            if (event.key === " " && grabbedMention !== null && grabbedMention.variable.type === types.point)
                dragPlane.copy(e0)
        })
    }

    {
        const pointRadius = .1
        let pointGeo = new THREE.SphereBufferGeometry(pointRadius, 32, 16)
        class PointViz extends THREE.Mesh {
            constructor(col) {
                if (col === undefined)
                    col = 0xFFFFFF
                super(pointGeo, new THREE.MeshBasicMaterial({ color: col }))
                this.castShadow = true
            }

            setMv(newMv) {
                newMv.toVectorDisplayable(this.position)
            }
        }
        window.PointViz = PointViz //since this is useful for debug

        let ourPointViz = new PointViz()
        dw.addNonMentionChild(ourPointViz)
        dw.elem.addEventListener('mousemove',(event)=>{
            let mouseRay = getMouseRay(dw)

            ourPointViz.setMv(meet(e0, mouseRay, mv0))
        })
    }

    {
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