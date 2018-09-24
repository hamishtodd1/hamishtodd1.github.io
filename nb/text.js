function makeTextSign(text)
{
	//"Context" is a persistent thing
	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");

	var backgroundMargin = 50;
	var textSize = 100;
	var backGroundColor = "white"
	var textColor = "black"

	var sign = new THREE.Mesh(new THREE.PlaneBufferGeometry(0.05,0.05), new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(canvas)}));
	
	sign.updateText = function(text)
	{
		sign.text = text;
		
		context.font = textSize + "pt Arial";
		var textWidth = context.measureText(text).width;
		canvas.width = textWidth + backgroundMargin;
		canvas.height = textSize + backgroundMargin;

		context = canvas.getContext("2d");
		context.font = textSize + "pt Arial";
		context.textAlign = "center";
		context.textBaseline = "middle";
		
		context.fillStyle = backGroundColor;
		context.fillRect(canvas.width / 2 - textWidth / 2 - backgroundMargin / 2, canvas.height / 2 - textSize / 2 - +backgroundMargin / 2, textWidth + backgroundMargin, textSize + backgroundMargin);
		
		context.fillStyle = textColor;
		context.fillText(text, canvas.width / 2, canvas.height / 2);

		sign.scale.x = sign.scale.y * canvas.width/canvas.height;

		sign.material.map.needsUpdate = true
	}

	sign.updateText(text)

	return sign;
}