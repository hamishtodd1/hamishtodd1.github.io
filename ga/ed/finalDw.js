function initFinalDw() {
    let dw = new Dw("final", false)
    dw.elem.style.bottom = "0px"
    // dw.elem.style.display = 'none'

    //vertex version
    if(0)
    {
        let mat = new THREE.ShaderMaterial({
            uniforms: {
            }
        })
        mat.vertexShader = `
varying vec4 coord;
varying vec2 frameCoord;

void main()
{
	coord = modelMatrix * vec4(position, 1.);
	frameCoord = position.xy + .5;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`
        mat.fragmentShader = `
void main() {
    gl_FragColor = vec4(1., 1., 1., 1.);
}`
        let ourPoints = new THREE.Points(geo,mat)
        dw.addNonMentionChild(ourPoints)
    }

    // fragment version
    {
        let finalFsq = FullScreenQuad()
        dw.addNonMentionChild(finalFsq)

        let toFragColorSuffix = `
void main() {
    vec3 myCol = getFragmentColor();

    gl_FragColor = vec4(myCol,1.);
}`
        updateFinalDw = (text) => {
            finalFsq.updateFragmentShader(text + toFragColorSuffix)
        }
    }
}