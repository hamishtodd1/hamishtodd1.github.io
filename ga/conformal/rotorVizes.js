/*
    For the points, have a think about them as circles

    Interesting: you might be best off visualizing arrows in the sky
        Rotation arrows in the sky, sure
        Translation arrows in the sky, yes
            But how long? Maybe the length of the distance where you are, superimposed on the sky


    For any circle, you can get the plane which contains it

    Conformal point idea:
        You have a sphere and a center point for it (is it a center point?)
        The idea is that the thing is a point reflection in that point followed by a reflection in that sphere
        inner product with point at infinity
        Nice because that point is canonical with your choice of point-at-infinity
        

    3 arrows arranged in a triangle?
        There's a sphere, which could be a plane, which they poke through
        Their center of mass is in it

    Plane pencil; sphere pencil; circle nesting
    All special cases of what you should probably call a sphere foliation

    Arrow needs to do:          Shape                                   Arrow sphere is
        Translations            straight                                Plane containing camera and translation axis
        Rotations               circular arc                            Plane containing camera and rotation axis
        Screw                   corkscrew, also circular arc            
        conf hoop               circular arc 
        conf hoop screw         circular arc                            
        conf zero-hoop          straight line
        conf zero-hoop screw    donutty looking thing
        Scaling                 straight. Or, hmm, getting smaller?     Sphere centered on scale center, with radius such that arrow tips touch a sphere of a chosen size
        Poincare translation    circular arc
        Poincare screw          circular arc, also corkscrewing
        Rotate+scale            
        Scale+translate         Same as scale


    Whether you're inside or outside the hoop should matter


    Scaling-and-translation = 
 */

