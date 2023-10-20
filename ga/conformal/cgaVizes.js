/*
    An e4 idea
        It is a 

    An inertia tensor could be visualized as a mapping of lines to lines
    A screw motion is one of those. Bu

    Trivector-circle
        an example of a bivector point pair is e45. Dual is e123 which looks the same
        so, claim: e12's dual imaginary ztrivector, e345, looks like e12
        it's kind of scale-toward-origin-then-reflect-in-e3. So yes, dotted line through origin orth to e3
        e34 is the unit circle straddling e12. "wedge" that with e5 to get this shit, ugh
        zero-radius point pair is dual to zero radius circle

        you can make a transflection in 2D by GPing a line and a point
        How about a circle and a point? Again 2D?
        That's a hyperbolic trans starting at the point, going toward circle center, and with a 


    you only need the one arrow for a rotor, so maybe for sphere, plane etc too?

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
        textureLoader.load(`data/bourke.jpg`, (tex) => {
            bourkeTexture = tex
            resolve()
        })
    })

    let sphereMatInjections = [
        {
            type: `vertex`,
            precedes: ``,
            str: `uniform float[16] rotor;
            varying float drawability;
            \n` + glslCga
        },
        {
            type: `vertex`,
            precedes: `	#include <project_vertex>`,
            str: `
                transformed = sandwichRotorPoint( rotor, transformed );
                if(transformed.x == 999. && transformed.y == 999. && transformed.z == 999.)
                    drawability = 0.;
                else
                    drawability = 1.;
                \n`,
            //` transformed.y += 0.; vNormal.x += 0.;\n`
        },
        //vNormal
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

    let magicNumberRadius = 8. //hacky. Empirically, this is the radius outside of which things look like shit
    let sphereGeo = new THREE.IcosahedronGeometry(magicNumberRadius, 5)
    let startingSphere = sphere0.fromCenterAndRadius(0.,0.,0.,magicNumberRadius).cast(new Cga())
    let asCga = new Cga()
    let approximatelyInfinity = e0c.addScaled(ep,.003,new Cga()) //eyeballed
    class SphereViz extends THREE.Mesh {

        constructor() {
            
            let mat = new THREE.MeshPhong2Material({ 
                side: THREE.DoubleSide, 
                map: bourkeTexture,
                transparent: true,
            })
            mat.injections = sphereMatInjections

            super( sphereGeo, mat )
            scene.add(this)
            
            this.sphere = new Sphere()
        }

        onBeforeRender() {

            //inner product with point at infinity, get point pair of its center and point at infinity
            //geometric product of that with e123, got the translation part
            //apply that to unit circle, geometric product with current value to get scalor?

            //coooooooould just use position and radius
            //if you don't want to do that, you need to 

            let radius = this.sphere.getRadius()

            if( radius < 0.001 || this.sphere.isZero() )
                this.material.opacity = 0.
            else {
                this.material.opacity = 1.

                //need to do something in the radius zero situation
                // if(radius < .01) {
                // }
                
                this.sphere.cast(asCga)

                let isAtInfinity = true
                if(asCga[4] == 0. || asCga[5] === 0. || Math.abs(asCga[4] - asCga[5]) > .0001)
                    isAtInfinity = false
                for(let i = 0; i < 32; ++i) {
                    if(i !== 4 && i !== 5 && asCga[i] !== 0.)
                        isAtInfinity = false
                }
                if(isAtInfinity)
                    asCga.copy(approximatelyInfinity)
                
                startingSphere.rotorTo( asCga, this.material.rotor )
            }
        }

        getMv() {
            return this.sphere
        }
    }
    window.SphereViz = SphereViz

    // let sphere1 = new SphereViz()
    // let mrh = (ep.add(e0c))
    // mrh.cast( sphere1.sphere )
    // sphere1.sphere.fromCenterAndRadius(0.,0.,0.,2)

    let pointGeo = new THREE.IcosahedronGeometry(.03,2)
    let pointMat = new THREE.MeshPhongMaterial( { color:0x000000 } )
    let p1 = new Cga(); p2 = new Cga()
    class PpViz extends THREE.Group {
        constructor() {
            super()

            this.meshes = Array(2)
            for(let i = 0; i < 2; ++i) {
                this.meshes[i] = new THREE.Mesh(pointGeo, pointMat) //trivially instanceable
                this.meshes[i].castShadow = true
                scene.add(this.meshes[i])
            }

            this.cga = new Cga()
            ep.meet(e23c,this.cga)

            obj3dsWithOnBeforeRenders.push(this)
        }

        onBeforeRender() {
            // log(this.visible)
            this.meshes[0].visible = this.visible
            this.meshes[1].visible = this.visible

            this.cga.ppToConformalPoints(p1, p2)
            p1.downPt(this.meshes[0].position)
            p2.downPt(this.meshes[1].position)
        }

        getMv() {
            return this.cga
        }
    }
    window.PpViz = PpViz
}