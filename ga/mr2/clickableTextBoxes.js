function initClickableTextBoxes() {
    let clickableTextBoxes = []
    ClickableTextBox = function (str,onClick) {
        this.position = new ScreenPosition()

        clickableTextBoxes.push(this)

        this.str = str
        this.visible = true

        this.width = str.length * characterWidth
        
        let self = this
        mouseResponses.push({
            z: () => {
                let inside = mouse.inBounds(
                    self.position.x - self.width / 2.,
                    self.position.x + self.width / 2.,
                    self.position.y + .5,
                    self.position.y - .5)
                if (inside && self.visible)
                    return Infinity
                else
                    return -Infinity
            },
            start: onClick
        })
    }

    addRenderFunction( () => {
        clickableTextBoxes.forEach((ctb) => {
            if (ctb.visible) {
                for (let i = 0; i < ctb.str.length; ++i) {
                    let x = ctb.position.x - ctb.width * .5 + characterWidth * i
                    addCharacterToDraw(ctb.str[i], x, ctb.position.y)
                }
            }
        })
    })
}