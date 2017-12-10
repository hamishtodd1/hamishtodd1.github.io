//we assume natural parent is scene
function ensureAttachment(child, parent)
{
	if(child.parent !== parent)
	{
		THREE.SceneUtils.attach( child, scene, parent );
	}
}

function ensureDetachment(child, parent)
{
	if(child.parent === parent)
	{
		THREE.SceneUtils.detach( child, parent, scene );
	}
}

function loop( controllers, vrInputSystem, thingsToBeUpdated, holdables, monitorer )
{
	frameDelta = ourClock.getDelta();
	frameTime += frameDelta;
	
	vrInputSystem.update();
	
	for(var i = 0; i < controllers.length; i++)
	{
		if( controllers[i].grippingTop )
		{
			if( controllers[i].children.length === 1)
			{
				for(var holdable in holdables )
				{
					if( controllers[i].overlappingHoldable(holdables[holdable]) )
					{
						if( controllers[i].children.length > 1)
						{
							console.warn("was going to attach something else")
							break;
						}
						
						ensureDetachment(holdables[holdable], holdables[holdable].parent)
						ensureAttachment(holdables[holdable], controllers[i])
					}
				}
			}
		}
		else
		{
			for(var holdable in holdables )
			{
				if( holdables[holdable].parent === controllers[i])
				{
					ensureDetachment(holdables[holdable], controllers[i])
					ensureAttachment(holdables[holdable], holdables[ holdable ].ordinaryParent )
				}
			}
		}
	}

	if(monitorer.playing)
	{
		monitorer.dispense();

		//it would be nice if you could change the initial conditions then watch me make a fool of myself
	}
	else
	{
		//principle: variables affected by updates must be tracked by monitorer
		for( var thing in thingsToBeUpdated)
		{
			thingsToBeUpdated[thing].update();
		}
		if(monitorer.recording)
		{
			monitorer.record();
		}
	}
}