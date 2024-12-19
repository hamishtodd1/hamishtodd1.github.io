function updateWorldMaps() { }
function initWorldMaps() {
    
    let axis = v1.set(5., 0., 5.).normalize()
    // let l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0., -999., 0.), new THREE.Vector3(0., 999., 0.)]), new THREE.LineBasicMaterial({ color: 0x0000ff }))
    // scene.add(l)
    // l.quaternion.setFromUnitVectors(yUnit, axis)

    updateWorldMaps = () => {
        // if(frameCount % 450 === 0) {
        //     mapProjection.value += 1
        //     if(mapProjection.value > 3)
        //         mapProjection.value = 2
        // }

        let angle = Math.PI / 3. + TAU * frameCount * .001
        greenlands.forEach(g => {
            q1.setFromAxisAngle(axis, angle)
            g.material.uniforms.quat.value.copy(q1)
        })
    }

    document.addEventListener('keydown', e => {
        q1.identity()
        if(e.key === `ArrowRight`) {
            q1.setFromAxisAngle(yUnit, .01)
        }
        else if(e.key === `ArrowLeft`) {
            q1.setFromAxisAngle(yUnit, -.01)
        }
        else if(e.key === `ArrowUp`) {
            q1.setFromAxisAngle(xUnit, .01)
        }
        else if(e.key === `ArrowDown`) {
            q1.setFromAxisAngle(xUnit, -.01)
        }

        q2.copy(equidistantEarth.material.uniforms.quat.value)
        q2.premultiply(q1)
        q2.normalize()
        equidistantEarth.material.uniforms.quat.value.copy(q2)
    })

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
                        pos *= .6;
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
                    }

                    //azimuthal equidistant
                    if(mapProjection == 5)
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

    let geo = new THREE.PlaneGeometry(2., 1., 512, 512)

    let earths = []
    let greenlands = []
    class MapProjection extends THREE.Mesh {
        constructor(mapProjection, isGreenland) {
            let mat = new THREE.ShaderMaterial({
                transparent: true,
                uniforms:
                {
                    map: { value: null },
                    quat: { value: new THREE.Vector4() },
                    mapProjection: { value: mapProjection },
                    transparent: true
                },
                vertexShader: earthVert,
                fragmentShader: earthFrag
            });
            mat.uniforms.quat.value.set(0., 0., 0., 1.)
            super(geo, mat)
            scene.add(this)

            if(isGreenland) {
                greenlands.push(this)
                this.position.z = .02
            }
            else
                earths.push(this)
        }
    }

    let equidistantEarth = new MapProjection(5, false)
    // equidistantEarth.scale.setScalar(.5)
    // equidistantEarth.position.y = .85
    // equidistantEarth.position.x = -1.3
    
    // let equidistantGreenland = new MapProjection(5, true)
    // equidistantGreenland.scale.setScalar(.5)
    // equidistantGreenland.position.y = .85
    // equidistantGreenland.position.x = -1.3

    // let mercatorEarth = new MapProjection(2, false)
    // mercatorEarth.scale.setScalar(.5)
    // mercatorEarth.position.y = .85
    // mercatorEarth.position.x = 1.3

    // let mercatorGreenland = new MapProjection(2, true)
    // mercatorGreenland.scale.setScalar(.5)
    // mercatorGreenland.position.y = .85
    // mercatorGreenland.position.x = 1.3

    // let perspectiveEarth = new MapProjection(0, false)
    // perspectiveEarth.scale.setScalar(.75)
    // perspectiveEarth.position.y = -.95

    // let perspectiveGreenland = new MapProjection(0, true)
    // perspectiveGreenland.scale.setScalar(.75)
    // perspectiveGreenland.position.y = -.95

    new THREE.TextureLoader().load('https://hamishtodd1.github.io/fep/data/earthOutline.png', map => {
        earths.forEach(e => e.material.uniforms.map.value = map)
    })
    new THREE.TextureLoader().load('https://hamishtodd1.github.io/fep/data/greenland.png', map => {
        greenlands.forEach(e => e.material.uniforms.map.value = map)
    })

    {
        const x = 0, y = 0;

        const heartShape = new THREE.Shape();

        heartShape.moveTo(x + 5, y + 5);
        heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
        heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
        heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
        heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
        heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
        heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

        var heartGeo = new THREE.ShapeGeometry(heartShape);
        heartGeo.scale(.003,.0035,.004)
        heartGeo.rotateZ(Math.PI)
        heartGeo.translate(0.,0.,0.01)
    }

    let spotGeo = new THREE.SphereGeometry(.016)
    let spotMat = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    let spotOutlineMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
    for(let i = 0; i < weddingData.length / 2; ++i) { 
        let spot = new THREE.Mesh(heartGeo, spotMat)
        let outline = new THREE.Mesh(heartGeo, spotOutlineMat)
        outline.scale.setScalar(1.3)
        outline.position.z -= .01
        outline.position.y += .011
        outline.position.x += .0053
        spot.add(outline)
        spot.scale.setScalar(1.6)
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

let weddingData = [
    35.641662, 139.769279,
    41.353676, 2.178857,
    43.472731, 5.210011,
    48.127993, 11.577923,
    48.219988, -2.831188,
    48.859017, 2.335184,
    49.513356, 3.835002,
    50.436565, -104.615205,
    51.251535, -0.143348,
    51.337057, -0.364519,
    51.356205, -0.470535,
    51.463026, -2.631284,
    51.507717, -0.118954,
    51.654612, 0.819422,
    51.696911, 0.727709,
    51.742198, 0.690139,
    52.073084, 0.583992,
    52.212512, 0.120120,
    52.332619, -0.076488,
    52.394059, 0.268199,
    52.923337, -1.491600,
    52.923522, -1.472429,
    53.482178, -2.251885,
    53.856335, -1.766660,
    54.158753, -4.467326,
    54.616032, -5.914004,
    55.051160, -1.445771,
    55.622363, 12.986120,
    55.941532, -3.056444,
    55.946778, -3.162601,
    51.589808, 0.190250,
    51.463745, -0.951860,
    52.050812, 1.157639,
    50.084606, 14.411776,
    51.617126, 0.511961,
    52.281634, 0.059784,
    -34.558362, -58.383939
]