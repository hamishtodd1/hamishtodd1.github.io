function initPortraits()
{
	let copiedImageNotFoundSign = makeTextSign("Copied image not found")
	copiedImageNotFoundSign.scale.multiplyScalar(0.1)
	copiedImageNotFoundSign.material.opacity = 0;
	copiedImageNotFoundSign.material.transparent = true
	updatables.push(copiedImageNotFoundSign)
	copiedImageNotFoundSign.update = function()
	{
		this.material.opacity -= frameDelta * 0.9
	}
	scene.add(copiedImageNotFoundSign)

	let pastedImageMesh = new THREE.Mesh(new THREE.OriginCorneredPlaneGeometry(1,1),new THREE.MeshBasicMaterial())
	pastedImageMesh.visible = false
	pastedImageMesh.position.z = 0.3
	scene.add(pastedImageMesh)

	let selectionBox = new THREE.LineLoop(new THREE.Geometry())
	selectionBox.position.z = pastedImageMesh.position.z + 0.01
	scene.add(selectionBox)
	selectionBox.geometry.vertices.push(
		new THREE.Vector3(0,0,0),
		new THREE.Vector3(1,0,0),
		new THREE.Vector3(1,1,0),
		new THREE.Vector3(0,1,0)
	)
	let selecting = false
	selectionBox.visible = false
	updatables.push(selectionBox)
	let initialMousePosition = new THREE.Vector3()
	selectionBox.update = function()
	{
		if( !makingSuspectPortrait )
		{
			return
		}

		if(mouse.clicking && !mouse.oldClicking && selecting === false)
		{
			selecting = true
			initialMousePosition.copy(mouse.zZeroPosition)
			selectionBox.visible = true
			selectionBox.scale.copy(zeroVector)
		}

		if(selecting)
		{
			selectionBox.position.x = mouse.zZeroPosition.x < initialMousePosition.x? mouse.zZeroPosition.x : initialMousePosition.x
			selectionBox.position.y = mouse.zZeroPosition.y < initialMousePosition.y? mouse.zZeroPosition.y : initialMousePosition.y
			selectionBox.scale.x  = Math.abs(mouse.zZeroPosition.x - initialMousePosition.x)
			selectionBox.scale.y  = Math.abs(mouse.zZeroPosition.y - initialMousePosition.y)
			selectionBox.scale.z = 1
		}

		if(!mouse.clicking && selecting === true)
		{
			if(selectionBox.scale.length()<1.01)
			{
				console.log("yo")
				selecting = false
				selectionBox.visible = false
			}
			else
			{
				selecting = false
				makingSuspectPortrait = false

				selectionBox.visible = false
				pastedImageMesh.visible = false

				let clippedMesh = new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:pastedImageMesh.material.map}))
				clippedMesh.scale.copy(selectionBox.scale)
				clippedMesh.position.copy(selectionBox.position)

				for(let i = 0; i < 4; i++)
				{
					let onPastedImage = selectionBox.geometry.vertices[i].clone()
					selectionBox.localToWorld(onPastedImage)
					pastedImageMesh.worldToLocal(onPastedImage)

					for(let j = 0; j < clippedMesh.geometry.faceVertexUvs[0].length; j++)
					{
						for(let k = 0; k < clippedMesh.geometry.faceVertexUvs[0][j].length; k++)
						{
							if( clippedMesh.geometry.faceVertexUvs[0][j][k].x === selectionBox.geometry.vertices[i].x &&
								clippedMesh.geometry.faceVertexUvs[0][j][k].y === selectionBox.geometry.vertices[i].y )
							{
								clippedMesh.geometry.faceVertexUvs[0][j][k].x = onPastedImage.x
								clippedMesh.geometry.faceVertexUvs[0][j][k].y = onPastedImage.y
							}
						}
					}
				}
				clippedMesh.geometry.uvsNeedUpdate = true

				scene.add(clippedMesh)
			}
		}
	}
	//click the profile picture and it opens this again

	document.addEventListener('paste', function (e)
	{
		if(e.clipboardData)
		{
			var items = e.clipboardData.items;
			if (!items) return;
			
			for (var i = 0; i < items.length; i++)
			{
				if (items[i].type.indexOf("image") !== -1)
				{
					var blob = items[i].getAsFile();
					var URLObj = window.URL || window.webkitURL;
					var source = URLObj.createObjectURL(blob);
					
					var pastedImage = new Image();
					pastedImage.onload = function ()
					{
						let canvas = document.createElement('canvas')
						let ctx = canvas.getContext('2d')
						canvas.width = pastedImage.width;
						canvas.height = pastedImage.height;
						ctx.drawImage(pastedImage, 0, 0);

						makingSuspectPortrait = true

						pastedImageMesh.scale.set(1,pastedImage.height/pastedImage.width,1)
						pastedImageMesh.material.map = new THREE.CanvasTexture( canvas )
						pastedImageMesh.visible = true
					}
					pastedImage.src = source;

					e.preventDefault();
					return;
				}
			}
			copiedImageNotFoundSign.material.opacity = 2;
		}
	}, false);
}