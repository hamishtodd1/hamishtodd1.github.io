/*
Ok so your wormholes only exist inside a box

Each ray is some curve in, fuck it, 4D space

Your 3D space is a tet mesh
At the places where they meet, the tets are bent.
When a ray travels through 


This is both a minor exercise in 3-manifold stuff and something useful for Dom collab


Beyond visualization (THIS FILE IS JUST VISUALIZATION YOU ARE JUST MAKING A WORMHOLE)
Arbitrary three manifolds
	The mesh is made of tets, but you could visualize them as vertices with four edges
	Possibly a graph is the right way to think about modifying the 3-manifold?
	Game objects should include planes, lines, points
	What's the 3-manifold equivalent of handles?
The three-manifolds may self-intersect in the sense of the tets intersecting (in planes? Maybe in full 3D).
This is ok right? Even in the worst case scenario I know their connectivity.
*/

void main()
{
	vec4 rayDirection;
	vec4 rayOrigin;

	int maxTetsToGoThrough = 100; //heh, in theory light has to end somewhere? Can go round in circles forever, interesting!

	for(int i = 0; i < maxTetsToGoThrough; i++)
	{
		for(objectsInsideTet)
		{
			if( checkCollision(rayOrigin,rayDirection) )
			{
				gl_FragColor = vec4(result, 0.0, 1.0);
				return;
			}
		}

		float closestDistance = FLOAT_MAX
		vec4 finalIntersection
		for(tetFaces)
		{
			intersection = getIntersection( rayOrigin, rayDirection )
			if( 0 < intersectionDistance && intersectionDistance < closestDistance)
			{
				finalIntersection = intersection
			}
		}

		rayOrigin = finalIntersection
		rayDirection = bendItByDihedralAngle
	}
}