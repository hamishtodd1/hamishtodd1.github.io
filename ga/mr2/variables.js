const canvas = document.createElement("CANVAS")
document.body.appendChild(canvas)
const gl = canvas.getContext("webgl2")
if (!gl)
    console.error("Failed to get WebGL context, browser or device may not support WebGL.")

mainCamera = {
    aspect:0.,
    topAtZZero:0.,
    rightAtZZero:0.
}

const renderFunctions = []