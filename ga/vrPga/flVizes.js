/*
    Could have two planes: one where the point is and one between hands
    Or just a long capsule shape
    Could have another plane, rectangular
        One of its sides is on the line between your two hands
        It extends to the center of the disk


    For transflection: When holding, have all 3
        It's so unlikely you actually want a transflection that we can get rid of all 3 mirrors
        So markupPos is the place where TWO of the plane positions are

    dotted line axis maybe
    TODO studs, rounded back, sharp front
    randomly distributed, maybe moving super slowly?
 */


function initFlVizes(transparentOpacity) {

    let planePart = new Fl()
    let pointPart = new Fl()

    let diskMatFront = new THREE.MeshPhongMaterial({ 
        side: THREE.FrontSide,
        color: 0x00FFFF,
        transparent: true,
        opacity: .4 })
    let diskMatBack = new THREE.MeshPhongMaterial({
        side: THREE.BackSide,
        color: 0x00FF00,
        transparent: true,
        opacity: .4
    })
    let diskGeo = new THREE.CircleGeometry(.15, 32)
    diskGeo.computeBoundingBox()
    let pointRadius = .004
    let pointGeo = new THREE.SphereGeometry(pointRadius)
    pointGeo.computeBoundingBox()

    let planePos = new Fl()
    let e3OnPos = new Fl()
    function planeMeshQuat(planeMesh, plane) {
        planePos.pointFromGibbsVec(planeMesh.position)
        e3.projectOn(planePos, e3OnPos)
        plane.mulReverse(e3OnPos, dq0).sqrtSelf().toQuaternion(planeMesh.quaternion)
    }

    // let extraPlanes = [
    //     new THREE.Group().add(
    //         new THREE.Mesh(diskGeo, diskMatFront),
    //         new THREE.Mesh(diskGeo, diskMatBack)),
    //     new THREE.Group().add(
    //         new THREE.Mesh(diskGeo, diskMatFront),
    //         new THREE.Mesh(diskGeo, diskMatBack)),
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

    class FlViz extends THREE.Group {

        constructor(color, omitFromSnappables = false, transparent = false) {
            
            super()
            vizes.push(this)
            this.dontUpdateMarkupPos = true
            scene.add(this)

            this.snapRating = -1

            this.lockedGrade = -1

            let pointMat = new THREE.MeshPhongMaterial({
                color: (color || 0xFF0000),
                transparent,
                opacity: transparent ? transparentOpacity : 1.
            })

            this.boundingBox = new THREE.Box3()
            this.boxHelper = new THREE.BoxHelper()
            this.add(this.boxHelper)
            this.boxHelper.visible = false
            this.boxHelper.matrixAutoUpdate = false

            if (!omitFromSnappables)
                makeSnappable(this)
            this.affecters = [
                null, null, -1
            ]

            this.fl = new Fl()
            this.mv = this.fl
            this.fl.zero()
            this.markupPos = new Fl().point(0.,1.2,0.,1.)

            this.arrow1 = new Arrow( pointMat.color, false, pointMat, true )
            this.arrow1.visible = false
            this.add(this.arrow1)
            this.arrow2 = new Arrow( pointMat.color, false, pointMat, false )
            this.arrow2.visible = false
            this.add(this.arrow2)

            //arrowbar crossing through mirror was the next thing we were gonna do
            //don't be tempted to try to hack the extraShaft into being this. Extrashaft SHOULD be arrow1.
            //so you need TWO little balls for the thing anyway
            this.arrowBar = new THREE.Mesh(this.arrow1.extraShaft.geometry, pointMat )
            this.arrowBar.visible = false
            this.add(this.arrowBar)
            this.arrowBarCup = this.arrow1.cup.clone()
            this.arrowBarCup.visible = false
            this.add(this.arrowBarCup)

            this.diskGroup = new THREE.Group()
            this.diskGroup.scale.setScalar(0.)
            this.add(this.diskGroup)
            this.diskGroup.add(
                new THREE.Mesh(diskGeo, diskMatFront), 
                new THREE.Mesh(diskGeo, diskMatBack))

            this.pointMesh = new THREE.Mesh(pointGeo, pointMat)
            this.pointMesh.visible = false
            this.add(this.pointMesh)

            this.idealPointMeshes = Array(new THREE.Mesh(pointGeo, pointMat), new THREE.Mesh(pointGeo, pointMat))
            this.idealPointMeshes.forEach((pt,i) => {
                pt.visible = false
                this.add(pt)
                pt.scale.setScalar( 50. )
            })

            obj3dsWithOnBeforeRenders.push(this)
            this.onBeforeRender = () => {

                if (spectatorMode)
                    this.visible = false
                if (!this.visible)
                    return

                this.pointMesh.visible = false
                this.arrowBar.visible = false
                this.arrowBarCup.visible = false
                this.idealPointMeshes.forEach(pt => pt.visible = false)
                this.boundingBox.makeEmpty()

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
                        box0.expandByScalar(pointRadius * 3.5)
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
                    this.arrowBar.visible = true
                    this.arrowBarCup.visible = true

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

                    //it's not going all the way because of the arrowhead, silly

                    let arrow1End = halfWay.sandwich( this.markupPos, fl0 )
                    arrow1End.joinPt(arrow2Start,dq1)
                    arrow1End.pointToGibbsVec(this.arrowBarCup.position)

                    arrow2Start.pointToGibbsVec(this.arrowBar.position)
                    e13.projectOn(arrow2Start, dq0)
                    dq1.mulReverse( dq0, dq2 ).sqrtSelf().toQuaternion(this.arrowBar.quaternion)
                    this.arrowBar.scale.y = arrow1End.distanceToPt(arrow2Start)
                }
                
                //plane
                {
                    let scaleSpeed = 3.5
                    let newScale = clamp(this.diskGroup.scale.x + (hasPlane ? 1. : -1.) * scaleSpeed * frameDelta,0.,1.)
                    this.diskGroup.scale.setScalar(newScale)

                    this.getSettledDiskPosition(this.markupPos,planePosition)
                    this.diskGroup.position.lerp(planePosition.pointToGibbsVec(v1), .13)
                    if(hasPlane)
                        planeMeshQuat(this.diskGroup, planePart, planePosition)
                    
                    box0.copy(diskGeo.boundingBox)
                    this.diskGroup.updateMatrixWorld()
                    box0.applyMatrix4(this.diskGroup.matrixWorld)
                    this.boundingBox.union(box0)
                }

                updateBoxHelper(this.boxHelper, this.boundingBox)
            }
        }

        getSettledDiskPosition(pointToProject,target) {

            this.fl.selectGrade(1, planePart)
            this.fl.selectGrade(3, pointPart)
            let hasPoint = pointPart.isZero() === false
            let pointIsIdeal = this.fl[7] === 0.

            if (!hasPoint)
                pointToProject.projectOn(planePart, target).normalizePoint()
            else if (!pointIsIdeal)
                target.copy(pointPart)
            else {
                this.fl.sandwich(pointToProject, fl0)
                pointToProject.addScaled(fl0, pointToProject[7] / fl0[7], target)
            }

            return target
        }

        settleDiskPosition(pointToProject) {
            this.getSettledDiskPosition(pointToProject,planePosition)
            planePosition.pointToGibbsVec(this.diskGroup.position)
        }

        setTransparency(opacity) {
            //plane is already transparent soooo
            this.pointMesh.material.opacity = opacity
            this.arrow1.material.opacity = opacity
            this.arrow2.material.opacity = opacity
        }

        dispose() {
            disposeMostOfSnappable(this)
        }
    }
    window.FlViz = FlViz

    debugFls = [
        new FlViz(0xFFFF00, true, false), new FlViz(0xFFFF00, true, false),
        new FlViz(0xFFFF00, true, false), new FlViz(0xFFFF00, true, false)
    ]
    debugFls.forEach(dfl => {
        dfl.fl.zero()
        dfl.markupPos.pointFromGibbsVec(outOfSightVec3)
    })

    // blankFunction = () => {
    //     myFlViz.fl[7] = sq(Math.cos(frameCount * .02))
    //     myFlViz.fl[4] = -sq(Math.sin(frameCount * .02))
    // }
}