function ceilPowerOfTwo( value )
{
	return Math.pow( 2, Math.ceil( Math.log( value ) / Math.LN2 ) );
}

function makeTextSign(originalText, twoSided, materialOnly, originCornered)
{
	if(twoSided == undefined)
	{
		twoSided = true;
	}

	let canvas = document.createElement("canvas");
	let context = canvas.getContext("2d");
	let material = new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(canvas)});

	material.setText = function(text)
	{
		let font = "Trebuchet"
		let resolution = 128
		canvas.height = resolution

		let approximateVerticalPaddingProportion = 0.27
		//Ambiguous what this really is. Even without padding it fails to take up whole height.
		let textHeight = Math.round(canvas.height * (1-approximateVerticalPaddingProportion))
		context.font = textHeight + "pt " + font;

		let textWidth = context.measureText(text).width;
		canvas.width =  ceilPowerOfTwo(textWidth);

		context.font = textHeight + "pt " + font; //yes, seriously
		context.textAlign = "center";
		context.textBaseline = "middle";
		
		let backGroundColor = "#3F3D3F"
		context.fillStyle = backGroundColor;
		context.fillRect(0,0,canvas.width,canvas.height);
		
		let textColor = "#D3D1D3"
		context.fillStyle = textColor;
		context.fillText(text, canvas.width / 2, canvas.height / 2);

		this.map.needsUpdate = true;

		return textWidth

		//geometry isn't affected
	}
	let textWidth = material.setText(originalText);

	if(materialOnly !== undefined && materialOnly === true)
	{
		return material;
	}

	if( originCornered===undefined)
	{
		originCornered = false
	}
	let geo = originCornered ? new THREE.OriginCorneredPlaneGeometry(textWidth/canvas.height, 1) : new THREE.PlaneGeometry(textWidth/canvas.height, 1)

	let trimOff = 0.5 - (textWidth/canvas.width)/2
	for(let i = 0; i < 2; i++)
	{
		for(let j = 0; j < 3; j++)
		{
			if( geo.faceVertexUvs[0][i][j].x == 0)
			{
				geo.faceVertexUvs[0][i][j].x = trimOff
			}
			else
			{
				geo.faceVertexUvs[0][i][j].x = 1 - trimOff
			}
		}
	}
	geo.uvsNeedUpdate = true
	
	let sign = null
	if(twoSided)
	{
		let firstSign = new THREE.Mesh( geo, material );
		let secondSign = firstSign.clone();
		secondSign.rotation.y = TAU / 2;
		sign = new THREE.Group();
		sign.add(firstSign, secondSign);
	}
	else
	{
		sign = new THREE.Mesh( geo, material );
	}

	return sign;
}