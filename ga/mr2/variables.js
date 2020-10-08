{
    const canvas = document.createElement("CANVAS")
    document.body.appendChild(canvas)
    gl = canvas.getContext("webgl2")
}
if (!gl)
    console.error("Failed to get WebGL context, browser or device may not support WebGL.")

const mainCamera = {
    topAtZZero:0.,
    rightAtZZero:0.
}

const renderFunctions = []