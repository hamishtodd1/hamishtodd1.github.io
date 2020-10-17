/*
    Performance-optimal
    It's going to cover the whole screen

    You only want to "draw" once so

    You want to batch it
    Would be nice to have it in one draw call
    very large number of vertices in the array, but use the "count" argument to give what you need

    every letter in a big tall texture, centered
    

    canvas https://webglfundamentals.org/webgl/lessons/webgl-text-texture.html
    a bit more https://webglfundamentals.org/webgl/lessons/webgl-text-glyphs.html

    atlas builder https://github.com/memononen/fontstash
*/

function initCharacterTexture(typeableCharacters) {
    const maxCharacters = 512 //noticeable load time increase when changed

    let characterIndices = {}
    for(let i = 0; i < typeableCharacters.length; ++i)
        characterIndices[typeableCharacters[i]] = i

    let characterAttributeBuffer = new Float32Array(maxCharacters*6) //could be 16
    let positionAttributeBuffer = new Float32Array(maxCharacters*6*2)

    addCharacterToDraw = function(character,drawingPosition) {
        if(numCharactersToDraw >= maxCharacters) {
            console.error("character limit hit")
        }
        else {
            let i = numCharactersToDraw * 6
            for (let j = 0; j < 6; ++j) {
                characterAttributeBuffer[i + j] = characterIndices[character]
                positionAttributeBuffer[(i + j) * 2 + 0] = drawingPosition.x
                positionAttributeBuffer[(i + j) * 2 + 1] = drawingPosition.y
            }
            //can make these uniforms instead for 6x less of this and a 6x smaller buffer in the end, but more draw calls
            //easy to check difference
            ++numCharactersToDraw
        }
    }
    let numCharactersToDraw = 0

    // https://delphic.me.uk/tutorials/webgl-text
    const texture = gl.createTexture();
    {
        const monospaceHeightOverWidth = 1.8188277087

        const textCanvas = document.createElement("canvas")
        var ctx = textCanvas.getContext("2d");

        const height = 64
        const fontHeight = Math.floor(height / 1.3) //1.3 was in tutorial. It's the spacing above and below. Probably fine to add more if you want
        textCanvas.height = height;

        const widthTakenUpByCharacters = fontHeight / monospaceHeightOverWidth * typeableCharacters.length
        const width = nextPowerOf2(widthTakenUpByCharacters)
        var proportionOfTextureTakenUpByCharacters = widthTakenUpByCharacters / width
        textCanvas.width = width;

        let proportionOfTextureTakenUpByOneCharacter = proportionOfTextureTakenUpByCharacters / typeableCharacters.length
        var singleCharacterHeightOverWidth = height / (width * proportionOfTextureTakenUpByOneCharacter)

        ctx.font = fontHeight + "px monospace"; //can't put this before the above because state machine
        ctx.textBaseline = "middle"; //vertical
        ctx.textAlign = "start";
        ctx.fillStyle = "black";

        ctx.fillStyle = "rgb("+backgroundColor[0]+","+backgroundColor[1]+","+backgroundColor[2]+")";
        // ctx.fillStyle = "rgb(255,0,0)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "black";
        ctx.fillText(typeableCharacters, 0, height / 2);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    const vsSource = shaderHeader + `
        attribute vec4 pointA;

        const float proportionOfTextureTakenUpByCharacters = ` + proportionOfTextureTakenUpByCharacters + `;
        const float totalCharactersInTexture = `+ typeableCharacters.length +`.;
        
        attribute float characterIndexA;
        varying vec2 uv;
        attribute vec2 screenPositionA;

        const float width = `+ characterWidth +`;
        const float height = `+ characterWidth * singleCharacterHeightOverWidth +`;

        void main(void) {
            vec4 p = pointA;
            p.x *= width;
            p.y *= height;
            p.xy += screenPositionA;

            //uv comes from characterIndex
            // uv = screenPosition + pointA.xy + .5;

            //might need to chop off some left and right
            uv.x = pointA.x < .5 ? characterIndexA : characterIndexA+1.;
            uv.x /= totalCharactersInTexture / proportionOfTextureTakenUpByCharacters;
            uv.y = pointA.y > 0. ? 0. : 1.;

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
            gl_FragColor = texture2D(sampler, uv);
        }
        `

    const program = Program(vsSource, fsSource)
    program.locateUniform("sampler")

    //unit square centered at (.5,0.)
    const pBuffer = new Float32Array(quadBuffer.length * maxCharacters)
    for(let j = 0; j < maxCharacters; ++j) {
        for(let i = 0; i < pBuffer.length / 4; ++i) {
            pBuffer[j*quadBuffer.length+i] = quadBuffer[i]
            if(i%4 === 0)
                pBuffer[j * quadBuffer.length +i] += .5
        }
    }
    program.addVertexAttribute("point", pBuffer, 4, false)

    program.addVertexAttribute("characterIndex", characterAttributeBuffer, 1, true)
    program.addVertexAttribute("screenPosition", positionAttributeBuffer, 2, true)

    program.locateUniform("rightAtZZero")
    program.locateUniform("topAtZZero")
    program.locateUniform("frontAndBackZ")

    addRenderFunction(() =>
    {
        gl.useProgram(program.glProgram);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(program.uniformLocations.sampler, 0);

        gl.uniform1f(program.uniformLocations.rightAtZZero, mainCamera.rightAtZZero);
        gl.uniform1f(program.uniformLocations.topAtZZero, mainCamera.topAtZZero);
        gl.uniform1f(program.uniformLocations.frontAndBackZ, mainCamera.frontAndBackZ);

        program.doSomethingWithVertexAttribute("point")
        program.doSomethingWithVertexAttribute("screenPosition",positionAttributeBuffer)
        program.doSomethingWithVertexAttribute("characterIndex",characterAttributeBuffer)

        gl.drawArrays(gl.TRIANGLES, 0, numCharactersToDraw * 6);

        numCharactersToDraw = 0
    })
}