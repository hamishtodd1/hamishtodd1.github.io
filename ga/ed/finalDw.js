function initFinalDw() {
    let ourDw = new Dw("final", false)
    // ourDw.elem.style.display = 'none'

    ourDw.elem.style.bottom = "0px"

    let finalFsq = FullScreenQuad()
    ourDw.scene.add(finalFsq)

    let toFragColorSuffix = `
void main() {
    vec4 myCol = vec4(0.,0.,0.,1.);
    mainImage(myCol);

    gl_FragColor = vec4(myCol);
}`
    updateFinalDw = (text) => {
        finalFsq.updateFragmentShader(text + toFragColorSuffix)
    }
}