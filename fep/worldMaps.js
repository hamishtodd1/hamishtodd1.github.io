function updateWorldMaps() { }
function initWorldMaps() {
    
    let axis = v1.set(5., 0., 5.).normalize()
    // let l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0., -999., 0.), new THREE.Vector3(0., 999., 0.)]), new THREE.LineBasicMaterial({ color: 0x0000ff }))
    // scene.add(l)
    // l.quaternion.setFromUnitVectors(yUnit, axis)

    mapProjection = { value: 5 }
    updateWorldMaps = () => {
        if (greenland === null || earth === null)
            return

        // if(frameCount % 450 === 0) {
        //     mapProjection.value += 1
        //     if(mapProjection.value > 3)
        //         mapProjection.value = 2
        // }

        let q = greenland.material.uniforms.quat.value
        q1.setFromAxisAngle(axis, Math.PI / 3. + TAU * frameCount * .4 / 450.)
        q.copy(q1)
    }

    let earthVert = `
                uniform mat4 bivMat4;

                out vec2 vUv;

                #define PI 3.1415926535897932384626433832795

                uniform vec4 quat;
                uniform int mapProjection;

                // Complex number operations
                vec2 complex_mul(vec2 a, vec2 b) {
                    return vec2(a.x * b.x - a.y * b.y,
                                a.x * b.y + a.y * b.x);
                }

                vec2 complex_div(vec2 a, vec2 b) {
                    float denom = b.x * b.x + b.y * b.y;
                    return vec2(a.x * b.x + a.y * b.y,
                                a.y * b.x - a.x * b.y) / denom;
                }

                // Jacobi elliptic functions approximation
                vec2 sn_cn_dn(float u, float k) {
                    // This is a simplified approximation
                    float sn = sin(u);
                    float cn = cos(u);
                    float dn = sqrt(1.0 - k * k * sn * sn);
                    return vec2(sn, cn);
                }

                vec3 applyQuaternion(in vec3 v, in vec4 q) {
                    float ix = q.w * v.x + q.y * v.z - q.z * v.y;
                    float iy = q.w * v.y + q.z * v.x - q.x * v.z;
                    float iz = q.w * v.z + q.x * v.y - q.y * v.x;
                    float iw = -q.x * v.x - q.y * v.y - q.z * v.z;

                    vec3 ret;
                    ret.x = ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y;
                    ret.y = iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z;
                    ret.z = iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x;
                    return ret;
                }

                void main (void) {

                    vUv = uv;

                    vec3 pos;
                    float lon = PI * position.x;
                    float lat = PI * position.y;

                    // globe
                    vec3 globePos;
                    globePos.y = sin(lat);
                    globePos.x = cos(lat) * sin(lon);
                    globePos.z = cos(lat) * cos(lon);

                    vec3 rotated = applyQuaternion(globePos,quat);
                    lon = atan(rotated.x, rotated.z);
                    lat = asin(rotated.y);

                    if(mapProjection == 0) {
                        pos = rotated;
                    }

                    //equirectangular
                    if(mapProjection == 1) {
                        pos.z = 0.;
                        pos.x = lon;
                        pos.y = lat;
                    }

                    // mercator
                    if(mapProjection == 2) {
                        pos.x = lon;
                        pos.y = log( tan( PI / 4. + lat / 2. ) );
                        pos.z = 0.;
                        float max = 3.;
                        if( abs(pos.y) > max )
                            pos.y = sign(pos.y) * max;
                        pos *= .5;
                    }

                    // azimuthal equal area
                    if(mapProjection == 3) {
                        float lat0 = PI/2.;
                        float k = sqrt(2./(1.+sin(lat0)*sin(lat)+cos(lat0)*cos(lat)*cos(lon)));
                        float max = 100.;
                        if(k > max)
                            k = max;
                        pos.x = k * cos(lat) * sin(lon);
                        pos.y = k * (cos(lat0)*sin(lat) - sin(lat0)*cos(lat)*cos(lon));
                        pos.z = 0.;
                        pos *= .7;
                    }

                    //peirce
                    if(mapProjection == 4) {
                        // Convert to complex plane
                        vec2 z = vec2(
                            cos(lat) * cos(lon),
                            cos(lat) * sin(lon)
                        );

                        // Stereographic projection from north pole
                        float k = tan(lat/2.0 + 3.14159265359/4.0);
                        z = complex_div(
                            vec2(1.0, 0.0) + z,
                            vec2(1.0, 0.0) - z
                        );

                        // Apply elliptic function transformation
                        vec2 w = sn_cn_dn(atan(z.y, z.x), k).xy;

                        // Scale and translate to final square
                        w = (w + 1.0) * 0.5; // Map from [-1,1] to [0,1]
                        pos.xy = w;
                        pos.z = 0.;
                    }

                    //azimuthal equidistant
                    {
                        float lat0 = PI/2.;
                        float d = acos(sin(lat0)*sin(lat)+cos(lat0)*cos(lat)*cos(lon));
                        float k = d / sin(d);
                        pos.x = k * cos(lat) * sin(lon);
                        pos.y = k * (cos(lat0)*sin(lat) - sin(lat0)*cos(lat)*cos(lon));
                        pos.z = 0.;
                        pos *= .6;
                    }
                
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
                    gl_PointSize = 3.5;
                }`
    let earthFrag = `
                precision highp float;

                in vec2 vUv;
                uniform sampler2D map;

                void main (void) {

                    vec2 uv = vUv;

                    gl_FragColor = texture2D( map, uv );
                }`

    let greenland = null
    let earth = null
    let geo = new THREE.PlaneGeometry(2., 1., 512, 512)
    new THREE.TextureLoader().load('https://hamishtodd1.github.io/fep/data/earthOutline.png', map => {

        let mat = new THREE.ShaderMaterial({
            transparent: true,
            uniforms:
            {
                map: { value: map },
                quat: { value: new THREE.Vector4() },
                mapProjection
            },
            vertexShader: earthVert,
            fragmentShader: earthFrag
        });
        mat.uniforms.quat.value.set(0., 0., 0., 1.)
        earth = new THREE.Mesh(geo, mat)
        scene.add(earth)
    })

    // new THREE.TextureLoader().load('https://hamishtodd1.github.io/fep/data/greenland.png', map => {

    //     let mat = new THREE.ShaderMaterial({
    //         transparent: true,
    //         uniforms:
    //         {
    //             map: { value: map },
    //             quat: { value: new THREE.Vector4() },
    //             mapProjection
    //         },
    //         vertexShader: earthVert,
    //         fragmentShader: earthFrag
    //     });
    //     mat.uniforms.quat.value.set(0., 0., 0., 1.)
    //     greenland = new THREE.Mesh(geo, mat)
    //     scene.add(greenland)
    //     greenland.position.z = .02
    // })

    let spotGeo = new THREE.SphereGeometry(.016)
    for(let i = 0; i < weddingData.length / 2; ++i) { 
        let spot = new THREE.Mesh(spotGeo, new THREE.MeshBasicMaterial({ color: 0xff0000 }))
        scene.add(spot)

        let lat = weddingData[i * 2] * Math.PI / 180.
        let lon = weddingData[i * 2 + 1] * Math.PI / 180.

        let pos = spot.position
        {
            let lat0 = Math.PI / 2.;
            let d = Math.acos(Math.sin(lat0) * Math.sin(lat) + Math.cos(lat0) * Math.cos(lat) * Math.cos(lon));
            let k = d / Math.sin(d);
            pos.x = .6 * k * Math.cos(lat) * Math.sin(lon);
            pos.y = .6 * k * (Math.cos(lat0) * Math.sin(lat) - Math.sin(lat0) * Math.cos(lat) * Math.cos(lon));
            pos.z = 0.;
        }
    }
}

