function initOutputColumn()
{
    outputColumn.renderOrder = 0
    outputColumn.material.depthTest = false

    outputColumn.position.x = -camera.rightAtZZero
    outputColumn.left = () => outputColumn.position.x - outputColumn.scale.x / 2.
    outputColumn.right = () => outputColumn.position.x + outputColumn.scale.x / 2.
    getDisplayColumnWidth = () => Math.abs(-camera.rightAtZZero - outputColumn.left())
    scene.add(outputColumn)
    onClicks.push({
        z: () => mouse.areaIn() === "column" ? 0. : -Infinity,
        during: ()=>{
            outputColumn.position.x = mouse.getZZeroPosition(v1).x
        }
    })
    updateFunctions.push(()=>{
        let cursorStyle = "default"
        let area = mouse.areaIn()
        if (mouse.displayWindowMouseIsOn() !== null)
            cursorStyle = "grab" //you might like "grabbing" but we can't rely on domElement to change it
        else if (area === "column")
            cursorStyle = "col-resize"
        else if (area === "pad")
            cursorStyle = "text"
        renderer.domElement.style.cursor = cursorStyle

        outputColumn.position.x = clamp(outputColumn.position.x, -camera.rightAtZZero + outputColumn.scale.x / 2., camera.rightAtZZero - outputColumn.scale.x / 2.)
        //and maybe resize as well?

        outputColumn.scale.setScalar(getWorldLineHeight())
    })
}