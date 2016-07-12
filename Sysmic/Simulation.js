//there's a max too but placeholder
function GetNextInfected(OurInfected)
{
	OurInfected += Infectiousness;
	if(OurInfected < 0)
		OurInfected = 0;
	
	return OurInfected;
}

function GetNextResistant(OurResistant)
{
	OurResistant += RecoveryTime;
	if(OurResistant < 0)
		OurResistant = 0;
	
	return OurResistant;
}