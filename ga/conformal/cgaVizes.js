/*


    Fullscreen quad plan:
        ALL fragment shaders both check against depth buffer and write to depth buffer
        gl.disable(gl.DEPTH_TEST) //because you're checking depth yourself!
        Full screen quad, all the spheres/planes go in. Hmm, how to intersect generally though...
 */

function initCgaVizes() {
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



    let mat = new THREE.MeshPhong2Material({ color: 0xFF0000, side: THREE.DoubleSide })

    mat.injections = [
        {
            type: `fragment`,
            precedes: ``,
            str: `uniform float mrh;\n`
        },
        {
            type: `fragment`,
            precedes: `}`,
            str: `gl_FragColor.b = gl_FragColor.b;\n`
        },
        {
            type: `vertex`,
            precedes: `	#include <project_vertex>`,
            str: `
                transformed = sandwichSpinorPoint( spinor, transformed );

                // float[16] testSpinor;
                // testSpinor[0] = 1.;
                // // testSpinor[2] = 0.96;
                // vec3 testVec = vec3(1.,0.,0.);
                // float testResult = (sandwichSpinorPoint( testSpinor, testVec )).x;

                // transformed.y += testResult;
                \n`,
            //` transformed.y += 0.; vNormal.x += 0.;\n`
        },
        {
            type: `vertex`,
            precedes: ``,
            str: glslCga
        },
        {
            type: `vertex`,
            precedes: ``,
            str: `uniform float[16] spinor;\n`
        }
    ]

    //vNormal

    let sphereGeo = new THREE.IcosahedronGeometry(1.,11)
    // sphereGeo.translate(1.,0.,0.)
    class SphereViz extends THREE.Mesh {
        constructor() {
            super(sphereGeo, mat)
            this.sphere = new Sphere()
            
            scene.add(this)

            //do it in terms of position and scale, fuck it

            //some kind of instancing would be better but not clear how to get your spinor in there
        }
    }
    window.SphereViz = SphereViz

    let mrh = new SphereViz()
    // mrh.sphere[4] = 1.
    // log(mrh.sphere)

    //ep2 + e02

    

    let ourCircle = e1p.convert( new Circle() )
    let startingPt = new Cga().up(0.,0.,0.)
    let old = .1
    let multiple = .1
    mrh.onBeforeRender = () => {
        multiple = 1.5 + .001 * frameCount
        
        ourCircle.exp(mat.spinor, multiple )
        
        old = debugSphere.position.x
        mat.spinor.convert(new Cga()).sandwich(startingPt).down(debugSphere.position.set(0., 1., 0.))
        if ((old < 0.) !== (debugSphere.position.x < 0.))
            log("yo")
        mat.spinor.log("spinor",5)


        mrh.position.y = 100.

        // debugSphere.position.set(0., 1., 0.)

        // log(.001 * frameCount * TAU)
        // mat.spinor.log()
    }

    // debugger
    // let test = ep1.convert(new Circle()).exp(new Spinor(), 0.126 * TAU)
    // log(test.convert(new Cga()).sandwich(startingPt).down())

    

    // let otherMat = new THREE.MeshPhongMaterial({ color: 0x00FF00 })
    // let foo = new THREE.Mesh(sphereGeo,otherMat)
    // foo.position.y = 1.9
    // scene.add(foo)
}