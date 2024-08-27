//to get the position/rotation/scale of a sphere
//reflect e1230 in the sphere


updateDisplay = () => {}

function initGrade1Shader() {

    let spheres = [
        _e1,
        _e2,
        _e3,
        _e4,
        _e4.addScaled(_e2,1.,new Odd()),
    ]

    let sGeo = new THREE.SphereGeometry(1.,64,32)
    let pGeo = new THREE.PlaneGeometry(1.,1.)
    let h = 4.
    let w = 5.
    let clippingPlanes = [
        new THREE.Plane(new THREE.Vector3( 0, 0, 1), w*.5),
        new THREE.Plane(new THREE.Vector3( 0, 0,-1), w*.5),
        new THREE.Plane(new THREE.Vector3( 0, 1, 0), h*.5),
        new THREE.Plane(new THREE.Vector3( 0,-1, 0), h*.5),
        new THREE.Plane(new THREE.Vector3( 1, 0, 0), w*.5),
        new THREE.Plane(new THREE.Vector3(-1, 0, 0), w*.5),
    ]

    let mrh = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(  w/2.,  h/2.,  w/2.), new THREE.Vector3(  w/2., -h/2.,  w/2.),
        new THREE.Vector3(  w/2., -h/2.,  w/2.), new THREE.Vector3( -w/2., -h/2.,  w/2.),
        new THREE.Vector3( -w/2., -h/2.,  w/2.), new THREE.Vector3( -w/2.,  h/2.,  w/2.),
        new THREE.Vector3( -w/2.,  h/2.,  w/2.), new THREE.Vector3(  w/2.,  h/2.,  w/2.),

        new THREE.Vector3(  w/2.,  h/2., -w/2.), new THREE.Vector3(  w/2., -h/2., -w/2.),
        new THREE.Vector3(  w/2., -h/2., -w/2.), new THREE.Vector3( -w/2., -h/2., -w/2.),
        new THREE.Vector3( -w/2., -h/2., -w/2.), new THREE.Vector3( -w/2.,  h/2., -w/2.),
        new THREE.Vector3( -w/2.,  h/2., -w/2.), new THREE.Vector3(  w/2.,  h/2., -w/2.),

        new THREE.Vector3(  w/2.,  h/2.,  w/2.), new THREE.Vector3(  w/2.,  h/2., -w/2.),
        new THREE.Vector3(  w/2., -h/2.,  w/2.), new THREE.Vector3(  w/2., -h/2., -w/2.),
        new THREE.Vector3( -w/2.,  h/2.,  w/2.), new THREE.Vector3( -w/2.,  h/2., -w/2.),
        new THREE.Vector3( -w/2., -h/2.,  w/2.), new THREE.Vector3( -w/2., -h/2., -w/2.),
    ])
    a = new THREE.LineSegments(mrh, new THREE.LineBasicMaterial({color: 0xFFFFFF}))
    scene.add(a)
    
    class SphereViz extends THREE.Group{
        constructor(color) {
            super()

            let frontMat = new THREE.MeshPhongMaterial({ 
                color, 
                clippingPlanes,
                clipShadows: true,
                side: THREE.FrontSide,
                transparent: true,
                opacity: .75,
            })
            let backMat = new THREE.MeshPhongMaterial({
                color: color * .8,
                clippingPlanes,
                clipShadows: true,
                side: THREE.BackSide,
                transparent: true,
                opacity: .75,
            })

            this.sphereGroup = new THREE.Group()
            this.sphereGroup.add(new THREE.Mesh(sGeo, frontMat), new THREE.Mesh(sGeo, backMat))
            // this.sphereGroup.castShadow = true
            this.add(this.sphereGroup)

            this.planeGroup = new THREE.Group()
            this.planeGroup.add(new THREE.Mesh(pGeo, frontMat), new THREE.Mesh(pGeo, backMat))
            // this.planeGroup.castShadow = true
            this.planeGroup.scale.setScalar(999.)
            this.add(this.planeGroup)

            this.setFromSphere(_e5)
        }

        setFromSphere(sphere) {
            
            let isHyperIdeal = sphere.inner(sphere, even0) < 0.
            let isPlane = sphere.meet(_e1230, odd0)[15] === 0.

            if (isHyperIdeal) {
                this.sphereGroup.visible = false
                this.planeGroup.visible = false
            }
            else if (isPlane) {
                this.sphereGroup.visible = false
                this.planeGroup.visible = true

                _e123.projectOn(sphere, odd0).flatPointToVec3(this.planeGroup.position)
                sphere.mulReverse(_e3, even0).toQuaternion(this.planeGroup.quaternion)
                getSqrtQuaternion(this.planeGroup.quaternion, this.planeGroup.quaternion)
            }
            else {
                this.sphereGroup.visible = true
                this.planeGroup.visible = false
                let radius = sphere.getSpherePositionVec3AndRadius(this.sphereGroup.position)
                this.sphereGroup.scale.setScalar(radius)
            }
        }
    }

    let svs = [
        new SphereViz(0xFF0000),
        new SphereViz(0x0000FF),
        new SphereViz(0x00FF00),
        new SphereViz(0x00FFFF),
        new SphereViz(0xFFFF00)
        //TODO viridis
    ]
    svs.forEach(sv=>scene.add(sv))
    svs.forEach((sv,i)=>sv.setFromSphere(spheres[i]))


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

                float e12345[16]; e12345[15] = 1.;
                float e123[16]; e123[5] = 1.;
                float e0[16]; e0[3] = 1.; e0[4] = 1.;
                float e1230[16]; e1230[11] = 1.; e1230[12] = 1.;

                // diffuseColor = vec4( cameraRayDirVec3,.55 );

                float cameraPosZrs[16];
                for(int i = 0; i < 5; ++i)
                    cameraPosZrs[i] = floats[i];
                
                vec3 cols[`+spheres.length+`];
                cols[0] = vec3(1.,0.,0.);
                // cols[1] = vec3(0.,0.,1.);

                diffuseColor = vec4(0.,0.,0.,0.);

                float e1234[16]; e1234[11] = 1.;
                float projectable[16];
                
                float renderedUna[16];
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
                bool collisions[`+spheres.length+`]; //ugh it has no idea which side you were on
                normal = vec3(0.,1.,0.);
                for(int i = 0; i < `+ spheres.length + `; ++i) {

                    for(int j = 0; j < 16; ++j)
                        renderedUna[j] = 0.;
                    for(int j = 0; j < 5; ++j) {
                        renderedUna[j] = floats[5*(i+1)+j];
                    }

                    

                    float cameraRayDirDop[16]; vec3ToDop(cameraRayDirVec3, cameraRayDirDop);
                    float cameraRayBiv[16]; oddInnerOdd( cameraPosZrs, cameraRayDirDop, cameraRayBiv );

                    float pp[16]; evenMeetOdd( cameraRayBiv, renderedUna, pp );
                    float projector[16]; oddInnerOdd( pp, e12345, projector );
                    float bivSq = evenInnerSelf( projector );

                    if(bivSq >= 0.) {
                        diffuseColor.a = 1.;
                        diffuseColor.rgb += cols[i];
                        
                    }

                    evenRegressiveEven( projector, e1234, projectable );

                    float factor = .5 / sqrt(bivSq);
                    for(int i = 0; i < 16; ++i)
                        projector[i] *= factor;
                    projector[0] = .5;

                    // for(int i = 0; i < 2; ++i) { //TODO CHANGE BACK TO 2

                    //     oddMulEven( projectable, projector, zrSphere ); //zrSphere seems fine
                    //     for(int i = 1; i < 16; ++i)
                    //         projector[i] *= -1.;

                    //     oddMeetOdd( zrSphere, renderedUna, zrCircle );
                    //     evenInnerOdd( zrCircle, e0, tangentPlane );

                    //     diffuseColor.rgba = vec4(
                    //         abs(tangentPlane[1]),
                    //         abs(tangentPlane[3]),
                    //         abs(tangentPlane[4]),
                    //         1.
                    //     );

                    //     //IT IS A HACK THAT YOU HAVE MINUS SIGNS IN THE TANGENTPLANE AND THINGY

                    //     // //position
                    //     oddMeetEven(tangentPlane, cameraRayBiv, posDop);
                    //     // for( int j = 0; j < 16; ++j )
                    //     //     posDop[i] /= posDop[5];
                    //     // posDop[5] = 0.;
                    //     // dopToVec3(posDop, posVec3s[i]);

                    //     // //normal
                    //     // normalVec3s[i] = vec3(tangentPlane[0],tangentPlane[1],tangentPlane[2]);

                    //     // float eps = .001;
                    //     // bool isE0Multiple = zrSphere[3] != 0. && abs(zrSphere[3] - zrSphere[4])<eps && abs(zrSphere[0]) < eps && abs(zrSphere[1]) < eps && abs(zrSphere[2]) < eps && abs(zrSphere[5]) < eps;
                        
                    //     // diffs[i] = posVec3s[i] - cameraPosition;
                    //     // visibilities[i] = dot( cameraRayDirVec3, diffs[i] ) > 0. && !isE0Multiple;
                    // }

                    // bool visible = bivSq > 0. && (visibilities[0] || visibilities[1]);
                    // diffuseColor.a = visible ? 1.: 0.;

                    // int oneToUse = 
                    //     visibilities[0] && !visibilities[1] ? 0 :
                    //     visibilities[1] && !visibilities[0] ? 1 :
                    //     dot( diffs[0], diffs[0] ) < dot( diffs[1], diffs[1] ) ? 0:1;

                    // diffuseColor.rgb = vec3(0.,0.,0.);
                    // diffuseColor.r = posVec3s[oneToUse].y;
                    // normal = vec3(0.,1.,0.);

                    // // diffuseColor = vec4(visibilities[0] ? 1.:0., visibilities[1] ? 1.:0.,0.,1.);
                    // // diffuseColor.rgb = normalVec3s[oneToUse];
                    // // diffuseColor.rgb = vec3(1.,0.,0.);
                    // // diffuseColor.rgb = posVec3s[oneToUse];
                    // // normal = vec3(posVec3s[oneToUse][0],posVec3s[oneToUse][1],posVec3s[oneToUse][2]);

                    // // vec3 unnormalized = cross( dFdx(posVec3s[oneToUse]), dFdy(posVec3s[oneToUse]));
                    // // normal = normalize(unnormalized);

                    // // normal = normalize(normalVec3s[oneToUse]);
                    
                    
                }

            \n`
        },
    ]

    //glued to face
    let mesh = new THREE.Mesh(new THREE.PlaneGeometry(.5,.5), mat)
    mesh.position.z = -camera.near * 2.
    scene.add(camera)
    // camera.add(mesh) //does that mean you're in a space where the camera is at the origin?

    spheres.forEach((s,i)=>{
        for (let j = 0; j < 5; ++j)
            mat.floats[5 + 5*i + j] = s[j]
    })

    return mat
}