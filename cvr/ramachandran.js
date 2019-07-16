//CLEARLY the better thing to do is have spheres of the size that ramachandran used
function initRamachandran()
{
	new THREE.FileLoader().load(
		"data/Ala_Tau_110.txt",
		function(data)
		{
			var values = data.split(" "); //for some reason this handles the newlines as well
			//WE WERE HERE
			
			let allowedPhiPsiArray = Array( 72 )
			for(let i = 0; i < allowedPhiPsiArray.length; i++)
			{
				allowedPhiPsiArray[i] = Array( 72 )
			}
			
			for(var i = 0, il = Math.floor( values.length / 3 ); i < il; i++)
			{
				var phi = parseInt( values[i*3+0] );
				var psi = parseInt( values[i*3+1] );
				
				//pair of hacks that Lynne said.
				// psi += 180;
				// phi *= -1;
				
				while(phi < 0)
					phi += 360;
				while(psi < 0)
					psi += 360;
				
				allowedPhiPsiArray[phi / 5][psi / 5] = parseInt( values[i*3+2] );
			}

			ramamachandranAllowed = function(phi,psi)
			{
				//for god's sake you could simulate it yourself
				let phiEntry = Math.round(phi/5)
				let psiEntry = Math.round(psi/5)

				while(phiEntry < 0)
					phiEntry += 72;
				while(psiEntry < 0)
					psiEntry += 72;

				while(phiEntry >= 72)
					phiEntry -= 72;
				while(psiEntry >= 72)
					psiEntry -= 72;

				return allowedPhiPsiArray[phiEntry][psiEntry] === 1
			}

			let rama = new THREE.Mesh(new THREE.OriginCorneredPlaneGeometry(TAU,TAU),new THREE.MeshBasicMaterial())
			rama.scale.multiplyScalar(0.03)
			rama.position.z = -0.3
			scene.add(rama)
			
			let resolution = 72
			let ramaArray = new Uint8Array(sq(resolution)*3)
			for(let i = 0; i < resolution; i++)
			{
				for(let j = 0; j < resolution; j++)
				{
					for(let k = 0; k < 3; k++)
					{
						//horizontal then vertical
						ramaArray[(j*resolution+i)*3+k] = ramamachandranAllowed(i*5-180,j*5-180) ? 255 : 0
					}
				}
			}
			rama.material.map = new THREE.DataTexture( ramaArray, resolution, resolution, THREE.RGBFormat )
			rama.material.map.needsUpdate = true

			// let point = new THREE.Mesh(new THREE.SphereGeometry( TAU/resolution*2 ));
			// rama.add(point)
		},
		function ( xhr ) {}, function ( xhr ) { console.error( "couldn't load data" ); }
	);

	return


	//donut stuff
	if(0)
	{
		for(var i = 0; i <= verticesWide; i++)
		{
			let x = (i / verticesWide) * 2 - 1
			for(var j = 0; j <= verticesWide; j++)
			{
				let y = (j / verticesWide) * 2 - 1

				rama.geometry.vertices[ i * (verticesWide) + j ].copy(
					foldingDonutPosition( x, y, 0 ) );
			}
		}
		rama.geometry.computeFaceNormals();
		rama.geometry.computeVertexNormals();
		rama.geometry.verticesNeedUpdate = true;
		rama.geometry.normalsNeedUpdate = true;

		function positionOnCircle(arcLength, center, axis, angleZeroPosition )
		{
			var radiusVector = angleZeroPosition.clone();
			radiusVector.sub( center );
			
			var circumference = TAU * radiusVector.length();
			var angle = arcLength / circumference * TAU;
			
			var position = radiusVector.clone();
			position.applyAxisAngle(axis,angle); //or minus that angle?
			position.add(center);
			
			return position;
		}

		function foldingDonutPosition( x, y, genus )
		{
			var innerRoundedness = genus < 0.5 ? genus * 2 : 1;
			var outerRoundedness = genus >= 0.5 ? (genus-0.5) * 2 : 0;
			
			var finalOuterRadius = 2 / TAU;
			var virtualOuterRadius = outerRoundedness === 0 ? Number.MAX_SAFE_INTEGER : finalOuterRadius / outerRoundedness;
			var virtualCircumferenceCenter = new THREE.Vector3(0,0,-virtualOuterRadius);
			var circumferenceComponent = positionOnCircle( x, virtualCircumferenceCenter, yAxis, new THREE.Vector3() );
			
			var finalMinorRadius = finalOuterRadius / 3;
			var virtualMinorRadius = innerRoundedness === 0 ? Number.MAX_SAFE_INTEGER : finalMinorRadius / innerRoundedness;
			
			var virtualTubeCenter = virtualCircumferenceCenter.clone();
			virtualTubeCenter.sub(circumferenceComponent);
			virtualTubeCenter.setLength( virtualMinorRadius );
			virtualTubeCenter.add(circumferenceComponent);
			
			var tubeCenterTangent = circumferenceComponent.clone().sub(virtualTubeCenter);
			tubeCenterTangent.cross(yAxis);
			tubeCenterTangent.normalize();
			
			var finalPosition = positionOnCircle( y / (1+2*innerRoundedness), virtualTubeCenter, tubeCenterTangent, circumferenceComponent );
			return finalPosition;
		}
	}
}

