/*
    It's probably quite fun just to look at dq arrow compositions
    Like the vector picture but a bit more fun because you can curve

    The box should be at the center of the circle that all three points fall on
        Unless two of the floor points are within a certain distance of each other
            Then you get the circle
        To get a CGA point at a certain position, take the origin point and translate it by the translation

    Call the plane contianing a translation axis and the camera point the "nice-plane"
        For any pair of non-parallel translations
            you can always compose both the arrows while keeping them in their nice-plane

    Hey, even your rotoreflections and transflections need arrows
    They are also gaugeable

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
     */
    let dqArrowMatInjections = [
        {
            type: `vertex`,
            precedes: ``,
            str: egaVerboseGlsl + egaGlsl + `
                float TAU = 6.283185307179586;
                uniform float[8] dq;
                uniform vec3 extraVec1; //start
                uniform vec3 extraVec2; //"out vector" at base
                uniform vec3 extraVec3; //x and y do separate things
            \n`
        },
        {
            type: `vertex`,
            precedes: `	#include <project_vertex>`,
            str: `

                float[8] oneDq; oneDq[0] = 1.;

                vec4 start = vec4(extraVec1,1.);

                bool isShaft = position.y <= 1.;
                bool isTip = position.y >= 2.;
                float headStart = extraVec3.y; //it's a proportion
                float alongness = isShaft ? headStart * position.y : headStart + (1.-headStart) * (position.y - 1.);
                alongness = alongness < 0. ? 0. : alongness;
                float headOutnessAtArrowBase = extraVec3.x;
                float outness = isShaft ? 1. : isTip ? 0. : headOutnessAtArrowBase * (1.-alongness);
                bool noShaft = headStart < 0.;
                if(noShaft && isShaft)
                    outness = 0.;

                //get the correct alongness and the slight alongness
                float[8] myDqLog; dqLog( dq, myDqLog );
                float[8] alongLog; multiplyScalar( myDqLog, alongness, alongLog );
                float[8] along; dqExp( alongLog, along );

                // vec4 startAlonged = sandwichDqPoint(dq, start);
                vec4 startDerivative = commutator(start, myDqLog);
                float[8] aroundLogUnnormalized; joinPt(start, startDerivative, aroundLogUnnormalized);
                float[8] aroundLog; dqNormalize(aroundLogUnnormalized, aroundLog);
                float angleAround = isTip ? 0. : .5 * atan(transformed.z,transformed.x);
                float[8] around; fromUnitAxisAndSeparation( aroundLog, angleAround, around );

                vec4 outed = vec4(extraVec1 + outness*extraVec2,1.);
                vec4 arounded = sandwichDqPoint( around, outed );
                vec4 alonged = sandwichDqPoint( along, arounded ); //purposefully last
                transformed = alonged.xyz / alonged.w;
                
                // transformed.xyz += ;

                vNormal = 
                    isTip ? vec3(0.,0.,0.) : 
                    (arounded - start).xyz;
            `,
            //` transformed.y += 0.; vNormal.x += 0.;\n`
        },
    ]
    let arrowRadius = .04
    
    {
        let radialSegments = 14
        var cupGeo = new THREE.SphereGeometry(arrowRadius, radialSegments)
        let headSegments = 8
        let shaftSegments = 37
        let heightSegments = headSegments + shaftSegments + 1
        var dqArrowGeo = new THREE.ConeGeometry(
            1., //irrelevant
            heightSegments, //we are about to modify y's
            radialSegments, heightSegments, true) //first half is shaft, second is head
        let attr = dqArrowGeo.attributes.position
        for (let i = 0; i < attr.count; ++i) {

            let y = attr.array[i * 3 + 1] + heightSegments / 2.
            if(y <= shaftSegments)
                y = y / shaftSegments
            else
                y = 1.001 + (y-shaftSegments-1)/headSegments
            attr.array[i * 3 + 1] = y
        }
        log(attr.array.length)
        var extraShaftGeo = new THREE.CylinderGeometry(arrowRadius, arrowRadius, 2000., radialSegments, 1, true)
        extraShaftGeo.translate(0.,1000.,0.)
    }
    
    let rotAxisRadius = .02
    let trnAxisRadius = .32 //there's something weird about it disappearing
    let rotAxisGeo = new THREE.CylinderGeometry(rotAxisRadius, rotAxisRadius, camera.far * 10., 5, 1, true)
    let trnAxisGeo = new THREE.CylinderGeometry(trnAxisRadius, trnAxisRadius, camera.far * 10., 5, 1, true)
    let rotationPart = new Dq()
    let translationPart = new Dq()
    let randomPt = new Fl().point(0.2448657087518873, 0.07640275431752674, 0.360207610338215, 1.)
    let bivPart = new Dq()
    let nonNetherDq = new Dq()
    let nonNetherArrowStart = new Fl()
    class DqViz extends THREE.Group {
        
        constructor(col = dqCol, transparent = false) {

            super()
            scene.add(this)
            this.dq = new Dq() //better to say mv really, disambiguate from dqMeshes

            let axisMat = new THREE.MeshPhongMaterial({
                color: col,
                transparent: transparent,
                opacity: transparent ? .4 : 1.
            })
            this.rotAxisMesh = new DqMesh(rotAxisGeo, axisMat)
            this.add(this.rotAxisMesh)

            this.circuitVisible = false

            this.sclptable = null

            this.trnAxisMesh = new DqMesh(trnAxisGeo, axisMat)
            this.add(this.trnAxisMesh)

            this.boxHelper = new THREE.BoxHelper()
            this.boundingBox = new THREE.Box3()
            this.boxHelper.visible = false
            this.boxHelper.matrixAutoUpdate = false
            this.add(this.boxHelper)

            this.extraShaft = new THREE.Mesh(extraShaftGeo, axisMat)
            this.extraShaft.visible = false
            this.add(this.extraShaft)

            this.cup = new THREE.Mesh(cupGeo, axisMat)
            this.cup.visible = false
            this.add(this.cup)

            this.scalarSign = changeableText()
            this.scalarSign.scale.multiplyScalar(.4)
            this.scalarSign.visible = false
            this.add(this.scalarSign)

            this.affecters = [
                null, null, -1
            ]

            let arrowMat = new THREE.MeshPhong2Material({
                side: THREE.DoubleSide,
                color: col,
                transparent: transparent,
                opacity: transparent ? .4 : 1.
            })
            arrowMat.injections = dqArrowMatInjections

            this.arrow = new THREE.Mesh(dqArrowGeo, arrowMat)
            // this.arrow.castShadow = true //would be nice but it doesn't use the vertex shader
            this.markupPos = new Fl().copy(e123)
            this.arrow.matrixAutoUpdate = false
            this.add(this.arrow)

            obj3dsWithOnBeforeRenders.push(this)
            this.onBeforeRender = () => {

                // if(frameCount === 400)
                //     debugger

                this.updateFromAffecters()
                if (!this.visible)
                    return

                this.dq.selectGrade(2, bivPart)
                
                if (bivPart.isZero()) {
                    this.rotAxisMesh.visible = this.trnAxisMesh.visible = this.arrow.visible = this.cup.visible = false
                    this.scalarSign.visible = true

                    if (this.dq[0] === 1.)
                        this.scalarSign.visible = false
                    else {
                        this.markupPos.pointToVertex(this.scalarSign.position)
                        this.scalarSign.lookAt(camera.position)
                        
                        this.scalarSign.setText(this.dq[0])
                        this.scalarSign.visible = true
                    }

                    return
                }

                this.rotAxisMesh.visible = this.trnAxisMesh.visible = this.arrow.visible = this.cup.visible = true
                this.scalarSign.visible = false

                nonNetherDq.copy(this.dq)  
                let isNether = nonNetherDq[0] < 0. && Math.abs(bivPart.eNormSq()) < .0001
                if (isNether)
                    nonNetherDq.multiplyScalar(-1., nonNetherDq)
                this.extraShaft.visible = false

                let arrowArcLength = 0.
                //bounding box and determination of arrow arclength
                {
                    this.boundingBox.makeEmpty()
                    let numSamples = 8
                    for (let i = 0; i < numSamples; ++i) {
                        nonNetherDq.pow(i / (numSamples - 1), dq0)
                        dq0.sandwichFl(this.markupPos, fl0).pointToVertex(v1)
                        this.boundingBox.expandByPoint(v1)
                    }
                    this.boundingBox.min.subScalar(arrowRadius)
                    this.boundingBox.max.addScalar(arrowRadius)
                    updateBoxHelper(this.boxHelper, this.boundingBox)
                }

                //cup
                {
                    this.markupPos.pointToVertex(this.cup.position)

                    let joinedPlane = bivPart.joinPt(this.markupPos, fl0)
                    joinedPlane.mulReverse(e2, dq0).sqrtSelf().toQuaternion(this.cup.quaternion)
                }
                
                //arrow
                {
                    if(!isNether) {
                        arrowMat.dq.copy(this.dq)
                        nonNetherArrowStart.copy(this.markupPos)
                    } 
                    else {
                        this.extraShaft.visible = true
                        this.markupPos.pointToVertex(this.extraShaft.position)

                        let joinedPlane = bivPart.joinPt(e123, fl0)
                        joinedPlane.mulReverse(e2, dq0).sqrtSelf().toQuaternion(this.extraShaft.quaternion)

                        //arrow should be offset to start in some faraway place
                        //and take you back to where nonNetherDq takes markupPos
                        let offseterDq = dq1;
                        offseterDq.copy(bivPart)
                        let dqDist = bivPart.getDual(dq3).eNorm() / -this.dq[0]
                        offseterDq.multiplyScalar(-100. / dqDist, offseterDq)
                        offseterDq[0] = 1.
                        
                        offseterDq.sandwichFl(this.markupPos, nonNetherArrowStart)
                        nonNetherDq.mulReverse(offseterDq, arrowMat.dq )
                    }

                    nonNetherArrowStart.pointToVertex(arrowMat.extraVec1)
                    
                    //if you're non-nether, you have an extraShaft, but that isn't "arrow" for these purposes
                    arrowArcLength = arrowMat.dq.pointTrajectoryArcLength(nonNetherArrowStart)
                    let headArcLength = .25
                    let headStart = (1. - headArcLength / arrowArcLength)
                    let headOutnessAtArrowBase = arrowArcLength * 10. //number we use to control head's radius
                    arrowMat.extraVec3.set(headOutnessAtArrowBase, headStart, 0.)
                    if(headArcLength > arrowArcLength) //really if you're at this stage, you should move markupPos
                        this.cup.scale.setScalar(1./(1.-headStart))
                    else
                        this.cup.scale.setScalar(1.)

                    let spineLineAtNominalStart = nonNetherArrowStart.momentumLine(arrowMat.dq, dq0)
                    let randomPlaneContainingLine = spineLineAtNominalStart.joinPt(randomPt, fl1)
                    let outDqAtStartLog = randomPlaneContainingLine.meet(e0, dq0).normalize()
                    arrowMat.extraVec2.set(
                        outDqAtStartLog[1],
                        outDqAtStartLog[2],
                        outDqAtStartLog[3]).multiplyScalar(arrowRadius)
                    // if(isNether)
                    //     log("outer", arrowMat.extraVec2)
                }

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
            }
        }

        dependsOn(viz) {
            let ret = false
            if (this.affecters[0] === viz ||
                this.affecters[1] === viz)
                ret = true

            if (ret === false && this.affecters[0] !== null)
                ret = this.affecters[0].dependsOn(viz)
            if (ret === false && this.affecters[1] !== null)
                ret = this.affecters[1].dependsOn(viz)

            return ret
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
            this.dq.sandwichFl(this.markupPos, target)
            return target
        }

        getArrowCenter(target) {
            return this.dq.sqrt(dq0).sandwichFl(this.markupPos, target)
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

    let scalarBgMat = new THREE.MeshBasicMaterial({ color: 0xCCCCCC })
    function changeableText() {

        let canvas = document.createElement("canvas")
        let context = canvas.getContext("2d")
        let material = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true })

        let font = "Arial"
        let padding = 43
        let textSize = 85
        canvas.height = textSize + padding
        canvas.width = 200. //more an estimate of the required resolution

        let ret = new THREE.Group()

        let currentText = ""
        ret.setText = function (text) {
            if (currentText === text)
                return

            context.font = "bold " + textSize + "px " + font
            context.textAlign = "center"
            context.textBaseline = "middle"

            context.clearRect(
                0, 0,
                canvas.width,
                canvas.height)
            context.fillStyle = "#000000"
            context.fillText(text, canvas.width / 2., canvas.height / 2. + 8) //8 is eyeballed. These are numbers

            let textWidth = context.measureText(text).width + padding
            bg.scale.x = bg.scale.y * textWidth / canvas.height

            material.map.needsUpdate = true

            currentText = text
        }

        let bg = new THREE.Mesh(unchangingUnitSquareGeometry, scalarBgMat)
        bg.position.z = -.01
        ret.add(bg)
        let sign = new THREE.Mesh(unchangingUnitSquareGeometry, material);
        sign.scale.x = canvas.width / canvas.height
        ret.add(sign)

        return ret
    }
}