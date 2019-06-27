/*
	How about the stage is an actual stage and you are in a little opera box

	Donut would be better

	TODO
		Switch to threejs contour
		GPU simulation
		Ultimately:
			move hand around in cube, put it at orientation that puts in color or, you know, orienation
			I mean what's nice is the idea of making some changes at one time and continuously moving one's hand up


	You're allowed to move hand up, because we're instantaneously updating*
	Moving hand down pulls the current row down

	Actually you only need to update stuff in the light cone

	Is the system reversible? Could be fascinating what you can do if so! But probably not
		Therefore, wherever your hand is is the beginning becomes the "initial conditions"



	*or at least we're updating upwards faster than you can move your hand
		So imagine that you are updating instantly
*/

function initReactionDiffusion()
{
	//camera.children[0].visible = false //hack for lab

	let resolution = 200

	let values = new Uint8Array(sq(resolution)*3)

	let field = new THREE.Mesh(new THREE.OriginCorneredPlaneBufferGeometry(resolution,resolution),new THREE.MeshBasicMaterial({
		map:new THREE.DataTexture( values, resolution, resolution, THREE.RGBFormat )
	}))
	field.scale.multiplyScalar(1/resolution)
	field.position.x -= 0.5
	field.position.y -= 0.5
	scene.add(field)
	clickables.push(field)

	let clicking = false
	field.onClick = function(intersection)
	{
		clicking = true
	}

	function setCell(row,column,living)
	{
		let value = living?0:255
		for(let k = 0; k < 3; k++)
		{
			values[(row*resolution+column)*3+k] = value
		}
	}
	function getCell(row,column)
	{
		//there are two more
		return values[(row*resolution+column)*3+0] === 0
	}
	for(let i = 0; i < resolution; i++)
	{
		for(let j = 0; j < resolution; j++)
		{
			setCell(i,j,false)
		}
	}
	for(let i = 0; i < resolution; i++)
	{
		setCell(0,i,Math.random()<0.5)
	}
	

	let rule = 110
	function applyRule(a,b,c)
	{
		let val = 0
		if(a) val = val | 4
		if(b) val = val | 2
		if(c) val = val | 1

		return rule & (1 << val)
	}

	function updateRow( row )
	{
		for(let column = 0; column < resolution; column++)
		{
			let center = getCell(row-1,column)
			let right = getCell(row-1,(column+1) % resolution)
			let left = getCell(row-1,(column+resolution-1) % resolution)
			setCell( row, column, applyRule( left, center, right ) )
		}
	}

	let waterfall = 0
	let lastRowUpdated = 0
	let lastRowSet = 0

	updateFunctions.push(function()
	{
		if(mouse.clicking === false)
		{
			clicking = false
		}

		if(clicking)
		{
			let p = field.worldToLocal(mouse.zZeroPosition.clone())
			let cell = {x:Math.floor(p.x),y:Math.floor(p.y)}
			if(cell.x >= 0 && cell.y >= 0)
			{
				if(!getCell(cell.y,cell.x))
				{
					lastRowUpdated = cell.y
					lastRowSet = cell.y

					setCell(cell.y,cell.x,true)

					for(let i = 0; i < cell.y; i++)
					{
						for(let j = 0; j < resolution; j++)
						{
							setCell(i,j,false)
						}
					}
				}

			}
		}
		else
		{
			if(lastRowSet>=1)
			{
				lastRowSet--;
				lastRowUpdated--;
				for(let rowToBringDown = lastRowSet+1; rowToBringDown < resolution; rowToBringDown++)
				{
					for(let column = 0; column < resolution; column++)
					{
						setCell(rowToBringDown-1,column,getCell(rowToBringDown,column))
					}
				}
			}
		}

		if(waterfall)
		{
			lastRowUpdated = clamp(lastRowUpdated+1,0,resolution-1)
			updateRow( lastRowUpdated )
		}
		else
		{
			let rowToUpdate = lastRowSet
			while(rowToUpdate < resolution)
			{
				rowToUpdate++
				updateRow(rowToUpdate)
			}
		}

		field.material.map.needsUpdate = true
	})
}