/*
    Question: given a vertex at which several triangles are meeting,
    If you take the circumcircles of all the triangles, and add them,
    do you get a zero-radius circle at the vertex?

    CGA visualization of the loop. A sphere which stereographically projects down to the loop
    TODO
        Each point in the 1D "mesh" is actually a line
        Trying to visualize the 1D version of Ideal Hyperbolic Polyhedra

    Conformal VR
        just a nice thing where you can make spheres and take their geometric products
        Aaaand, change what possibly-spherical slice you're looking at? With a watch interface?

    Goals:
        See what conformal skinning is liket

    TODO 1D
        Bones
            Not rotating properly?
            You can move, rotate, scale the bones                               


    TODO
        Because animation, want a timeline with parameters you can put on
        Make a texture you can draw on
        A tube with three bones in it

    Intrinsic triangulation
    Displacement map
    Lighting calculation

    Might be nicer for your "domain of constant curvature" to be a sphere

    There's a simple harmonic oscillator (weight on a spring)
        You make time out of that thing
 */

function initSkinning() {

    let bones = Array()
    let boneGeo = new THREE.CapsuleGeometry(.1, .1,3,15)
    boneGeo.computeBoundingBox()
    class Bone extends DqMesh {
        constructor(col) {
            super(
                boneGeo,
                new THREE.MeshPhongMaterial({ color: col })
            )

            bones.push(this)
            grabbables.push(this)
            scene.add(this)
            this.dq.copy(oneDq)

            this.initialInverse = new Dq()
        }
    }
    new Bone(0xFF0000)
    new Bone(0x00FF00)
    new Bone(0x0000FF)
    new Bone(0xFFFFFF)
    bones[1].dqParent = bones[3]
    bones[2].dqParent = bones[3]
    bones[0].dqParent = bones[2]

    bones[3].dq.translator(0., 1.6, 0.)
    bones[2].dq.translator(.4, .6, 0.)
    bones[1].dq.translator(.4, -.6, 0.)
    bones[0].dq.translator(-.5, .4, 0.)

    bones.forEach((bone)=>{
        dq0.copy(oneDq)
        bone.prependTransform(dq0)
        dq0.normalize()
        dq0.reverse(bone.initialInverse)
    })

    {
        let vertexShader = `#version 300 es\nprecision highp float;\n` + glslEga
            + `
            uniform mat4 viewMatrix;
            uniform mat4 projectionMatrix;
            
            in vec3 position;
            
            in vec4 weights;
            out vec4 vWeights;
            
            uniform float boneDqs[32];

            Dq getBoneDq(int index ) {
                Dq ret;
                ret.w     = boneDqs[ index*8 + 0 ];
                ret.e01   = boneDqs[ index*8 + 1 ];
                ret.e02   = boneDqs[ index*8 + 2 ];
                ret.e03   = boneDqs[ index*8 + 3 ];
                ret.e12   = boneDqs[ index*8 + 4 ];
                ret.e31   = boneDqs[ index*8 + 5 ];
                ret.e23   = boneDqs[ index*8 + 6 ];
                ret.e0123 = boneDqs[ index*8 + 7 ];
                return ret;
            }

            void main() {
                Dq basicBlend;
                for(int i = 0; i < 4; ++i)
                    basicBlend = addScaled( basicBlend, getBoneDq( i ), weights[i] );
                
                vec4 transformed = sandwichDqPoint( basicBlend, vec4( position, 1. ) );

                gl_Position = projectionMatrix * viewMatrix * transformed;
                vWeights = weights;
            }
        `
        let fragmentShader = `#version 300 es
            precision highp float;
            in vec4 vWeights;

            out vec4 fragColor;
            void main() {
                vec3 col = vWeights.xyz + vec3(1.,1.,1.) * vWeights.w;
                fragColor = vec4(col,1.);
            }`

        const geo = new THREE.BufferGeometry()

        var numVerts = 64
        var coords = new Float32Array(numVerts*3)
        for (let i = 0; i < numVerts; ++i) {
            coords[i * 3 + 0] = 1.3 * Math.cos(TAU * i / numVerts)
            coords[i * 3 + 1] = 1.3 * Math.sin(TAU * i / numVerts) + 1.6
            coords[i * 3 + 2] = 0.
        }
        geo.setAttribute(`position`, new THREE.BufferAttribute(coords, 3))

        var weights = new Float32Array([0, 0.3515416383743286, 0.44372817873954773, 0.20473018288612366, 0.0398259200155735, 0.20871207118034363, 0.5875508189201355, 0.16391122341156006, 0.030982183292508125, 0.11171704530715942, 0.7467210292816162, 0.11057975143194199, 0.015511938370764256, 0.03444540128111839, 0.9107368588447571, 0.03930580988526344, 0.004995287396013737, 0.0017622612649574876, 0.9910212755203247, 0.002221203874796629, 0.005386041011661291, 1.6886004061689164e-7, 0.9938015341758728, 0.0008122603176161647, 0.007089670747518539, 2.674027940482184e-29, 0.9920769333839417, 0.0008333915029652417, 0.009602262638509274, 0, 0.9895327687263489, 0.000864939414896071, 0.013428530655801296, 0, 0.9856637716293335, 0.0009077278082258999, 0.01947380229830742, 0, 0.9795635342597961, 0.0009626438841223717, 0.02943752333521843, 1.4132587719766696e-31, 0.9695323705673218, 0.001030108891427517, 0.046673569828271866, 2.1119147319836884e-8, 0.952217698097229, 0.0011086888844147325, 0.08281031250953674, 0.00011759510380215943, 0.9157909750938416, 0.0012811163906008005, 0.2172403633594513, 0.0013359484728425741, 0.7744755148887634, 0.0069481679238379, 0.5485728979110718, 0.004292313475161791, 0.4302113652229309, 0.016923444345593452, 0.8697918057441711, 0.001469155540689826, 0.124818816781044, 0.003920244984328747, 0.9846519231796265, 0.00019734457600861788, 0.014775002375245094, 0.0003757363301701844, 0.9999448657035828, 0.0000011649016187220695, 0.00005135730316396803, 0.0000025832528081082273, 1, 7.913857157132908e-19, 2.265020529442305e-17, 2.2614385892357667e-18, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 4.049421117435087e-13, 2.263691838144677e-12, 5.3812705159972385e-12, 0.9997627139091492, 0.000009643797056924086, 0.0000413352572650183, 0.00018632193678058684, 0.9792912602424622, 0.0006671192240901291, 0.0015598922036588192, 0.018481727689504623, 0.7985964417457581, 0.003986604977399111, 0.008295685984194279, 0.18912124633789062, 0.5209149122238159, 0.004282764159142971, 0.011885871179401875, 0.46291646361351013, 0.29746130108833313, 0.0021708873100578785, 0.009052470326423645, 0.6913153529167175, 0.14538444578647614, 0.0010907320538535714, 0.0034643136896193027, 0.8500605225563049, 0.06590639799833298, 0.0006491023232229054, 0.0007068125414662063, 0.9327377080917358, 0.02994648925960064, 0.00018621425260789692, 0.0001582274417160079, 0.9697090983390808, 0.01723800040781498, 7.87165390647715e-7, 5.38049050646805e-7, 0.9827606678009033, 0.012021184898912907, 1.3313545468255573e-20, 7.315958538046906e-21, 0.9879788160324097, 0.008686560206115246, 0, 0, 0.9913134574890137, 0.006473814137279987, 0, 0, 0.9935261607170105, 0.004959591198712587, 0, 0, 0.9950404167175293, 0.0038951237220317125, 7.749180507716238e-43, 1.723597111119525e-43, 0.996104896068573, 0.0031290201004594564, 5.888878273907494e-10, 1.0272849237935588e-10, 0.9968709945678711, 0.00265014567412436, 0.0001490694412495941, 0.00002042341475316789, 0.9971803426742554, 0.004296419210731983, 0.003504631808027625, 0.0007619201787747443, 0.9914370179176331, 0.013807808049023151, 0.020806511864066124, 0.0053830742835998535, 0.960002601146698, 0.025563005357980728, 0.06176788732409477, 0.012951645068824291, 0.8997174501419067, 0.0335923433303833, 0.12166174501180649, 0.020524675026535988, 0.8242212533950806, 0.03754535689949989, 0.1936699002981186, 0.02678498439490795, 0.7419997453689575, 0.03813067451119423, 0.2749423682689667, 0.03101806342601776, 0.6559088826179504, 0.03582730516791344, 0.36742299795150757, 0.03277088329195976, 0.5639788508415222, 0.03076913021504879, 0.4794672429561615, 0.03144007548689842, 0.45832353830337524, 0.022655583918094635, 0.6269791126251221, 0.025760965421795845, 0.324604332447052, 0.01155591569840908, 0.8167579770088196, 0.014612424187362194, 0.15707366168498993, 0.0023704099003225565, 0.9689469337463379, 0.00352902477607131, 0.025153659284114838, 0.0008321886998601258, 0.9925504922866821, 0.0017381301149725914, 0.004879170097410679, 0.0008058656239882112, 0.9934148788452148, 0.0020076490473002195, 0.0037716340739279985, 0.0008074308861978352, 0.9937670826911926, 0.002387494780123234, 0.003037992399185896, 0.0008188221254386008, 0.9937915802001953, 0.0028919910546392202, 0.0024976308923214674, 0.0008405146072618663, 0.9934931993484497, 0.0035736525896936655, 0.0020926266442984343, 0.0008734301081858575, 0.9928290843963623, 0.004512993153184652, 0.0017845184775069356, 0.0009190099663101137, 0.9916970729827881, 0.005836751777678728, 0.001547191641293466, 0.0009793393546715379, 0.989907443523407, 0.007750621531158686, 0.0013625849969685078, 0.0011052105110138655, 0.98665452003479, 0.01076405681669712, 0.0014762334758415818, 0.005768660921603441, 0.9348748326301575, 0.03031953237950802, 0.029036983847618103, 0.02090357430279255, 0.7780739665031433, 0.0937829315662384, 0.1072394996881485, 0.03620852530002594, 0.6136606931686401, 0.18207652866840363, 0.1680542677640915, 0.04539450630545616, 0.4698697030544281, 0.290286660194397, 0.19444912672042847])
        // new Float32Array(numVerts * 4)
        // for (let i = 0; i < numVerts; ++i) {
        //     weights[i*4+0] = 0.//1./3.
        //     weights[i*4+1] = 0.//1./3.
        //     weights[i*4+2] = 0.//1./3.
        //     weights[i*4+3] = 1.
        // }
        geo.setAttribute(`weights`, new THREE.BufferAttribute(weights, 4))

        var boneDqs = new Float32Array(8*bones.length)
        for(let i = 0; i < 4; ++i)
            boneDqs[8*i] = 1.

        const mat = new THREE.RawShaderMaterial({
            uniforms: {
                projectionMatrix: { value: camera.projectionMatrix },
                viewMatrix:       { value: camera.matrixWorldInverse },
                boneDqs:          { value: boneDqs }
            },
            vertexShader,
            fragmentShader,
        })

        var loop = new THREE.LineLoop( geo, mat )
        loop.frustumCulled = false //suppresses irritating bounding sphere calculation error
        scene.add(loop)
    }

    let keysDown = [ false, false, false, false ]
    document.addEventListener(`keydown`,(event)=>{
        keysDown[event.key] = true
    })
    document.addEventListener(`keyup`, (event) => {
        keysDown[event.key] = false
    })
    let vertex = new Ega()
    loop.onBeforeRender = () => {
        for (let i = 0; i < bones.length; ++i) {
            bones[i].prependTransform( dq0.copy(oneDq) )
            bones[i].initialInverse.mul(dq0, dq1)
            dq1.toArray( boneDqs, i )
        }

        keysDown.forEach((isDown, boneIndex) => {
            if (!isDown)
                return

            for (let i = 0; i < numVerts; ++i) {
                vertex.point(coords[i * 3 + 0], coords[i * 3 + 1], coords[i * 3 + 2], 1.)
                let dist = vertex.distanceTo(mousePlanePosition)

                weights[i * 4 + boneIndex] += .001 / (dist * dist * dist * dist * dist)

                let factor = 1./(weights[i * 4 + 0] + weights[i * 4 + 1] + weights[i * 4 + 2] + weights[i * 4 + 3])
                if(factor === Infinity) {
                    weights[i * 4 + 0] = 1./3.
                    weights[i * 4 + 1] = 1./3.
                    weights[i * 4 + 2] = 1./3.
                    weights[i * 4 + 3] = 0.    
                }
                else {
                    weights[i * 4 + 0] *= factor
                    weights[i * 4 + 1] *= factor
                    weights[i * 4 + 2] *= factor
                    weights[i * 4 + 3] *= factor
                }

                loop.geometry.attributes.weights.needsUpdate = true
                // log(loop.geometry.attributes.weights.array.join(`,`))
            }
        })
    }
}