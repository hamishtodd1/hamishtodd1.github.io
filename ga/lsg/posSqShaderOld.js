/*
    Need to make it so you can see e1! And check et and e1+et

    Move mouse around, can make 1-vectors
    e1 et ep em
    Make a series of 4


    Goal is to render ePlus, properly. Can transform into a hyperboloid
    Send in pss
    With pixel, create ray... wedge with 1-vector

    Pretty likely that point pairs are a separate pass, I mean they're only in one place

    A thing that MIGHT work is to use your norms-ratio approach to get a "distance"
    Yes it's a bizarre distance and it's in minkowski space. It MIGHT work.

    Hey, could even work for Todd Ell
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
            str: egaVerboseGlsl + egaGlsl + basis1t2.prefix + `
                uniform vec4 extraVec1;
                uniform vec4 extraVec2;
                uniform vec4 extraVec3;
                uniform float floats[`+ NUM_FLOATS_PHONG2 +`];

                in vec4 vPos;
                bool validAndInBox(in vec3 v) {

                    return v != vec3(999.,999.,999.) &&
                           all(lessThan(v, extraVec2.xyz )) &&
                           all(greaterThan(v, extraVec1.xyz ));
                }

                float lengthSq(in vec3 v) {
                    return dot(v,v);
                }

                float intersectUnavec(in float[BIV_LEN] rayBiv, in float[6] renderedObj, out vec3 target) {

                    float[20] pp;
                    unaMeetBivec( renderedObj, rayBiv, pp ); //unavec meets bivec to get trivec
                    vec3 vec31, vec32;
                    float ret = ppToVec3s( pp, vec31, vec32 );

                    bool valid1 = validAndInBox(vec31);
                    bool valid2 = validAndInBox(vec32);
                    vec3 closer = distance(vec31, cameraPosition) < distance(vec32,cameraPosition) ? vec31 : vec32;
                    target =
                        valid1 && valid2  ? closer :
                        valid1 && !valid2 ? vec31 :
                        !valid1 && valid2 ? vec32 :
                        vec3(999.,999.,999.);
                    
                    return ret;
                }
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
                // rayDq[0] = 0.; rayDq[1] = 0.; rayDq[2] = 0.; rayDq[3] = 0.; rayDq[4] = 0.; rayDq[5] = 1.; rayDq[6] = 0.; rayDq[7] = 0.;
                float[BIV_LEN] rayBiv;
                dqToBiv( rayDq, rayBiv );

                //You were trying to figure out why tf et isn't visible

                // float[6] renderedObj;
                // for(int j = 0; j < 6; ++j)
                //     renderedObj[j] = floats[j];
                // vec3 betterVec3 = intersectUnavec( rayBiv, renderedObj );
                
                // if( betterVec3 == vec3(0.,0.,0.) )
                //     diffuseColor = vec4( 1.,0.,0.,1. );
                // else
                //     diffuseColor = vec4( 0.,0.,1.,1. );

                vec3 bestVec3 = vec3(999.,999.,999.);
                float ret = -1.;
                for(int i = 0; i < 4; ++i) {
                    float[6] renderedObj;
                    for(int j = 0; j < 6; ++j)
                        renderedObj[j] = floats[i*6+j];

                    vec3 betterVec3;
                    ret = intersectUnavec(rayBiv, renderedObj, betterVec3);
                    if( betterVec3 != vec3(999.,999.,999.) && 
                        lengthSq(betterVec3 - cameraPosition) < lengthSq(bestVec3-cameraPosition) )
                        bestVec3 = betterVec3;
                }
                // diffuseColor = vec4( ret,1.-ret,0.,1. );

                vec3 unnormalized = cross(dFdx(bestVec3), dFdy(bestVec3));
                normal = normalize(unnormalized);
                
                if( bestVec3 == vec3(999.,999.,999.) || unnormalized == vec3(0.) )
                    diffuseColor = vec4( 0.,0.,0.,0. );
                else
                    diffuseColor = vec4( 1.,.5,0., diffuseColor.a );

            \n`
        },
    ]
    
    //glued to face
    let mesh = new THREE.Mesh(new THREE.PlaneGeometry(.5,.5), lsgMat)
    mesh.position.z = -camera.near * 2.
    scene.add(camera)
    camera.add(mesh)

    {
        // let boxGeo = new THREE.BoxGeometry(
        //     limitsUpper.x - limitsLower.x,
        //     limitsUpper.y - limitsLower.y,
        //     limitsUpper.x
        // )

        // var mesh = new THREE.Mesh(boxGeo,lsgMat)
        // scene.add(mesh)

        // const wireframeGeo = new THREE.WireframeGeometry(boxGeo);
        // const wireframeCube = new THREE.LineSegments(wireframeGeo, new THREE.LineBasicMaterial({color:0x333333}));
        // mesh.add(wireframeCube);
        // let backs = new THREE.Mesh(boxGeo, new THREE.MeshPhongMaterial({ color: 0xCCCCCC, side: THREE.BackSide }))
        // mesh.add(backs)
    }

    {
        // let eyeMat = new THREE.MeshBasicMaterial()
        // new THREE.TextureLoader().load(`data/eyeTexture.png`, (texture) => {
        //     eyeMat.map = texture
        //     eyeMat.needsUpdate = true
        // }, () => { }, (err) => { log(err) })
        // let eyeGeo = new THREE.SphereGeometry(.08)
        // eyeGeo.rotateX(TAU / 4.)
        // let eye = new THREE.Mesh(eyeGeo, eyeMat)
        // eye.rotation.y = TAU * .5
        // eye.position.z = -.3
        // scene.add(eye)
    }

    mesh.onBeforeRender = () => {

        lsgMat.extraVec1.copy(limitsLower)
        lsgMat.extraVec2.copy(limitsUpper)
    }
}