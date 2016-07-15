var stoichiometry_matrix = new THREE.Matrix4(-1,1,0,0,	0,-1,1,0,	1,0,-1,0,	1,-1,0,0);

function GetNextState( S,I,R )
{
	//concentrations
	var S_c = S / Population;
	var I_c = I / Population;
	var R_c = R / Population;
	
	var deathrate = 0.01;
	
	var h = new THREE.Vector4();
	h.x = Infectiousness * Math.sqrt(S_c) * Math.sqrt(I_c);
	h.y = I_c / RecoveryTime;
	h.z = deathrate * R_c;
	h.w = deathrate * I_c;
	
	h.applyMatrix4( stoichiometry_matrix );
	
	var epsilon_t = 1; //the "time step"
	h.multiplyScalar( epsilon_t );
	
	returnstate = new THREE.Vector3(S,I,R);
	returnstate.x += h.x;
	returnstate.y += h.y;
	returnstate.z += h.z;
	
	return returnstate;
}