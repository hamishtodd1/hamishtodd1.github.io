/*
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

    let mat = new THREE.MeshPhong2Material({transparent: true, opacity: 1./*.55*/})
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
            str: egaVerboseGlsl + egaGlsl + basis1t2.prefix + `
                uniform vec4 extraVec1;
                uniform vec4 extraVec2;
                uniform vec4 extraVec3;
                uniform float floats[`+ NUM_FLOATS_PHONG2 +`];

                in vec4 vPos;
                bool validAndInBox(in vec3 v) {
                    vec3 limitsLower = vec3(floats[0],floats[1],floats[2]);
                    vec3 limitsUpper = vec3(floats[3],floats[4],floats[5]);
                    return v != vec3(999.,999.,999.) &&
                           all(lessThan(v, limitsUpper )) &&
                           all(greaterThan(v, limitsLower ));
                }

                vec3 intersectUnavec(in float[BIV_LEN] ray123, in float[6] renderedObj) {

                    float[20] pp;
                    unaMeetBivec( renderedObj, ray123, pp ); //unavec meets bivec to get trivec
                    vec3 gibbsVec1, gibbsVec2;
                    ppToGibbsVecs( pp, gibbsVec1, gibbsVec2 );

                    vec3 betterGibbsVec = vec3(999.,999.,999.);
                    bool valid1 = validAndInBox(gibbsVec1);
                    bool valid2 = validAndInBox(gibbsVec2);
                    vec3 closer = distance(gibbsVec1, cameraPosition) < distance(gibbsVec2,cameraPosition) ? gibbsVec1 : gibbsVec2;
                    betterGibbsVec =
                        valid1 && valid2  ? closer :
                        valid1 && !valid2 ? gibbsVec1 :
                        !valid1 && valid2 ? gibbsVec2 :
                        vec3(999.,999.,999.);
                    
                    return betterGibbsVec;
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
                float[BIV_LEN] ray123;
                dqToBiv( rayDq, ray123 );

                float[6] renderedObj;
                renderedObj[0] = extraVec1[0]; renderedObj[1] = extraVec1[1]; renderedObj[2] = extraVec1[2];
                renderedObj[3] = extraVec1[3]; renderedObj[4] = extraVec2[0]; renderedObj[5] = extraVec2[1];

                vec3 betterGibbsVec = intersectUnavec(ray123, renderedObj);

                vec3 unnormalized = cross(dFdx(betterGibbsVec), dFdy(betterGibbsVec));
                normal = normalize(unnormalized);
                
                if( betterGibbsVec == vec3(999.,999.,999.) || unnormalized == vec3(0.) )
                    diffuseColor = vec4( 0.,0.,0.,0. );
                else
                    diffuseColor = vec4( 1.,.5,0., diffuseColor.a );

            \n`
        },
    ]
    
    //glued to face
    let mesh = new THREE.Mesh(new THREE.PlaneGeometry(.5,.5), mat)
    mesh.position.z = -camera.near * 2.
    scene.add(camera)
    camera.add(mesh)

    {
        // let boxGeo = new THREE.BoxGeometry(
        //     limitsUpper.x - limitsLower.x,
        //     limitsUpper.y - limitsLower.y,
        //     limitsUpper.x
        // )

        // var mesh = new THREE.Mesh(boxGeo,mat)
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

    let renderedObj = new Unavec()
    mesh.onBeforeRender = () => {

        //bog standard conformal transformation around a circle
        let angle = frameCount * .004
        _ep.addScaled(_em, -.8, tw1).cast(renderedObj)
        // tw1.multiplyScalar(Math.cos(angle), tw0).addScaled(_e2, Math.sin(angle), tw1).cast(renderedObj)

        //twistor?
        // oneTw.addScaled(_e1t, 0., tw0)
        // tw0.sandwich(_e1, tw1).cast(renderedObj)
        // _e2.cast(renderedObj)
        // renderedObj.log()

        //glooping hyperboloids
        // let t = 0.4//.5 + .5*Math.sin(.001-frameCount*.00001)
        // tw0.zero()
        // tw0.addScaled(_ep, 1.-t, tw0)
        // tw0.addScaled(_em, -t, tw0)
        // tw0.cast(renderedObj)

        mat.extraVec1.set(renderedObj[0], renderedObj[1], renderedObj[2], renderedObj[3]) //e1
        mat.extraVec2.set(renderedObj[4], renderedObj[5], 0., 0.)
        limitsLower.toArray(mat.floats, 0)
        limitsUpper.toArray(mat.floats, 3)
    }
}