function initMobiusTransformations()
{
	camera.position.y = 0

	//cubic grid
	let cubicGrid = new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({size:0.05,color:0x000000}))
	scene.add(cubicGrid)
	let numWide = 10
	for(let i = 0; i <= numWide; i++)
	{
		for(let j = 0; j <= numWide; j++)
		{
			for(let k = 0; k <= numWide; k++)
			{
				let p = new THREE.Vector3(i-numWide/2,j-numWide/2,k-numWide/2)
				p.multiplyScalar(0.1)
				cubicGrid.geometry.vertices.push(p)
			}
		}
	}
	console.log(cubicGrid.position)

	let invert = false //binary value according to wikipedia. But surely it is stereographic projection, which is not binary?
	let alpha = 1
	let a = new THREE.Vector3()
	let A = new THREE.Matrix3()

	function transform(x)
	{
		let xRelative = x.clone().sub(a)
		let result = xRelative.clone().applyMatrix3(A).multiplyScalar(alpha)
		if(invert)
		{
			result.multiplyScalar( 1/xRelative.lengthSq() )
		}
		return result
	}

	updateFunctions.push(function()
	{
		for(let i = 0, il = cubicGrid.geometry.vertices.length; i<il; i++)
		{
			cubicGrid.geometry.vertices[i].copy( transform(cubicGrid.geometry.vertices[i]) )
		}
		cubicGrid.geometry.verticesNeedUpdate = true
	})
}