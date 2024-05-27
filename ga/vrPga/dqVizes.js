/*
    TODO:
        A null bivector, hey man, that's still valid - it's a translation to infinity
        So, Just the beginning of the arrow, going off into the sky

    Possibly 180s should have no arrow at all

    Possibly should have points at infinity where the axes meet the sky

    The box should be at the center of the circle that all three points fall on
        Unless two of the floor points are within a certain distance of each other
            Then you get the circle
        To get a CGA point at a certain position, take the origin point and translate it by the translation

    Might be better if you only see the start and end of the arrow
    Or maybe you should get them moving a bit more to go to nicer-to-look-at positions

    Call the plane containing a translation axis and the camera point the "nice-plane"
        For any pair of non-parallel translations
            you can always compose both the arrows while keeping them in their nice-plane

    The idea is you're going to REMEMBER how the things got made
        If you're looking at the wires for a thing, could press a button to see how those things got made

    Where to START the arrow
        Ideally no "if" statement about rotation and translation
        The arrow should be cut in half by the axis maybe
            That puts it in a plane
            Quite a striking, maybe useful image: the arrow cut by the axis
            Could say that the arrow always appears to be a certain size from your point-of-view
                Change its tube radius and move it toward/away from the thing to enforce this
                Relatively easy to implement:
                    somewhere between camera pos and camera pos projected on line
                    For the translation lines just use the fake line at infinity
        The further away the axis, the more distant from it is the arrow
        SOMETIMES you may WELL want to put them end-to-end. So it may be an "art"
        Could all originate at your hand

    Could have things vibrate depending on their norm, because they "want to move"?
*/


function initDqVizes(transparentOpacity) {

    initScalars()

    let dqCol = 0x00FFFF
    let colFactor = 0.
    let colFactorIncrease = 1./sq(Math.sqrt(5.) / 2. + .5)
    let rotAxisRadius = .0025
    let trnAxisRadius = .06
    let rotAxisGeo = new THREE.CylinderGeometry(rotAxisRadius, rotAxisRadius, 1., 5, 1, false)
    let trnAxisGeo = new THREE.CylinderGeometry(trnAxisRadius, trnAxisRadius, camera.far * 10., 5, 1, true)
    let rotationPart = new Dq()
    let translationPart = new Dq()
    let bivPart = new Dq()
    let pointHalfWayAlongArrow = new Fl()
    class DqViz extends THREE.Group {
        
        constructor(color, omitFromSnappables = false, backgroundSnappable = false) {

            super()
            vizes.push(this)
            // log(vizes.length-1, getWhereThisWasCalledFrom())
            this.dontUpdateMarkupPos = true
            this.backgroundSnappable = backgroundSnappable
            scene.add(this)

            this.sclptable = null

            this.snapRating = -1
            
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
        
            this.dq = new Dq().zero() //better to say mv really, disambiguate from dqMeshes
            this.mv = this.dq

            if(!color) {
                color = new THREE.Color()
                let i = (colFactor * 3.) % 3
                color.lerpColors(discreteViridis[Math.floor(i)].color, discreteViridis[Math.ceil(i)].color, i % 1.)
                // log(color)
                colFactor += colFactorIncrease
            }
            let axisMat = new THREE.MeshPhongMaterial({
                color,
                transparent: true
            })
            this.rotAxisMesh = new THREE.Mesh(rotAxisGeo, axisMat)
            this.rotAxisMesh.visible = false
            this.add(this.rotAxisMesh)

            this.trnAxisMesh = new THREE.Mesh(trnAxisGeo, axisMat)
            this.trnAxisMesh.visible = false
            this.add(this.trnAxisMesh)

            this.scalar = new ScalarViz(color)
            this.add(this.scalar)
            this.scalar.visible = false

            this.arrow = new Arrow(color, axisMat)
            this.arrow.visible = false
            // this.arrow.castShadow = true //would be nice but it doesn't use the vertex shader
            this.markupPos = new Fl().copy(e123)
            this.markupPosAttractor = new Fl().copy(e123)
            this.add(this.arrow)

            this.arrowBar = new THREE.Mesh(new THREE.CylinderGeometry(),axisMat)

            obj3dsWithOnBeforeRenders.push(this)
            this.onBeforeRender = () => {

                if (spectatorMode)
                    this.visible = false
                if (!this.visible)
                    return
                
                this.boundingBox.makeEmpty()

                this.dq.selectGrade(2, bivPart)
                
                if (bivPart.isZero()) {
                    this.rotAxisMesh.visible = this.trnAxisMesh.visible = this.arrow.visible = this.scalar.visible = false
                    
                    if(this.dq[0] !== 0.)
                        this.scalar.visible = false//true
                    
                    return
                }
                this.scalar.visible = false

                this.arrow.visible = true

                this.dq.invariantDecomposition(rotationPart, translationPart)

                this.arrow.update(
                    this.dq,
                    rotationPart,
                    translationPart,
                    bivPart,
                    this.markupPos,
                    
                    this.boundingBox,
                    pointHalfWayAlongArrow)
                
                //axes
                {
                    if (rotationPart.approxEquals(oneDq))
                        this.rotAxisMesh.visible = false
                    else {
                        this.rotAxisMesh.visible = true

                        let rotationAxis = rotationPart.selectGrade(2, dq1)
                        e31.dqTo( rotationAxis.projectOn(e123, dq0), this.rotAxisMesh.dq ).toQuaternion(this.rotAxisMesh.quaternion)
                        pointHalfWayAlongArrow.projectOn(rotationAxis, fl1).pointToGibbsVec(this.rotAxisMesh.position)
                        //funny: pointHalfWayAlongArrow is point pair at infinity for negaDqs
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

                updateBoxHelper(this.boxHelper, this.boundingBox)
            }
        }

        setOpacity(opacity) {
            this.rotAxisMesh.material.opacity = opacity
            this.arrow.material.opacity = opacity
        }

        dispose() {

            disposeMostOfSnappable(this)

            this.arrow.material.dispose()
            this.rotAxisMesh.material.dispose()
            this.boxHelper.dispose()
            
            this.scalarSign.dispose()
        }

        setColor(newColor) {
            if (newColor === undefined)
                newColor = dqCol

            this.arrow.material.color.setHex(newColor)
            this.rotAxisMesh.material.color.setHex(newColor)
            this.trnAxisMesh.material.color.setHex(newColor)
        }

        //it's a vec3 going in there
        getArrowTip(target) {
            this.dq.sandwichFl(this.markupPos, target)
            return target
        }

        getArrowCenter(target) {
            return this.dq.sqrt(dq0).sandwichFl(this.markupPos, target)
        }

        //just to make it so they don't z-fight
        setAxisRadius(factor) {
            this.rotAxisMesh.scale.x = factor
            this.trnAxisMesh.scale.x = factor
        }
    }
    window.DqViz = DqViz

    debugDqVizes = [
        new DqViz(0xFFFF00, true, true), new DqViz(0xFFFF00, true, true)
    ]
    debugDqVizes.forEach(ddqv => {
        ddqv.setAxisRadius(.95)
        ddqv.dq.zero()
        ddqv.markupPos.pointFromGibbsVec(outOfSightVec3)
    })
}