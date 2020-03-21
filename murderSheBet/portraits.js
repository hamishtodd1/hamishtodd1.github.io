function initPortraits()
{
	let copiedImageNotFoundSign = makeTextSign("No image in clipboard")
	copiedImageNotFoundSign.scale.multiplyScalar(0.1)
	copiedImageNotFoundSign.material.opacity = 0;
	copiedImageNotFoundSign.material.transparent = true
	copiedImageNotFoundSign.position.x = (camera.right-camera.left)/2
	copiedImageNotFoundSign.position.y = (camera.top-camera.bottom)/2

	let portraitBeingEdited = null

	updatables.push(copiedImageNotFoundSign)
	copiedImageNotFoundSign.update = function()
	{
		this.material.opacity -= frameDelta * 0.9
	}
	scene.add(copiedImageNotFoundSign)

	let pastedImageMesh = new THREE.Mesh(new THREE.OriginCorneredPlaneGeometry(1,1),new THREE.MeshBasicMaterial())
	pastedImageMesh.visible = false
	pastedImageMesh.position.z = camera.position.z - camera.near*1.01
	scene.add(pastedImageMesh)

	let selectionBox = new THREE.LineLoop(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0x00FF00}))
	selectionBox.position.z = pastedImageMesh.position.z + 0.000001
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

	let portraitAdviceSign = new THREE.Object3D()
	portraitAdviceSign.add(
		makeTextSign("Click and drag to make"),
		makeTextSign("suspect portrait")
		)
	portraitAdviceSign.children[0].position.y += 1.
	portraitAdviceSign.scale.multiplyScalar(.1)
	portraitAdviceSign.position.x = .5
	portraitAdviceSign.position.y = .2
	portraitAdviceSign.position.z = selectionBox.position.z
	scene.add(portraitAdviceSign)
	updatables.push(portraitAdviceSign)
	portraitAdviceSign.update = function()
	{
		portraitAdviceSign.visible = pastedImageMesh.visible
	}

	selectionBox.update = function()
	{
		if( tradingAllowed )
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
			selectionBox.scale.y  = Math.abs(mouse.zZeroPosition.y - initialMousePosition.y)
			selectionBox.scale.x  = selectionBox.scale.y / camera.getHorizontalStretching() //Math.abs(mouse.zZeroPosition.x - initialMousePosition.x)
			if(mouse.zZeroPosition.x > initialMousePosition.x)
			{
				selectionBox.position.x = initialMousePosition.x
			}
			else
			{
				selectionBox.position.x = initialMousePosition.x - selectionBox.scale.x
			}

			if( mouse.zZeroPosition.y > initialMousePosition.y )
			{
				selectionBox.position.y = initialMousePosition.y
			}
			if( mouse.zZeroPosition.y < initialMousePosition.y )
			{
				selectionBox.position.y = mouse.zZeroPosition.y
			}
			selectionBox.scale.z = 1
		}

		if(!mouse.clicking && selecting === true)
		{
			if(selectionBox.scale.length()<1.0001)
			{
				selecting = false
				selectionBox.visible = false
			}
			else
			{
				selecting = false
				tradingAllowed = true

				selectionBox.visible = false
				pastedImageMesh.visible = false

				if(portraitBeingEdited === null)
				{
					portraitBeingEdited = Portrait()
				}
				portraitBeingEdited.setImage()

				portraitBeingEdited = null
			}
		}
	}
	//click the profile picture and it opens this again

	function Portrait()
	{
		let portrait = new THREE.Mesh(new THREE.OriginCorneredPlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:pastedImageMesh.material.map}))
		scene.add(portrait)

		let column = Column()

		let columnHeigth = 0
		for(let i = 0; i < column.slots.length; i++)
		{
			columnHeigth += getPrice(i) * dollarHeight
		}
		
		let enabledMesh = makeTextSign("GUILTY!")
		{
			column.isGuilty = false

			column.guiltyBox = makeTextSign("Guilty?")
			column.guiltyBox.trueAspect = column.guiltyBox.scale.x
			column.guiltyBox.scale.multiplyScalar(0.1)
			column.guiltyBox.position.y = columnHeigth + column.guiltyBox.scale.y/2
			scene.add(column.guiltyBox)

			enabledMesh.trueAspect = enabledMesh.scale.x
			enabledMesh.scale.multiplyScalar(0.1)
			enabledMesh.material.color.setRGB(1,0.5,0.5)
			enabledMesh.visible = false
			scene.add(enabledMesh)
			
			clickables.push(column.guiltyBox)
			column.guiltyBox.onClick = function()
			{
				column.isGuilty = !column.isGuilty
				enabledMesh.visible = column.isGuilty

				// for(let i = 0; i < column.bets.length; i++)
				// {
				// 	column.bets[i].material = column.isGuilty ? moneyMaterial:column.ordinaryMaterial
				// }
				sortHands()
			}
		}

		column.portrait = portrait
		portrait.scale.y = camera.top - columnHeigth - column.guiltyBox.scale.y
		portrait.position.y = camera.top - portrait.scale.y

		updatables.push(portrait)
		portrait.update = function()
		{
			portrait.scale.x = portrait.scale.y / camera.getHorizontalStretching()

			column.guiltyBox.scale.x = column.guiltyBox.scale.y * column.guiltyBox.trueAspect / camera.getHorizontalStretching()
			enabledMesh.scale.x = enabledMesh.scale.y * enabledMesh.trueAspect / camera.getHorizontalStretching()

			portrait.position.x = column.slots[0].position.x + column.slots[0].scale.x/2 - portrait.scale.x/2
			column.guiltyBox.position.x = portrait.position.x + portrait.scale.x/2
			enabledMesh.position.copy( column.guiltyBox.position )
			enabledMesh.position.z += 0.1
		}

		clickables.push(portrait)
		portrait.onClick = function()
		{
			portraitBeingEdited = this
			goIntoEditingMode(portrait.material.map)
		}
		
		let unchangedPlaneGeometry = new THREE.OriginCorneredPlaneGeometry(1,1)
		portrait.setImage = function()
		{
			for(let i = 0; i < 4; i++)
			{
				let onPastedImage = selectionBox.geometry.vertices[i].clone()
				selectionBox.localToWorld(onPastedImage)
				pastedImageMesh.worldToLocal(onPastedImage)

				for(let j = 0; j < this.geometry.faceVertexUvs[0].length; j++)
				{
					for(let k = 0; k < this.geometry.faceVertexUvs[0][j].length; k++)
					{
						if( unchangedPlaneGeometry.faceVertexUvs[0][j][k].x === selectionBox.geometry.vertices[i].x &&
							unchangedPlaneGeometry.faceVertexUvs[0][j][k].y === selectionBox.geometry.vertices[i].y )
						{
							this.geometry.faceVertexUvs[0][j][k].x = onPastedImage.x
							this.geometry.faceVertexUvs[0][j][k].y = onPastedImage.y
						}
					}
				}
			}
			this.geometry.uvsNeedUpdate = true
		}

		return portrait
	}

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

						goIntoEditingMode(new THREE.CanvasTexture( canvas ))
					}
					pastedImage.src = source;

					e.preventDefault();
					return;
				}
			}
			copiedImageNotFoundSign.material.opacity = 2;
		}
	}, false);

	function goIntoEditingMode(texture)
	{
		tradingAllowed = false

		pastedImageMesh.material.map = texture

		pastedImageMesh.scale.x = camera.right-camera.left
		pastedImageMesh.scale.y = pastedImageMesh.scale.x * texture.image.height/texture.image.width * camera.getHorizontalStretching()
		pastedImageMesh.position.y = (camera.top+camera.bottom)/2 - pastedImageMesh.scale.y/2

		pastedImageMesh.visible = true
	}
}