// let weddingData = [
//     35.641662, 139.769279,
//     41.353676, 2.178857,
//     43.472731, 5.210011,
//     48.127993, 11.577923,
//     48.219988, -2.831188,
//     48.859017, 2.335184,
//     49.513356, 3.835002,
//     50.436565, -104.615205,
//     51.251535, -0.143348,
//     51.337057, -0.364519,
//     51.356205, -0.470535,
//     51.463026, -2.631284,
//     51.507717, -0.118954,
//     51.654612, 0.819422,
//     51.696911, 0.727709,
//     51.742198, 0.690139,
//     52.073084, 0.583992,
//     52.212512, 0.120120,
//     52.332619, -0.076488,
//     52.394059, 0.268199,
//     52.923337, -1.491600,
//     52.923522, -1.472429,
//     53.482178, -2.251885,
//     53.856335, -1.766660,
//     54.158753, -4.467326,
//     54.616032, -5.914004,
//     55.051160, -1.445771,
//     55.622363, 12.986120,
//     55.941532, -3.056444,
//     55.946778, -3.162601,
//     51.589808, 0.190250,
//     51.463745, -0.951860,
//     52.050812, 1.157639,
//     50.084606, 14.411776,
//     51.617126, 0.511961,
//     52.281634, 0.059784,
//     -34.558362, -58.383939
// ]