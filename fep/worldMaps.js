function updateWorldMaps() { }

function initMeasuringStick(perspective, mercator, equidistant, planePerspective, planeMercator, planeEquidistant) {

    let worldMaps = [equidistant, mercator, perspective]
    let planes = [planeEquidistant, planeMercator, planePerspective]

    let dir = new THREE.Vector3()
    let yUnitNeg = new THREE.Vector3(0., -1., 0.)
    function directPlane(plane, nextPosition) {
        dir.subVectors(nextPosition, plane.position).normalize()
        plane.quaternion.setFromUnitVectors(yUnitNeg, dir)
    }

    let globeStickGeoSegments = 32
    let globeStickGeoInitial = new THREE.PlaneGeometry(.02, 1., 1, globeStickGeoSegments)
    globeStickGeoInitial.translate(0., .5, 0.)
    initialCoords = globeStickGeoInitial.attributes.position.array
    let globeStick = new THREE.Mesh(globeStickGeoInitial.clone(), new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide }))
    perspective.add(globeStick)
    let gsCoords = globeStick.geometry.attributes.position.array
    
    let identityQuaternion = new THREE.Quaternion()
    let displacer = new THREE.Vector3()
    let perspectiveStart = new THREE.Vector3(0., 0., 1.)
    let perspectiveEnd = new THREE.Vector3(1., 1., 1.).normalize()

    let globeSphere = new THREE.Sphere()
    function getGlobeIntersection(target) {
        globeSphere.center.copy(perspective.position)
        globeSphere.radius = perspective.scale.x
        let intersection = raycaster.ray.intersectSphere(globeSphere, v1)
        if (intersection) {
            target.copy(v1)
            perspective.worldToLocal(target)
            target.normalize()
        }
    }
    

    let measuringStick = new THREE.Mesh(new THREE.PlaneGeometry(.02, 1.), new THREE.MeshBasicMaterial({ color: 0x000000 }))
    measuringStick.visible = false
    measuringStick.geometry.translate(0., .5, 0.)
    scene.add(measuringStick)
    measuringStick.position.z = .05
    let changingStickMode = false
    let measuringStickMap = null
    document.addEventListener('keyup', event => {
        if (event.key === `1`) {
            if (changingStickMode === true) {
                changingStickMode = false
                backAndForth = 0.
                forth = true
            }
            else {
                changingStickMode = true
                measuringStick.visible = true

                let closestDist = 1.
                worldMaps.forEach(map => {
                    let dist = map.position.distanceToSquared(mousePos)
                    if (dist < closestDist) {
                        closestDist = dist
                        measuringStickMap = map
                    }
                })

                measuringStick.position.x = mousePos.x
                measuringStick.position.y = mousePos.y

                if (measuringStickMap === perspective) {
                    getGlobeIntersection(perspectiveStart)
                }

                // if (measuringStickMap !== null) {
                //     measuringStickMap.worldToLocal(measuringStick.position)
                // }
            }
        }
    })

    let forth = true
    let backAndForth = 0.
    function getPosition(t,target) {
        target.copy(measuringStick.position)
        v4.copy(yUnit).applyQuaternion(measuringStick.quaternion).multiplyScalar(measuringStick.scale.y)
        return target.addScaledVector(v4, t)
    }

    let euler = new THREE.Euler()
    function setOthersFromLatLon(lat,lon,ommitted) {

        if(mercator !== ommitted) {
            let pos = planeMercator.position
            pos.x = lon
            pos.y = Math.log(Math.tan(Math.PI / 4. + lat / 2.))
            pos.z = 0.
            let max = 3.
            if (Math.abs(pos.y) > max)
                pos.y = Math.sign(pos.y) * max
            pos.x *= .6
            pos.y *= .6
        }

        if(equidistant !== ommitted) {
            let pos = planeEquidistant.position
            let lat0 = Math.PI / 2.
            let k = Math.sqrt(2. / (1. + Math.sin(lat0) * Math.sin(lat) + Math.cos(lat0) * Math.cos(lat) * Math.cos(lon)))
            let max = 100.
            if (k > max)
                k = max
            pos.x = k * Math.cos(lat) * Math.sin(lon)
            pos.y = k * (Math.cos(lat0) * Math.sin(lat) - Math.sin(lat0) * Math.cos(lat) * Math.cos(lon))
            pos.z = 0.
            pos.x *= .7
            pos.y *= .7
        }

        if(perspective !== ommitted) {
            let q1 = new THREE.Quaternion()
            q1.setFromEuler(euler.set(lat, lon, 0.))
            q2.setFromUnitVectors(yUnit,zUnit)
            planePerspective.quaternion.multiplyQuaternions(q1, q2)
        }
    }

    updateMeasuringStick = () => {

        if (backAndForth > 1.)
            forth = false
        else if (backAndForth < 0.)
            forth = true
        backAndForth += .8 * (forth ? frameDelta : -frameDelta)

        if (!changingStickMode) {
            planes.forEach(p => p.visible = true)

            let plane = planes[worldMaps.indexOf(measuringStickMap)]

            let lat, lon;

            switch (measuringStickMap) {

                case perspective:
                    q1.setFromUnitVectors(perspectiveStart, perspectiveEnd)
                    planePerspective.quaternion.slerpQuaternions(identityQuaternion, q1, backAndForth)

                    let northPoleToPerspectiveStart = q1.setFromUnitVectors(yUnit, perspectiveStart)
                    planePerspective.quaternion.multiply(northPoleToPerspectiveStart)

                    let currentPos = v3.set(0.,1.,0.).applyQuaternion(planePerspective.quaternion).normalize()

                    v1.crossVectors(currentPos, forth?perspectiveEnd:perspectiveStart).normalize()
                    let currentDir = v2.set(0., 0., -1.).applyQuaternion(planePerspective.quaternion)
                    v2.crossVectors(currentPos, currentDir).normalize()
                    q1.setFromUnitVectors(v2, v1)
                    planePerspective.quaternion.premultiply(q1)

                    lat = Math.asin(currentPos.y)
                    lon = Math.atan(currentPos.x, currentPos.z)

                    setOthersFromLatLon(lat, lon,perspective)

                    break

                case null:
                    break

                //equidistant, mercator
                default:

                    getPosition(backAndForth, plane.position)
                    measuringStickMap.worldToLocal(plane.position)

                    measuringStickMap.worldToLocal(getPosition(backAndForth + .00001*(forth?1.:-1.), v1))
                    directPlane(plane, v1)

                    lat = -1.
                    lon = -1.
                    if(measuringStickMap === equidistant) {
                        //equidistant
                        lat = Math.PI / 2. - plane.position.length()
                        lon = Math.atan2(plane.position.x, -plane.position.y)
                    }
                    else {
                        //mercator
                        lon = plane.position.x / .6
                        lat = 2. * (Math.atan(Math.exp(plane.position.y)) - Math.PI / 4.)
                    }

                    setOthersFromLatLon(lat, lon, measuringStickMap)

            }

            return
        }
        else {

            planes.forEach(p => p.visible = false)
    
            switch (measuringStickMap) {
                case perspective:
                    getGlobeIntersection(perspectiveEnd)
                    q1.setFromUnitVectors(perspectiveStart, perspectiveEnd)
                    displacer.set(q1.x, q1.y, q1.z).setLength(.02)
                    for (let i = 0, il = gsCoords.length / 3; i < il; i++) {
                        let t = initialCoords[i * 3 + 1]
                        q2.slerpQuaternions(identityQuaternion, q1, t)
    
                        let pointOn = v1.copy(perspectiveStart).applyQuaternion(q2)
                        pointOn.addScaledVector(displacer, initialCoords[i * 3] < 0. ? 1. : -1.)
                        pointOn.setLength(1.015)
                        pointOn.toArray(gsCoords, i * 3)
                    }
                    globeStick.geometry.attributes.position.needsUpdate = true
    
                    break

                case null:
    
                    break
    
                default:
                    measuringStick.scale.y = mousePos.distanceTo(measuringStick.position)
                    measuringStick.rotation.z = -yUnit.angleTo(v1.subVectors(mousePos, measuringStick.position))
                    if (mousePos.x < measuringStick.position.x)
                        measuringStick.rotation.z *= -1.
            }
        }
    }
}


