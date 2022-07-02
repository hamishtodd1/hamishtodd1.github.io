function initFinalDw() {
    let dw = new Dw("final", false, false, camera, false)
    // dw.elem.style.display = 'none'

    if (VERTEX_MODE)
    {
        let mat = new THREE.ShaderMaterial({
            uniforms: {
            },
            fragmentShader: `
void main() {
    gl_FragColor = vec4(1., 0., 0., 1.);
}`
        })

        let toVertexSuffix = `
void main() {
    gl_PointSize = 2.0;
	gl_Position = projectionMatrix * modelViewMatrix * getVertex();
}`

        let test = `
vec4 getVertex() {
    return vec4(position,1.);
}`

        //getColor needs a vec2 input, the fragCoord
        //this one gets a uv from a 1x1 rect
        //and they are a special kind of manipulation
        //their windows go at the top
        
        let geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0., 1., 0.)])
        let a = new THREE.PointsMaterial({ size: .5 })
        dw.addNonMentionChild(new THREE.Points(geo, mat))

        updateFinalDw = (text) => {
            mat.vertexShader = test + toVertexSuffix
            mat.needsUpdate = true
        }
    }

    if (!VERTEX_MODE)
    {
        let finalFsq = FullScreenQuad()
        dw.addNonMentionChild(finalFsq)

        let toFragColorSuffix = `
void main() {
    gl_FragColor = vec4(getColor(),1.);
}`
        updateFinalDw = (text) => {
            finalFsq.updateFragmentShader(text + toFragColorSuffix)
        }
    }
}