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

    program.addVertexAttribute = (name, arr, itemSize, dynamic) => {
        if ( !(arr instanceof Float32Array) )
            console.error("needs to be float32Array")
        const bufferId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferData(gl.ARRAY_BUFFER, arr, dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW)

        program.vertexAttributes[name] = {
            bufferId, itemSize,
            location: gl.getAttribLocation(glProgram, name + "A") //yeah don't forget that
        }
    }
    program.doSomethingWithVertexAttribute = (name,updatedArray) => {
        let va = program.vertexAttributes[name]

        gl.enableVertexAttribArray(va.location); //not sure this is necessary here

        gl.bindBuffer(gl.ARRAY_BUFFER, va.bufferId);
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.vertexAttribPointer(
            va.location,
            va.itemSize,
            type,
            normalize,
            stride,
            offset);

        if (updatedArray !== undefined)
            gl.bufferData(gl.ARRAY_BUFFER, updatedArray, gl.DYNAMIC_DRAW)
    }

    return program
}

function logShader(source)
{
    let lines = source.split("\n");
    for (let i = 0; i < lines.length; ++i)
        log((i + 1) + " " + lines[i])
}

sq = (x) => x * x