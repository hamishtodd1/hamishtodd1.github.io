function initPgaDw()
{
    let cameraJoin = new Mv()
    
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
    
    dws.top.addNonMentionChild(ourLineViz)
    updateFunctions.push(()=>{
        ourLineViz.setMv(e01)
    })

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
    window.PointViz = PointViz

    // {
    //     let ourPointViz = new PointViz()
    //     dws.top.addNonMentionChild(ourPointViz)
    //     let mouseRay = new Mv()
    //     dws.top.elem.addEventListener('mousemove',(event)=>{
    //         getMouseRay(dws.top, mouseRay)

    //         ourPointViz.setMv(meet(e0, mouseRay, mv0))
    //     })
    // }

    
    {
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
}