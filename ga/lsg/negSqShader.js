/*
    Idea is to generate random points, and then pair them with their pair
    Ideally want an interface that moves smoothly to CGA
        It's a hyperboloid of two sheets
        How do you decide when to show this version?

    We want to demonstrate the "line up two points in this" thing
    And see what it does to a teapot
 */

function initNegSqShader() {

    let numPoints = 50;
    let pointGeo = new THREE.SphereGeometry(.01, 10, 10)
    for(let i = 0; i < numPoints; ++i) {
        //generate random points on the surface of a 2-sphere
        let u = Math.random() * 2. - 1.
        let v = Math.random() * 2. - 1.
        let s = u*u + v*v
        let x = 2 * u * Math.sqrt(1 - s)
        let y = 2 * v * Math.sqrt(1 - s)
        let z = 1 - 2 * s

        let color = new THREE.Color().setHSL(Math.random(), 1. - sq(Math.random()), .5)
        let point = new THREE.Mesh(pointGeo, new THREE.MeshPhongMaterial({color}))
        point.position.set(x, y, z)
        // basis123.gibbsVecToZrs(, tw0)
        // _em.sandwich(tw0, tw1)
        // basis123.zrsToGibbsVec(tw1, )
    }
}