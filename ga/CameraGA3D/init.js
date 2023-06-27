async function init() {
    if(camera.isPerspectiveCamera)
        console.error("Meant to be an orthographic camera here")

    let motor = oneMv.clone()

    // debugger
    // xDir.exp()

    function composeWithScaledBivectorExp(bivector, t) {
        mv0.copy(zeroMv).addScaled(bivector, t)
        mv0.exp(mv1)
        mv1.normalize()
        
        mv2.copy(motor)
        mv2.mul(mv1, motor)
    }

    bindButton("a",()=>{},``,()=>{
        composeWithScaledBivectorExp( e12, 0.015)
    })
    bindButton("d", () => { }, ``, () => {
        composeWithScaledBivectorExp(e12, -0.015)
    })
    bindButton("w", () => { }, ``, () => {
        composeWithScaledBivectorExp(ePlusMinus, 0.015)
    })
    bindButton("s", () => { }, ``, () => {
        composeWithScaledBivectorExp(ePlusMinus, -0.015)
    })

    //translation
    bindButton("j", () => { }, ``, () => {
        composeWithScaledBivectorExp(xDir, 0.005)
    })
    bindButton("l", () => { }, ``, () => {
        composeWithScaledBivectorExp(xDir, -0.005)
    }) 
    let zollyAxis = em.meet(e2)
    zollyAxis.log()
    bindButton("i", () => { }, ``, () => {
        composeWithScaledBivectorExp(zollyAxis, 0.015)
    })
    bindButton("k", () => { }, ``, () => {
        composeWithScaledBivectorExp(zollyAxis, -0.015)
    })

    let initialCoords = []
    for (let i = 0;     i < 29; ++i) {
        for (let j = 0; j < 29; ++j) {
            initialCoords.push(
                .05 * (i - 14), 
                .05 * (j - 14) )
        }
    }

    updateFunctions.push( () => {
        for (let i = 0, il = coords.length / 2; i < il; ++i) {
            mv0.fromPoint2D(
                initialCoords[i * 2 + 0],
                initialCoords[i * 2 + 1])

            // motor.sandwich(mv0,mv1)

            //cut with thingy THEN apply
            {
                em.meet(mv0,mv2)
                motor.sandwich(mv2, mv3)
                e012.join(mv3, mv1)
            }

            mv1.toPoint2D(coords, i * 3)
        }

        geo.attributes.position.needsUpdate = true
    })
    let geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(Array(initialCoords.length / 2 * 3)), 3));
    let coords = geo.attributes.position.array
    let mesh = new THREE.Points(geo, new THREE.PointsMaterial({color:0xFF0000,size:3}))
    scene.add(mesh)
}