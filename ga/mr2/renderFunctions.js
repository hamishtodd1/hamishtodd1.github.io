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
        gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS); //is this the reason z is reversed?

        //this is just what was found to work with the globes
        gl.enable(gl.CULL_FACE);

        let depthTestEnabled = true
        for(let i = 0; i < renderFunctions.length; ++i) {
            if(orders[i] === "end" && depthTestEnabled)
                gl.disable(gl.DEPTH_TEST);

            renderFunctions[i]()
        }
    }

    return renderEverything
}