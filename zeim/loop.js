
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

function loop( controllers, vrInputSystem )
{
	frameDelta = ourClock.getDelta();
	frameTime += frameDelta;
	frameCount++;
	
	vrInputSystem.update();
	mouse.updateFromAsyncAndCheckClicks();
	
	//sure you want things to be parented given monitoring?
	for(var i = 0; i < controllers.length; i++)
	{
		if( controllers[i].grippingTop )
		{
			if( controllers[i].children.length === 1)
			{
				for(var j = 0; j < holdables.length; j++ )
				{
					if( controllers[i].overlappingHoldable(holdables[j]) )
					{
						if( controllers[i].children.length > 1)
						{
							console.warn("was going to attach something else")
							break;
						}
						
						ensureDetachment( holdables[j], holdables[j].parent)
						ensureAttachment( holdables[j], controllers[i])
					}
				}
			}
		}
		else
		{
			for(var j = 0; j < holdables.length; j++ )
			{
				if( holdables[j].parent === controllers[i])
				{
					ensureDetachment(holdables[j], controllers[i])
					ensureAttachment(holdables[j], holdables[ j ].ordinaryParent )
				}
			}
		}
	}

	for(var i = 0; i < unmarkedThingsToBeUpdated.length; i++)
	{
		unmarkedThingsToBeUpdated[i].update();
	}
}