function initFinalDw() {
    let ourDw = new Dw("final", false)
    // ourDw.elem.style.display = 'none'

    ourDw.elem.style.bottom = "0px"

    let finalFsq = FullScreenQuad()
    ourDw.scene.add(finalFsq)

    let toFragColorSuffix = `
void main() {
    vec3 myCol = vec3(0.,0.,0.);
    mainImage(myCol);

    gl_FragColor = vec4(myCol,1.);
}`
    updateFinalDw = (text) => {
        finalFsq.updateFragmentShader(text + toFragColorSuffix)
    }
}