//from https://stackoverflow.com/questions/2824478/shortest-distance-between-two-line-segments

function closestDistanceBetweenLineSegments(a0,a1,b0,b1)
{
	return closestDistanceBetweenLines(
		a0, a1,
		b0, b1, true );
}

function closestDistanceBetweenLines(
	a0, a1,
	b0, b1, clampAll)
{
	var clampA0 = false;
	var clampA1 = false;
	var clampB0 = false;
	var clampB1 = false;

	if(clampAll)
	{
		clampA0 = true;
		clampA1 = true;
		clampB0 = true;
		clampB1 = true;
	}

	//Calculate denomitator
	var A = a1.clone().sub(a0);
	var B = b1.clone().sub(b0);
	var _A = A.clone().normalize();
	var _B = B.clone().normalize();
	var cross = _A.clone().cross(_B);
	var denom = sq(cross.length());

	//If denominator is 0, lines are parallel: Calculate distance with a projection and evaluate clamp edge cases
	if (denom == 0)
	{
		var d0 = _A.dot(b0.clone().sub(a0))
		var d = _A.clone().multiplyScalar(d0).add(a0).sub(b0).length();

		//If clamping: the only time we'll get closest points will be when lines don't overlap at all. Find if segments overlap using dot products.
		if(clampA0 || clampA1 || clampB0 || clampB1)
		{
			var d1 = _A.dot(b1.clone().sub(a0));

			//Is segment B before A?
			if(d0 <= 0 && 0 >= d1)
			{
				if(clampA0 == true && clampB1 == true)
				{
					if(Math.abs(d0) < Math.abs(d1))
					{
						return [b0, a0, b0.clone().sub(a0).length() ];
					}
					return [b1, a0, b1.clone().sub(a0).length() ];
				}
			}
			//Is segment B after A?
			else if(d0 >= A.length() && A.length() <= d1)
			{
				if(clampA1 == true && clampB0 == true)
				{
					if(Math.abs(d0) < Math.abs(d1))
					{
						return [b0, a1, b0.clone().sub(a1).length() ];
					}
					return [b1, a1, b1.clone().sub(a1).length()];
				}
			}

		}

		//If clamping is off, or segments overlapped, we have infinite results, just return position.
		return [null, null, d];
	}

	//Lines criss-cross: Calculate the dereminent and return points
	var t = b0.clone().sub(a0);
	//siiiigh, not sure about this part
	var det0 = determinant3( t,_B,cross)
	var det1 = determinant3( t,_A,cross)

	var t0 = det0 / denom;
	var t1 = det1 / denom;
	// console.log(det0,det1)

	var pA = a0.clone().add(_A.clone().multiplyScalar(t0))
	var pB = b0.clone().add(_B.clone().multiplyScalar(t1))

	//Clamp results to line segments if needed
	if(clampA0 || clampA1 || clampB0 || clampB1)
	{
		if(t0 < 0 && clampA0)
			pA = a0;
		else if(t0 > A.length() && clampA1)
			pA = a1;

		if(t1 < 0 && clampB0)
			pB = b0;
		else if(t1 > B.length() && clampB1)
			pB = b1;
	}

	var d = pA.clone().sub(pB).length();

	return [pA, pB, d];
}

function determinant3( a, v1, v2)
{
	return a.x * (v1.y * v2.z - v1.z * v2.y) + a.y * (v1.z * v2.x - v1.x * v2.z) + a.z * (v1.x * v2.y - v1.y * v2.x);
}