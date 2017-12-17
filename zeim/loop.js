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

	/*
		Philofophie
		One might like to change initial conditions then watch what I do
			That would mean: DO NOT record certain things, instead update them while the recording is playing
			But it is also important to be able to skip around the timeline
			Could simulate forward by going through what's happened in every frame.
			Could mark certain properties as "recalled if you skip to this point but not if you're simulating forward". That's a lot of work for yourself.
			It is REALLY UNAVOIDABLY COMPLEX to think about any kind of updating during playingtime. Consider that some things are inter-frame.
			Could record only controller input
			It also risks (hugely) people seeing something you didn't intend
	*/
	console.assert(!(monitorer.playing && monitorer.recording))
	monitorer.updateUiAppearance();
	if(monitorer.playing)
	{
		monitorer.dispense();
	}
	else
	{
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