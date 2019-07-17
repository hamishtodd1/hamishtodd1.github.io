function initAtomLabeller()
{
	let atomLabeller = Tool(0x0000FF)

	atomLabeller.whileHeld = function(positionInAssemblage)
	{
		var ourRadiusSq = sq( this.boundingSphere.radius / getAngstrom() );
		for(var i = 0; i < models.length; i++)
		{
			for(var j = 0, jl = models[i].atoms.length; j < jl; j++)
			{
				var labelVisibility = models[i].atoms[j].position.distanceToSquared( positionInAssemblage ) < ourRadiusSq;
				// models[i].atoms[j].setLabelVisibility(labelVisibility);
				//TODO update is not a function, for the labels, if you uncomment this
			}
		}
	}

	return atomLabeller;
}