/*
	So the animation is...

	vector * scalar = extend

	Could have complex number!

				Scalar		Vector 		Bivector	Trivector
	Scalar		
	Vector		
	Bivector	
*/

function geometricProduct(a,b,target)
{
	//from ganja.js

	target[0]= b[0]*a[0] + b[1]*a[1] + b[2]*a[2] + b[3]*a[3] - b[4]*a[4] - b[5]*a[5] - b[6]*a[6] - b[7]*a[7] ;

	target[1]= b[1]*a[0] + b[0]*a[1] - b[4]*a[2] - b[5]*a[3] + b[2]*a[4] + b[3]*a[5] - b[7]*a[6] - b[6]*a[7] ;
	target[2]= b[2]*a[0] + b[4]*a[1] + b[0]*a[2] - b[6]*a[3] - b[1]*a[4] + b[7]*a[5] + b[3]*a[6] + b[5]*a[7] ;
	target[3]= b[3]*a[0] + b[5]*a[1] + b[6]*a[2] + b[0]*a[3] - b[7]*a[4] - b[1]*a[5] - b[2]*a[6] - b[4]*a[7] ;

	target[4]= b[4]*a[0] + b[2]*a[1] - b[1]*a[2] + b[7]*a[3] + b[0]*a[4] - b[6]*a[5] + b[5]*a[6] + b[3]*a[7] ;
	target[5]= b[5]*a[0] + b[3]*a[1] - b[7]*a[2] - b[1]*a[3] + b[6]*a[4] + b[0]*a[5] - b[4]*a[6] - b[2]*a[7] ;
	target[6]= b[6]*a[0] + b[7]*a[1] + b[3]*a[2] - b[2]*a[3] - b[5]*a[4] + b[4]*a[5] + b[0]*a[6] + b[1]*a[7] ;

	target[7]= b[7]*a[0] + b[6]*a[1] - b[5]*a[2] + b[4]*a[3] + b[3]*a[4] - b[2]*a[5] + b[1]*a[6] + b[0]*a[7] ;

	// log(target)

	return target;
}

function geometricSum(a,b,target)
{
	for(let i = 0; i < target.length; i++)
		target[i] = a[i] + b[i];

	return target;
}

function randomMultivector(index1,index2,index3)
{
	let multivec = new Float32Array(8)

	if(index1 !== undefined)
		multivec[index1] = Math.random()
	if(index2 !== undefined)
		multivec[index2] = Math.random()
	if(index3 !== undefined)
		multivec[index3] = Math.random()

	return multivec
}