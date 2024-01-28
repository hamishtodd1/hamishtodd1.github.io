function init22() {

    //hyperboloid of one sheet
    {
        let g = new THREE.PlaneGeometry(1.,1.,20,20)
        let a = g.attributes.position.array
        for(let i = 0; i < a.length / 3; ++i) {
            
            let y = 3.7 * a[i * 3 + 1]
            let unrotatedX = Math.cosh(y)
            let unrotatedY = Math.sinh(y)
            
            let angle = a[i * 3 + 0] * TAU
            a[i * 3 + 0] = unrotatedX * Math.sin(angle)
            a[i * 3 + 1] = unrotatedY
            a[i * 3 + 2] = unrotatedX * Math.cos(angle)            
            
        }
        g.computeVertexNormals()
        let m = new THREE.Mesh( g, new THREE.MeshPhongMaterial({
            color:0xFF0000,
            side: THREE.DoubleSide,

        }) )
        m.scale.setScalar(.16)
        m.position.y = 1.6
        m.position.x = -1.
        scene.add(m)
    }
    
    let pixels = new THREE.Group()
    pixels.position.set(.6,1.6,0.)
    pixels.position.z += .01
    scene.add(pixels)
    let pixelsWide = 50
    let pixelWidth = 1./pixelsWide
    let pixelGeo = new THREE.PlaneGeometry(pixelWidth, pixelWidth)
    let pixelMat = new THREE.MeshPhongMaterial({
        color: 0x000000,
        side: THREE.DoubleSide,
    })
    for (let i = 0; i < pixelsWide; ++i) {
        for (let j = 0; j < pixelsWide; ++j) {
            let pixel = new THREE.Mesh(pixelGeo, pixelMat)
            pixels.add(pixel)
            pixel.position.x = -.5 + (i+.5) * pixelWidth
            pixel.position.y = -.5 + (j+.5) * pixelWidth
        }
    }

    /*
        You're wedging some objects together and ending up with a point pair
        Assume you can extract xyz's from point pairs

        Probably easier to do 3,2 first!
    */

    //there's a ray in projective 2,2 with plucker coordinates
    // origin is e1t
    // "x direction" (e1p+e1m) = e1(ep+em) = e1*e0 = e10
    // "y direction" (etp+etm) = et(ep+em) = et*e0 = et0
    //want to draw e1

    function rayDqTo32( rDq, r32 ) {
        //e1 is e1, e0 is e0
        //e2 in 32 is e3 in ega
        //et in 32 is e2 in ega

        r32.zero()
        r32.addScaled(_e10, -rDq[1], r32)
        r32.addScaled(_e20, -rDq[3], r32)
        r32.addScaled(_et0, -rDq[2], r32)
        r32.addScaled(_e12, -rDq[5], r32) //-rDq[5] = e13
        r32.addScaled(_e1t,  rDq[4], r32) // rDq[5] = e12
        r32.addScaled(_e2t, -rDq[6], r32) // rDq[6] = e23
    }

    let rayDq = new Dq()
    let ray32 = new Tw()
    let displayed42 = new Tw()
    displayed42.copy(_ep)
    let pss32 = _e1.mul(_e2.mul(_et.mul(_ep.mul(_em, tw0), tw1), tw0), new Tw())
    log(pss32)
    // let pointAtInfinity32 = _e0.mul(pss32,new Tw())
    let projector = new Tw()
    let projectorReverse = new Tw()
    let projectorBiv = new Tw()

    // function inner32Pss(a, target) {
    //     target[0] = a[60]; target[1] = a[55]; target[2] = -a[51]; target[3] = a[63]; target[4] = a[47]; target[5] = a[46]; target[6] = -a[45]; target[7] = -a[41]; target[9] = a[37]; target[10] = a[36]; target[11] = -a[35]; target[13] = -a[31]; target[14] = -a[30]; target[15] = a[29]; target[19] = a[25]; target[20] = -a[24]; target[21] = -a[23]; target[23] = -a[21]; target[24] = -a[20]; target[25] = a[19]; target[29] = a[15]; target[30] = -a[14]; target[31] = -a[13]; target[35] = -a[11]; target[36] = a[10]; target[37] = a[9]; target[41] = -a[7]; target[45] = -a[6]; target[46] = a[5]; target[47] = a[4]; target[51] = -a[2]; target[55] = a[1]; target[60] = a[0];
    //     return target
    // }
    // function innerE12t0(a, target) {
    //     target[0] = + a[46] - a[47]; target[1] = + a[36] - a[37]; target[2] = - a[30] + a[31]; target[3] = + a[58] - a[59]; target[4] = + a[25] - a[60]; target[5] = - a[60] + a[25]; target[6] = + a[23] - a[24]; target[7] = - a[20] + a[21]; target[8] = 0.; target[9] = + a[15]; target[10] = + a[15]; target[11] = + a[13] - a[14]; target[12] = 0.; target[13] = - a[11]; target[14] = - a[11]; target[15] = - a[9] + a[10]; target[16] = - a[63]; target[17] = - a[63]; target[18] = 0.; target[19] = 0.; target[20] = + a[7]; target[21] = + a[7]; target[22] = 0.; target[23] = - a[6]; target[24] = - a[6]; target[25] = - a[4] + a[5]; target[26] = 0.; target[27] = 0.; target[28] = 0.; target[29] = 0.; target[30] = + a[2]; target[31] = + a[2]; target[32] = 0.; target[33] = 0.; target[34] = 0.; target[35] = 0.; target[36] = - a[1]; target[37] = - a[1]; target[38] = 0.; target[39] = 0.; target[40] = 0.; target[41] = 0.; target[42] = 0.; target[43] = 0.; target[44] = 0.; target[45] = 0.; target[46] = 0. = (-1.) * a[0]; target[47] = 0. = (-1.) * a[0]; target[48] = 0.; target[49] = 0.; target[50] = 0.; target[51] = 0.; target[52] = 0.; target[53] = 0.; target[54] = 0.; target[55] = 0.; target[56] = 0.; target[57] = 0.; target[58] = 0.; target[59] = 0.; target[60] = 0.; target[61] = 0.; target[62] = 0.; target[63] = 0.;
    //     return target;
    // }
    
    update22 = () => {
        
        if(frameCount!== 1)
            return

        pixels.children.forEach(pixel => {

            // debugger

            let pixelWorldPos = fl0.pointFromGibbsVec(pixels.localToWorld(v1.copy(pixel.position)))
            camera.mvs.pos.joinPt(pixelWorldPos, rayDq)

            rayDqTo32(rayDq, ray32)
            
            pixel.visible = pixel.position.length() < .5
            
        })
    }
}