async function initCrystallography()
{
	//probably want it to receive shadow
	let crystalArea = new THREE.Mesh(new THREE.PlaneBufferGeometry(.8,.8), new THREE.MeshBasicMaterial())
	crystalArea.position.x = -.5
	scene.add(crystalArea)

	let asymmetricUnitAtoms = []
	let atomGeometry = new THREE.SphereBufferGeometry(.04)
	function AsymmetricUnitAtom()
	{
		let atom = new THREE.Object3D()
		crystalArea.add(atom)
		let mat = new THREE.MeshBasicMaterial()
		mat.color.r = Math.random()

		for(let i = 0; i < 4; i++)
		{
			let symmetricCopy = new THREE.Mesh(atomGeometry,mat)
			atom.add(symmetricCopy)
			clickables.push(symmetricCopy)
		}
		atom.children[0].position.x += .4;
		atom.children[1].position.y += .4;
		atom.children[2].position.x += .4;
		atom.children[2].position.y += .4;

		asymmetricUnitAtoms.push(atom)

		updateFunctions.push(function()
		{
			if(mouse.clicking && atom.children.indexOf(mouse.lastClickedObject) !== -1 )
			{
				atom.position.add(mouse.zZeroPosition)
				atom.position.sub(mouse.oldZZeroPosition)

				if(atom.position.x > 0.)
					atom.position.x -= .4
				if(atom.position.x < -.4)
					atom.position.x += .4
				if(atom.position.y > 0.)
					atom.position.y -= .4
				if(atom.position.y < -.4)
					atom.position.y += .4
			}
		})
	}

	AsymmetricUnitAtom()
	AsymmetricUnitAtom()
	AsymmetricUnitAtom()
	asymmetricUnitAtoms[1].position.y = -.2
	asymmetricUnitAtoms[2].position.y = -.25


	//structure factors
	{
		let hk = 2 //how many structure factors wide you want it to be

		asymmetricUnitAtoms[0].position.set( 0.12, 0.10, 0. )
		asymmetricUnitAtoms[1].position.set( 0.20, 0.38, 0. )
		asymmetricUnitAtoms[2].position.set( 0.40, 0.20, 0. )

		//could be done in a vertex shader? Or a texture if it's axis aligned? Probably isn't though
		let numHkls = 0
		for (let h = -hk; h <= hk; h++)
		{
			for (let k = -hk; k <= hk; k++)
			{
				if (k > 0 || (k == 0 && h >= 0))
					numHkls++
			}
		}
		let hkls = arrayOfArraysWithCertainValue(numHkls, 5, 0.)
		var structureFactors = arrayOfArraysWithCertainValue(numHkls, 4, 0.)

		let numSoFar = 0
		let r, i,f,phi,a;
		for (let h = -hk; h <= hk; h++)
		{
			for (let k = -hk; k <= hk; k++)
			{
				if (k > 0 || (k == 0 && h >= 0)) //err, so why not start k at 0? I notice all the atom positions are positive...
				{
					r = 0.;
					i = 0.;
					for (let j = 0; j < asymmetricUnitAtoms.length; j++)
					{
						a = asymmetricUnitAtoms[j].position
						r += 6. * Math.cos(TAU * (h * a.x + k * a.y))
						i += 6. * Math.sin(TAU * (h * a.x + k * a.y))
					}
					f = Math.sqrt(r * r + i * i)
					phi = 180. / 3.14159265 * Math.atan2(i, r) //TODO strongly prefer radians. This'd remove the "round" below too
					hkls[numSoFar][0] = -f
					hkls[numSoFar][1] = h
					hkls[numSoFar][2] = k
					hkls[numSoFar][3] = f
					hkls[numSoFar][4] = phi

					numSoFar++
				}
			}
		}
		hkls.sort(function (a, b) { return b[3] - a[3] })
		for (let j = 0; j < hkls.length; j++)
		{
			structureFactors[j][0] = hkls[j][1]
			structureFactors[j][1] = hkls[j][2]
			structureFactors[j][2] = hkls[j][3]
			structureFactors[j][3] = Math.round(hkls[j][4])
			log(structureFactors[j])
		}
	}


	{
		let atomCoords = new Float32Array(asymmetricUnitAtoms.length*3); //next thing to do is get an array in there, suuuurely possible
		//could do it as a texture though, rgb = xyz

		let material = new THREE.ShaderMaterial({
			uniforms: {
				numberGoingBetweenZeroAndOne: {value: 0},
				atomCoords: {value: atomCoords}
			},
		});
		await assignShader("basicVertex", material, "vertex")
		await assignShader("crystallographyFragment", material, "fragment")

		function assignCoords(index, v)
		{
			atomCoords[index*3 + 0] = v.x;
			atomCoords[index*3 + 1] = v.y;
			atomCoords[index*3 + 2] = v.z;
		}

		let plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(.8,.8), material);
		plane.position.x = .5
		scene.add(plane);

		updateFunctions.push( function() 
		{
			

			material.uniforms.numberGoingBetweenZeroAndOne.value = 0.5 + Math.sin(clock.elapsedTime) * 0.5;

			for(let i = 0; i < asymmetricUnitAtoms.length; i++)
				assignCoords(i, asymmetricUnitAtoms[i].position)
		} )
	}
}

