/*
    Performance-optimal
    It's going to cover the whole screen

    You only want to "draw" once so


    Plan
        every letter in a big tall texture, centered

    canvas https://webglfundamentals.org/webgl/lessons/webgl-text-texture.html
    a bit more https://webglfundamentals.org/webgl/lessons/webgl-text-glyphs.html

    atlas builder https://github.com/memononen/fontstash
*/

async function initText() {
    const textCtx = canvas.getContext("2d");

    // Puts text in center of canvas.
    function makeTextCanvas(text, width, height)
    {
        textCtx.canvas.width = width;
        textCtx.canvas.height = height;
        textCtx.font = "20px monospace";
        textCtx.textAlign = "center";
        textCtx.textBaseline = "middle";
        textCtx.fillStyle = "black";
        textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
        textCtx.fillText(text, width / 2, height / 2);
        return textCtx.canvas;
    }

    // const texture = await Texture("data/earthColor.png")

    let unchangingUnitSquareVertices = Array()
    for (let i = 0; i < 4; ++i)
    {
        let p = new Float32Array(16)
        pointX(p, .5)
        pointY(p, .5)
        pointZ(p, 0.)
        pointW(p, 1.)

        if (i % 2) pointX(p, -.5)
        if (i < 2) pointY(p, -.5)

        unchangingUnitSquareVertices.push(p)
    }

    let quadBuffer = new Float32Array(6 * 4)
    let orderedIndices = [0, 2, 1, 3, 1, 2]
    for (let i = 0; i < orderedIndices.length; ++i)
    {
        quadBuffer[i * 4 + 0] = pointX(unchangingUnitSquareVertices[orderedIndices[i]])
        quadBuffer[i * 4 + 1] = pointY(unchangingUnitSquareVertices[orderedIndices[i]])
        quadBuffer[i * 4 + 2] = pointZ(unchangingUnitSquareVertices[orderedIndices[i]])
        quadBuffer[i * 4 + 3] = pointW(unchangingUnitSquareVertices[orderedIndices[i]])
    }

    const vsSource = shaderHeader + `
        attribute vec4 pointA;
        varying vec2 uv;

        void main(void) {
            vec4 p = pointA;

            uv = pointA.xy + .5;

            //camera, "just" squashing so it goes on screen
            p.x /= rightAtZZero;
            p.y /= topAtZZero;
            p.z /= frontAndBackZ;

            gl_Position = p;
        }
        `
    const fsSource = shaderHeader + `
        varying vec2 uv;

        uniform sampler2D sampler;

        void main(void) {
            vec4 texelColor = texture2D(sampler, vec2(uv.x,1.-uv.y)); //1- because jfc opengl

            gl_FragColor = vec4(texelColor.rgb, texelColor.a);
        }
        `

    const program = Program(vsSource, fsSource)
    program.addVertexAttribute("point", quadBuffer, 4, true)

    program.locateUniform("rightAtZZero")
    program.locateUniform("topAtZZero")
    program.locateUniform("frontAndBackZ")

    const texture = await Texture("data/earthColor.png")
    program.locateUniform("sampler")

    renderFunctions.push(() =>
    {
        gl.useProgram(program.glProgram);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(program.uniformLocations.sampler, 0);

        gl.uniform1f(program.uniformLocations.rightAtZZero, mainCamera.rightAtZZero);
        gl.uniform1f(program.uniformLocations.topAtZZero, mainCamera.topAtZZero);
        gl.uniform1f(program.uniformLocations.frontAndBackZ, mainCamera.frontAndBackZ);

        program.enableVertexAttribute("point", quadBuffer)

        gl.drawArrays(gl.TRIANGLES, 0, quadBuffer.length / 4);
    })
}