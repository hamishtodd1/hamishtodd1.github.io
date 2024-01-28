function text(initialText,materialOnly,textColorHex, clear) {
	if (materialOnly === undefined) materialOnly = false

	//potential speedup? really canvases everywhere?
	let canvas = document.createElement("canvas")
	let context = canvas.getContext("2d")
	let material = new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(canvas), transparent: true})

	let currentText = ""
	material.setText = function(text) {
		if(currentText === text)
			return

		let font = "Arial"
		let backgroundMargin = 43
		let textSize = 85
		context.font = "bold " + textSize + "px " + font
		let textWidth = context.measureText(text).width
		canvas.width = textWidth + backgroundMargin
		canvas.height = textSize + backgroundMargin

		context.font = "bold " + textSize + "px " + font
		context.textAlign = "center"
		context.textBaseline = "middle"

		if (clear) {
			context.clearRect(
				canvas.width / 2 - textWidth / 2 - backgroundMargin / 2,
				canvas.height / 2 - textSize / 2 - backgroundMargin / 2,
				textWidth + backgroundMargin,
				textSize + backgroundMargin)	
		}
		else {
			context.fillStyle = "#CCCCCC"
			
			context.fillRect(
				canvas.width / 2 - textWidth / 2 - backgroundMargin / 2, 
				canvas.height / 2 - textSize / 2 - backgroundMargin / 2,
				textWidth + backgroundMargin, 
				textSize + backgroundMargin)
		}
		
		
		let textColor = textColorHex || "#FFFFFF"
		context.fillStyle = textColor
		context.fillText(text, canvas.width / 2, canvas.height / 2)

		this.map.needsUpdate = true

		if( materialOnly === false)
			sign.scale.x = material.getAspect() * sign.scale.y

		currentText = text
	}
	material.getText = function() {
		return currentText
	}

	material.getAspect = function() {
		return canvas.width / canvas.height
	}

	if(materialOnly) {
		material.setText(initialText);
		return material
	}

	let sign = new THREE.Mesh(unchangingUnitSquareGeometry, material);
	material.setText(initialText);
	sign.scale.x = material.getAspect() * sign.scale.y;

	return sign;
}