function oldInitRamachandran(allowedArray)
{
	function normalizedAngle(angle)
	{
		var returnValue = angle;
		while(returnValue<0)
			returnValue += TAU;
		while(returnValue >= TAU)
			returnValue -= TAU;
		return returnValue;
	}
	var atomRadii = {
		"H":1,
		"O":1.1,
	};
	angleAllowed = function(tau, phi, psi)
	{
		//"hard sphere"? You mean this?
		{
			
			// for(var i = 0; i < .atoms.length; i++)
			// {
			// 	atoms[i].updateMatrixWorld();
			// 	for(var j = 0; j < .atoms.length; j++)
			// 	{
			// 		atoms[j].updateMatrixWorld();
			// 		if( .atoms[i].getWorldPosition().distanceTo( .atoms[j].getWorldPosition() ) < atomRadii[ .atoms[i].element] + atomRadii[ .atoms[i].element] )
			// 		{
			// 			return 0;
			// 		}
			// 	}
			// }
			// return 1;
		}
		
		{
			var phiIndex = normalizedAngle(phi);
			phiIndex = Math.round(phiIndex * 360 / TAU / 5);
			var psiIndex = normalizedAngle(psi);
			psiIndex = Math.round(psiIndex * 360 / TAU / 5);
			
			var tauIndex = normalizedAngle(tau);
			tauIndex = Math.round(tauIndex * 360 / TAU / 5 );
			tauIndex -= 21;
			if( tauIndex < 0 || allowedArray.length-1 < tauIndex )
			{
//				console.log("received unknown tau: ", tau);
				return 0;
			}
			
			return allowedArray[ tauIndex ][ phiIndex ][ psiIndex ];
		}
	}
	
	var ramachandran = new THREE.Object3D();
	ramachandran.horizontalSegments = 63;
	
	ramachandran.genus = 0;
	ramachandran.width = 1;
	ramachandran.position.z = -0.1;
	ramachandran.position.y = -0.1;
	ramachandran.scale.setScalar(0.09)
	
	scene.add(ramachandran);
	
	var positionOnCircle = function(arcLength, center, axis, angleZeroPosition )
	{
		var radiusVector = angleZeroPosition.clone();
		radiusVector.sub( center );
		
		var circumference = TAU * radiusVector.length();
		var angle = arcLength / circumference * TAU;
		
		var position = radiusVector.clone();
		position.applyAxisAngle(axis,angle); //or minus that angle?
		position.add(center);
		
		return position;
	}
	
	//accepts numbers from a 2x2 square centered at the origin. Returns that for genus = 0
	//gives 2x(2/3) donut in XZ plane for genus = 1
	var foldingDonutPosition = function( x, y, genus )
	{
		var innerRoundedness = genus < 0.5 ? genus * 2 : 1;
		var outerRoundedness = genus >= 0.5 ? (genus-0.5) * 2 : 0;
		
		var finalOuterRadius = 2 / TAU;
		var virtualOuterRadius = outerRoundedness === 0 ? Number.MAX_SAFE_INTEGER : finalOuterRadius / outerRoundedness;
		var virtualCircumferenceCenter = new THREE.Vector3(0,0,-virtualOuterRadius);
		var circumferenceComponent = positionOnCircle( x, virtualCircumferenceCenter, yAxis, new THREE.Vector3() );
		
		var finalMinorRadius = finalOuterRadius / 3;
		var virtualMinorRadius = innerRoundedness === 0 ? Number.MAX_SAFE_INTEGER : finalMinorRadius / innerRoundedness;
		
		var virtualTubeCenter = virtualCircumferenceCenter.clone();
		virtualTubeCenter.sub(circumferenceComponent);
		virtualTubeCenter.setLength( virtualMinorRadius );
		virtualTubeCenter.add(circumferenceComponent);
		
		var tubeCenterTangent = circumferenceComponent.clone().sub(virtualTubeCenter);
		tubeCenterTangent.cross(yAxis);
		tubeCenterTangent.normalize();
		
		var finalPosition = positionOnCircle( y / (1+2*innerRoundedness), virtualTubeCenter, tubeCenterTangent, circumferenceComponent );
		return finalPosition;
	}
	
	var plotMaterial = new THREE.MeshPhongMaterial({vertexColors:THREE.FaceColors, side: THREE.DoubleSide});
	
	ramachandran.plots = Array(4);	
	for(var i = 0; i < ramachandran.plots.length; i++)
	{
		ramachandran.plots[i] = new THREE.Mesh( new THREE.Geometry(), plotMaterial );
		if(i===0)
			ramachandran.plots[i].geometry.vertices = Array( Math.pow(ramachandran.horizontalSegments+1, 2 ) );
		else
			ramachandran.plots[i].geometry.vertices = ramachandran.plots[0].geometry.vertices;
		ramachandran.add( ramachandran.plots[i] );
		ramachandran.plots[i].visible = false;
	}
	
	for(var i = 0, il = ramachandran.plots[0].geometry.vertices.length; i < il; i++)
		ramachandran.plots[0].geometry.vertices[i] = new THREE.Vector3();
	ramachandran.update = function()
	{
		var visiblePlot = -1;
		for(var i = 0; i < this.plots.length; i++ )
			if(this.plots[i].visible )
				visiblePlot = i;
		if(visiblePlot === -1)
			return;
		
		for(var i = 0; i <= this.horizontalSegments; i++)
		{
			for(var j = 0; j <= this.horizontalSegments; j++)
				this.plots[visiblePlot].geometry.vertices[ i * (this.horizontalSegments+1) + j ].copy(
					foldingDonutPosition( (i / this.horizontalSegments) * 2 - 1, (j / this.horizontalSegments) * 2 - 1, this.genus ) );
		}
		ramachandran.plots[visiblePlot].geometry.computeFaceNormals();
		ramachandran.plots[visiblePlot].geometry.computeVertexNormals();
		ramachandran.plots[visiblePlot].geometry.verticesNeedUpdate = true;
	}
	ramachandran.update();
	
	ramachandran.plots[0].geometry.faces = Array( ramachandran.horizontalSegments * ramachandran.horizontalSegments * 2 );
	allowedColor = new THREE.Color(0x00FF00);
	disallowedColor = new THREE.Color(0xFF0000);
	var thisFaceColor = null;
	for(var i = 0; i < ramachandran.horizontalSegments; i++) //row
	{
		for(var j = 0; j < ramachandran.horizontalSegments; j++) //column
		{
			for(var k = 0; k < ramachandran.plots.length; k++)
			{
				thisFaceColor = angleAllowed( (100+k*5)/360*TAU,
					i / ramachandran.horizontalSegments * TAU,
					j / ramachandran.horizontalSegments * TAU) ?
					allowedColor : disallowedColor;
				
				var topLeft = i * (ramachandran.horizontalSegments+1) + j;
				var bottomLeft = (i+1) * (ramachandran.horizontalSegments+1) + j;
				
				ramachandran.plots[k].geometry.faces[(i*ramachandran.horizontalSegments+j)*2+0] = new THREE.Face3( 
					topLeft,
					topLeft + 1,
					bottomLeft,
					new THREE.Vector3(0,0,1),
					thisFaceColor
				);
				ramachandran.plots[k].geometry.faces[(i*ramachandran.horizontalSegments+j)*2+1] = new THREE.Face3( 
					bottomLeft,
					topLeft + 1,
					bottomLeft + 1,
					new THREE.Vector3(0,0,1),
					thisFaceColor
				);
			}
		}
	}
	
	ramachandran.indicator = new THREE.Mesh(new THREE.SphereGeometry(0.013), new THREE.MeshBasicMaterial({color:0x000000}));
	ramachandran.add( ramachandran.indicator );
	ramachandran.repositionIndicatorAndReturnAllowability = function(tau, phi, psi)
	{
		this.indicator.position.copy( foldingDonutPosition(
			phi / TAU * 2, psi / TAU * 2, this.genus
		));
		
		var visibleIndex = Math.round( ( ( tau * 360 / TAU ) - 105 ) / 5 );
		
		for(var i = 0; i < ramachandran.plots.length; i++)
		{
			ramachandran.plots[i].visible = false;
		}
		
		if( 1 <= visibleIndex && visibleIndex <= 3)
		{
			ramachandran.plots[visibleIndex].visible = true;
		}
		else
			ramachandran.plots[0].visible = true; //not allowed

		return angleAllowed( tau, phi, psi );
	}
	
	return ramachandran;
}