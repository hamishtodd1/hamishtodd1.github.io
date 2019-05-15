/*
	rule 110 on flat texture
	with clicking

	TODO
		clicking
		either instantaneous or waterfall update
		Switch to threejs contour
		GPU simulation
		Ultimately:
			move hand around in cube, put it at orientation that puts in color or, you know, orienation
*/

function initReactionDiffusion()
{
	let field = new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial())
	scene.add(field)
	log("yo")
	
	let resolution = 72
	let values = new Uint8Array(sq(resolution)*3)
	for(let i = 0; i < resolution; i++)
	{
		for(let j = 0; j < resolution; j++)
		{
			let value = Math.random() < 0.5 ? 255:0
			for(let k = 0; k < 3; k++)
			{
				values[(j*resolution+i)*3+k] = value
			}
		}
	}
	field.material.map = new THREE.DataTexture( values, resolution, resolution, THREE.RGBFormat )
	field.material.map.needsUpdate = true

	updateFunctions.push(function()
	{
		for(let i = 0; i < resolution; i++)
		{
			for(let j = 0; j < resolution; j++)
			{
				let value = Math.random() < 0.5 ? 255:0
				for(let k = 0; k < 3; k++)
				{
					values[(j*resolution+i)*3+k] = value
				}
			}
		}
		// field.material.map.needsUpdate = true
	})
}