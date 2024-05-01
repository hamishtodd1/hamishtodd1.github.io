/*
    
 */

function initPosSqShader() {

    lsgMat = new THREE.MeshPhong2Material({transparent: true, opacity: 1./*.55*/})
    lsgMat.injections = [
        {
            type: `vertex`,
            precedes: ``,
            str: `
                out vec4 vPos;
            \n`
        },
        {
            type: `vertex`,
            precedes: `	#include <project_vertex>`,
            str: `
                vPos = modelMatrix * vec4(transformed,1.);
            `,
        },
        {
            type: `fragment`,
            precedes: ``,
            str: egaVerboseGlsl + egaGlsl + `
                uniform vec4 extraVec1;
                uniform vec4 extraVec2;
                uniform vec4 extraVec3;
                uniform float floats[`+ NUM_FLOATS_PHONG2 +`];

                in vec4 vPos;
            `
        },
        {
            type: `fragment`,
            precedes: `	#include <normal_fragment_maps>`,
            str: `
                // if(length(vPos) < 1.11)
                //     gl_FragColor.r = 0.;
                
                float[8] rayDq;
                joinPt( cameraPosition, vPos, rayDq );

                //new plan: no dq. turn vPos, cameraPos into null 1-vecs, wedge to get biv
                //wedge with 1-vec at infinity for a triv. Maybe dualize but there's a line.
                //
                //wedge with 1-vec to be displayed, now got pp

                diffuseColor = vec4( 1.,0.,0.,1. );

                normal = vec3(0.,0.,1.);

            \n`
        },
    ]

    //glued to face
    let mesh = new THREE.Mesh(new THREE.PlaneGeometry(.5,.5), lsgMat)
    mesh.position.z = -camera.near * 2.
    scene.add(camera)
    camera.add(mesh)

    mesh.onBeforeRender = () => {

        lsgMat.extraVec1.copy(limitsLower)
        lsgMat.extraVec2.copy(limitsUpper)
    }
}