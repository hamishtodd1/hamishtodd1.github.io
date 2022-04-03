function text(initialText,materialOnly,textColorHex)
{
	if (materialOnly === undefined) materialOnly = false

	let canvas = document.createElement("canvas");
	let context = canvas.getContext("2d");
	let material = new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(canvas)});

	let currentText = ""
	material.setText = function(text)
	{
		if(currentText === text)
			return

		currentText = text

		let font = "Trebuchet"
		let backgroundMargin = 50;
		let textSize = 100;
		context.font = textSize + "pt " + font;
		let textWidth = context.measureText(text).width;
		canvas.width = textWidth + backgroundMargin;
		canvas.height = textSize + backgroundMargin;

		context.font = textSize + "pt " + font;
		context.textAlign = "center";
		context.textBaseline = "middle";
		
		let backGroundColor = "#" + renderer.getClearColor(new THREE.Color()).getHexString()
		context.fillStyle = backGroundColor;
		context.fillRect(
			canvas.width / 2 - textWidth / 2 - backgroundMargin / 2, 
			canvas.height / 2 - textSize / 2 - backgroundMargin / 2,
			textWidth + backgroundMargin, 
			textSize + backgroundMargin);
		
		let textColor = textColorHex || "#D3D1D3"
		context.fillStyle = textColor;
		context.fillText(text, canvas.width / 2, canvas.height / 2);

		this.map.needsUpdate = true;

		if( materialOnly === false)
			sign.scale.x = material.getAspect() * sign.scale.y;

		//the geometry isn't affected ofc
	}
	material.getText = function()
	{
		return currentText
	}

	material.getAspect = function()
	{
		return canvas.width / canvas.height
	}

	if(materialOnly)
	{
		material.setText(initialText);
		return material
	}

	let sign = new THREE.Mesh(unchangingUnitSquareGeometry, material);
	material.setText(initialText);
	sign.scale.x = material.getAspect() * sign.scale.y;

	return sign;
}