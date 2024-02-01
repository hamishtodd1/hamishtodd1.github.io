/*
    TERRIBLE DISTRACTION UNTIL YOU HAVE A REASON TO NEED IT
        The arrow is the hard part
        Needs to go through the plane
        But how to indicate it's a reflection?
 */


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
    let planeGeo = new THREE.CircleGeometry(.2, 32)
    let pointGeo = new THREE.SphereGeometry(.004)

    //need studs
    //dotted line axis maybe
    
    class FlViz extends THREE.Group {

        constructor() {
            
            super()
            scene.add(this)

            this.fl = new Fl()
            this.fl.zero()
            this.markupPos = new Fl().point(0.,1.2,0.,1.)

            this.plane = new THREE.Group()
            this.plane.visible = false
            scene.add(this.plane)
            this.plane.add(new THREE.Mesh(planeGeo, planeMatFront))
            this.plane.add(new THREE.Mesh(planeGeo, planeMatBack))

            this.point = new THREE.Mesh(pointGeo, pointMat)
            this.point.visible = false
            scene.add(this.point)

            //arrow too maybe

            obj3dsWithOnBeforeRenders.push(this)
            this.onBeforeRender = () => {
                
                let hasPlane = /*Math.abs(this.fl[0]) > eps || */Math.abs(this.fl[1]) > eps || Math.abs(this.fl[2]) > eps || Math.abs(this.fl[3]) > eps
                let hasPoint = Math.abs(this.fl[4]) > eps || Math.abs(this.fl[5]) > eps || Math.abs(this.fl[6]) > eps || Math.abs(this.fl[7]) > eps

                this.point.visible = hasPoint
                if( hasPoint) {
                    let isIdeal = this.fl[7] === 0.
                    if (!isIdeal) {
                        this.fl.pointToGibbsVec(this.point.position)
                        this.point.scale.setScalar(1.)
                    }
                    else {
                        this.fl.fakeThingAtInfinity(fl0)
                        fl0.pointToGibbsVec(this.point.position)
                        this.point.scale.setScalar(10.)
                    }

                    this.markupPos.pointFromGibbsVec(this.point.position)
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
    window.FlViz = FlViz

    debugFls = [
        new FlViz(), new FlViz(),
        new FlViz(), new FlViz()
    ]
    debugFls.forEach(dfl => {
        dfl.fl.zero()
        dfl.markupPos.pointFromGibbsVec(outOfSightVec3)
    })

    // let myFlViz = new FlViz()
    // myFlViz.fl.copy(e3)

    // myFlViz.fl.copy(e012)
    // // myFlViz.fl.multiplyScalar(-1., myFlViz.fl)

    // blankFunction = () => {
    //     myFlViz.fl[7] = sq(Math.cos(frameCount * .02))
    //     myFlViz.fl[4] = -sq(Math.sin(frameCount * .02))
    // }
    

}