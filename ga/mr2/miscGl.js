async function Texture(src) {
    const texture = gl.createTexture();
    
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    // gl.bindTexture(gl.TEXTURE_2D, texture);
    // gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
    //     width, height, border, srcFormat, srcType,
    //     pixel);

    const image = new Image();
    await (new Promise(resolve => {
        image.src = src;
        image.onload = resolve
    }))

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        srcFormat, srcType, image);

    // isPowerOf2 = (value) => (value & (value - 1)) == 0
    // if (isPowerOf2(image.width) && isPowerOf2(image.height))
    //     gl.generateMipmap(gl.TEXTURE_2D);
    // else
    {
        // Turn off mips and set
        // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    return texture
}

function loadShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));

    return shader;
}
function Program(vsSource, fsSource) {
    const shaderProgram = gl.createProgram();

    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));

    return shaderProgram
}

async function initTest()
{
    const vsSource = `
        attribute vec4 a_position;
        void main() {
            gl_Position = a_position;
        }
    `
    const fsSource = `
        precision mediump float;

        void main() {
            gl_FragColor = vec4(1., 0., 0.5, 1.);
        }
    `

    const program = Program(vsSource, fsSource)

    var positions = [
        0., 0.,
        0., 0.5,
        0.5, 0.,
    ];
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    renderFunctions.push(()=>{
        gl.useProgram(program);

        // Turn on the attribute
        gl.enableVertexAttribArray(positionAttributeLocation);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer( positionAttributeLocation, size, type, normalize, stride, offset);

        // draw
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 3;
        gl.drawArrays(primitiveType, offset, count);
    })
}