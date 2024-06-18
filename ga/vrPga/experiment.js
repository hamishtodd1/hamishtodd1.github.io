function initExperiment() {

    let matInjections = [
        `cylinderSector`,
        {
            type: `vertex`,
            precedes: ``,
            str: egaVerboseGlsl + egaGlsl + `
                float TAU = 6.283185307179586;
                uniform float[8] dq; //rotation axis logarithm
                uniform vec3 extraVec1; //start
                uniform vec3 extraVec2; //displacement toward the axis by the desired amount
                uniform vec3 extraVec3; //translation axis logarithm
                out float myOpacity;
            \n`
        },
        {
            type: `vertex`,
            precedes: `	#include <project_vertex>`,
            str: `

                myOpacity = 0.75*(transformed.z);

                float radialProportion = 1.-transformed.z;
                vec4 start = vec4( extraVec1 + radialProportion * extraVec2, 1. );

                float rotnProportion = transformed.x;
                float trnsProportion = transformed.y;

                float[8] rotPart;
                float[8] rotPartAxis;
                multiplyScalar(dq, rotnProportion, rotPartAxis);
                dqExp( rotPartAxis, rotPart );

                float[8] translationPart;
                translationPart[0] = 1.;
                translationPart[1] = extraVec3.x * trnsProportion;
                translationPart[2] = extraVec3.y * trnsProportion;
                translationPart[3] = extraVec3.z * trnsProportion;

                float[8] cylDq;
                mulDqDq( translationPart, rotPart, cylDq );

                vec4 final = sandwichDqPoint( cylDq, start );
                transformed = final.xyz / final.w;
            `,
            //` transformed.y += 0.; vNormal.x += 0.;\n`
        },

        {
            type: `fragment`,
            precedes: ``,
            str: `
                in float myOpacity;
            \n`
        },
        {
            type: `fragment`,
            precedes: `	#include <normal_fragment_maps>`,
            str: `
                diffuseColor.a = myOpacity;
            `,
        },
    ]

    let mat = new THREE.MeshPhong2Material({
        transparent: true,
        opacity: 1.,
        // side:THREE.DoubleSide,
    })
    mat.injections = matInjections

    let viz = new DqViz(0xFF0000, false, false)

    const geo = new THREE.BoxGeometry(1., 1., 1., 32, 1, 1)
    log(geo)
    geo.translate(.5,.5,.5)
    const m = new THREE.Mesh(geo,mat)
    scene.add(m)

    let rotationPart = new Dq()
    let translationPart = new Dq()

    updateExperiment = () => {

        dq0.zero()
        e13.multiplyScalar(
            3.*Math.cos(frameCount * .01),
            dq3).exp(dq0)
        dq1.zero()
        dq1[0] = 1.
        dq1[2] = -.2 * Math.sin(frameCount*.007)
        dq0.mul(dq1, viz.dq)
        
        if(viz.dq[7]<0.)
            mat.side = THREE.BackSide
        else
            mat.side = THREE.FrontSide

        // e13.projectOn(comfortableLookPos(fl0, 0.2), dq0).multiplyScalar(.7, dq0).exp(viz.dq)
        viz.markupPos[5] = .9
        viz.markupPos[6] = -.15

        viz.dq.invariantDecomposition(rotationPart, translationPart)
        rotationPart.logarithm(mat.dq)
        translationPart.logarithm(dq0).translationLogToGibbsVec(mat.extraVec3)
        // //gonna send in rotation axis
        // //multiply it by angle * e0123*distance
        // //yeah great except it might be a translation

        viz.markupPos.pointToGibbsVec(mat.extraVec1)
        let annulusRadius = .06
        if (rotationPart.equals(oneDq)) {
            mat.extraVec2.subVectors(
                viz.trnAxisMesh.position, //need to move this
                mat.extraVec1
            )
            mat.extraVec2.setLength(annulusRadius)
        }
        else {
            viz.markupPos.projectOn(rotationPart.selectGrade(2, dq0), fl1).pointToGibbsVec(v1)
            mat.extraVec2.subVectors(
                v1,
                mat.extraVec1)
            let currentLength = mat.extraVec2.length()
            if (currentLength > annulusRadius)
                mat.extraVec2.setLength(annulusRadius)
        }

    }

    camera.position.z += .3
    camera.position.y += .3
}