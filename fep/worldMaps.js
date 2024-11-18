function updateWorldMaps() { }
function initWorldMaps() {
    
    let axis = v1.set(5., 0., 5.).normalize()
    // let l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0., -999., 0.), new THREE.Vector3(0., 999., 0.)]), new THREE.LineBasicMaterial({ color: 0x0000ff }))
    // scene.add(l)
    // l.quaternion.setFromUnitVectors(yUnit, axis)

    mapProjection = { value: 2 }
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
    let geo = new THREE.PlaneGeometry(2., 1., 256, 256)
    new THREE.TextureLoader().load('https://hamishtodd1.github.io/fep/data/earthColor.png', map => {

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

    new THREE.TextureLoader().load('https://hamishtodd1.github.io/fep/data/greenland.png', map => {

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
        greenland = new THREE.Mesh(geo, mat)
        scene.add(greenland)
        greenland.position.z = .02
    })
}