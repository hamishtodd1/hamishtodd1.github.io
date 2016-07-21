var stoichiometry_matrix = new THREE.Matrix4(-1,1,0,0,	0,-1,1,0,	1,0,-1,0,	1,-1,0,0);

function GetNextState( S,I,R )
{
	//concentrations
	var S_c = S;
	var I_c = I;
	var R_c = R;
	
	var deathrate = 0.01;
	
	var h = new THREE.Vector4(
			deathrate * R + deathrate * I - Infectiousness * S_c * I_c,
			 1/RecoveryTime * I_c - deathrate * R_c,
			-1/RecoveryTime * I_c - deathrate * I_c + Infectiousness * S_c * I_c,
			0
	);
//	h.x = Infectiousness * Math.sqrt(S_c) * Math.sqrt(I_c);
//	h.y = 1/RecoveryTime * I_c;
//	h.z = deathrate * R_c;
//	h.w = deathrate * I_c;
//	
//	h.applyMatrix4( stoichiometry_matrix );
//	
	var epsilon_t = 0.01; //the "time step"
	h.multiplyScalar( epsilon_t );
	
	returnstate = new THREE.Vector3(S,I,R);
	returnstate.x += h.x;
	returnstate.y += h.y;
	returnstate.z += h.z;
	
	var newpopulation = returnstate.x + returnstate.y + returnstate.z;
	returnstate.multiplyScalar(1 / newpopulation * Population)
	console.log( returnstate.x + returnstate.y + returnstate.z,Population)
	
	return returnstate;
}