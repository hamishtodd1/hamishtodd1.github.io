/*
	You want something to show which c-alpha the stats are talking about
		A sphere with dotted lines going to all the stats. The sphere sits on the
		How about: all the stats specific to a c-alpha are tiny

	If you recently used the b factors you'll probably use them again

	Pull the ones you're most interested in to the front
	Some go into the floor
	Pull it out like a towel rail
	
	"hover" = see a bunch of things highlighted on the chain that are not usually visible.
		you have all your different metrics as a little list and move your hand over them
	At the very least, when a stat highlights a thing, you should show the map there

*/

function initStats()
{
	// var correlationIndicatorsGeometry = new THREE.EfficientSphereBufferGeometry(2.0);
	// new THREE.FileLoader().load(
	// 	'data/residueCorrelations.txt',
	// 	function ( data )
	// 	{
	// 		var residueCorrelations = eval(data)
	// 		var correlationIndicators = Array(models[0].carbonAlphaPositions.length);
	// 		//seem to need to make them one model ;_;

	// 		for(var i = 0, il = residueCorrelations.length; i < il; i++)
	// 		{
	// 			var nastiness = 2 * clamp(residueCorrelations[i][1]-0.5,0,0.5);
	// 			correlationIndicators[i] = new THREE.Mesh(correlationIndicatorsGeometry,new THREE.MeshBasicMaterial({
	// 				// opacity: 1-residueCorrelations[i][1],
	// 				// transparent:true,
	// 				color: new THREE.Color(1,1-nastiness,1-nastiness)
	// 			}));
	// 			models[0].add(correlationIndicators[i]);
	// 			models[0].remove(correlationIndicators[i]);

	// 			var resNo = residueCorrelations[i][0][2];
	// 			correlationIndicators[i].position.copy(models[0].carbonAlphaPositions[resNo])
	// 		}
	// 		console.log(correlationIndicators[0])
	// 	},
	// 	function ( xhr ) {},function ( err ) {}
	// );


	// new THREE.FileLoader().load(
	// 	'data/residueDistortions.txt',
	// 	function ( data )
	// 	{
	// 		var residueDistortions = eval(data)
	// 		console.log(residueDistortions)
	// 	},
	// 	function ( xhr ) {},function ( err ) {}
	// );
	/*
		distortion score: 1-4 is green, 2-9 is orange, 9+ is red
		CBeta deviations
	*/
	// {'restraint': {'restraint_type': 'Bond', 'sigma': 0.019, 'target_value': 1.458, 'fixed_atom_flags': [0, 0]}, 'atom_indices': [0, 1], 'distortion_score': 3.551691954394837, 'residue_spec': [True, 'A', 1, '']}
	// {'restraint': {'restraint_type': 'NBC', 'sigma': 0.02, 'target_value': 2.64, 'fixed_atom_flags': [0, 0]}, 'atom_indices': [1392, 1394], 'distortion_score': -0.07484748222726961, 'residue_spec': [True, 'B', 87, '']},

	initBarcharts();
}

