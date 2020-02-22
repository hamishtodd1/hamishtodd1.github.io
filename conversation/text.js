function makeTextSign(initialText)
{
	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");

	var sign = new THREE.Mesh( unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas) }) );

	sign.setText = function(text)
	{
		if(sign.currentText === text)
			return

		sign.currentText = text

		var font = "Trebuchet"
		var backgroundMargin = 50;
		var textSize = 100;
		context.font = textSize + "pt " + font;
		var textWidth = context.measureText(text).width;
		canvas.width = textWidth + backgroundMargin;
		canvas.height = textSize + backgroundMargin;

		context.font = textSize + "pt " + font;
		context.textAlign = "center";
		context.textBaseline = "middle";
		
		var backGroundColor = "#3F3D3F"
		context.fillStyle = backGroundColor;
		context.fillRect(
			canvas.width / 2 - textWidth / 2 - backgroundMargin / 2, 
			canvas.height / 2 - textSize / 2 - backgroundMargin / 2,
			textWidth + backgroundMargin, 
			textSize + backgroundMargin);
		
		var textColor = "#D3D1D3"
		context.fillStyle = textColor;
		context.fillText(text, canvas.width / 2, canvas.height / 2);

		sign.material.map.needsUpdate = true;

		sign.scale.x = canvas.width / canvas.height * sign.scale.y;

		//the geometry isn't affected ofc
	}

	sign.setText(initialText);
	return sign;
}