function initMeasuringStick(
    perspective, mercator, equidistant, 
    planePerspective, planeMercator, planeEquidistant,
    isochroneCenterA, isochroneCenterB) {

    let worldMaps = [equidistant, mercator, perspective]
    let planes = [planeEquidistant, planeMercator, planePerspective]

    let dir = new THREE.Vector3()
    let yUnitNeg = new THREE.Vector3(0., -1., 0.)
    function directPlane(plane, nextPosition) {
        dir.subVectors(nextPosition, plane.position).normalize()
        plane.quaternion.setFromUnitVectors(yUnitNeg, dir)
    }

    let identityQuaternion = new THREE.Quaternion()
    let perspectiveStart = new THREE.Vector3(0., 0., 0.)
    let perspectiveEnd = new THREE.Vector3(0., 0., 0.)

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

    let holdingForRotation = false
    document.addEventListener('mousedown', event => {
        if(event.button === 1)
            holdingForRotation = true
    })
    document.addEventListener('mouseup', event => {
        if(event.button === 1)
            holdingForRotation = false
    })
    let axis = new THREE.Vector3()
    document.addEventListener('mousewheel', event => {
        if(holdingForRotation) {

            getGlobeIntersection(axis)
            q1.setFromAxisAngle(axis, event.deltaY * .0003)

            perspectiveStart.applyQuaternion(q1)
            perspectiveEnd.applyQuaternion(q1)

            q2.copy(perspective.children[0].material.uniforms.quat.value)
            q3.multiplyQuaternions(q1, q2)
            perspective.children[0].material.uniforms.quat.value.copy(q3)
            
            event.stopImmediatePropagation()
        }
    })
    
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

                let closestDist = 1.
                worldMaps.forEach(map => {
                    let dist = map.position.distanceToSquared(mousePos)
                    if (dist < closestDist) {
                        closestDist = dist
                        measuringStickMap = map
                    }
                })

                if (measuringStickMap === perspective) {
                    getGlobeIntersection(perspectiveStart)
                }
                else if(measuringStickMap === mercator) {
                    let [lat, lon] = mercatorToLatLon(mousePos)
                    latLonToPerspective( lat, lon, perspectiveStart )
                }
                else if (measuringStickMap === equidistant) {
                    // debugger
                    let [lat, lon] = equidistantToLatLon(mousePos)
                    latLonToPerspective( lat, lon, perspectiveStart )
                }
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

    function latLonToEquidistant(lat, lon, target) {
        let lat0 = Math.PI / 2.;
        let d = Math.acos(Math.sin(lat0) * Math.sin(lat) + Math.cos(lat0) * Math.cos(lat) * Math.cos(lon));
        let k = d / Math.sin(d);
        target.x = k * Math.cos(lat) * Math.sin(lon);
        target.y = k * (Math.cos(lat0) * Math.sin(lat) - Math.sin(lat0) * Math.cos(lat) * Math.cos(lon));
        target.z = 0.
        target.multiplyScalar(.6)
        return target
    }
    function latLonToMercator(lat, lon, target) {
        target.x = lon
        target.y = Math.log(Math.tan(Math.PI / 4. + lat / 2.))
        let max = 3.
        if (Math.abs(target.y) > max)
            target.y = Math.sign(target.y) * max
        target.z = 0.
        target.multiplyScalar(.6)
        return target
    }

    let va = new THREE.Vector3()
    function mercatorToLatLon(v) {
        mercator.worldToLocal(va.copy(v))
        va.z = 0.
        va.multiplyScalar(1. / .6)
        let lon = va.x
        let lat = 2. * (Math.atan(Math.exp(va.y)) - Math.PI / 4.)
        return [lat, lon]
    }
    function equidistantToLatLon(v) {
        equidistant.worldToLocal(va.copy(v))
        va.z = 0.
        va.multiplyScalar(1. / .6)
        let lat = Math.PI / 2. - va.length()
        let lon = Math.atan2(va.x, -va.y)
        return [lat, lon]
    }
    function perspectiveToLatLon(v) {
        let lon = Math.atan2(v.x, v.z);
        let lat = Math.asin(v.y);
        return [lat, lon]
    }
    function latLonToPerspective(lat, lon, target) {
        q1.setFromAxisAngle(yUnit, lon)
        q2.setFromAxisAngle(xUnit, -lat)
        q3.multiplyQuaternions(q1, q2)
        target.copy(zUnit).applyQuaternion(q3).normalize()
    }

    let previousPos = new THREE.Vector3()
    updateWorldMaps = () => {

        isochroneCenterA.copy(perspectiveStart)
        isochroneCenterB.copy(perspectiveEnd)

        if (backAndForth > 1.)
            forth = false
        else if (backAndForth < 0.)
            forth = true
        backAndForth += .8 * (forth ? frameDelta : -frameDelta)

        if (!changingStickMode) {
            planes.forEach(p => p.visible = (measuringStickMap !== null))

            if (measuringStickMap) {
                q1.setFromUnitVectors(perspectiveStart, perspectiveEnd)
                planePerspective.quaternion.slerpQuaternions(identityQuaternion, q1, backAndForth)

                let northPoleToPerspectiveStart = q1.setFromUnitVectors(yUnit, perspectiveStart)
                planePerspective.quaternion.multiply(northPoleToPerspectiveStart)

                let currentPos = v3.set(0., 1., 0.).applyQuaternion(planePerspective.quaternion).normalize()
                v1.crossVectors(currentPos, forth?perspectiveEnd:perspectiveStart).normalize()
                let currentDir = v2.set(0., 0., -1.).applyQuaternion(planePerspective.quaternion)
                v2.crossVectors(currentPos, currentDir).normalize()
                q1.setFromUnitVectors(v2, v1)
                planePerspective.quaternion.premultiply(q1)

                // currentPos.set(Math.sqrt(2.), 0., Math.sqrt(2.))
                let [lat, lon] = perspectiveToLatLon(currentPos)
                previousPos.copy(planeMercator.position)
                latLonToMercator(lat, lon, planeMercator.position)
                planeMercator.rotation.z = yUnit.angleTo(v1.subVectors(planeMercator.position, previousPos))
                if(!forth)
                    planeMercator.rotation.z += Math.PI
                else
                    planeMercator.rotation.z = Math.PI - planeMercator.rotation.z


                previousPos.copy(planeEquidistant.position)
                latLonToEquidistant(lat, lon, planeEquidistant.position)
                planeEquidistant.rotation.z = yUnit.angleTo(v1.subVectors(planeEquidistant.position, previousPos))
                if (!forth)
                    planeEquidistant.rotation.z += Math.PI
                else
                    planeEquidistant.rotation.z = Math.PI - planeEquidistant.rotation.z

            }
        }
        else {

            planes.forEach(p => p.visible = false)
    
            switch (measuringStickMap) {
                case perspective:
                    getGlobeIntersection(perspectiveEnd)

                    break

                case null:
    
                    break

                case mercator:
                    [lat, lon] = mercatorToLatLon(mousePos)
                    latLonToPerspective(lat, lon, perspectiveEnd)

                    break

                case equidistant:
                    [lat, lon] = equidistantToLatLon(mousePos)
                    latLonToPerspective(lat, lon, perspectiveEnd)
    
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

    let showIsochrones = { value: false }
    document.addEventListener('keyup', event => {

        if (event.key === `2`) {
            greenlandMovingMode = !greenlandMovingMode
            posWhenGreenlandMovingModeStarted.copy(mousePos)
        }

        if (event.key === `3`) {
            showIsochrones.value = !showIsochrones.value
        }
    })

    document.addEventListener('mousemove', e => {
        if(greenlandMovingMode) {
            
            v1.subVectors(mousePos, posWhenGreenlandMovingModeStarted)
            q1.setFromAxisAngle(v2.set(1.,0.,1.).normalize(), -1.8 * v1.y)
            q1.premultiply(q2.setFromAxisAngle(yUnit, 1.8 * v1.x))
        
            greenlands[0].material.uniforms.quat.value.copy(q1)
        }
    })

    let earths = []
    let greenlands = []
    let mapProjectionGeo = new THREE.PlaneGeometry(2., 1., 512, 512)
    let isochroneCenterA = new THREE.Vector3()
    let isochroneCenterB = new THREE.Vector3()
    let greenlandQuat = new THREE.Vector4()
    let nonGreenlandQuat = new THREE.Vector4()
    class MapProjection extends THREE.Mesh {
        constructor(mapProjection, isGreenland) {
            let mat = new THREE.ShaderMaterial({
                transparent: true,
                // opacity: .1,
                uniforms:
                {
                    map: { value: null },
                    quat: { value: isGreenland ? greenlandQuat : nonGreenlandQuat },
                    mapProjection: { value: mapProjection },
                    
                    showIsochrones,
                    isochroneCenterA: { value: isochroneCenterA },
                    isochroneCenterB: { value: isochroneCenterB },
                },
                vertexShader: worldMapVert,
                fragmentShader: worldMapFrag
            });
            mat.uniforms.quat.value.set(0., 0., 0., 1.)

            super(mapProjectionGeo, mat)

            if(isGreenland) {
                greenlands.push(this)
                this.visible = false
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
        // planeEquidistant.position.x = TAU / 2. * .6
        let _planeMercator = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: 0x00FF00 }))
        planeMercator.add(_planeMercator)
        // planeMercator.position.x = TAU / 2. * .6

        let _planePerspective = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: 0x00FF00 }))
        planePerspective.add(_planePerspective)
        _planePerspective.position.y = 1.09
        _planePerspective.rotation.x = TAU / 4.
    })

    textureLoader.load('https://hamishtodd1.github.io/fep/data/earthColor.png', map => {
        earths.forEach(e => e.material.uniforms.map.value = map)
    })
    textureLoader.load('https://hamishtodd1.github.io/fep/data/greenland.png', map => {
        greenlands.forEach(e => e.material.uniforms.map.value = map)
    })

    initMeasuringStick(
        perspective, mercator, equidistant, 
        planePerspective, planeMercator, planeEquidistant, 
        isochroneCenterA, isochroneCenterB)
}

