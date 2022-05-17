function initFinalDw($dwEl) {
    let dw = new Dw("final",$dwEl, false)
    dw.elem.style.display = 'none'

    let finalFsq = FullScreenQuad(new THREE.ShaderMaterial())
    dw.scene.add(finalFsq)

    let toFragColorSuffix = `
void main() {
    vec4 myCol = vec4(0.,0.,0.,1.);
    mainImage(myCol);

    gl_FragColor = vec4(myCol);
}`
    updateOutputDw = (text) => {
        finalFsq.material.fragmentShader = text + toFragColorSuffix
        finalFsq.material.needsUpdate = true
    }
}