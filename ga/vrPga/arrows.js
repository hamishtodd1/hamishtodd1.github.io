function initArrows() {
    let arrowMatInjections = [
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

    const headArcLength = arrowRadius * 5.
    const headRadiusFactor = 2.1

    {
        let radialSegments = 14
        var cupGeo = new THREE.SphereGeometry(arrowRadius, radialSegments)

        let headSegments = 8
        let shaftSegments = 37
        let heightSegments = shaftSegments + headSegments + 1
        var dqArrowGeo = new THREE.ConeGeometry(
            1., //irrelevant radius
            heightSegments, //we are about to modify y's
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

        var headlessGeo = new THREE.CylinderGeometry(
            1., 1.,
            1.,
            radialSegments, shaftSegments, false)
        headlessGeo.translate(0.,0.5,0.)
        // dqArrowGeo = headlessGeo
        
        var extraShaftGeo = new THREE.CylinderGeometry(arrowRadius, arrowRadius, 2000., radialSegments, 1, true)
        extraShaftGeo.translate(0., 1000., 0.)
    } 
    
    let nonNetherArrowStart = new Fl()
    let finalHeadRadiusFactor = headRadiusFactor / headArcLength

    let nonNetherDq = new Dq()

    class Arrow extends THREE.Mesh {
        
        constructor( color, transparent, axisMat, headless) {

            let mat = new THREE.MeshPhong2Material({
                color,
                transparent,
                opacity: transparent ? .4 : 1.
            })
            mat.injections = arrowMatInjections

            super(headless ? headlessGeo : dqArrowGeo, mat )
            this.matrixAutoUpdate = false

            this.extraShaft = new THREE.Mesh(extraShaftGeo, axisMat)
            this.extraShaft.visible = false
            this.add(this.extraShaft)

            this.cup = new THREE.Mesh(cupGeo, axisMat)
            this.add(this.cup)
        }

        update(
            possiblyNetherDq,
            rotationPart,
            translationPart,
            bivPart,
            startPoint,

            boundingBox,
            pointHalfWayAlongArrow ) 
            {

            startPoint.pointToGibbsVec(this.cup.position)

            //extend bounding box
            {
                //if you're non-nether, you have an extraShaft, but that isn't "arrow" for these purposes
                nonNetherDq.copy(possiblyNetherDq)
                var isNether = nonNetherDq[0] < 0. && Math.abs(bivPart.eNormSq()) < eps
                if (isNether)
                    nonNetherDq.multiplyScalar(-1., nonNetherDq)

                //bounding box and determination of arrow arclength
                let numSamples = 8
                for (let i = 0; i < numSamples; ++i) {
                    nonNetherDq.pow(i / (numSamples - 1), dq0)
                    dq0.sandwichFl(startPoint, fl0).pointToGibbsVec(v1)
                    boundingBox.expandByPoint(v1)
                }
                box0.min.copy(this.cup.position).subScalar(arrowRadius)
                box0.max.copy(this.cup.position).addScalar(arrowRadius)
                boundingBox.union(box0)
            }

            //you MIGHT want nether transflections one day, keep this stuff here
            if (!isNether) {
                this.extraShaft.visible = false

                translationPart.mul(rotationPart, this.material.dq)
                nonNetherArrowStart.copy(startPoint)
            }
            else {
                this.extraShaft.visible = false

                startPoint.pointToGibbsVec(this.extraShaft.position)

                let joinedPlane = bivPart.joinPt(e123, fl0)
                joinedPlane.mulReverse(e2, dq0).normalize().sqrtSelf().toQuaternion(this.extraShaft.quaternion)

                //arrow should be offset to start in some faraway place
                //and take you back to where nonNetherDq takes startPoint
                let offseterDq = dq1
                offseterDq.copy(bivPart)
                let dqDist = bivPart.getDual(dq3).eNorm() / -possiblyNetherDq[0]
                offseterDq.multiplyScalar(-100. / dqDist, offseterDq)
                offseterDq[0] = 1.

                offseterDq.sandwichFl(startPoint, nonNetherArrowStart)
                nonNetherDq.mulReverse(offseterDq, this.material.dq)
                this.material.dq[4] = 0.; this.material.dq[5] = 0.; this.material.dq[6] = 0.; this.material.dq[7] = 0.;
            }

            nonNetherArrowStart.pointToGibbsVec(this.material.extraVec1)

            //Head radius and arrow base stuff
            {
                let arrowArcLength = this.material.dq.pointTrajectoryArcLength(nonNetherArrowStart, 16)
                let headStart = (1. - headArcLength / arrowArcLength)
                let headOutnessAtArrowBase = arrowArcLength * finalHeadRadiusFactor
                this.material.extraVec3.set(headOutnessAtArrowBase, headStart, 0.)
                if (headArcLength > arrowArcLength) //really if you're at this stage, you should move startPoint
                    this.cup.scale.setScalar(1. / (1. - headStart))
                else
                    this.cup.scale.setScalar(1.)
                
                //out vector at base
                let spineLineAtNominalStart = nonNetherArrowStart.momentumLineFromRotor(this.material.dq, dq0)
                let randomPlaneContainingLine = spineLineAtNominalStart.joinPt(randomPt, fl1)
                let outDqAtStartLog = randomPlaneContainingLine.meet(e0, dq0).normalize()
                this.material.extraVec2.set(
                    outDqAtStartLog[1],
                    outDqAtStartLog[2],
                    outDqAtStartLog[3]).multiplyScalar(arrowRadius)
            }

            if (pointHalfWayAlongArrow)
                nonNetherDq.sqrt(dq0).sandwich(startPoint, pointHalfWayAlongArrow)
        }
    }
    window.Arrow = Arrow
}