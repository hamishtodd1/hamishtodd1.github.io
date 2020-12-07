function initSliderPictograms() {
    let drawers = []

    let width = 1.4

    //line
    {
        let vs = `
        attribute vec4 vertA;
        void main(void) {
            gl_Position = vertA;
        `
        let fs = `
        void main(void) {
            gl_FragColor = vec4(0.,0.,0.,1.);
        `

        let rectBuffer = new Float32Array(quadBuffer.length)
        for(let i = 0; i < rectBuffer.length; ++i) {
            rectBuffer[i] = quadBuffer[i]
            if (i % 4 === 1)
                rectBuffer[i] *= .04;
            if (i % 4 === 0)
                rectBuffer[i] *= width;
        }

        let pictogramDrawer = new PictogramDrawer(vs, fs)
        drawers.push(pictogramDrawer)
        pictogramDrawer.program.addVertexAttribute("vert", rectBuffer, 4, false)

        function renderRect() {
            gl.useProgram(pictogramDrawer.program.glProgram)
            pictogramDrawer.program.prepareVertexAttribute("vert", rectBuffer)

            pictogramDrawer.finishPrebatchAndDrawEach(() => {
                gl.drawArrays(gl.TRIANGLES, 0, rectBuffer.length / 4)
            })
        }
    }

    //pointer
    {
        let vs = `
        attribute vec4 vertA;
        uniform float visualPosition;
        void main(void) {
            gl_Position = vertA;
            gl_Position.x += visualPosition;
        `
        let fs = `
        void main(void) {
            gl_FragColor = vec4(1.,1.,1.,1.);
        `

        let buff = new Float32Array([
            0.,0.,0.,1.,
            -.12,-.12,0.,1.,
            .12,-.12,0.,1.
        ])

        let pictogramDrawer = new PictogramDrawer(vs, fs)
        drawers.push(pictogramDrawer)
        pictogramDrawer.program.addVertexAttribute("vert", buff, 4, false)
        pictogramDrawer.program.locateUniform("visualPosition")

        function renderPointer() {
            gl.useProgram(pictogramDrawer.program.glProgram)
            pictogramDrawer.program.prepareVertexAttribute("vert", buff)

            pictogramDrawer.finishPrebatchAndDrawEach((nameProperties) => {
                let visualX = width * (nameProperties.value - .5)
                gl.uniform1f(pictogramDrawer.program.getUniformLocation("visualPosition"), visualX)
                gl.drawArrays(gl.TRIANGLES, 0, buff.length / 4)
            })
        }
    }

    addRenderFunction(()=>{
        renderRect()
        renderPointer()
    })

    addType("slider", drawers, {
        during: (name, x, y) => {
            getNameDrawerProperties(name).value = x / width + .5
            getNameDrawerProperties(name).value = clamp(getNameDrawerProperties(name).value,0.,1.)
        },
    })
}