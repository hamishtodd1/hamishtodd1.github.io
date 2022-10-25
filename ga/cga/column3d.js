function initColumn3d() {
    {
        let ambient = new Dw(3, 0)
        let sign = text("?? 5D :'( ??", false)
        sign.scale.multiplyScalar(2.)
        ambient.scene.add(sign)

        let hyperbolic = new Dw(3, 1)
        let sign2 = text("? 4D :( ?", false)
        sign2.scale.multiplyScalar(2.)
        hyperbolic.scene.add(sign2)
    }

    let conformal = new Dw(3,2,false, true)
    conformal.camera.position.set(1., 1., 2.).setLength(4.)
    conformal.camera.lookAt(zeroVector)
    conformal.camera.fov = getFov(2.)
    conformal.camera.updateProjectionMatrix()

    let conformalOrigin = e123

    {
        var initialGridMvs = Array(3)
        let gridNumWide = 3
        let trios = [[mul(e3,e1), e01, e03], [e23,e02,e03], [e12,e01,e02]]
        trios.forEach((trio)=>{
            for(let i = 0; i < gridNumWide; ++i) {
                let iAmt = .9 * (i / (gridNumWide-1) - .5)
                mv0.copy(trio[1]).multiplyScalar(iAmt)
                mv0[0] = 1.

                for(let j = 0; j < gridNumWide; ++j) {
                    let jAmt = .9 * (j / (gridNumWide-1) - .5)
                    mv1.copy(trio[2]).multiplyScalar(jAmt)
                    mv1[0] = 1.

                    mul(mv0,mv1,mv2)
                    
                    initialGridMvs.push(mv2.sandwich(trio[0], new Mv()))
                }
            }
        })
        var gridCount = initialGridMvs.length

        let cylGeo = new THREE.CylinderGeometry(.02, .02, 100.)
        var gridLines = new THREE.InstancedMesh(cylGeo, new THREE.MeshBasicMaterial({color:0x0000FF}), gridCount)
        conformal.scene.add(gridLines)
    }

    let getterMv0 = new Mv()
    let getterMv1 = new Mv()
    function getPositionVector(mv, target) {
        conformalOrigin.projectOn(mv, getterMv0)
        target.set(
            getterMv0.e23Plus() + getterMv0.e23Minus(),
            getterMv0.e13Plus() + getterMv0.e13Minus(),
            getterMv0.e12Plus() + getterMv0.e12Minus(),
        ).multiplyScalar(.5 / getterMv0.e123())

        return target
    }
    function getQuaternionTo(mv, originComparisonMv, target) {
        mv.projectOn(conformalOrigin, getterMv0).normalize()
        //the origin in this space is still a bunch of planes that square to 1 so this is fine
        mul(originComparisonMv, getterMv0, getterMv1).naieveSqrt() //kiiiinda wrong way around
        target.set(getterMv1.e23(), getterMv1.e13(), getterMv1.e12(), getterMv1[0]).normalize()

        return target
    }

    updateFunctions.push(() => {
        initialGridMvs.forEach((igmv, i) => {
            //could be minus signs of course!!!

            getPositionVector(igmv, v1)
            getQuaternionTo(igmv, e13, q1)

            m1.compose(v1, q1, v2.set(1., 1., 1.))
            gridLines.setMatrixAt(i, m1)
        })
        gridLines.instanceMatrix.needsUpdate = true
    })
}