function getVariableNameAsString(variableWrappedInAnObject){
    if(typeof a !== "object")
        log("needs to be {input}")
    return Object.keys(variableWrappedInAnObject)[0]
}

async function Texture(src,aspect) {
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

    const $image = new Image();
    await (new Promise(resolve => {
        $image.src = src;
        $image.onload = resolve
    }))

    if (aspect)
        aspect.value = $image.width / $image.height

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        srcFormat, srcType, $image); //can you flip it in here?

    //no mipmaps
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return texture
}

function loadShader(type,source) { //more like "initialize"
    const shader = gl.createShader(type);
    setShaderSourceAndCompile(shader, source)
    return shader
}

function setShaderSourceAndCompile(shader,source) {
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        let infolog = gl.getShaderInfoLog(shader)
        let lineNumber = (infolog[2]).split(":")
        
        let lines = source.split("\n");
        for (let i = 0; i < lines.length; ++i) {
            let startPosition = 0
            while (startPosition < lines[i].length && (lines[i][startPosition] === " " || lines[i][startPosition] === " "))
                ++startPosition
            log((i + 1) + " " + lines[i].substr(startPosition))

            if(i === lineNumber)
                console.error(infolog)
        }

        alert(infolog);
    }

    return shader;
}

function Program(vsSource, fsSource) {
    const glProgram = gl.createProgram()
    this.glProgram = glProgram
    this.vertexAttributes = {}
    this.uniformLocations = {}

    let self = this

    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
    gl.attachShader(glProgram, vertexShader);
    gl.attachShader(glProgram, fragmentShader);
    gl.linkProgram(glProgram);

    // gl.detachShader(glProgram, vertexShader);
    // gl.detachShader(glProgram, fragmentShader);
    // gl.deleteShader(vertexShader)
    // gl.deleteShader(fragmentShader)

    if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {

        let fullString = 'Unable to initialize the shader program, error is: ' + gl.getProgramInfoLog(glProgram)
        alert(fullString);
        console.error("here's vsSource:")
        console.log(vsSource)
        console.error("and here's fsSource:")
        console.log(fsSource)
    }

    this.locateUniform = (name) => {
        self.uniformLocations[name] = gl.getUniformLocation(glProgram, name)
    }
    this.locateVertexAttribute = (name) => {
        self.vertexAttributes[name].location = gl.getAttribLocation(glProgram, name + "A")
    }

    this.changeShader = (type,source) => {
        let shaderToChange = type === gl.VERTEX_SHADER ? vertexShader : fragmentShader
        setShaderSourceAndCompile(shaderToChange, source)

        gl.linkProgram(glProgram);

        //assumes there's no new things!
        Object.keys(self.uniformLocations).forEach((uniformName)=>{
            self.locateUniform(uniformName)
        })
        Object.keys(self.vertexAttributes).forEach((vertexAttributeName)=>{
            self.locateVertexAttribute(vertexAttributeName)
        })
    }

    this.getUniformLocation = (name) => {
        if (self.uniformLocations[name] === undefined)
            console.error("no uniform named ",name, " have you located it?")
        return self.uniformLocations[name]
    }

    this.addVertexAttribute = (name, itemSize, arr) => {
        const bufferId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        
        if(arr) {
            if ( !(arr instanceof Float32Array) )
                console.error("needs to be float32Array")
            gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW)
        }

        self.vertexAttributes[name] = {
            bufferId, itemSize
        }
        this.locateVertexAttribute(name)
    }
    this.prepareVertexAttribute = (name,updatedArray) => {
        let va = self.vertexAttributes[name]

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

        if (updatedArray !== undefined) //i.e. it's dynamic
            gl.bufferData(gl.ARRAY_BUFFER, updatedArray, gl.DYNAMIC_DRAW)
    }
}