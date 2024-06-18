function initArrows() {

    const arrowRadius = .006
    let nonNegaArrowStart = new Fl()
    const headArcLength = arrowRadius * 5.
    const headRadiusFactor = 2.1
    let finalHeadRadiusFactor = headRadiusFactor / headArcLength
    let spineLineAtNominalStart = new Dq()
    let nonNegaDq = new Dq()

    let infix = `
        //get the correct alongness and the slight alongness
        float[8] myDqLog; dqLog( dq, myDqLog );
        float[8] alongLog; multiplyScalar( myDqLog, alongness, alongLog );
        float[8] along; dqExp( alongLog, along );

        vec4 start = vec4(extraVec1,1.);
        // vec4 startAlonged = sandwichDqPoint(dq, start);
        vec4 startDerivative = commutator(start, myDqLog);
        float[8] aroundLogUnnormalized; joinPt(start, startDerivative, aroundLogUnnormalized);
        float[8] aroundLog; dqNormalize(aroundLogUnnormalized, aroundLog);
        float[8] around; fromUnitAxisAndSeparation( aroundLog, angleAround, around );
    `

    let arrowMatInjections = [
        `arrow`,
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

                bool isShaft = position.y <= 1.;
                bool isTip = position.y >= 2.;
                float headStart = extraVec3.y; //it's a proportion
                float alongness = isShaft ? headStart * position.y : headStart + (1.-headStart) * (position.y - 1.);
                alongness = alongness < 0. ? 0. : alongness;
                float headOutnessAtBase = extraVec3.x;
                float outness = isShaft ? 1. : isTip ? 0. : headOutnessAtBase * (1.-alongness);
                bool noShaft = headStart < 0.;
                if(noShaft && isShaft)
                    outness = 0.;

                float angleAround = isTip ? 0. : .5 * atan(transformed.z,transformed.x);

                `+infix+`

                vec4 outed = vec4(extraVec1 + outness*extraVec2,1.);
                vec4 arounded = sandwichDqPoint( around, outed );
                vec4 alonged = sandwichDqPoint( along, arounded ); //purposefully last
                transformed = alonged.xyz / alonged.w;
                
                vNormal = 
                    isTip ? vec3(0.,0.,0.) : 
                    (arounded - start).xyz;
            `,
            //` transformed.y += 0.; vNormal.x += 0.;\n`
        },
    ]

    let shaftMatInjections = [
        `shaft`,
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

                float headStart = extraVec3.y; // it's a proportion
                float alongness = position.y;

                float angleAround = .5 * atan(transformed.z,transformed.x);

                `+infix+`

                vec4 outed = vec4(extraVec1 + extraVec2,1.);
                vec4 arounded = sandwichDqPoint( around, outed );
                vec4 alonged = sandwichDqPoint( along, arounded ); //purposefully last
                transformed = alonged.xyz / alonged.w;

                vNormal = (arounded - start).xyz;
            `,
            //` transformed.y += 0.; vNormal.x += 0.;\n`
        },
    ]

    {
        let radialSegments = 14
        var cupGeo = new THREE.SphereGeometry(arrowRadius, radialSegments, 16, 0., TAU, 0., TAU * .32)

        let headSegments = 8
        let shaftSegments = 37
        let heightSegments = shaftSegments + headSegments + 1
        var dqArrowGeo = new THREE.ConeGeometry(
            1., //irrelevant radius
            heightSegments, //"height", but we are about to modify y's
            radialSegments, heightSegments, true) //first half is shaft, second is head
        let attr = dqArrowGeo.attributes.position
        for (let i = 0; i < attr.count; ++i) {

            let y = attr.array[i * 3 + 1] + heightSegments / 2.
            if (y <= shaftSegments)
                y = y / shaftSegments
            else
                y = 1.001 + (y - shaftSegments - 1) / headSegments
            attr.array[i * 3 + 1] = y
        }

        var headlessGeo = new THREE.CylinderGeometry( 1., 1., 1.,
            radialSegments, shaftSegments, true)
        headlessGeo.translate(0.,0.5,0.)
        // dqArrowGeo = headlessGeo
        
        var extraShaftGeo = new THREE.CylinderGeometry(arrowRadius, arrowRadius, 1., radialSegments, 1, true)
        extraShaftGeo.translate(0., .5, 0.)
    }

    class Arrow extends THREE.Mesh {
        
        constructor( color, axisMat, headless) {

            let mat = new THREE.MeshPhong2Material({
                color,
                transparent: true,
                opacity: 1.
            })
            mat.injections = headless ? shaftMatInjections : arrowMatInjections

            super(headless ? headlessGeo : dqArrowGeo, mat )
            this.matrixAutoUpdate = false

            this.extraShaft = new THREE.Mesh(extraShaftGeo, axisMat)
            this.extraShaft.visible = false
            this.add(this.extraShaft)

            this.cup = new THREE.Mesh(cupGeo, axisMat)
            this.add(this.cup)
        }

        update(
            possiblyNegaDq,
            rotationPart,
            translationPart,
            bivPart,
            startPoint,

            boundingBox,
            pointHalfWayAlongArrow ) 
            {

            //extend viz's bounding box
            {
                //if you're non-nega, you have an extraShaft, but that isn't "arrow" for these purposes
                nonNegaDq.copy(possiblyNegaDq)
                var isNega = nonNegaDq[0] < 0. && Math.abs(bivPart.eNormSq()) < eps
                if (isNega)
                    nonNegaDq.multiplyScalar(-1., nonNegaDq)

                //bounding box and determination of arrow arclength
                let numSamples = 8
                for (let i = 0; i < numSamples; ++i) {
                    nonNegaDq.pow(i / (numSamples - 1), dq0)
                    dq0.sandwichFl(startPoint, fl0).pointToGibbsVec(v1)
                    boundingBox.expandByPoint(v1)
                }
                box0.min.copy(this.cup.position).subScalar(arrowRadius)
                box0.max.copy(this.cup.position).addScalar(arrowRadius)
                boundingBox.union(box0)
            }

            //you MIGHT want nega transflections one day, keep this stuff here
            if (!isNega) {
                this.extraShaft.visible = false

                translationPart.mul(rotationPart, this.material.dq)
                nonNegaArrowStart.copy(startPoint)
            }
            else {
                this.extraShaft.visible = true

                startPoint.pointToGibbsVec(this.extraShaft.position)

                let joinedPlane = bivPart.joinPt(e123, fl0)
                joinedPlane.mulReverse(e2, dq0).normalize().sqrtSelf().toQuaternion(this.extraShaft.quaternion)
                this.extraShaft.scale.y = 2.

                //arrow should be offset to start in some faraway place
                //and take you back to where nonNegaDq takes startPoint
                let offseterDq = dq1
                offseterDq.copy(bivPart)
                let dqDist = bivPart.getDual(dq3).eNorm() / -possiblyNegaDq[0]
                offseterDq.multiplyScalar(-100. / dqDist, offseterDq)
                offseterDq[0] = 1.

                offseterDq.sandwichFl(startPoint, nonNegaArrowStart)
                nonNegaDq.mulReverse(offseterDq, this.material.dq)
                this.material.dq[4] = 0.; this.material.dq[5] = 0.; this.material.dq[6] = 0.; this.material.dq[7] = 0.;
            }

            nonNegaArrowStart.pointToGibbsVec(this.material.extraVec1)

            //Head radius and arrow base stuff
            {
                let arrowArcLength = this.material.dq.pointTrajectoryArcLength(nonNegaArrowStart, 16)
                let headStart = (1. - headArcLength / arrowArcLength)
                let headOutnessAtBase = arrowArcLength * finalHeadRadiusFactor
                this.material.extraVec3.set(headOutnessAtBase, headStart, 0.)
                if (headArcLength > arrowArcLength) //really if you're at this stage, you should move startPoint. Wouldn't affect a translation tho
                    this.cup.scale.setScalar(1. / (1. - headStart))
                else
                    this.cup.scale.setScalar(1.)
                
                //out vector at base
                nonNegaArrowStart.momentumLineFromRotor(this.material.dq, spineLineAtNominalStart)
                if (spineLineAtNominalStart.isZero()) {
                    this.cup.scale.setScalar(.001)
                    this.material.extraVec2.set(0.,0.,0.)
                }
                else {
                    let randomPlaneContainingLine = spineLineAtNominalStart.joinPt(randomPt, fl1)
                    let outDqAtStartLog = randomPlaneContainingLine.meet(e0, dq0).normalize()
                    
                    this.material.extraVec2.set(
                        outDqAtStartLog[1],
                        outDqAtStartLog[2],
                        outDqAtStartLog[3]).multiplyScalar(arrowRadius)

                    e13.dqTo(spineLineAtNominalStart, dq1).toQuaternion(this.cup.quaternion)
                    startPoint.pointToGibbsVec(this.cup.position)
                }
            }

            v1.subVectors(boundingBox.max, boundingBox.min)
            let minLen = .08
            if (v1.length() < minLen) {
                v2.copy(v1).setLength(minLen).sub(v1).multiplyScalar(.5)
                boundingBox.max.add(v2)
                boundingBox.min.sub(v2)
            }

            if (pointHalfWayAlongArrow)
                nonNegaDq.sqrt(dq0).sandwich(startPoint, pointHalfWayAlongArrow)
        }
    }
    window.Arrow = Arrow
}