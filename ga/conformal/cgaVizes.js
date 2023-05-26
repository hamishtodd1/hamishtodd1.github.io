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

    new THREE.TextureLoader().load(`data/bourke.jpg`,(tex)=>{
        mat.map = tex
        mat.needsUpdate = true
    })

    let mat = new THREE.MeshPhong2Material({ side: THREE.DoubleSide })

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
        //vNormal
    ]


    let sphereGeo = new THREE.IcosahedronGeometry(1., 5)
    class SphereViz extends THREE.Mesh {
        constructor() {
            super(sphereGeo, mat)
            this.sphere = new Sphere()
            // scene.add(this)

            //some kind of instancing would be better but not clear how to get your spinor in there
        }
    }
    window.SphereViz = SphereViz

    let mySphere = new SphereViz()
    // mySphere.sphere[4] = 1.
    // log(mySphere.sphere)

    //ep2 + e02

    

    let ourCircle = e1p.convert( new Circle() )
    let multiple = .1
    mySphere.onBeforeRender = () => {
        multiple = .001 * frameCount
        ourCircle.exp(mat.spinor, multiple )
    }

    ppToVec3s = (pp, v1, v2) => {
        //tortured appeal to hyperbolic PGA, but it should work
        let directionTowardNullPt = em.meet(pp,cga1)
        directionTowardNullPt.multiplyScalar( 1. / Math.sqrt(sq(directionTowardNullPt[27]) + sq(directionTowardNullPt[28]) + sq(directionTowardNullPt[29]) + sq(directionTowardNullPt[30])))
        
        let imaginaryPtBetweenPts = e123p.projectOn(pp,cga0)
        imaginaryPtBetweenPts.multiplyScalar( 1. / imaginaryPtBetweenPts[26] )
        
        let currentEDistFromHyperbolicCenterSq = sq(imaginaryPtBetweenPts[27]) + sq(imaginaryPtBetweenPts[28]) + sq(imaginaryPtBetweenPts[29]) + sq(imaginaryPtBetweenPts[30])
        directionTowardNullPt.multiplyScalar(Math.sqrt( (1. - currentEDistFromHyperbolicCenterSq) ) )

        imaginaryPtBetweenPts.add(directionTowardNullPt, cga2).downPt(v1)
        imaginaryPtBetweenPts.sub(directionTowardNullPt, cga2).downPt(v2)
    }

    let pointGeo = new THREE.IcosahedronGeometry(.03,2)
    let pointMat = new THREE.MeshPhongMaterial( { color:0x000000 } )
    class PpViz extends THREE.Group {
        constructor() {
            super()

            this.meshes = Array(2)
            for(let i = 0; i < 2; ++i) {
                this.meshes[i] = new THREE.Mesh(pointGeo, pointMat) //trivially instanceable
                scene.add(this.meshes[i])
            }

            this.cga = new Cga()

            this.meshes[0].onBeforeRender = () => {
                ppToVec3s(this.cga, this.meshes[0].position, this.meshes[1].position)
            }
        }
    }
    window.PpViz = PpViz

    let mrh = new PpViz()
    ep.meet(e13c, mrh.cga)
    // mrh.meshes[0].position.set(0.4, 1.6, 0.)
    // mrh.meshes[1].position.set(0.7, 1.6, 0.)

    // class PointViz extends THREE.Mesh {
    //     constructor() {
    //         super(pointGeo,pointMat)
    //         scene.add(this)

    //         this.cga = new Cga()
    //     }

    //     onBeforeRender() {
    //         // ppToVec3s(this.cga, this.meshes[0].position, this.meshes[1].position)
    //         cga0.fromEga(mousePlanePosition).meet(eo,this.cga)
            
    //         this.cga.downPt(this.position)
    //         // log(this.cga)

    //         //could use mouseRay as CGA, intersect it with the mouseplane

    //         //just think of the lasenby formula as zero-radius circles dude
    //     }
    // }
    // window.PointViz = PointViz

    // let mrh = new PointViz()
    // mrh.cga.up(.4,1.6,0.)
}