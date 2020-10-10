function getVariableNameAsString(variableWrappedInAnObject){
    if(typeof a !== "object")
        log("needs to be {input}")
    return Object.keys(variableWrappedInAnObject)[0]
}

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
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    const image = new Image();
    await (new Promise(resolve => {
        image.src = src;
        image.onload = resolve
    }))

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        srcFormat, srcType, image); //can you flip it in here?

    //no mipmaps
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

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
    const glProgram = gl.createProgram()
    const program = {
        glProgram,
        vertexAttributes: {},
        uniformLocations: {}
    };

    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
    gl.attachShader(glProgram, vertexShader);
    gl.attachShader(glProgram, fragmentShader);
    gl.linkProgram(glProgram);

    if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS))
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(glProgram));

    program.locateUniform = (name) => {
        program.uniformLocations[name] = gl.getUniformLocation(glProgram, name)
    }

    program.addVertexAttribute = (name, arr, itemSize) => {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW)

        program.vertexAttributes[name] = {
            buffer, itemSize,
            location: gl.getAttribLocation(glProgram, name + "A")
        }
    }
    program.enableVertexAttribute = (name) => {
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;

        let va = program.vertexAttributes[name]
        gl.enableVertexAttribArray(va.location); //weird since you use the location below as well
        gl.bindBuffer(gl.ARRAY_BUFFER, va.buffer);
        gl.vertexAttribPointer(
            va.location,
            va.itemSize,
            type,
            normalize,
            stride,
            offset);
    }

    return program
}