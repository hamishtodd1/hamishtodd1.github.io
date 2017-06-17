//we tweak these
//at max, you can keep everyone sick, and at min, everyone gets better
var ik = 5; //18.5?
var rk = 0.0005; //set recovery time close to 0 and arrows get massive
var deathRate = 0.01; //a free variable.

//this goes into a button pressing function
//ik *= 2;
//set_vector_field()

function GetNextState( I,R )
{
	//concentrations
	var S_c = (Population-I-R) / Population;
	var I_c = I / Population;
	var R_c = R / Population;
	
	var deathRateInfected = deathRate * I_c; //coooould have two separate deathRates
	var deathRateHealthy = deathRate * S_c;
	
	var infectionRate = ik * Infectiousness;
	infectionRate *= S_c * I_c;
	
	var recoveryRate = rk / RecoveryTime; //it's just an input, don't think about the literal interpretation
	recoveryRate *= I_c;
	
	var stateDerivative = new THREE.Vector3(
			deathRateInfected + deathRateHealthy - infectionRate,
			infectionRate - recoveryRate - deathRateInfected,
			recoveryRate - deathRateHealthy
	);
	var timeStep = 1.7; //Arrow size. Shouldn't change behaviour. 
	var deltaState = stateDerivative.clone().multiplyScalar( timeStep ); //or hey, a better numerical integrator?
//	console.log(deltaState)
	
	newState = new THREE.Vector3(S_c,I_c,R_c);
	newState.add(deltaState);
	
	if( newState.x < 0 )
		newState.x = 0;
	if( newState.y < 0 )
		newState.y = 0;
	if( newState.z < 0 )
		newState.z = 0;
	
	var newSum = newState.x + newState.y + newState.z; //sum could have gotten to be more than 1
	newState.multiplyScalar( 1 / newSum );
	newState.multiplyScalar( Population );
	
	return newState;
}


//keyboard crap. Have to use "preventdefault" within ifs, otherwise certain things you'd like to do are prevented
document.addEventListener( 'keydown', function(event)
{	
	var ikChangeSpeed = 0.1;
	if( event.keyCode === 81 )
		ik += ikChangeSpeed;
	if( event.keyCode === 65 )
		ik -= ikChangeSpeed;
	
	var rkChangeSpeed = 0.0001;
	if( event.keyCode === 87 )
		rk += rkChangeSpeed;
	if( event.keyCode === 83 )
		rk -= rkChangeSpeed;
	
	var deathRateChangeSpeed = 0.003;
	if( event.keyCode === 69 )
		deathRate += deathRateChangeSpeed;
	if( event.keyCode === 68 )
		deathRate -= deathRateChangeSpeed;
	
	set_vector_field();
}, false );

/*
 * Behaviour at corners, which you should be able to see nice transitions to
 * Left side: recover instantly; everything goes down to bottom, fast
 * Top: Everything goes up to triangle's diagonal
 * Right side: all arrows point up
 * Bottom: everything goes down to the bottom, slow
 * 
 * You want a clear spiral
 * 
 * the deathrate should determine how much the arrows skew to the left
 */