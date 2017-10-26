/*
 * You can wrap and unwrap an octagon
 * You are just showing copies of the same thing again and again.
 * 
 * Would this be any better with pentagons? They at least join four to a corner
 * 
 * Start out with an octagon. You can shoot things around it
 * When it wraps up
 * 
 * Apparently this is the bolza surface somehow?
 * 
 * No, the most natural 2-torus has threefold symmetry
 * 
 * How about a tetrahedron from a dodecagon? Klein quartic
 * 
 * Where this fits in:
 * 		She studied POINTS that MOVE AROUND in SPACES
 * 		Sometimes spaces are connected in weird ways
 */

/*
 * Line traced out by projectile
 * "folding out"? Eh
 * And then the nice part is seeing the trajectory go out fast. And moving it around and seeing all its copies go out too
 */

function initOctagonScene()
{
	var octagon = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color:0xFF0000, side:THREE.DoubleSide}));
	octagon.geometry.vertices.push(new THREE.Vector3());
	for(var i = 0; i < 8; i++)
	{
		var newVertex = new THREE.Vector3();
		newVertex.y = 0.2;
		newVertex.applyAxisAngle(zAxis, TAU/8*i);
		octagon.geometry.vertices.push(newVertex);
		
		var mostRecentIndex = octagon.geometry.vertices.length-1;
		var newFace = new THREE.Face3(0, mostRecentIndex, mostRecentIndex%8+1);
		console.log(newFace)
		octagon.geometry.faces.push(newFace);
	}
	
	//you need a thing that maps a point in the octagon to the right place. Probably polar coords, you think of it as a circle
	//Ideally that mapping works both for your 2-torus and for the hyperbolic plane
	//what would be nice would be a minimal energy thing
	
	var edgeLen = 1;
	var inRadius = (1+Math.sqrt(2))/2;
	var octagonRadius = Math.sqrt(4+Math.sqrt(2))/2;
	
	//have a different color for triangles on the edges
	
	function mapPoint(p, state)
	{
		var centralRadius = edgeLen / 4;
		
		//the gap
		if( p.x <= centralRadius && p.y > inRadius - centralRadius )
		{
			p.y += (centralRadius - inRadius) * state;
			return;
		}
		
		//squashing area
		if( p.x + p.y <= inRadius )
		{
			p.y *= (1-state);
			return;
		}
		
		//bottom of arms
		if( p.x + p.y <= inRadius + centralRadius )
		{
			p.y -= state * (inRadius-p.x)
			return;
		}
		//top of arms
		if( p.x + p.y <= inRadius + centralRadius * 2)
		{
			
		}
		
		console.error("beyond octagon")
	}
	
	var movingPoint = new THREE.Mesh(new THREE.SphereGeometry(0.02), new THREE.MeshBasicMaterial({color:0x00FF00}));
	movingPoint.velocity = new THREE.Vector3(0.003,0,0);
	
	var octagonScene = {};
	octagonScene.setUpScene = function()
	{
		scene.add(octagon);
		scene.add(movingPoint);
	}
	octagonScene.update = function()
	{
		movingPoint.position.add(movingPoint.velocity);
	}
	
	return octagonScene;
}