let worldMapVert = `
                uniform mat4 bivMat4;

                out vec2 vUv;
                out vec3 globePos;

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
                    vec3 globePosUnrotated;
                    globePosUnrotated.y = sin(lat);
                    globePosUnrotated.x = cos(lat) * sin(lon);
                    globePosUnrotated.z = cos(lat) * cos(lon);

                    globePos = normalize(applyQuaternion(globePosUnrotated,quat));
                    lon = atan(globePos.x, globePos.z);
                    lat = asin(globePos.y);

                    if(mapProjection == 0) {
                        pos = globePos;
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
                        pos *= .9;
                    }

                    //gnomonic
                    if(mapProjection == 4) {
                        pos.xy = .4 * -globePos.xz / globePos.y;
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

                    if(mapProjection == 0) {
                        pos *= 1.03;
                    }
                    else {
                        pos.z += .01;
                    }
                
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
                    gl_PointSize = 3.5;
                }`
let worldMapFrag = `
                precision highp float;

                in vec2 vUv;
                in vec3 globePos;
                uniform sampler2D map;
                uniform vec3 isochroneCenterA;
                uniform vec3 isochroneCenterB;
                uniform float showIsochrones;

                void main (void) {

                    vec2 uv = vUv;

                    gl_FragColor = texture2D( map, uv );

                    float totalRadius = acos(dot(isochroneCenterA,isochroneCenterB));
                    float spacing = 26.;
                    
                    float angleA = acos(dot(globePos,isochroneCenterA));
                    float angleB = acos(dot(globePos,isochroneCenterB));
                    
                    float cA = cos( angleA * spacing );
                    float cB = cos( angleB * spacing );
                    
                    float angleToAxis = abs(dot(globePos,normalize(cross(isochroneCenterA,isochroneCenterB))));

                    if( showIsochrones > .5 && angleToAxis < 999. ){
                        if(angleA < totalRadius && cA > .985 )
                            gl_FragColor.rgb = vec3(1.,0.,0.);
                        if(angleB < totalRadius && cB > .985 )
                            gl_FragColor.rgb = vec3(0.,0.,1.);
                    }

                    vec3 halfway = normalize(isochroneCenterA + isochroneCenterB);
                    float angleToHalfway = acos(dot(globePos,halfway));
                    
                    if(angleToAxis < .01 && angleToHalfway < totalRadius / 2.)
                        gl_FragColor.rgb = vec3(0.,0.,0.);
                }`