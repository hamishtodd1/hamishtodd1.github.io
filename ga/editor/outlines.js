function OutlineCollection()
{
	let maxOutlines = 256
	let outlineCollection = new THREE.LineSegments(new THREE.Geometry(), new THREE.LineBasicMaterial({ color: 0xFFFFFF }))
	for(let i = 0, il = 8 * maxOutlines; i < il; ++i)
		outlineCollection.geometry.vertices.push(new THREE.Vector3())

	let outlinesThisFrame = 0
	let outlinePositions  = new Float32Array(2*maxOutlines)
	let halfOutlineDimensions = new Float32Array(maxOutlines)

	outlineCollection.draw = (x,y,dimension) => {
		outlinePositions[outlinesThisFrame*2+0] = x
		outlinePositions[outlinesThisFrame*2+1] = y
		halfOutlineDimensions[outlinesThisFrame] = dimension / 2.

		++outlinesThisFrame
	}

	renderFunctions.push(()=>{
		if (outlinesThisFrame >= maxOutlines) {
			console.error("too many outlines")
			return
		}
		//TODO vertex shader

		for(let i = 0; i < maxOutlines; ++i) {
			if(i > outlinesThisFrame) {
				for(let j = 0; j < 8; ++j)
					outlineCollection.geometry.vertices[i*8+j].copy(zeroVector)
			}
			else {
				for (let j = 0; j < 8; ++j) {
					let v = outlineCollection.geometry.vertices[i * 8 + j]
					v.set(halfOutlineDimensions[i], halfOutlineDimensions[i], 0.)
					if( 0 < j && j < 5 ) //left
						v.x *= -1.
					if ( 2 < j && j < 7) //bottom
						v.y *= -1.
					v.x += outlinePositions[i*2+0]
					v.y += outlinePositions[i*2+1]
				}
			}
		}
		outlineCollection.geometry.verticesNeedUpdate = true
		outlinesThisFrame = 0
	})

	return outlineCollection
}