
function initFlVizes() {

    let planeMatFront = new THREE.MeshPhongMaterial({ 
        side: THREE.FrontSide,
        color: 0x00FFFF,
        transparent: true,
        opacity: .4 })
    let planeMatBack = new THREE.MeshPhongMaterial({
        side: THREE.BackSide,
        color: 0x00FF00,
        transparent: true,
        opacity: .4
    })
    let pointMat = new THREE.MeshPhongMaterial({
        color: 0x00FFFF,
    })
    let planeGeo = new THREE.CircleGeometry(1., 32)
    let pointGeo = new THREE.SphereGeometry(.04)

    //need studs
    //dotted line axis maybe
    
    class FlViz extends THREE.Group {

        constructor() {
            
            super()
            scene.add(this)

            this.fl = new Fl()
            this.markupPos = new Fl().point(0.,1.6,0.,1.)

            this.plane = new THREE.Group()
            scene.add(this.plane)
            this.plane.add(new THREE.Mesh(planeGeo, planeMatFront))
            this.plane.add(new THREE.Mesh(planeGeo, planeMatBack))

            this.point = new THREE.Mesh(pointGeo, pointMat)
            scene.add(this.point)

            //arrow too maybe

            obj3dsWithOnBeforeRenders.push(this)
            this.onBeforeRender = () => {
                let hasPlane = this.fl[0] !== 0. || this.fl[1] !== 0. || this.fl[2] !== 0. || this.fl[3] !== 0.
                let hasPoint = this.fl[4] !== 0. || this.fl[5] !== 0. || this.fl[6] !== 0. || this.fl[7] !== 0.

                this.point.visible = hasPoint
                if( hasPoint) {
                    this.fl.pointToGibbsVec(this.point.position)
                    //actually if it's an ideal point, need to a bit more

                    this.markupPos.copy(this.fl)
                }

                this.plane.visible = hasPlane
                if (hasPlane ) {
                    this.markupPos.pointToGibbsVec(this.plane.position)
                    fl1.pointFromGibbsVec(this.plane.position)
                    let e3OnPos = e3.projectOn(this.markupPos,fl0)
                    this.fl.mulReverse(e3OnPos,dq0).sqrtSelf().toQuaternion(this.plane.quaternion)

                    //TODO studs, rounded back, sharp front
                    //randomly distributed, maybe moving super slowly
                }

                if (hasPlane && hasPoint) {
                    //dotted line
                    //arrow.
                    //arrows gaugeable
                    //also the 3-reflection I guess, 3 planes
                }
            }
        }
    }

    // let myFlViz = new FlViz()
    // myFlViz.fl.copy(e123)

}