/*
	charges that repel, including by the frame?
	wouldn't even need to tween
	also repelled by your head in the corner!
	it's more likely to be: you put a recent object in 

	When you put an object in the scene, it stays in place and everything else is repelled

	Do the repelling to figure out where they go in one frame, then tween them nicely.

	Could have a little circle with a little arrow pointing at the thing that came from it
		And/or its name on the circle
*/

function arrangeToys()
{
	function projectOntoToyShelf(p)
	{
		var distFromFrame = AUDIENCE_CENTER_TO_TOP_OF_FRAME_AT_Z_EQUALS_0;
		var maxX = AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0 + distFromFrame;
		var maxY = AUDIENCE_CENTER_TO_TOP_OF_FRAME_AT_Z_EQUALS_0 + distFromFrame;
		// p.x *= AUDIENCE_ASPECT_RATIO
		if(p.equals(zeroVector))
		{
			p.set(Math.random(),Math.random(),0)
		}

		if( Math.abs(p.y) > Math.abs(p.x))
		{
			p.multiplyScalar( maxY / Math.abs(p.y) )
		}
		else
		{
			p.multiplyScalar( maxX / Math.abs(p.x) )
		}
	}

	var numAroundEdges = 0;
	for(var i = 0; i < toysToBeArranged.length; i++)
	{
		if( toysToBeArranged[i].position.equals(zeroVector) )
		{
			numAroundEdges++;
		}
	}
	for(var i = 0; i < toysToBeArranged.length; i++)
	{
		if(toysToBeArranged[i].geometry === undefined)
		{
			console.error("this toy has no geometry, won't be clickable:", toysToBeArranged[i])
		}

		if(toysToBeArranged[i].parent === null)
		{
			scene.add(toysToBeArranged[i])
		}
		if( toysToBeArranged[i].position.equals(zeroVector) )
		{
			toysToBeArranged[i].position.x = 1
			toysToBeArranged[i].position.applyAxisAngle(zUnit,i/numAroundEdges*TAU)
			projectOntoToyShelf(toysToBeArranged[i].position)
		}
	}

	return;

	var dummyToys = Array(20)
	var toysInScene = [];
	var w = AUDIENCE_CENTER_TO_SIDE_OF_FRAME_AT_Z_EQUALS_0 * 2;
	var h = AUDIENCE_CENTER_TO_TOP_OF_FRAME_AT_Z_EQUALS_0 * 2;
	var correctPositionSuggestions = [
		[new THREE.Vector3()],
		[
			new THREE.Vector3( 0.25 * w,0,0),
			new THREE.Vector3(-0.25 * w,0,0)
		],
		[
			new THREE.Vector3( 1/3 * w,0,0),
			new THREE.Vector3( 0,0,0),
			new THREE.Vector3(-1/3 * w,0,0),
		],
		[
			new THREE.Vector3( 0.25 * w, 0.25 * h,0),
			new THREE.Vector3(-0.25 * w, 0.25 * h,0),
			new THREE.Vector3( 0.25 * w,-0.25 * h,0),
			new THREE.Vector3(-0.25 * w,-0.25 * h,0),
		],
		[
			new THREE.Vector3( 0.25 * w, 0.25 * h,0),
			new THREE.Vector3(-0.25 * w, 0.25 * h,0),
			new THREE.Vector3( 0.25 * w,-0.25 * h,0),
			new THREE.Vector3(-0.25 * w,-0.25 * h,0),
		],
	]
	for(var i = 0; i < dummyToys.length; i++)
	{
		dummyToys[i] = new THREE.Mesh(new THREE.CircleGeometry(0.1))
		scene.add(dummyToys[i])

		clickables.push(dummyToys[i])
		dummyToys[i].onClick = function()
		{
			if( toysInScene.indexOf(this) === -1 )
			{
				toysInScene.push(this)
				this.correctPosition.copy(zeroVector); //we want it closest to middle

				var correctPositions = correctPositionSuggestions[toysInScene.length-1].slice(0);
				for(var i = toysInScene.length-1; i > -1 ; i--)
				{
					var index = getClosestPointToPoint(toysInScene[i].correctPosition,correctPositions)
					toysInScene[i].correctPosition.copy(correctPositions[index])

					correctPositions.splice(index,1)

					//urgh note that this is not necessarily ideal assignment.
					//Just because a's closest is b doesn't mean b's closest is a.
					//you want one that minimizes travel distance
				}
			}
			else
			{
				toysInScene.splice( toysInScene.indexOf(this) )
				projectOntoToyShelf( this.correctPosition )
				console.log(this.correctPosition)
			}
		}
		updatables.push(dummyToys[i])
		dummyToys[i].update = function()
		{
			this.position.lerp(this.correctPosition,0.1)
		}

		dummyToys[i].position.x = 1
		dummyToys[i].position.applyAxisAngle(zUnit,i/dummyToys.length*TAU)
		projectOntoToyShelf(dummyToys[i].position)
		dummyToys[i].correctPosition = dummyToys[i].position.clone()
	}
}