function initPgaDw()
{
    let lineMv = e01.clone()
    if (0) {
        let lineGeo = new THREE.CylinderGeometry(.05, .05, 500.)
        let lineMesh = new THREE.Mesh(lineGeo, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }))
        dws.top.scene.add(lineMesh)
        let displayedLineMv = new Mv()

        updateFunctions.push(() => {

            if (lineMv.hasEuclideanPart())
                displayedLineMv.copy(lineMv)
            else {
                let planeContainingCameraAndLine = mv0
                join(lineMv, cameraPos, planeContainingCameraAndLine)
                meet(frustum.far, planeContainingCameraAndLine, displayedLineMv)
                //order here has not been thought through, may screw up orientation
                //actually you maybe want it intersected with
            }

            let pos = e123.projectOn(displayedLineMv, mv2)
            pos.toVector(lineMesh.position)

            let projectedOnOrigin = displayedLineMv.projectOn(e123, mv0).normalize()
            let quatToProjOnOrigin = mul(projectedOnOrigin, e31, mv1)
            quatToProjOnOrigin.log()
            quatToProjOnOrigin.sqrtSelf()
            quatToProjOnOrigin.toQuaternion(lineMesh.quaternion)
        })
    }

    //you probably do just want to scan the pga file once you've made it,
    //look for all instances of "newLocalMv" or whatever
    //and then create those

    const pointRadius = .1
    let pointGeo = new THREE.SphereBufferGeometry(pointRadius, 32, 16)
    let displayedPointMv = new Mv()
    class PointViz extends THREE.Mesh {
        #mv = new Mv()

        constructor(col) {
            if (col === undefined)
                col = 0xFFFFFF
            super(pointGeo, new THREE.MeshBasicMaterial({ color: col }))
            this.castShadow = true
        }

        setMv(newMv) {
            this.#mv.copy(newMv)

            if (this.#mv.hasEuclideanPart())
                this.#mv.toVector(this.position)
            else {
                let cameraJoin = mv0
                join(this.#mv, camera.mvs.pos, cameraJoin)
                meet(camera.frustum.far, cameraJoin, displayedPointMv)
                displayedPointMv.toVector(this.position)
            }
            //and scale its size with distance to camera
        }
    }
    window.PointViz = PointViz

    if (0) {
        let planeMesh = new THREE.Mesh(new THREE.CircleGeometry(2.), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }))
        dws.top.scene.add(planeMesh)

        let planeMv = new Mv().plane(2., 1., 1., 1.)
        planeMv.normalize()
        updateFunctions.push(() => {
            e123.projectOn(planeMv, mv0).toVector(planeMesh.position)

            let planeOnOrigin = planeMv.projectOn(e123, mv0)
            let e3ToPlaneMotor = mul(planeOnOrigin, e3, mv2).sqrt(mv3)
            e3ToPlaneMotor.toQuaternion(planeMesh.quaternion)
        })
    }

    let ourPointViz = new PointViz()
    dws.top.addNonMentionChild(ourPointViz)
    let mouseRay = new Mv()
    updateFunctions.push(()=>{
        getMouseRay(dws.top,mouseRay)

        ourPointViz.setMv(meet(e0, mouseRay, mv0))
    })
}