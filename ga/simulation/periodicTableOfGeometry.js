function initPeriodicTableOfGeometry() {
    let boxDimension = .25
    let boxSpacing = boxDimension * 2.3
    let holder = new THREE.Group()
    holder.scale.multiplyScalar(.65)
    scene.add(holder)
    holder.position.y = .75
    holder.position.x -= .6
    holder.position.y -= .6
    let boxGeo = new THREE.BoxGeometry(boxDimension,boxDimension,boxDimension)
    let sigs = [

        //hypercomplex numbers
        // [0, 0, 1],
        // [0, 1, 0],
        // [1, 0, 0],

        //exterior algebra
        [0, 0, 2],
        [0, 0, 3],
        [0, 0, 4],
        // [0, 0, 5],
        // [0, 0, 6],

        //euclidean pgas
        [1, 0, 1],
        [2, 0, 1],
        [3, 0, 1],
        [4, 0, 1],
        // [5, 0, 1],
        // [6, 0, 1],

        //elliptic and spacetime projective
        [2, 0, 0],
        [3, 0, 0],
        [4, 0, 0],
        
        //conformals and hyperbolics, and STA
        [1, 1, 0],
        [2, 1, 0],
        [3, 1, 0], //start by talking about this one
        [1, 3, 0], //west coast
        [4, 1, 0],

        //conformal and other approaches to spacetime
        [3, 2, 0],
        [4, 2, 0],
        [1, 1, 1],
        [2, 1, 1],
        [3, 1, 1],

        //weird surfaces / double conformal
        [5, 3, 0],
        [6, 3, 0],
        // [8,2,0],
        // [9,6,0],
        // [9,7,0],

        //odds and sods
        [0,0,0],
        [6,0,0],
        [1,0,2], //zollies only
        [2,0,2], //levenberg marquardt
        // [3,0,3], //levenberg marquardt
        // [0,2,0], //"quaternions"

        //"mother"
        [2,2,0],
        [3,3,0],
    ]
    sigs.forEach( sig => {

        let i = sig[0]
        let j = sig[1]
        let k = sig[2]

        let angle = Math.atan2(i,j)
        let len = Math.sqrt(i * i + j * j)
        let col = new THREE.Color().setHSL(-angle / (TAU / 3.5), 1. - k * .35, .5 / len) //new THREE.Color(i/6.,j/6.,k/6.)
        if(i===0&&j===0)
            col.setRGB(k * .1, k * .1, k * .1)

        let m = new THREE.Mesh(boxGeo, new THREE.MeshPhongMaterial({ color: col }))
        m.castShadow = true
        m.receiveShadow = true
        holder.add(m)
        m.position.set(i*boxSpacing,j*boxSpacing,-k*boxSpacing)

        let myText = text(i+`,`+j + `,` +k)
        myText.scale.multiplyScalar(.16)
        myText.position.z = boxDimension * .53
        m.add(myText)
    })
}