function makeTextSign(originalText, twoSided, materialOnly, originCornered)
{
	if(twoSided == undefined)
	{
		twoSided = true;
	}

	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");
	var material = new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(canvas)});

	material.setText = function(text)
	{
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

		this.map.needsUpdate = true;

		//the geometry isn't affected ofc
	}
	material.setText(originalText);

	if(materialOnly !== undefined && materialOnly === true)
	{
		return material;
	}

	if(originCornered===undefined|| originCornered === false)
	{
		var geo = new THREE.PlaneGeometry(canvas.width / canvas.height, 1)
	}
	else
	{
		var geo = new THREE.OriginCorneredPlaneGeometry(canvas.width / canvas.height, 1)
	}
	
	if(twoSided)
	{
		var firstSign = new THREE.Mesh( geo, material );
		var secondSign = firstSign.clone();
		secondSign.rotation.y = TAU / 2;
		var sign = new THREE.Group();
		sign.add(firstSign, secondSign);
	}
	else
	{
		var sign = new THREE.Mesh( geo, material );
	}

	return sign;
}