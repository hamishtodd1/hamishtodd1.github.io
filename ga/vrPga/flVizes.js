/*
    For transflection: When holding, have all 3
        It's so unlikely you actually want a transflection that we can get rid of all 3 mirrors
        So markupPos is the place where TWO of the plane positions are

    dotted line axis maybe
    TODO studs, rounded back, sharp front
    randomly distributed, maybe moving super slowly?
 */


function initFlVizes() {

    let planePart = new Fl()
    let pointPart = new Fl()

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

    function updatePlaneMesh(planeMesh, plane, pos) {
        pos.pointToGibbsVec(planeMesh.position)
        let e3OnPos = e3.projectOn(pos, fl1)
        plane.mulReverse(e3OnPos, dq0).sqrtSelf().toQuaternion(planeMesh.quaternion)
    }

    // let extraPlanes = [
    //     new THREE.Group().add(
    //         new THREE.Mesh(planeGeo, planeMatFront),
    //         new THREE.Mesh(planeGeo, planeMatBack)),
    //     new THREE.Group().add(
    //         new THREE.Mesh(planeGeo, planeMatFront),
    //         new THREE.Mesh(planeGeo, planeMatBack)),
    // ]
    // extraPlanes.forEach(plane => {
    //     plane.visible = false
    //     scene.add(plane)
    // })

    let halfWay = new Dq()
    let halfWayRotnPart = new Dq()
    let halfWayTrnsPart = new Dq()
    let bivPart = new Dq()
    let arrow2Start = new Fl()
    let planePosition = new Fl()
    let evenPart = new Dq()
    let axisBiv = new Dq()
    
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

            this.arrow1 = new Arrow(0xFF00FF, false, pointMat, true)
            this.add(this.arrow1)
            this.arrow2 = new Arrow(0xFF00FF, false, pointMat, false)
            this.add(this.arrow2)

            //arrowbar crossing through mirror was the next thing we were gonna do
            //don't be tempted to try to hack the extraShaft into being this. Extrashaft SHOULD be arrow1.
            // this.arrowBar

            this.planeMesh = new THREE.Group()
            this.planeMesh.visible = false
            scene.add(this.planeMesh)
            this.planeMesh.add(
                new THREE.Mesh(planeGeo, planeMatFront), 
                new THREE.Mesh(planeGeo, planeMatBack))

            this.pointMesh = new THREE.Mesh(pointGeo, pointMat)
            this.pointMesh.visible = false
            scene.add(this.pointMesh)

            this.idealPointMeshes = Array(new THREE.Mesh(pointGeo, pointMat), new THREE.Mesh(pointGeo, pointMat))
            this.idealPointMeshes.forEach((pt,i) => {
                pt.visible = false
                scene.add(pt)
                pt.scale.setScalar( 50. )
            })

            obj3dsWithOnBeforeRenders.push(this)
            this.onBeforeRender = () => {

                this.boundingBox.makeEmpty()
                this.pointMesh.visible = false
                this.planeMesh.visible = false
                this.idealPointMeshes.forEach(pt => pt.visible = false)

                if(this.fl.isZero())
                    return

                this.fl.selectGrade(1, planePart)
                this.fl.selectGrade(3, pointPart)
                
                let hasPlane = /*Math.abs(planePart[0]) > eps || */Math.abs(planePart[1]) > eps || Math.abs(planePart[2]) > eps || Math.abs(planePart[3]) > eps
                let hasPoint = pointPart.isZero() === false
                let pointIsIdeal = this.fl[7] === 0.

                if( hasPoint) {
                    if (!pointIsIdeal) {
                        this.pointMesh.visible = true
                        this.fl.pointToGibbsVec(this.pointMesh.position)
                        let camDistSq = this.pointMesh.position.distanceToSquared(camera.position)
                        this.pointMesh.scale.setScalar(Math.sqrt(Math.sqrt(camDistSq)) )

                        box0.copy(pointGeo.boundingBox)
                        this.pointMesh.updateMatrixWorld()
                        box0.applyMatrix4(this.pointMesh.matrixWorld)
                        this.boundingBox.union(box0)
                    }
                    else {
                        pointPart.fakeThingAtInfinity(fl0)
                        fl0.pointToGibbsVec(this.idealPointMeshes[0].position)
                        this.idealPointMeshes[1].position.copy(this.idealPointMeshes[0].position)

                        for(let i = 0; i < 2; ++i) {
                            this.idealPointMeshes[i].visible = true
    
                            // box0.copy(pointGeo.boundingBox)
                            // this.idealPointMeshes[i].updateMatrixWorld()
                            // box0.applyMatrix4(this.idealPointMeshes[i].matrixWorld)
                            // this.boundingBox.union(box0)
                        }
                    }
                }

                if (!hasPlane || !hasPoint) {
                    this.arrow1.visible = false
                    this.arrow2.visible = false
                }
                else {
                    this.arrow1.visible = true
                    this.arrow2.visible = true

                    this.fl.mul(planePart, evenPart) //guaranteed positive scalar => guaranteed < 180deg rotation
                    evenPart.sqrt(halfWay)
                    halfWay.invariantDecomposition( halfWayRotnPart, halfWayTrnsPart )
                    halfWay.selectGrade( 2, bivPart )

                    halfWay.mul(planePart, fl0).sandwich(this.markupPos,arrow2Start)
                    // planePart.sandwich(this.markupPos, arrow2Start)

                    // debugger
                    this.arrow1.update(
                        halfWay,
                        halfWayRotnPart,
                        halfWayTrnsPart,
                        bivPart,
                        this.markupPos,

                        this.boundingBox )
                    this.arrow2.update(
                        halfWay,
                        halfWayRotnPart,
                        halfWayTrnsPart,
                        bivPart,
                        arrow2Start,

                        this.boundingBox)

                    // evenPart.selectGrade(2, axisBiv)
                    // let plane1 = axisBiv.joinPt( this.markupPos, fl0 )
                    // updatePlaneMesh( extraPlanes[0], plane1, this.markupPos )
                    // let plane2 = axisBiv.joinPt( arrow2Start, fl0 )
                    // updatePlaneMesh( extraPlanes[1], plane2, arrow2Start )
                }

                if (hasPlane) {
                    this.planeMesh.visible = true

                    if(!hasPoint)
                        this.markupPos.projectOn(planePart, planePosition).normalizePoint()
                    else if(!pointIsIdeal)
                        planePosition.copy( pointPart )
                    else {
                        this.fl.sandwich( this.markupPos, fl0 )
                        this.markupPos.addScaled(fl0, this.markupPos[7] / fl0[7], planePosition)
                    }

                    planePosition.pointToGibbsVec(this.planeMesh.position) 
                    let e3OnPos = e3.projectOn(planePosition, fl1)
                    planePart.mulReverse(e3OnPos, dq0).sqrtSelf().toQuaternion(this.planeMesh.quaternion)

                    updatePlaneMesh(this.planeMesh, planePart, planePosition)
                    
                    box0.copy(planeGeo.boundingBox)
                    this.planeMesh.updateMatrixWorld()
                    box0.applyMatrix4(this.planeMesh.matrixWorld)
                    this.boundingBox.union(box0)
                }

                updateBoxHelper(this.boxHelper, this.boundingBox)
            }
        }

        regularizeMarkupPos() {

            // debugger

            this.fl.selectGrade( 1, planePart )
            this.fl.selectGrade( 3, pointPart )
            let hasPlane = !planePart.isZero()
            let hasPoint = !pointPart.isZero()

            let start = null
            if(hasPoint && hasPlane)
                start = pointPart
            else if(hasPlane && !hasPoint)
                start = comfortableLookPos(fl3).projectOn(planePart, fl5).normalizePoint()

            let awayFromCamera = camera.mvs.dq.sandwich(e012, fl2).multiplyScalar(.1, fl1)
            start.add(awayFromCamera, this.markupPos)

            if(hasPlane) {
                let awayFromPlane = planePart.mul(e0123, fl0).multiplyScalar(.1, fl1)
                this.markupPos.add(awayFromPlane, this.markupPos)
            }

            this.markupPos.normalizePoint()
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