function initWorldMaps() {

    let greenlandMovingMode = false
    let posWhenGreenlandMovingModeStarted = new THREE.Vector3()
    let euler = new THREE.Euler()
    euler.order = `YXZ`

    document.addEventListener('keyup', event => {

        if (event.key === `2`) {
            greenlandMovingMode = !greenlandMovingMode
            posWhenGreenlandMovingModeStarted.copy(mousePos)
        }
    })

    document.addEventListener('mousemove', e => {
        if(greenlandMovingMode) {
            
            v1.subVectors(mousePos, posWhenGreenlandMovingModeStarted)
            q1.setFromAxisAngle(v2.set(1.,0.,1.).normalize(), -1.8 * v1.y)
            q1.premultiply(q2.setFromAxisAngle(yUnit, 1.8 * v1.x))
        
            greenlands.forEach(g => {
                g.material.uniforms.quat.value.copy(q1)
            })
        }
    })

    document.addEventListener('keydown', e => {
        /*
            Grab greenland and africa and the plane

            -Bring in Mercator
            -Grab Greenland and Africa and move them
            -Bring in equidistant
            -Bring in globe
            -Draw a line on equidistant. Plane appears at start
            -Make notches appear on the line
            -Make them appear on globe
            -Same drag on mercator
            -same drag on globe, it works properly

            Features:
                The "plane trajectory":
                    Click on a map, move mouse to somewhere else making a line segment
                    A plane appears at start, rotates to face in the direction your mouse is in
                    when you let go, notches appear on the line, plane moves back and forth on it
                    Can also draw somewhere that isn't a map, it just makes the notches
                The "grab greenland and africa"




            // T = sqrt(e123/(S.e1230))
            // Math.log( |log(e4TS~T)| )
        */
    })
    
    let axis = v1.set(5., 0., 5.).normalize()
    // let l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0., -999., 0.), new THREE.Vector3(0., 999., 0.)]), new THREE.LineBasicMaterial({ color: 0x0000ff }))
    // scene.add(l)
    // l.quaternion.setFromUnitVectors(yUnit, axis)

    



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
                vertexShader: worldMapVert,
                fragmentShader: worldMapFrag
            });
            mat.uniforms.quat.value.set(0., 0., 0., 1.)
            super(geo, mat)

            if(isGreenland) {
                greenlands.push(this)
                this.position.z = .02
            }
            else
                earths.push(this)
        }
    }

    let equidistant = new THREE.Group()
    simplyMoveableThings.push(equidistant)
    scene.add(equidistant)
    equidistant.scale.setScalar(.5)
    equidistant.position.y = .85
    equidistant.position.x = -1.3
    equidistant.add(new MapProjection(5, false))
    equidistant.add(new MapProjection(5, true))

    let mercator = new THREE.Group()
    simplyMoveableThings.push(mercator)
    scene.add(mercator)
    mercator.scale.setScalar(.5)
    mercator.position.y = .85
    mercator.position.x = 1.3
    mercator.add(new MapProjection(2, false))
    mercator.add(new MapProjection(2, true))

    let perspective = new THREE.Group()
    simplyMoveableThings.push(perspective)
    scene.add(perspective)
    perspective.scale.setScalar(.75)
    perspective.position.y = -.95
    perspective.add(new MapProjection(0, false))
    perspective.add(new MapProjection(0, true))

    let planeEquidistant = new THREE.Group()
    equidistant.add(planeEquidistant)
    let planeMercator = new THREE.Group()
    mercator.add(planeMercator)
    let planePerspective = new THREE.Group()
    perspective.add(planePerspective)

    new THREE.OBJLoader().load('https://hamishtodd1.github.io/fep/data/plane.obj', function (obj) {
        let planeGeo = obj.children[0].geometry
        planeGeo.scale(.008, .008, .008)
        planeGeo.rotateX( TAU / 4. )
        // scene.add(plane)

        let _planeEquidistant = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({color:0x00FF00}))
        planeEquidistant.add(_planeEquidistant)
        let _planeMercator = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: 0x00FF00 }))
        planeMercator.add(_planeMercator)

        let _planePerspective = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: 0x00FF00 }))
        planePerspective.add(_planePerspective)
        _planePerspective.position.y = 1.07
        _planePerspective.rotation.x = TAU / 4.
    })

    textureLoader.load('https://hamishtodd1.github.io/fep/data/earthColor.png', map => {
        earths.forEach(e => e.material.uniforms.map.value = map)
    })
    textureLoader.load('https://hamishtodd1.github.io/fep/data/greenland.png', map => {
        greenlands.forEach(e => e.material.uniforms.map.value = map)
    })

    initMeasuringStick(perspective, mercator, equidistant, planePerspective, planeMercator, planeEquidistant)
}

let worldMapVert = `
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

                    //gnomonic
                    if(mapProjection == 4) {
                        pos.xy = .4 * -rotated.xz / rotated.y;
                        pos.z = 0.;
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
                        float max = 1.9;
                        if( abs(length(pos.xy)) > max )
                            pos = vec3(0.,0.,-5.);
                    }
                
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
                    gl_PointSize = 3.5;
                }`
let worldMapFrag = `
                precision highp float;

                in vec2 vUv;
                uniform sampler2D map;

                void main (void) {

                    vec2 uv = vUv;

                    gl_FragColor = texture2D( map, uv );
                }`