/*
    "Point vortex dynamics" is the 2D version
    https://marcelpadilla.com/Projects/Point_Vortex_Dynamics_on_Closed_Surfaces/Marcel-Padilla-master-thesis-final-small.pdf
    Dan Piker linked more on GPWW
    
    A circular CGA rotor in a cube probably is not mass-preserving
    But, maybe you can combine it with a complementary one next to it which removes what it creates

    Curve, piecewise lines
        Lines have start and end points and therefore center
        To know the effect on a point, go through each, get distance from center
 */

function initField() {
    
    let numPoints = 40
    let geo = new THREE.BufferGeometry()
    let startCoords = new Float32Array(3 * numPoints)
    for(let i = 0; i < numPoints * 3; ++i) {
        startCoords[i] = Math.random() * 2. - 1.
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute( startCoords, 3 ))
    let coords = geo.attributes.position.array
    let a = new THREE.Points(geo, new THREE.PointsMaterial({color:0x00FF00, size:.1}))
    scene.add(a)

    let translation = new Tw()

    let pointPair = new Trivec()
    let fullTransform = new Tw()
    let myTrivec = new Trivec()
    
    updateField = (transform) => {

        // debugger
        for(let i = 0; i < numPoints; ++i) {

            v1.fromArray(startCoords, 3 * i)
            translation.copy(oneTw)
                .addScaled(_e10, v1.x * .5, translation)
                .addScaled(_e30, v1.y * .5, translation)
                .addScaled(_et0, v1.z * .5, translation)
            transform.mul(translation, fullTransform)
            // fullTransform.copy(translation)
            // debugger
            // debugger
            
            let zrs = fullTransform.sandwich(_eo, tw2)
            // debugger
            zrs.cast(uv0).inner(truePtAtInf, pointPair)
            pointPair.multiplyScalar(Math.sqrt(Math.abs(pointPair.innerSelfScalar())), pointPair)
            pointPair.sub(originPp, pointPair)
            
            dopToVec3(pointPair, v1)
            v1.toArray(coords, 3 * i)

        }
        geo.attributes.position.needsUpdate = true
    }
}