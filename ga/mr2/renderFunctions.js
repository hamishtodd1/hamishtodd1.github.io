function initRenderFunctions() {
    const orders = []
    const renderFunctions = []

    addRenderFunction = function(func, order) {
        if (order === undefined)
            order = "start"

        if(order === "end") {
            renderFunctions.splice(orders.length, 0, func)
            orders.splice(orders.length, 0, order)
        }
        else {
            renderFunctions.splice(0, 0, func)
            orders.splice(0, 0, order)
        }
    }

    function renderEverything() {
        gl.clearColor(backgroundColor[0] / 255., backgroundColor[1] / 255., backgroundColor[2] / 255., 1.0);
        gl.clearDepth(1.0); //depth buffer(?)
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        let depthTestEnabled = true
        for(let i = 0; i < renderFunctions.length; ++i) {
            if(orders[i] === "end" && depthTestEnabled)
                gl.disable(gl.DEPTH_TEST);

            renderFunctions[i]()
        }
    }

    return renderEverything
}