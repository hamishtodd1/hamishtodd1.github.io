/*
	charges that repel, including by the frame?
	wouldn't even need to tween
	also repelled by your head in the corner!
	it's more likely to be: you put a recent object in 

	You wanted a way to click the things and have them tween in

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
			if(numAroundEdges>1)
			{
				toysToBeArranged[i].position.applyAxisAngle(zUnit,-i/(numAroundEdges-1)*TAU/2)
			}
			projectOntoToyShelf(toysToBeArranged[i].position)
		}
	}
}