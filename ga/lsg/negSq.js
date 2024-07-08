function initNegSq() {
    let num = 1800
    let geo = new THREE.SphereGeometry(.03)
    let color = new THREE.Color()
    function randomizePos(pos) {
        pos.set(Math.random() - .5, Math.random() - .5, Math.random() - .5).multiplyScalar(2.)
    }

    let pointPair = new Trivec()
    let originPp = _e123.cast(new Trivec())
    let translation = new Tw()
    let _e0123 = _e01.meet(_e23, new Tw())

    let as = []
    let bs = []
    for(let i = 0; i < num; ++i) {
        randomizePos(v1)
        while (v1.length() > 1.)
            randomizePos(v1)
        
        let angle = Math.atan2(v1.x,v1.z)
        color.setHSL(
            angle / TAU + 0.5, 
            v2.set(v1.x, 0., v1.z).length() + .5,
            v1.y + .5 )
        
        let a = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color }))
        let b = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color }))
        as.push(a)
        bs.push(b)
        scene.add(a)
        scene.add(b)

        a.position.copy(v1)
    }
    
    updateGeneral()
    updateNegSq = () => {

        for (let i = 0; i < num; ++i) {
            let a = as[i]
            let b = bs[i]
            
            translation.copy(oneTw)
                .addScaled(_e10, a.position.x * .5, translation)
                .addScaled(_e20, a.position.y * .5, translation)
                .addScaled(_e30, a.position.z * .5, translation)
            translation.sandwich(_eo, tw0)
            _em.sandwich(tw0, tw1)
            tw1.inner(_e0123, tw3).cast(pointPair)

            pointPair.multiplyScalar(Math.sqrt(Math.abs(pointPair.innerSelfScalar())), pointPair)
            pointPair.sub(originPp, pointPair)
            dopToVec3(pointPair, b.position)
        }
    }
    updateNegSq()
}