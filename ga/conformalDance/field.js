updateField = ()=> {}
function initField() {

    function randomizeInSphere(v,radius) {
        v.set(999., 999., 999.)
        while (v.lengthSq() > 1.)
            v.random().subScalar(.5).multiplyScalar(2.)
        v.multiplyScalar(radius)
    }
    
    let numPoints = 1000
    let startCoords = new Float32Array(3 * numPoints)
    for(let i = 0.; i < 10.; ++i)
    for(let j = 0.; j < 10.; ++j)
    for(let k = 0.; k < 10.; ++k) {
        v1.set(i / 10., j / 10., k / 10.).subScalar(.5).multiplyScalar(6.)
        let index = i*100+j*10+k
        v1.toArray(startCoords, index*3)
    }
    // for(let i = 0; i < numPoints * 3; ++i) {

    //     randomizeInSphere(v1, 5.)
    //     v1.toArray(startCoords,i*3)

    //     // startCoords[i] = 2.*(Math.random() * 2. - 1.)
    // }
    // for(let i = 0; i < numPoints; ++i) {
    //     let a = Math.random() * TAU
    //     v1.set(Math.cos(a), Math.sin(a),0.)
    //     v1.toArray(startCoords, i*3)
    // }

    let instanceMesh = new THREE.InstancedMesh(
        new THREE.SphereGeometry(.06),
        new THREE.MeshPhongMaterial({ color: 0x71355B }), numPoints);
    instanceMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
    instanceMesh.castShadow = true
    scene.add(instanceMesh);

    // let geo = new THREE.BufferGeometry()
    // geo.setAttribute('position', new THREE.Float32BufferAttribute( startCoords, 3 ))
    // let coords = geo.attributes.position.array
    // scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x71355B, size: .1 })))

    let fullTransform = null
    let fullTransformEven = new Even()
    let fullTransformOdd = new Odd()

    let truePtAtInf = new Even()
    _e123.mul(_e0, truePtAtInf)
    let pointPair = new Odd()
    let finalTranslation = new Even()

    let e123Inverse = _e123.reverse(new Odd())

    function vecToTranslation(v,target) {
        target.copy(_one)
            .addScaled(_e10, v.x * .5, target)
            .addScaled(_e20, v.y * .5, target)
            .addScaled(_e30, v.z * .5, target)
        return target
    }

    function translationToVec3(trans, target) {
        target.set(0.,0.,0.)
        for (let i = 0; i < 16; ++i) {
            target.x += trans[i] * _e10[i] * .5
            target.y += trans[i] * _e20[i] * .5
            target.z += trans[i] * _e30[i] * .5
        }
        target.multiplyScalar(1. / trans[0])
        return target
    }

    updateField = (transform) => {

        fullTransform = transform.constructor === Odd ? fullTransformOdd : fullTransformEven

        for(let i = 0; i < numPoints; ++i) {

            // if (Math.random() < .05) {
            //     randomizeInSphere(v2, 5.)
            //     v2.toArray(startCoords, 3 * i)
            // }
            
            v1.fromArray(startCoords, 3 * i)
            vecToTranslation(v1, even0)
            transform.mul(even0, fullTransform)
            
            let zrs = fullTransform.sandwich(_eo, odd0)
            zrs.inner(truePtAtInf, pointPair)
            pointPair.mul(e123Inverse,finalTranslation) //so it's twice what it should be
            
            translationToVec3(finalTranslation,v2)

            // v2.toArray(coords, 3 * i)
            m1.setPosition(v2)
            instanceMesh.setMatrixAt(i, m1);

        }

        instanceMesh.instanceMatrix.needsUpdate = true;
        // geo.attributes.position.needsUpdate = true
    }
}