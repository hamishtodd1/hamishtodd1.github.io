/*
    
 */

updateDisplay = () => {}
function initPosSqShader() {

    lsgMat = new THREE.MeshPhong2Material({transparent: true, opacity: 1./*.55*/})
    lsgMat.injections = [
        {
            type: `vertex`,
            precedes: ``,
            str: `
                out vec3 cameraRayDirVec3;
            \n`
        },
        {
            type: `vertex`,
            precedes: `	#include <project_vertex>`,
            str: `
                vec4 vPos4 = modelMatrix * vec4(transformed,1.);
                cameraRayDirVec3 = vPos4.xyz / vPos4.w - cameraPosition;
            `,
        },
        {
            type: `fragment`,
            precedes: ``,
            str: verbose42Glsl + `
                uniform vec4 extraVec1;
                uniform vec4 extraVec2;
                uniform vec4 extraVec3;
                uniform float floats[`+ NUM_FLOATS_PHONG2 +`];

                in vec3 cameraRayDirVec3;

                void vec3ToDop( in vec3 v, out float[TRI_LEN] dop, in float[TRI_LEN] basisDops0, in float[TRI_LEN] basisDops1, in float[TRI_LEN] basisDops2) {
                    for (int i = 0; i < TRI_LEN; ++i) {
                        dop[i] = 
                            v.x * basisDops0[i] +
                            v.y * basisDops1[i] +
                            v.z * basisDops2[i];
                    }
                }
                void dopToVec3( float[TRI_LEN] dop, out vec3 v, in float[TRI_LEN] basisDops0, in float[TRI_LEN] basisDops1, in float[TRI_LEN] basisDops2) {
                    v = vec3(0.,0.,0.);
                    for (int i = 0; i < TRI_LEN; ++i) {
                        v.x += dop[i] * basisDops0[i] * .5;
                        v.y += dop[i] * basisDops1[i] * .5;
                        v.z += dop[i] * basisDops2[i] * .5;
                    }
                }
            `
        },
        {
            type: `fragment`,
            precedes: `	#include <normal_fragment_maps>`,
            str: `

                diffuseColor = vec4( 0.3,0.3,0.3,.55 );
                // normal = vec3(0.,0.,1.);

                // these you get fed in
                float[UNA_LEN] renderedUna;
                float[TRI_LEN] originPp;
                float[PENT_LEN] pss;
                float[QUAD_LEN] truePtAtInf;
                float[UNA_LEN] cameraPosZrs;
                float[TRI_LEN] basisDops0;
                float[TRI_LEN] basisDops1;
                float[TRI_LEN] basisDops2;
                
                int start = 0;
                for(int i = 0; i < UNA_LEN; ++i)
                    renderedUna[i] = floats[i];
                start += UNA_LEN;
                for(int i = 0; i < TRI_LEN; ++i)
                    originPp[i] = floats[start + i];
                start += TRI_LEN;
                for(int i = 0; i < PENT_LEN; ++i)
                    pss[i] = floats[start + i];
                start += PENT_LEN;
                for(int i = 0; i < QUAD_LEN; ++i)
                    truePtAtInf[i] = floats[start + i];
                start += QUAD_LEN;
                for(int i = 0; i < UNA_LEN; ++i)
                    cameraPosZrs[i] = floats[start + i];
                start += UNA_LEN;
                for (int i = 0; i < TRI_LEN; ++i)
                    basisDops0[i] = floats[start + i];
                start += TRI_LEN;
                for (int i = 0; i < TRI_LEN; ++i)
                    basisDops1[i] = floats[start + i];
                start += TRI_LEN;
                for (int i = 0; i < TRI_LEN; ++i)
                    basisDops2[i] = floats[start + i];
                
                float[TRI_LEN] cameraRayDirDop;
                float[BIV_LEN] cameraRayBiv;

                float[BIV_LEN] projectorBiv;
                float[UNA_LEN] tangentPlane;
                float[UNA_LEN] zrSphere;
                float[BIV_LEN] zrCircle;
                float[TRI_LEN] dop0;
                float[TRI_LEN] unnormalizedPos;
                float[TRI_LEN] pp;
                float[BIR_LEN] bireflection;

                vec3 normalVec3s[2];
                bool visibilities[2];
                vec3 diffs[2];
                
                vec3ToDop( cameraRayDirVec3, cameraRayDirDop, basisDops0, basisDops1, basisDops2 );
                unaInnerTri( cameraPosZrs, cameraRayDirDop, cameraRayBiv );

                bivMeetUna( cameraRayBiv, renderedUna, pp );
                triInnerPent( pp, pss, projectorBiv );
                float bivSq = bivInnerSelfScalar(projectorBiv);

                float factor = .5 / sqrt(bivSq);
                for(int i = 0; i < BIV_LEN; ++i)
                    projectorBiv[i] *= factor;

                vec3 outOfSightVec3 = vec3(999.,999.,999.);
                bireflection[0] = .5;
                for(int i = 0; i < 2; ++i) {

                    for(int j = 0; j < BIV_LEN; ++j)
                        bireflection[j + 1] = i==1? projectorBiv[j] : -projectorBiv[j];
                    bireflectionSandwichUna( bireflection, cameraPosZrs, zrSphere);

                    unaMeetUna(zrSphere, renderedUna, zrCircle);
                    bivInnerE0(zrCircle, tangentPlane);

                    //IT IS A HACK THAT YOU HAVE MINUS SIGNS IN THE TANGENTPLANE AND THINGY

                    //position
                    vec3 posVec3;
                    unaInnerQuad(zrSphere, truePtAtInf, unnormalizedPos);
                    // unaMeetBiv(tangentPlane, cameraRayBiv, unnormalizedPos);
                    float factor = -1. / sqrt(abs(trivInnerSelfScalar(unnormalizedPos)));

                    // factor *= triInnerTri(unnormalizedPos, originPp) < 0. ? 1. : -1.;
                    for(int j = 0; j < TRI_LEN; ++j)
                        dop0[j] = unnormalizedPos[j] * factor - originPp[j];
                    dopToVec3(dop0, posVec3, basisDops0, basisDops1, basisDops2);

                    //normal
                    unaInnerQuad(tangentPlane, truePtAtInf, dop0); //obviously the truePtAtInf is another basis element...
                    dopToVec3(dop0, normalVec3s[i], basisDops0, basisDops1, basisDops2);
                    normalVec3s[i] *= -1.;

                    float eps = .001;
                    bool isE0Multiple = zrSphere[3] != 0. && abs(zrSphere[3] - zrSphere[4])<eps && abs(zrSphere[0]) < eps && abs(zrSphere[1]) < eps && abs(zrSphere[2]) < eps && abs(zrSphere[5]) < eps;

                    diffs[i] = posVec3 - cameraPosition;
                    visibilities[i] = 
                        dot( cameraRayDirVec3, diffs[i] ) > 0. 
                        && !isE0Multiple
                        && all(greaterThan(posVec3,extraVec1.xyz))
                        && all(   lessThan(posVec3,extraVec2.xyz));
                }

                int oneToUse = 
                    visibilities[0] && !visibilities[1] ? 0 :
                    visibilities[1] && !visibilities[0]  ? 1 :
                    dot( diffs[0], diffs[0] ) < dot( diffs[1], diffs[1] ) ? 0:1;

                if( (!visibilities[0] && !visibilities[1]) || bivSq <= 0.)
                    diffuseColor.a = 0.;

                // diffuseColor.g = visibilities[0] ? 1. : 0.;
                // diffuseColor.b = visibilities[1] ? 1. : 0.;

                normal = normalize(normalVec3s[oneToUse]);
                // diffuseColor.rgb = normal;

            \n`
        },
    ]

    //glued to face
    let mesh = new THREE.Mesh(new THREE.PlaneGeometry(.5,.5), lsgMat)
    mesh.position.z = -camera.near * 2.
    scene.add(camera)
    camera.add(mesh)
}