function arrayOfArraysWithCertainValue(n, m, val)
{
	var result = [];
	for (var i = 0; i < n; i++)
	{
		result[i] = [];
		for (var j = 0; j < m; j++)
		{
			result[i][j] = val;
		}
	}
	return result;
}

//map
// {
// 	let ox = this.ox; let oy = this.oy;
// 	let sx = this.sx; let sy = this.sy; let sxy = this.sxy;
// 	let su = this.su; let sv = this.sv; let suv = this.suv;

// 	// calculate map. Use coarse grid for speed
// 	let map = arrayOfArraysWithCertainValue(canvasWidth, canvasHeight, sfcanvas.f[sfcanvas.maxhk][sfcanvas.maxhk]);
// 	let s = 2
// 	// calculate the contribution at a point - need frac coords
// 	for (let h = -sfcanvas.maxhk; h <= sfcanvas.maxhk; h++)
// 	{
// 		for (let k = -sfcanvas.maxhk; k <= sfcanvas.maxhk; k++)
// 		{
// 			if (h > 0 || (h == 0 && k > 0))
// 			{
// 				f = sfcanvas.f[h + sfcanvas.maxhk][k + sfcanvas.maxhk];
// 				if (f > 0.0)
// 				{
// 					phi = sfcanvas.phi[h + sfcanvas.maxhk][k + sfcanvas.maxhk];
// 					for (let y = 0; y < canvasHeight; y += s)
// 					{
// 						let v = sv * (y - oy);
// 						for (let x = 0; x < canvasWidth; x += s)
// 						{
// 							let u = suv * (y - oy) + su * (x - ox);
// 							map[x][y] += 2 * f * Math.cos(2 * Math.PI * (h * u + k * v - phi / 360));
// 						}
// 					}
// 				}
// 			}
// 		}
// 	}
// 	// interpolate remaining points
// 	if (s == 2)
// 	{
// 		for (let y = 0; y < canvasHeight; y += 2)
// 			for (let x = 1; x < canvasWidth - 1; x += 2)
// 				map[x][y] = (map[x - 1][y] + map[x + 1][y]) / 2;
// 		for (let y = 1; y < canvasHeight - 1; y += 2)
// 			for (let x = 0; x < canvasWidth - 1; x++)
// 				map[x][y] = (map[x][y - 1] + map[x][y + 1]) / 2;
// 	}

// 	// draw map
// 	// let highestMapValue = 1.0e-6;
// 	// for (let y = 0; y < canvasHeight; y++)
// 	// 	for (let x = 0; x < canvasWidth; x++)
// 	// 		highestMapValue = Math.max(highestMapValue, Math.abs(map[x][y]));

// 	// let r; let g;
// 	// for (let y = 0; y < canvasHeight; y++)
// 	// {
// 	// 	for (let x = 0; x < canvasWidth; x++)
// 	// 	{
// 	// 		let val = map[x][y] / highestMapValue;
// 	// 		if (val >= 0)
// 	// 		{
// 	// 			r = 255;
// 	// 			g = Math.round(255 * (1 - val));
// 	// 		} else {
// 	// 			r = Math.round(255 * Math.max(1 + 1.5 * val, 0));
// 	// 			g = Math.round(255 * Math.max(1 + 0.5 * val, 0));
// 	// 		}
// 	// 		let i = 4 * (x + canvasWidth * (y));
// 	// 		this.img.data[i + 0] = r;
// 	// 		this.img.data[i + 1] = g;
// 	// 		this.img.data[i + 2] = g;
// 	// 		this.img.data[i + 3] = 255;
// 	// 	}
// 	// }
// }