function initRotorVizes() {

    let pointGeo = new THREE.IcosahedronGeometry(.03, 2)
    let pointMat = new THREE.MeshPhongMaterial({ color: 0x000000 })

    class ConformalPointViz extends THREE.Mesh {
        constructor() {
            super(pointGeo,pointMat)
            this.castShadow = true
            scene.add(this)

            this.cga = new Cga()
        }

        onBeforeRender() {
            this.cga.downPt(this.position)
            // log(this.position)
        }

        getMv() {
            return this.cga
        }
    }
    window.ConformalPointViz = ConformalPointViz

    let cylRadius = .02
    let rotAxisGeo = new THREE.CylinderGeometry(cylRadius,       cylRadius,       camera.far * 10., 5, 1, true)
    let trnAxisGeo = new THREE.CylinderGeometry(cylRadius * 15., cylRadius * 15., camera.far * 10., 5, 1, true)
    let dqMat = new THREE.MeshPhongMaterial({color:0xFF0000})
    let rotAxis = new Dq()
    let trnAxis = new Dq()
    //maaaaybe it could be a similarity viz
    class DqViz extends THREE.Group {
        constructor() {
            super()
            scene.add(this)

            this.dq = new Dq()

            this.rotAxisMesh = new DqMesh(rotAxisGeo, dqMat)
            this.add(this.rotAxisMesh)

            this.trnAxisMesh = new DqMesh(trnAxisGeo, dqMat)
            this.add(this.trnAxisMesh)

            obj3dsWithOnBeforeRenders.push(this)
            this.onBeforeRender = () => {

                this.dq.invariantDecomposition( rotAxis, trnAxis )
                rotAxis[0] = 0.
                e13e.transformToAsDq( rotAxis.cast(ega0), this.rotAxisMesh.dq )
                // this.rotAxisMesh.dq.log()

                if(trnAxis.approxEquals(oneDq))
                    this.trnAxisMesh.visible = false
                else {
                    this.trnAxisMesh.visible = true

                    let planeOrthogonalToRotationAxis = rotAxis.cast(ega0).inner(camera.mvs.pos, ega1)
                    planeOrthogonalToRotationAxis.meet( camera.frustum.far, ega2 ).cast(trnAxis)
                    trnAxis.mul(e13e.cast(dq0), this.trnAxisMesh.dq).sqrtSelf()
                }
            }
        }
    }
    window.DqViz = DqViz

    // let myDqViz = new DqViz()
    // let littleTranslation = Translator(4., 0., 0.)
    // e23e.cast(new Dq()).mul( littleTranslation, myDqViz.dq )



    let circleGeo = new THREE.PlaneGeometry(1.,1.,63,5)
    circleGeo.translate(.5,.5,0.)
    circleGeo.scale(TAU,TAU,0.)
    let circleMat = new THREE.MeshPhong2Material({ side: THREE.DoubleSide, color: 0xFF0000 })

    let rodrigues = `
        vec3 rodrigues(in vec3 v, in vec3 axis, float angle) {
            float cosAngle = cos(angle);
            float sinAngle = sin(angle);
            return v * cosAngle + cross(axis, v) * sinAngle + axis * dot(axis,v) * (1.-cosAngle);
        }
    `

    //you wanna send a vertex to the correct place and rotate them out from there

    circleMat.injections = [
        {
            type: `vertex`,
            precedes: ``,
            str: `uniform float[16] rotor;
            varying float drawability;
            \n` + glslCga + rodrigues
        },
        {
            type: `vertex`,
            precedes: `	#include <project_vertex>`,
            str: `
                //rotor needs to take the z unit circle to the place the circle is
                float majorAngle = transformed.x;
                float minorAngle = transformed.y;
                float minorRadius = `+cylRadius+`;
        
                //the e3p circle
                vec3 center = vec3( cos(majorAngle     ), sin(majorAngle     ), 0. );
                
                vec3 helper = vec3( cos(majorAngle+.001), sin(majorAngle+.001), 0. );
                center = sandwichRotorPoint( rotor, center );
                helper = sandwichRotorPoint( rotor, helper );

                if(center.x == 999. && center.y == 999. && center.z == 999.)
                    drawability = 0.;
                else
                    drawability = 1.;
                
                //if this doesn't work, just use lineloop
                vec3 axis = normalize( helper - center );
                vec3 randomV = vec3( 0.40832, 0.59745, 0.25505 );
                vec3 displacer = cross( randomV, axis );
                displacer = rodrigues( displacer, axis, minorAngle );
                vNormal = normalize( displacer );
                
                transformed = minorRadius * vNormal + center;
                \n`,
            //` transformed.y += 0.; vNormal.x += 0.;\n`
        },
        {
            type: `fragment`,
            precedes: ``,
            str: `varying float drawability;\n`
        },
        {
            type: `fragment`,
            precedes: `	#include <dithering_fragment>`,
            str: `if(drawability!=1.)discard;\n`
        }
    ]


    // let arrowHeadGeo = new THREE.ConeGeometry(.1,.2,32,1)
    // arrowHeadGeo.translate(0.,-.1,0.)
    // let mrh = new THREE.Mesh(arrowHeadGeo)
    // mrh.position.y = .1
    // scene.add(mrh)

    let cgaCircles = [new Cga(), new Cga()]
    //this should be one of the last things in the frame that you call, ideally it'd be onBeforeRender
    function attemptToFindTransform(starter, intended, target) {

        let ratioCga = intended.mul(starter.reverse(cga0), cga1)

        let ratioSquaresToZero = ratioCga.mul(ratioCga, cga2).isZero()
        let ratioRotor = ratioCga.cast(rotor0)

        if (ratioSquaresToZero || ratioRotor.isStudy() ) 
            return false
        else {
            ratioRotor.sqrt(target)
            return true
        }
    }
    let e2pTo3p = e3p.rotorTo(e2p, new Rotor())
    class RotorViz extends THREE.Object3D {
        constructor() {
            super()
            scene.add(this)

            obj3dsWithOnBeforeRenders.push(this)

            this.circleMeshes = Array(2)
            this.circleMeshes[0] = new THREE.Mesh(circleGeo, circleMat)
            this.add(this.circleMeshes[0])
            this.circleMeshes[1] = new THREE.Mesh(circleGeo, circleMat)
            this.add(this.circleMeshes[1])

            this.rotor = new Rotor()
            this.rotor[0] = 1.
        }

        getMv() {
            return this.rotor
        }

        onBeforeRender() {
            //so, you were TRYING at some point to do proper "separation". For now just render one circle
            // let circles = this.rotor.cast(circle0).decompose(cgaCircles[0], cgaCircles[1])
            // cgaCircles[0].log()

            //ok so this is shit
            //You can do circles and lines with PGA
            //big pile of if statements is not great

            // this.rotor.log()
            
            this.rotor.cast(cga0).selectGrade(2, cgaCircles[0])
            cgaCircles[1].copy(zeroCga) //because we're not using it at all yet
            
            this.circleMeshes.forEach((cm,i)=>{

                //yes, this is pretty hacky
                
                if (this.visible && !cgaCircles[i].isZero() ) {
                    
                    if (attemptToFindTransform(e3p, cgaCircles[i], this.circleMeshes[i].material.rotor) ) {
                        cm.visible = true
                        return
                    }
                    else if ( attemptToFindTransform(e2p, cgaCircles[i], rotor0 ) ) {
                        e2pTo3p.mul( rotor0, this.circleMeshes[i].material.rotor )
                        cm.visible = true
                        return
                    }
                }
                cm.visible = false
            })
        }
    }
    window.RotorViz = RotorViz

    // let test = e12c.add(e3p).cast(circle0)
    // log(test.decompose())
    //need to do some work on decomposing
    // return

    let numPts = 200
    let cps = Array(numPts)
    let size = 1.9
    let initials = Array(numPts)
    for(let i = 0; i < numPts; ++i) {
        cps[i] = new ConformalPointViz()
        // cps[i].cga.upPt(  )
        initials[i] = new THREE.Vector3(
            size * (Math.random() - .5), 1.6 + 
            size * (Math.random() - .5), 
            size * (Math.random() - .5) )
    }

    // let testRv = new RotorViz()
    // e23c.sub(e03c).cast(testRv.rotor)
    // e3p.addScaled(e03c, -3.5, cga0).cast(testRv.rotor)

    //meshes could be just circles
    
    // let ourAxis = new Circle()
    // e3p.add(e12c,cga0).cast(ourAxis)
    // e3p.cast(ourAxis)
    // e12c.cast(ourAxis)
    // e3p.cast(ourAxis)
    
    // let smallSphereAtHeadHeight = cga0.upPt(0., 1.6, 0.).dual().sub(e0c, cga1)
    // smallSphereAtHeadHeight.meet(e1c, cga2).cast(ourAxis)
    // smallSphereAtHeadHeight.meet(e1c, cga2).log()
    // blankFunction = () => {
    //     ourAxis.exp( testRv.rotor, .015 * frameCount )

        // for(let i = 0; i < numPts; ++i ){
        //     cga1.upPt(initials[i])
        //     testRv.rotor.sandwichConformalPoint( cga1, cps[i].cga )
        // }
    // }
}