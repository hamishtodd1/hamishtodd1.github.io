'use strict'

function initTextboxes() {
    let textboxes = []
    class Textbox {
        constructor(str,r,g,b) {
            textboxes.push(this)

            this.position = new ScreenPosition()

            this.r = r
            this.g = g
            this.b = b

            this.visible = true
            this.setText(str)
        }
        setText(newStr) {
            this.str = newStr
            this.width = newStr.length * characterWidth
        }
    }
    // debugger

    addRenderFunction(() => {
        textboxes.forEach((tb) => {
            if (tb.visible) {
                for (let i = 0; i < tb.str.length; ++i) {
                    let x = tb.position.x - tb.width * .5 + characterWidth * i
                    addCharacterToDraw(tb.str[i],tb.r,tb.g,tb.b, x, tb.position.y)
                }
            }
        })
    })

    class ClickableTextbox extends Textbox {
        constructor(str, onClick) {
            super(str,0.,0.,0.)

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
    }

    window.ClickableTextbox = ClickableTextbox
    window.Textbox = Textbox
}