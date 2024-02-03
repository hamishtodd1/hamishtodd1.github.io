function initPluckerVizes() {

    let defaultCol = 0x00FFFF
    
    let rotAxisRadius = .006
    let trnAxisRadius = .12
    let rotAxisGeo = new THREE.CylinderGeometry(rotAxisRadius, rotAxisRadius, camera.far * 10., 5, 1, true)
    let trnAxisGeo = new THREE.CylinderGeometry(trnAxisRadius, trnAxisRadius, camera.far * 10., 5, 1, true)
    let rotationPart = new Dq()
    let translationPart = new Dq()
    let bivPart = new Dq()
    let nonNetherDq = new Dq()
    class PluckerViz extends THREE.Group {
        
        constructor(col = defaultCol, transparent = false) {

            super()
            scene.add(this)
            this.dq = new Dq()

            let axisMat = new THREE.MeshPhongMaterial({
                color: col,
                transparent: transparent,
                opacity: transparent ? .4 : 1.
            })
            this.rotAxisMesh = new DqMesh(rotAxisGeo, axisMat)
            this.rotAxisMesh.visible = false
            this.add(this.rotAxisMesh)

            this.trnAxisMesh = new THREE.Mesh(trnAxisGeo, axisMat)
            this.trnAxisMesh.visible = false
            this.add(this.trnAxisMesh)

            obj3dsWithOnBeforeRenders.push(this)
            this.onBeforeRender = () => {

                if (!this.visible)
                    return

                this.dq.selectGrade(2, bivPart)
                
                if (bivPart.isZero()) {
                    this.rotAxisMesh.visible = this.trnAxisMesh.visible = false
                    return
                }

                nonNetherDq.copy(this.dq)  
                let isNether = nonNetherDq[0] < 0. && Math.abs(bivPart.eNormSq()) < eps
                if (isNether)
                    nonNetherDq.multiplyScalar(-1., nonNetherDq)

                //axes
                this.dq.invariantDecomposition(rotationPart, translationPart)
                {
                    if (rotationPart.approxEquals(oneDq))
                        this.rotAxisMesh.visible = false
                    else {
                        this.rotAxisMesh.visible = true

                        rotationPart.selectGrade(2, dq0)
                        e31.dqTo(dq0, this.rotAxisMesh.dq)
                    }

                    if (translationPart.approxEquals(oneDq))
                        this.trnAxisMesh.visible = false
                    else {
                        this.trnAxisMesh.visible = true

                        translationPart.selectGrade(2, dq0)
                        let fakeLineAtInfinity = dq0.fakeThingAtInfinity(dq1)
                        // e31.dqTo(fakeLineAtInfinity, this.trnAxisMesh.dq)
                        camera.mvs.pos.projectOn(fakeLineAtInfinity, fl0).pointToGibbsVec(this.trnAxisMesh.position)
                        let fakeAtOrigin = fakeLineAtInfinity.projectOn(e123, dq0)
                        e31.dqTo(fakeAtOrigin, dq2).toQuaternion(this.trnAxisMesh.quaternion)
                        

                    }
                }
            }
        }

    }
    window.PluckerViz = PluckerViz

    debugPluckers = [
        new PluckerViz(0xFF0000, false, true),
        new PluckerViz(0xFF0000, false, true)
    ]
    debugPluckers.forEach(ddq => {
        ddq.dq.zero()
    })
}