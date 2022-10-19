function initColumn3d() {
    let ambient = new Dw(3, 0)
    let sign = text("?? 5D :'( ??", false)
    sign.scale.multiplyScalar(2.)
    ambient.scene.add(sign)

    let hyperbolic = new Dw(3, 1)
    let sign2 = text("? 4D :( ?", false)
    sign2.scale.multiplyScalar(2.)
    hyperbolic.scene.add(sign2)
}