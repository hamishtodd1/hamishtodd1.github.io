//wrappers assuming natural parent is scene
function establishAttachment(child, intendedParent)
{
	if(child.parent !== intendedParent)
	{
		if(child.parent !== scene)
		{
			THREE.SceneUtils.detach( child, child.parent, scene );
		}

		THREE.SceneUtils.attach( child, scene, intendedParent );

		if(intendedParent === child.ordinaryParent && child.onLetGo)
		{
			child.onLetGo();
		}
		if(intendedParent !== child.ordinaryParent && child.onGrab)
		{
			child.onGrab();
		}
	}
}

function loop( visiBox )
{
	frameDelta = ourClock.getDelta();
	frameCount++;

	readHandInput();
	updatePanel();
	
	if( handControllers[0].grippingSide && handControllers[1].grippingSide )
	{
		var handSeparationDifferential = 
			handControllers[0].position.distanceTo( handControllers[1].position ) / 
			handControllers[0].oldPosition.distanceTo( handControllers[1].oldPosition );
		
		assemblage.position.multiplyScalar( 1 / assemblage.scale.x ); 
		assemblage.scale.multiplyScalar( handSeparationDifferential );
		assemblage.position.multiplyScalar(assemblage.scale.x);

		var bothAttachedController = RIGHT_CONTROLLER_INDEX;
		establishAttachment(assemblage, handControllers[bothAttachedController]);
	}
	else
	{
		for(var i = 0; i < handControllers.length; i++)
		{
			if( handControllers[i].grippingSide && !handControllers[i].grippingSideOld )
			{
				if( holdables.indexOf( handControllers[i].children[handControllers[i].children.length-1] ) )
				{
					var distanceOfClosestObject = Infinity;
					for(var j = 0; j < holdables.length; j++ )
					{
						if( handControllers[i].overlappingHoldable(holdables[j]) )
						{
							//ok so actually holding the assemblage is probably an awful idea because many things will assume its parent is scene
							establishAttachment(holdables[j], handControllers[i]);
							break;
						}
					}
				}
			}
		}
	}
	
	for(var i = 0; i < handControllers.length; i++)
	{		
		if( !handControllers[i].grippingSide && handControllers[i].grippingSideOld )
		{
			for(var j = 0; j < holdables.length; j++ )
			{
				if( holdables[j].parent === handControllers[i])
				{
					establishAttachment( holdables[j], holdables[j].ordinaryParent );
				}
			}
		}
	}

	for( var i = 0; i < objectsToBeUpdated.length; i++)
	{
		objectsToBeUpdated[i].update();
	}
	
	// for(var i = 0; i < maps.length; i++)
	// {
	// 	for(var j = 0; j < maps[i].children.length; j++)
	// 	{
	// 		maps[i].children[j].material.linewidth = 0.2 / assemblage.position.distanceTo(camera.position);
	// 		maps[i].children[j].material.needsUpdate = true;
	// 	}
	// }
}