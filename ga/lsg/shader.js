/*
    Goal is to render ePlus, properly. Can transform into a hyperboloid
    Send in pss
    With pixel, create ray... wedge with 1-vector

    Pretty likely that point pairs are a separate pass, I mean they're only in one place

    A thing that MIGHT work is to use your norms-ratio approach to get a "distance"
    Yes it's a bizarre distance and it's in minkowski space. It MIGHT work.

    Hey, could even work for Todd Ell
 */

function initShader() {

    let mat = new THREE.MeshPhong2Material({transparent: true, opacity: .9})
    mat.injections = [
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
                in vec4 vPos;
            \n` + basis123.prefix
        },
        {
            type: `fragment`,
            precedes: `	#include <dithering_fragment>`,
            str: `
                // if(length(vPos) < 1.11)
                //     gl_FragColor.r = 0.;
                
                float[8] rayDq;
                float[BIV_LEN] ray123;
                float[20] pp;
                float[6] renderedObj;
                renderedObj[0] = extraVec1[0]; renderedObj[1] = extraVec1[1]; renderedObj[2] = extraVec1[2]; renderedObj[3] = extraVec1[3];
                renderedObj[4] = extraVec2[0]; renderedObj[5] = extraVec2[1];

                joinPt( cameraPosition, vPos, rayDq );
                dqToBiv( rayDq, ray123 );

                unaMeetBivec( renderedObj, ray123, pp ); //unavec meets bivec to get trivec
                vec3 v1, v2;
                // float debugOutput = 
                    ppToGibbsVecs( pp, v1, v2 );
                // gl_FragColor.rgb = vec3( 0., debugOutput, 0. );
                // gl_FragColor.rgb = vec3( 1.,.5,0. );

                vec3 oneToUse = distance(v1, cameraPosition) < distance(v2,cameraPosition) ? v1 : v2;

                if( v1 == vec3(999.,999.,999.) && v2 == vec3(999.,999.,999.) )
                    gl_FragColor = vec4( 0.,0.,0.,0. );
                else
                    gl_FragColor = vec4( 1.,.5,0., gl_FragColor.a );

                //sooooo, normal
                //in CGA, any sphere defines a scaling from its center toward the point at infinity

            \n`
        },
    ]
    // let comparison = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), new THREE.MeshBasicMaterial({transparent:true, opacity:.1}))
    // scene.add(comparison)

    // let mesh = new THREE.Mesh( new THREE.BoxGeometry(1.2,1.2,1.2), mat )
    // mesh.position.y += .8
    // scene.add(mesh)
    // comparison.position.copy(mesh.position)

    let gluedToFace = new THREE.Mesh(new THREE.PlaneGeometry(.5,.5), mat)
    gluedToFace.position.z = -camera.near * 2.
    scene.add(camera)
    camera.add(gluedToFace)

    let renderedObj = new Unavec()
    gluedToFace.onBeforeRender = () => {

        let angle = frameCount * .004
        _ep.addScaled(_em, -.8, tw1).cast(renderedObj)
        // tw1.multiplyScalar(Math.cos(angle), tw0).addScaled(_e2, Math.sin(angle), tw1).cast(renderedObj)

        mat.extraVec1.set(renderedObj[0], renderedObj[1], renderedObj[2], renderedObj[3]) //e1
        mat.extraVec2.set(renderedObj[4], renderedObj[5], 0., 0.)    
    }
}