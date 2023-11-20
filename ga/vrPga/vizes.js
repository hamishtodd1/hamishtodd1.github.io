/*
    Call the plane contianing a translation axis and the camera point the "nice-plane"
        For any pair of non-parallel translations
            you can always compose both the arrows while keeping them in their nice-plane

    Hey, even your rotoreflections and transflections need arrows
    They are also gaugeable

    The idea is you're going to REMEMBER how the things got made
        If you're looking at the wires for a thing, could press a button to see how those things got made

    The only "subjective" part is where to START the arrow
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

    Happy faces on vizes
    Could have things vibrate depending on their norm, because they "want to move"?
*/

function initVizes() {

    opIsSingleArgument = (opIndex) => {
        let op = operators[opIndex]
        return dq0[op].length === 1
    }

    function operate(affecters, target) {

        let op = operators[affecters[2]]
        let affecter0 = affecters[0]
        let affecter1 = affecters[1]

        // debugger
        if (affecter0.dq[op].length === 1)
            affecter0.dq[op](target)
        else
            affecter0.dq[op](affecter1.dq, target)

        target.normalize()
    }

    let dqCol = 0x00FFFF
    /*
        Each vertex has two floats, its u (distance around) and v (distance along)
        You're sending in:
            a point at the center of the base of the arrow
            an AROUND axis tangent to the spine at that point
            an AWAY axis taking that point away from the spine
                Could be trans. But if rotor is a scale it could be rotation!
                Will definitely have an axis that lies on the around axis but not necessarily on the spine
            So
        Apply the rotor by the amount v to get different pt, around axis, away axis

        The thing has a spine, which is at its most complex a spiral-screw
        Along the spine are cross sections where the vertices are
        Though note a cross section's surface is in general spherical
        So the vertices need to be rotated out

        Translation, rotation, scale
     */
    let dqArrowMatInjections = [
        {
            type: `vertex`,
            precedes: ``,
            str: egaVerboseGlsl + egaGlsl + `
                float TAU = 6.283185307179586;
                uniform float[8] dq;
                uniform vec3 extraVec1;
                uniform vec3 extraVec2;
            \n`
        },
        {
            type: `vertex`,
            precedes: `	#include <project_vertex>`,
            str: `

                float[8] oneDq; oneDq[0] = 1.;

                vec4 start = vec4(extraVec1,1.);

                float alongness = position.y;
                float outness = alongness == 1. ? 0. : 1.;

                float[8] alongLog; dqLog( dq, alongLog );
                multiplyScalar( alongLog, alongness, alongLog );
                float[8] along; dqExp( alongLog, along );
                
                float[8] outLog; zeroOut(outLog);
                outLog[1] = outness * extraVec2.x; outLog[2] = outness * extraVec2.y; outLog[3] = outness * extraVec2.z;
                float[8] outDq; dqExp( outLog, outDq );

                float[8] aroundAxisUnnormalized; joinPt(start, sandwichDqPoint(dq, start), aroundAxisUnnormalized);
                float[8] aroundAxis; dqNormalize(aroundAxisUnnormalized, aroundAxis);
                float angleAround = alongness == 1. ? 0. : atan(transformed.z,transformed.x);
                float[8] around; fromUnitAxisAndSeparation( aroundAxis, angleAround, around );

                vec4 outed = sandwichDqPoint( outDq, start );
                vec4 arounded = sandwichDqPoint( around, outed );
                vec4 alonged = sandwichDqPoint( along, arounded ); //purposefully last
                transformed = alonged.xyz / alonged.w;
                
                // transformed.xyz += ;

                vNormal = alongness == 1. ? vec3(0.,1.,0.) : (arounded - start).xyz;
            `,
            //` transformed.y += 0.; vNormal.x += 0.;\n`
        },
    ]
    let arrowRadius = .04
    let dqArrowGeo = new THREE.ConeGeometry(arrowRadius, 1., 16, 3, false)
    dqArrowGeo.translate(0., .5, 0.)
    let cylRadius = .02
    let rotAxisGeo = new THREE.CylinderGeometry(cylRadius,       cylRadius,       camera.far * 10., 5, 1, true)
    let trnAxisGeo = new THREE.CylinderGeometry(cylRadius * 15., cylRadius * 15., camera.far * 10., 5, 1, true)
    let rotationPart = new Dq()
    let translationPart = new Dq()
    let randomPt = new Fl().point(0.2448657087518873, 0.07640275431752674, 0.360207610338215, 1.)
    class DqViz extends THREE.Group {
        constructor(col = dqCol) {
            super()
            scene.add(this)
            this.dq = new Dq()

            let axisMat = new THREE.MeshPhongMaterial({ color: dqCol })
            this.rotAxisMesh = new DqMesh(rotAxisGeo, axisMat)
            this.add(this.rotAxisMesh)

            this.trnAxisMesh = new DqMesh(trnAxisGeo, axisMat)
            this.add(this.trnAxisMesh)

            this.boxHelper = new THREE.BoxHelper()
            this.boundingBox = new THREE.Box3()
            // this.boxHelper.visible = false
            this.boxHelper.matrixAutoUpdate = false
            scene.add(this.boxHelper)

            this.affecters = [
                null, null, -1
            ]

            let arrowMat = new THREE.MeshPhong2Material({ side: THREE.DoubleSide, color: col })
            arrowMat.injections = dqArrowMatInjections
            arrowMat.dq = this.dq

            this.arrow = new THREE.Mesh(dqArrowGeo, arrowMat)
            // this.arrow.castShadow = true //would be nice but it doesn't use the vertex shader
            this.arrowStart = new Fl().copy(e123)
            this.arrow.matrixAutoUpdate = false
            this.add(this.arrow)

            obj3dsWithOnBeforeRenders.push(this)
            this.onBeforeRender = () => {

                // visibility is *controlled* at the group level
                // ASSUMING you're group-level visible

                this.updateFromAffecters()

                if(this.dq.equals(oneDq) || this.dq.isZero()) {
                    this.rotAxisMesh.visible = false; this.trnAxisMesh.visible = false; this.arrow.visible = false
                    return
                }
                
                this.rotAxisMesh.visible = true; this.trnAxisMesh.visible = true; this.arrow.visible = true
                
                this.arrowStart.pointToVertex(this.arrow.material.extraVec1)
                {
                    this.dq.pow(0.01, dq0)
                    let movedAlongSlightly = dq0.sandwichFl(this.arrowStart, fl0) //alternatively, commutator with log

                    let randomPlaneContainingSpineAxisAtStart = this.arrowStart.joinPt(movedAlongSlightly, dq0).joinPt(randomPt, fl1)
                    let outDqAtStartLog = randomPlaneContainingSpineAxisAtStart.meet(e0, dq0).normalize()
                    this.arrow.material.extraVec2.set(
                        outDqAtStartLog[1],
                        outDqAtStartLog[2],
                        outDqAtStartLog[3]).multiplyScalar(arrowRadius)
                    // log(this.arrow.material.extraVec2)
                }
                //this gets the displacement from the start

                this.dq.invariantDecomposition( rotationPart, translationPart )
                {
                    if (rotationPart.approxEquals(oneDq))
                        this.rotAxisMesh.visible = false
                    else {
                        this.rotAxisMesh.visible = true

                        rotationPart[0] = 0.
                        e31.dqTo(rotationPart, this.rotAxisMesh.dq)
                    }

                    if (translationPart.approxEquals(oneDq))
                        this.trnAxisMesh.visible = false
                    else {
                        this.trnAxisMesh.visible = true

                        translationPart[0] = 0.
                        translationPart.joinPt(camera.mvs.pos, fl0)
                        let fakeLineAtInfinity = fl0.meet(camera.frustum.far, dq0)
                        e31.dqTo(fakeLineAtInfinity, this.trnAxisMesh.dq)
                    }
                }

                {
                    this.boundingBox.makeEmpty()
                    let numSamples = 4
                    for (let i = 0; i < numSamples; ++i) {
                        this.dq.pow(i / (numSamples-1), dq0)
                        dq0.sandwichFl(this.arrowStart, fl0).pointToVertex(v1)
                        this.boundingBox.expandByPoint(v1)
                    }
                    this.boundingBox.min.subScalar(arrowRadius*2.)
                    this.boundingBox.max.addScalar(arrowRadius*2.)
                    updateBoxHelper(this.boxHelper,this.boundingBox)
                }
            }
        }

        updateFromAffecters() {
            if (this.affecters[0] !== null) {
                operate(this.affecters, this.dq)
                this.dq.normalize()
            }
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
            this.dq.sandwichFl(this.arrowStart, target)
            return target
        }

        getArrowCenter(target) {
            return this.dq.sqrt(dq0).sandwichFl(this.arrowStart, target)
        }

        getNicePlane(target) {
            
            this.dq.invariantDecomposition(rotationPart, translationPart)

            let strippedAxis = dq1
            if (rotationPart.approxEquals(oneDq))
                translationPart.selectGrade(2, strippedAxis)
            else
                rotationPart.selectGrade(2, strippedAxis)

            strippedAxis.joinPt(camera.mvs.pos, target)
        }

    }
    window.DqViz = DqViz
}