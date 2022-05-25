function initFinalDw($dwEl) {
    let dw = new Dw("final",$dwEl, false)

    let finalFsq = FullScreenQuad()
    dw.scene.add(finalFsq)

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