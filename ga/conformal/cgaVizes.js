/*
    with the mouse, you do 2D CGA in a plane?
        place circles that are point pairs
        place spheres that are circles
        place points that 

    better way of doing the circles
    1. Take the meet of the circle with e0, getting, say, e012
    2. Take the dual of that. e012's dual would be e03
    3. That exponentiates, on the GPU, to a transform that does the whole circle
    4. On CPU, project a point onto the circle, that's your starting point
    5. (optional) could try to do the rounding. Remember there's the normal vector needed anyway

    Fullscreen quad plan:
        ALL fragment shaders both check against depth buffer and write to depth buffer
        gl.disable(gl.DEPTH_TEST) //because you're checking depth yourself!
        Full screen quad, all the spheres/planes go in. Hmm, how to intersect generally though...
 */


async function initCgaVizes() {
    //transparency wise, maybe if you get things in the right order it's ok, since they're spheres?

    // `float sphIntersect( in vec3 ro, in vec3 rd, in vec3 ce, float ra )
    // {
    //     vec3 oc = ro - ce;
    //     float b = dot( oc, rd );
    //     float c = dot( oc, oc ) - ra*ra;
    //     float h = b*b - c;
    //     if( h<0.0 ) return -1.; // no intersection
    //     return -b-sqrt( h );
    // }\n`

    let bourkeTexture = null
    await new Promise((resolve) => {
        new THREE.TextureLoader().load(`data/bourke.jpg`, (tex) => {
            bourkeTexture = tex
            resolve()
        })
    })

    let sphereMatInjections = [
        {
            type: `vertex`,
            precedes: `	#include <project_vertex>`,
            str: `
                transformed = sandwichRotorPoint( rotor, transformed );
                \n`,
            //` transformed.y += 0.; vNormal.x += 0.;\n`
        },
        {
            type: `vertex`,
            precedes: ``,
            str: `uniform float[16] rotor;\n` + glslCga
        }
        //vNormal
    ]

    let sphereGeo = new THREE.IcosahedronGeometry(1., 5)
    let renderedAsCga = new Cga()
    class SphereViz extends THREE.Mesh {

        constructor() {
            
            let mat = new THREE.MeshPhong2Material({ side: THREE.DoubleSide, map: bourkeTexture })
            mat.injections = sphereMatInjections

            super( sphereGeo, mat )
            scene.add(this)
            
            this.sphere = new Sphere()
        }

        onBeforeRender() {

            let radius = this.sphere.getRadius()

            if( radius < 0.001 || this.sphere.isZero() )
                this.visible = false
            else 
            {
                //need to do something in the radius zero situation
                // if(radius < .01) {
                // }
                
                this.sphere.cast(renderedAsCga)
                this.visible = true
                
                ep.rotorTo(renderedAsCga, this.material.rotor )
            }
        }

        getMv() {
            return this.sphere
        }
    }
    window.SphereViz = SphereViz

    // let ourCircle = e1p.cast( new Circle() )
    // let sphere1 = new SphereViz()
    // e1c.cast( sphere1.sphere )
    // let sphere2 = new SphereViz()
    // // ep.cast( sphere2.sphere )
    // ourCircle.exp(sphere2.material.rotor, .75 )
    // e1c.add(ep, cga0).cast(sphere2.sphere)

    let pointGeo = new THREE.IcosahedronGeometry(.03,2)
    let pointMat = new THREE.MeshPhongMaterial( { color:0x000000 } )
    let p1 = new Cga(); p2 = new Cga()
    class PpViz extends THREE.Group {
        constructor() {
            super()

            this.meshes = Array(2)
            for(let i = 0; i < 2; ++i) {
                this.meshes[i] = new THREE.Mesh(pointGeo, pointMat) //trivially instanceable
                scene.add(this.meshes[i])
            }

            this.cga = new Cga()
            ep.meet(e23c,this.cga)

            obj3dsWithOnBeforeRenders.push(this)
        }

        onBeforeRender() {
            this.meshes[0].visible = this.visible
            this.meshes[1].visible = this.visible

            this.cga.ppToConformalPoints(p1, p2)
            p1.downPt(this.meshes[0].position)
            p2.downPt(this.meshes[1].position)
        }
    }
    window.PpViz = PpViz

    class ConformalPointViz extends THREE.Mesh {
        constructor() {
            super(pointGeo,pointMat)
            scene.add(this)

            this.cga = new Cga()
        }

        onBeforeRender() {
            this.cga.downPt(this.position)  
        }

        getMv() {
            return this.cga
        }
    }
    window.ConformalPointViz = ConformalPointViz

    //could have a ring geometry, displace the things
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
            precedes: `	#include <project_vertex>`,
            str: `
                //rotor needs to take the z unit circle to the place the circle is
                float majorAngle = transformed.x;
                float minorAngle = transformed.y;
                float minorRadius = .02;
                
                vec3 center = vec3( cos(majorAngle     ), sin(majorAngle     ), 0. );
                vec3 helper = vec3( cos(majorAngle+.001), sin(majorAngle+.001), 0. );
                center = sandwichRotorPoint( rotor, center );
                helper = sandwichRotorPoint( rotor, helper );
                
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
            type: `vertex`,
            precedes: ``,
            str: `uniform float[16] rotor;
            \n` + glslCga + rodrigues
        }
    ]

    let cgaCircles = [new Cga(), new Cga()]
    //this should be one of the last things in the frame that you call, ideally it'd be onBeforeRender
    function attemptToFindTransform(starter, intended, target) {
        let ratioCga = starter.mul(intended.reverse(cga0), cga1)
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
            //so, you were TRYING at some point to do proper "separation". For now just try to render the freaking circles
            // let circles = this.rotor.cast(circle0).decompose(cgaCircles[0], cgaCircles[1])
            // cgaCircles[0].log()
            
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

    // let ourRotorViz = new RotorViz()
    // e12c.cast(ourRotorViz.rotor)
    // e3p.addScaled(e03c, -3.5, cga0).cast(ourRotorViz.rotor)
    
    // let ourAxis = new Circle()
    // e3p.add(e12c,cga0).cast(ourAxis)
    // e3p.cast(ourAxis)
    // e12c.cast(ourAxis)
    // e3p.cast(ourAxis)
    
    // let smallSphereAtHeadHeight = cga0.upPt(0., 1.6, 0.).dual().sub(e0c, cga1)
    // smallSphereAtHeadHeight.meet(e1c, cga2).cast(ourAxis)
    // smallSphereAtHeadHeight.meet(e1c, cga2).log()
    // blankFunction = () => {
    //     ourAxis.exp( ourRotorViz.rotor, .015 * frameCount )

        // for(let i = 0; i < numPts; ++i ){
        //     cga1.upPt(initials[i])
        //     ourRotorViz.rotor.sandwichConformalPoint( cga1, cps[i].cga )
        // }
    // }

    

    //currently we want to try out that linked-circles idea

    // let myRotor = new RotorViz()
    // e2p.cast(myRotor.rotor)
}