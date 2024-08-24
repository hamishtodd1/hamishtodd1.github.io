updateField = ()=> {}
function initField() {

    let noise = .25

    function randomizeInSphere(v,radius) {
        v.set(999., 999., 999.)
        while (v.lengthSq() > 1.)
            v.random().subScalar(.5).multiplyScalar(2.)
        v.multiplyScalar(v.lengthSq()) //push towards center

        v.multiplyScalar(radius)
    }
    
    let numPoints = 1000
    let startCoords = new Float32Array(3 * numPoints)
    // for(let i = 0.; i < 10.; ++i)
    // for(let j = 0.; j < 10.; ++j)
    // for(let k = 0.; k < 10.; ++k) {
    //     v1.set(i / 10., j / 10., k / 10.).subScalar(.5).multiplyScalar(6.)
    //     let index = i*100+j*10+k
    //     v1.toArray(startCoords, index*3)
    // }
    for(let i = 0; i < numPoints * 3; ++i) {

        randomizeInSphere(v1, 5.)
        v1.toArray(startCoords,i*3)

        // startCoords[i] = 2.*(Math.random() * 2. - 1.)
    }
    // for(let i = 0; i < numPoints; ++i) {
    //     let a = Math.random() * TAU
    //     v1.set(Math.cos(a), Math.sin(a),0.)
    //     v1.toArray(startCoords, i*3)
    // }

    let geo = new THREE.SphereGeometry(.06)
    let instanceMesh = new THREE.InstancedMesh(
        geo,
        new THREE.MeshPhongMaterial({ color: 0x71355B }), numPoints);
    instanceMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
    instanceMesh.castShadow = true
    scene.add(instanceMesh);

    let oddCount = 6
    let oddScale = 3.
    let instanceMeshInitial = new THREE.InstancedMesh(
        geo,
        new THREE.MeshPhongMaterial({ color: 0xEAB63C }), oddCount);
    instanceMeshInitial.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
    instanceMeshInitial.castShadow = true
    scene.add(instanceMeshInitial)

    // let geo = new THREE.BufferGeometry()
    // geo.setAttribute('position', new THREE.Float32BufferAttribute( startCoords, 3 ))
    // let coords = geo.attributes.position.array
    // scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x71355B, size: .1 })))

    let fullTransform = null
    let fullTransformEven = new Even()
    let fullTransformOdd = new Odd()

    let randomValues0 = Array(numPoints)
    let randomValues1 = Array(numPoints)
    let randomValues2 = Array(numPoints)
    for(let i = 0; i < numPoints; ++i) {
        randomValues0[i] = Math.random() * .4
        randomValues1[i] = Math.random() * 1.4
        randomValues2[i] = Math.random() * .2
    }

    updateField = (transform) => {

        camera.position.applyAxisAngle(yUnit, .001)
        camera.lookAt(0.,0.,0.)

        let isOdd = transform.constructor === Odd
        fullTransform = isOdd ? fullTransformOdd : fullTransformEven
        instanceMeshInitial.visible = isOdd

        let sphereScale = isOdd ? oddScale : 1.
        instanceMesh.count = isOdd ? oddCount : numPoints



        for(let i = 0; i < numPoints; ++i) {

            // if (Math.random() < .05) {
            //     randomizeInSphere(v2, 5.)
            //     v2.toArray(startCoords, 3 * i)
            // }
            
            v1.fromArray(startCoords, 3 * i)
            if(isOdd) {
                // v1.x += Math.sin(frameCount*randomValues2[i]+randomValues0[i]) * randomValues1[i]
                // v1.y += Math.random() * noise
                // v1.z += Math.random() * noise

                m1.makeScale(oddScale, oddScale, oddScale).setPosition(v1)
                instanceMeshInitial.setMatrixAt(i, m1);
            }
            vecToTranslation(v1, even0)
            transform.mul(even0, fullTransform)
            
            let zrs = fullTransform.sandwich(_eo, odd0)
            zrs.zrsToVector3(v2)

            // v2.toArray(coords, 3 * i)
            m1.makeScale(sphereScale, sphereScale, sphereScale).setPosition(v2)
            instanceMesh.setMatrixAt(i, m1);
        }

        instanceMesh.instanceMatrix.needsUpdate = true;
        instanceMeshInitial.instanceMatrix.needsUpdate = true;
        // geo.attributes.position.needsUpdate = true
    }
}