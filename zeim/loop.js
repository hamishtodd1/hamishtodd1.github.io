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

function loop( controllers, vrInputSystem, thingsToBeUpdated, holdables, monitorer, mouse, clickables )
{
	frameDelta = ourClock.getDelta();
	frameTime += frameDelta;
	
	mouse.updateFromAsyncAndMoveGrabbedObjects();
	vrInputSystem.update();
	
	//sure you want things to be parented given monitoring?
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
						
						ensureDetachment( holdables[holdable], holdables[holdable].parent)
						ensureAttachment( holdables[holdable], controllers[i])
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

	monitorer.update(thingsToBeUpdated);
}