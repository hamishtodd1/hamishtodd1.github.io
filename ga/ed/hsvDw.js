async function initHsv()
{
    // let dw = new Dw("hsv", true)
    
    var apparatus = new THREE.Object3D()
    dw.addNonMentionChild(apparatus)

    //TODO should actually be the cone, not double cone
    //or maybe hsl cylinder

    //your different "spaces" can have a specific thing in the background, eg a grid or rgb cube
    
    let coneRadius = 1.
    let actualRadialSegments = 16
    let actualThetaLength = TAU * 3. / 4.
    let thetaLengthOfOneSegment = actualThetaLength / actualRadialSegments
    let coneGeo = new THREE.ConeGeometry(coneRadius, coneRadius, actualRadialSegments + 2, 1, false, TAU / 2. - thetaLengthOfOneSegment, actualThetaLength + thetaLengthOfOneSegment * 2.)
    coneGeo.translate(0., .5, 0.)
    coneGeo.rotateX(TAU / 2.)

    forEachVecInAttribute(coneGeo.attributes.position.array, (v, i) => {
        if (Math.abs(v.x) < .01 && Math.abs(v.z) < .01 && Math.abs(v.y) < .01)
            v.y = coneRadius

        let around = Math.atan2(v.x, v.z)
        if (Math.abs(v.y) < .01) {
            if (0.01 < around && around < TAU / 4. - .01)
                v.set(0., 0., 0.)
        }
    })
    coneGeo.rotateY(TAU / 4.)

    let cone = new THREE.Mesh(coneGeo, new THREE.ShaderMaterial())
    cone.material.vertexShader = await getTextFile('hsvConeVert.glsl')
    cone.material.fragmentShader = await getTextFile('hsvCone.glsl')
    apparatus.add(cone)
}