//we can do better than bar charts and ramachandran.
function initBarcharts()
{
	var randomData = Array(37);
	for(var i = 0; i < randomData.length; i++)
	{
		randomData[i] = Math.random();
	}
	var randomGraph = Graph(randomData);
	scene.add(randomGraph)

	{
		var graphToPointLaser = new THREE.Mesh(
			new THREE.CylinderBufferGeometryUncentered( 0.001, 1), 
			new THREE.MeshBasicMaterial({color:0xFF0000, /*transparent:true,opacity:0.4*/}) 
		);
		graphToPointLaser.visible = false;
		scene.add(graphToPointLaser)
	}

	var movementDuration = 0.5;
	var requestCommencementTime = null;
	var positionPointedTo = null;
	var atomPositionToPutInCenterOfVisiBox = null;
	var extraHighlightCountDown = null;

	objectsToBeUpdated.push(randomGraph)
	randomGraph.update = function()
	{
		//your handControllers have a laser
		//the bars should change color if they are being pointed at
		//as should the backgrounds, that lets you drag them

		if(!models.length || !handControllers.length)
		{
			return;
		}

		for(var i = 0; i < 2; i++)
		{
			var intersections = handControllers[i].intersectLaserWithObject(randomGraph.background)
			if(intersections.length)
			{				
				if(handControllers[i].button1 && !handControllers[i].button1Old)
				{
					positionPointedTo = intersections[0].point;
					//The rubbish part
					{
						var focusedAtomIndex = Math.floor( (positionPointedTo.z / 2 + 0.5) * (models[0].atoms.length-1) );
						focusedAtomIndex = clamp(focusedAtomIndex,0,models[0].atoms.length-1)
					}

					atomPositionToPutInCenterOfVisiBox = models[0].atoms[focusedAtomIndex].position;
					requestCommencementTime = ourClock.getElapsedTime();
					extraHighlightCountDown = 0.98;
				}
			}
		}

		if(atomPositionToPutInCenterOfVisiBox)
		{
			graphToPointLaser.visible = true;

			var proportionThroughMovement = ( ourClock.getElapsedTime() - requestCommencementTime ) / movementDuration;
			proportionThroughMovement = clamp(proportionThroughMovement,0,1)

			var positionToPutInCenterOfVisiBox = atomPositionToPutInCenterOfVisiBox.clone()
			assemblage.updateMatrixWorld();
			assemblage.localToWorld(positionToPutInCenterOfVisiBox);

			var centerOfVisiBox = visiBox.position.clone();
			var displacement = centerOfVisiBox.clone().sub(positionToPutInCenterOfVisiBox)

			assemblage.position.add(displacement.clone().multiplyScalar(0.05));

			redirectCylinder(graphToPointLaser,positionPointedTo,positionToPutInCenterOfVisiBox.clone().sub(positionPointedTo));

			if(proportionThroughMovement >= 1)
			{
				//and also set zoom level?

				assemblage.onLetGo()

				requestCommencementTime = null;

				atomPositionToPutInCenterOfVisiBox = null;
				positionPointedTo = null;
			}
		}
		else
		{
			if( extraHighlightCountDown !== null)
			{
				extraHighlightCountDown -= frameDelta;
				if(extraHighlightCountDown <= 0)
				{
					graphToPointLaser.visible = false;
					extraHighlightCountDown = null;
				}
			}
		}
	}

	MenuOnPanel([{string:"Graph                             ", object3d: randomGraph }])
}

function Graph(data)
{
	var graph = new THREE.Group;
	var graphHeight = 0.8;

	// graph.scale.setScalar(0.1)
	var background = new THREE.Mesh(THREE.OriginCorneredPlaneGeometry(), new THREE.MeshBasicMaterial());
	background.position.z = -0.0001
	graph.add(background);
	graph.background = background;

	var xAxis = new THREE.Mesh(THREE.OriginCorneredPlaneGeometry(), new THREE.MeshBasicMaterial({color:0x000000}));
	var yAxis = new THREE.Mesh(THREE.OriginCorneredPlaneGeometry(), new THREE.MeshBasicMaterial({color:0x000000}));
	graph.add(xAxis,yAxis)

	var axisThickness = 0.01;
	xAxis.scale.y = axisThickness;
	yAxis.scale.x = axisThickness;

	yAxis.scale.y = graphHeight + axisThickness;

	var graphOffset = new THREE.Vector3( (1-graphHeight)/2, (1-graphHeight)/2, 0.00001);
	xAxis.position.copy(graphOffset)
	xAxis.position.y -= axisThickness;
	yAxis.position.copy(graphOffset)
	yAxis.position.x -= axisThickness;
	yAxis.position.y -= axisThickness;

	xAxis.label = makeTextSign( "Residues" );
	yAxis.label = makeTextSign( "Y axis" );
	xAxis.label.scale.setScalar(0.07)
	yAxis.label.scale.setScalar(0.07)
	xAxis.label.position.copy(graphOffset).multiplyScalar(0.5);
	yAxis.label.position.copy(graphOffset).multiplyScalar(0.5);
	xAxis.label.position.x = 0.5;
	yAxis.label.position.y = 0.5;
	yAxis.label.rotation.z = TAU/4;
	graph.add(xAxis.label)
	graph.add(yAxis.label)

	graph.displayDataset = function(data)
	{
		var barWidth = 0.1;

		xAxis.scale.x = barWidth * data.length;
		background.scale.x = 2 * graphOffset.x + barWidth * data.length;
		xAxis.label.position.x = background.scale.x / 2;

		for(var i = 0; i < data.length; i++)
		{
			var bar = new THREE.Mesh(THREE.OriginCorneredPlaneGeometry(1,graphHeight), new THREE.MeshBasicMaterial({color:0xFF0000}));
			bar.scale.y = data[i]
			bar.scale.x = barWidth
			bar.material.color.r = bar.scale.y;
			bar.material.color.g = 1-bar.scale.y;
			bar.position.add(graphOffset);
			bar.position.x += barWidth * i;
			graph.add(bar)
		}
	}
	if(data)
	{
		graph.displayDataset(data)
	}

	return graph;
}