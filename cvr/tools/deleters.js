//TODO turning white is a bad way to highlight, they're inside a ball
function initAtomDeleter()
{
	var atomDeleter = Tool(0xFF0000,"Atom Deleter")

	var highlightColor = new THREE.Color(1,1,1);

	//probably various things can highlight something, be sure to always do cleanup
	//heh but what if you want a tool in each hand?
	atomDeleter.onLetGo = turnOffAllHighlights;

	atomDeleter.whileHeld = function(assemblagePosition)
	{
		if( models.length === 0 )
		{
			return;
		}

		var ourRadiusSq = sq( this.boundingSphere.radius / getAngstrom() );

		//request is now fixed
		if( this.parent.button1 && !this.parent.button1Old )
		{
			for(var i = 0; i < models.length; i++)
			{
				for(var j = 0, jl = models[i].atoms.length; j < jl; j++)
				{
					if( models[i].atoms[j].selected )
					{
						var msg = {command:"deleteAtom"};
						models[i].atoms[j].assignAtomSpecToObject( msg );

						if(true) //not connected to coot!
						{
							// socket.commandReactions.deleteAtom(msg)
							i = -1
							break;
						}
						else
						{
							// socket.send(JSON.stringify(msg));
						}
					}
				}
			}
		}
		else
		{
			for(var i = 0; i < models.length; i++)
			{
				for(var j = 0, jl = models[i].atoms.length; j < jl; j++)
				{
					if( models[i].atoms[j].position.distanceToSquared( assemblagePosition ) < ourRadiusSq )
					{
						if(!models[i].atoms[j].selected)
						{
							// console.log("selecting?")
							//bug was apparently being fixed here
							models[i].atoms[j].selected = true;
							models[i].colorAtom(models[i].atoms[j], highlightColor);
						}
					}
					else
					{
						if( models[i].atoms[j].selected )
						{
							models[i].atoms[j].selected = false;
							models[i].colorAtom( models[i].atoms[j] );
						}
					}
				}
			}
		}
	}

	//highlighting is out there

	return atomDeleter;
}

//seems to have a bug if you delete two residues at the same time
function initResidueDeleter()
{
	var residueDeleter = Tool(0xFF0000,"Residue Deleter")

	residueDeleter.onLetGo = turnOffAllHighlights;	

	residueDeleter.whileHeld = function()
	{
		if( models.length === 0 )
		{
			return;
		}

		var ourRadiusSq = sq( this.boundingSphere.radius / getAngstrom() );

		if( this.parent.button1 && !this.parent.button1Old )
		{	
			for(var i = 0; i < models.length; i++)
			{
				if(!logged)
				{
					console.log("we appear to have been trying to test something that happens now")
				}
				logged = 1
				for(var j = 0, jl = models[i].atoms.length; j < jl; j++)
				{
					if( models[i].atoms[j].selected )
					{
						for(var k = 0, kl = models[i].atoms.length; k < kl; k++)
						{
							if(models[i].atoms[k].resNo === models[i].atoms[j].resNo)
							{
								//would be more efficient on coot side to delete all at once
								var msg = {command:"deleteAtom"};
								models[i].atoms[k].assignAtomSpecToObject( msg );
								// socket.send(JSON.stringify(msg));
							}
						}
					}
				}
			}
		}
		else
		{
			highlightResiduesOverlappingSphere(this, ourRadiusSq)
		}
	}

	return residueDeleter;
}