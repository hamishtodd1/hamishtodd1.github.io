/*
    For transflection: When holding, have all 3
        It's so unlikely you actually want a transflection that we can get rid of all 3 mirrors
        So markupPos is the place where TWO of the plane positions are

    Studs might be nice?
    dotted line axis maybe

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
        color: 0xFF0000,
    })
    let planeGeo = new THREE.CircleGeometry(.2, 32)
    planeGeo.computeBoundingBox()
    let pointGeo = new THREE.SphereGeometry(.004)
    pointGeo.computeBoundingBox()

    let boundingBox = new THREE.Box3()

    let extraPlanes = [
        new THREE.Group().add(
            new THREE.Mesh(planeGeo, planeMatFront),
            new THREE.Mesh(planeGeo, planeMatBack)),
        new THREE.Group().add(
            new THREE.Mesh(planeGeo, planeMatFront),
            new THREE.Mesh(planeGeo, planeMatBack)),
    ]
    extraPlanes.forEach(plane => {
        plane.visible = false
        scene.add(plane)
    })

    function planeFlToMesh(planeMesh, planeFl, markupPos) {
        markupPos.pointToGibbsVec(planeMesh.position)
        let e3OnPos = e3.projectOn(markupPos, fl0)
        planeFl.selectGrade(1, planePart)
        planePart.mulReverse(e3OnPos, dq0).sqrtSelf().toQuaternion(planeMesh.quaternion)
    }
    
    class FlViz extends THREE.Group {

        constructor(omitFromSnappables = false) {
            
            super()
            scene.add(this)

            this.boundingBox = new THREE.Box3()
            this.boxHelper = new THREE.BoxHelper()

            this.hasExtraPlanes = false

            if (!omitFromSnappables)
                giveSnappableProperties(this)

            this.fl = new Fl()
            this.mv = this.fl
            this.fl.zero()
            this.markupPos = new Fl().point(0.,1.2,0.,1.)

            this.arrow

            this.plane = new THREE.Group()
            this.plane.visible = false
            scene.add(this.plane)
            this.plane.add(
                new THREE.Mesh(planeGeo, planeMatFront), 
                new THREE.Mesh(planeGeo, planeMatBack))

            this.point = new THREE.Mesh(pointGeo, pointMat)
            this.point.visible = false
            scene.add(this.point)

            this.idealPoints = Array(new THREE.Mesh(pointGeo, pointMat), new THREE.Mesh(pointGeo, pointMat))
            this.idealPoints.forEach((pt,i) => {
                pt.visible = false
                scene.add(pt)
                pt.scale.setScalar(37.5)
            })

            //arrow too maybe

            obj3dsWithOnBeforeRenders.push(this)
            this.onBeforeRender = () => {

                this.boundingBox.makeEmpty()

                this.point.visible = false
                this.plane.visible = false
                this.idealPoints.forEach(pt => pt.visible = false)
                
                let hasPlane = /*Math.abs(this.fl[0]) > eps || */Math.abs(this.fl[1]) > eps || Math.abs(this.fl[2]) > eps || Math.abs(this.fl[3]) > eps
                let hasPoint = this.fl.includesGrade(3)

                if( hasPoint) {
                    let isIdeal = this.fl[7] === 0.
                    if (!isIdeal) {
                        this.point.visible = true
                        this.fl.pointToGibbsVec(this.point.position)
                        let camDistSq = this.point.position.distanceToSquared(camera.position)
                        this.point.scale.setScalar(Math.sqrt(Math.sqrt(camDistSq)) )
                    }
                    else {
                        this.fl.fakeThingAtInfinity(fl0)
                        fl0.pointToGibbsVec(this.idealPoints[0].position)
                        this.idealPoints[1].position.copy(this.idealPoints[0].position)
                        this.idealPoints[0].visible = true
                        this.idealPoints[1].visible = true
                    }

                    //no, don't do this, because point could be very far away
                    // this.markupPos.pointFromGibbsVec(this.point.position)

                    boundingBox.copy(pointGeo.boundingBox)
                    this.point.updateMatrixWorld()
                    boundingBox.applyMatrix4(this.point.matrixWorld)
                    this.boundingBox.union(boundingBox)
                }

                if (hasPlane ) {
                    this.plane.visible = true
                    
                    planeFlToMesh(this.plane, this.fl, this.markupPos)

                    //TODO studs, rounded back, sharp front
                    //randomly distributed, maybe moving super slowly

                    boundingBox.copy(planeGeo.boundingBox)
                    this.plane.updateMatrixWorld()
                    boundingBox.applyMatrix4(this.plane.matrixWorld)
                    this.boundingBox.union(boundingBox)
                }

                if (hasPlane && hasPoint) {
                    //dotted line
                    //arrow.
                    //arrows gaugeable
                    //also the 3-reflection I guess, 3 planes
                }

                updateBoxHelper(this.boxHelper, this.boundingBox)
            }
        }

        dispose() {

            disposeMostOfSnappable(this)
        }
    }
    window.FlViz = FlViz

    debugFls = [
        new FlViz(true), new FlViz(true),
        new FlViz(true), new FlViz(true)
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