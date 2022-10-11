function text(initialText,materialOnly,textColorHex) {
	if (materialOnly === undefined) materialOnly = false

	//potential speedup? really canvases everywhere?
	let canvas = document.createElement("canvas")
	let ctx = canvas.getContext("2d")
	let material = new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(canvas), transparent: true})

    const font = "Arial"
    const textHeight = 128 //is gonna be 128 high
    const fullFont = "bold " + textHeight + "px " + font

    let textColor = textColorHex || "#FFFFFF"

    let textureDimensionsDecided = false

	let currentText = ""
	material.setText = function(text) {
		if(currentText === text)
			return

        let oldText = currentText
		currentText = text

		ctx.font = fullFont
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
		let textWidth = ctx.measureText(text).width
        let currentAspect = textWidth / textHeight
        if (!textureDimensionsDecided) {
            canvas.width = canvas.height * currentAspect
            textureDimensionsDecided = true
        }
        else {
            if(currentAspect > canvas.width / canvas.height) {
                console.error("variable name too long")
                currentText = oldText
            }
        }

		ctx.font = fullFont
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		
		ctx.clearRect(0,0,canvas.width, canvas.height )

        // ctx.fillStyle = 'blue'
        // ctx.fillRect(0,0, canvas.width,canvas.height)

        ctx.font = fullFont
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
		
		ctx.fillStyle = textColor
        let textCenterX = canvas.width / 2
        let textCenterY = canvas.height / 2
		ctx.fillText(text, textCenterX,textCenterY)

		this.map.needsUpdate = true

		if( materialOnly === false)
			sign.scale.x = this.getAspect() * sign.scale.y
	}
	material.getText = function() {
		return currentText
	}

	material.getAspect = function() {
		return canvas.width / canvas.height
	}

	if(materialOnly) {
		material.setText(initialText)
		return material
	}

	let sign = new THREE.Mesh(unchangingUnitSquareGeometry, material)
	material.setText(initialText)
	sign.scale.x = material.getAspect() * sign.scale.y

	return sign
}