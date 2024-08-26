updateDisplay = () => {}

function initGrade1Shader() {

    mat = new THREE.MeshPhong2Material({transparent: true, opacity: 1./*.55*/})
    mat.injections = [
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
            str: cgaGlsl + `
                uniform vec4 extraVec1;
                uniform vec4 extraVec2;
                uniform vec4 extraVec3;
                uniform float floats[`+ NUM_FLOATS_PHONG2 +`];

                in vec3 cameraRayDirVec3;

                void dopToVec3( in float odd[16], out vec3 v) {
                    v.x = -.5 * (odd[11] + odd[12]);
                    v.y =  .5 * (odd[8] + odd[9]);
                    v.z = -.5 * (odd[6] + odd[7]);
                }

                void vec3ToDop( in vec3 v, out float odd[16]) {
                    for(int i = 0; i < 16; ++i)
                        odd[i] = 0.;
                    odd[11] = -v.x; odd[12] = -v.x;
                    odd[ 8] =  v.y; odd[ 9] =  v.y;
                    odd[ 6] = -v.z; odd[ 7] = -v.z;
                }
            `
        },
        {
            type: `fragment`,
            precedes: `	#include <normal_fragment_maps>`,
            str: `

                // diffuseColor = vec4( cameraRayDirVec3,.55 );

                float cameraPosZrs[16];
                float renderedUna[16];
                for(int i = 0; i < 5; ++i) {
                    cameraPosZrs[i] = floats[i];
                    renderedUna[i] = floats[i+5];
                }

                float e12345[16];
                e12345[15] = 1.;
                float e123[16];
                e123[5] = 1.;
                float e0[16];
                e0[3] = 1.; e0[4] = 1.;
                float e1230[16];
                e1230[11] = 1.; e1230[12] = 1.;

                float cameraRayDirDop[16]; vec3ToDop(cameraRayDirVec3, cameraRayDirDop);
                float cameraRayBiv[16]; oddInnerOdd( cameraPosZrs, cameraRayDirDop, cameraRayBiv );

                float pp[16]; evenMeetOdd( cameraRayBiv, renderedUna, pp );
                float projector[16]; oddInnerOdd( pp, e12345, projector );
                float bivSq = evenInnerSelf( projector );

                float e1234[16]; e1234[11] = 1.;
                float projectable[16];
                evenRegressiveEven(projector,e1234,projectable);

                float factor = .5 / sqrt(bivSq);
                for(int i = 0; i < 16; ++i)
                    projector[i] *= factor;
                projector[0] = .5;

                vec3 outOfSightVec3 = vec3(999.,999.,999.);
                float bireflection[16]; bireflection[0] = .5;
                float zrSphere[16];
                float zrCircle[16];
                float posDop[16];
                float dop0[16];
                vec3 diffs[2];
                vec3 normalVec3s[2];
                float tangentPlane[16];
                bool visibilities[2];
                vec3 posVec3s[2];
                for(int i = 0; i < 2; ++i) { //TODO CHANGE BACK TO 2

                    oddMulEven( projectable, projector, zrSphere );
                    for(int i = 1; i < 16; ++i)
                        projector[i] *= -1.;

                    oddMeetOdd( zrSphere, renderedUna, zrCircle );
                    evenInnerOdd( zrCircle, e0, tangentPlane );

                    //IT IS A HACK THAT YOU HAVE MINUS SIGNS IN THE TANGENTPLANE AND THINGY

                    //position
                    oddMeetEven(tangentPlane, cameraRayBiv, posDop);
                    for( int j = 0; j < 16; ++j )
                        posDop[i] /= posDop[5];
                    posDop[5] = 0.;
                    dopToVec3(posDop, posVec3s[i]);

                    //normal
                    normalVec3s[i] = vec3(tangentPlane[0],tangentPlane[1],tangentPlane[2]);

                    float eps = .001;
                    bool isE0Multiple = zrSphere[3] != 0. && abs(zrSphere[3] - zrSphere[4])<eps && abs(zrSphere[0]) < eps && abs(zrSphere[1]) < eps && abs(zrSphere[2]) < eps && abs(zrSphere[5]) < eps;
                    
                    diffs[i] = posVec3s[i] - cameraPosition;
                    visibilities[i] = dot( cameraRayDirVec3, diffs[i] ) > 0. && !isE0Multiple;
                }

                bool visible = bivSq > 0. && (visibilities[0] || visibilities[1]);
                diffuseColor.a = visible ? 1.: 0.;

                int oneToUse = 
                    visibilities[0] && !visibilities[1] ? 0 :
                    visibilities[1] && !visibilities[0] ? 1 :
                    dot( diffs[0], diffs[0] ) < dot( diffs[1], diffs[1] ) ? 0:1;

                diffuseColor.rgb = vec3(0.,0.,0.);
                diffuseColor.r = posVec3s[oneToUse].y;
                normal = vec3(0.,1.,0.);

                // diffuseColor = vec4(visibilities[0] ? 1.:0., visibilities[1] ? 1.:0.,0.,1.);
                // diffuseColor.rgb = normalVec3s[oneToUse];
                // diffuseColor.rgb = vec3(1.,0.,0.);
                // diffuseColor.rgb = posVec3s[oneToUse];
                // normal = vec3(posVec3s[oneToUse][0],posVec3s[oneToUse][1],posVec3s[oneToUse][2]);

                // vec3 unnormalized = cross( dFdx(posVec3s[oneToUse]), dFdy(posVec3s[oneToUse]));
                // normal = normalize(unnormalized);

                // normal = normalize(normalVec3s[oneToUse]);

            \n`
        },
    ]

    //glued to face
    let mesh = new THREE.Mesh(new THREE.PlaneGeometry(.5,.5), mat)
    mesh.position.z = -camera.near * 2.
    scene.add(camera)
    camera.add(mesh)

    for (let i = 0; i < 5; ++i)
        mat.floats[i+5] = _e4[i]

    return mat
}