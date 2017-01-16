//we're doing it with points only first
var qcTablet = new THREE.Object3D();
qcTablet.init = function()
{
	this.radius = 4; //the way to think of it is how many points do you want to see on it when it's just held parallel to octagons
	this.add(new THREE.Mesh(new THREE.CircleGeometry(this.radius, 32, 0), new THREE.MeshBasicMaterial({color:0xFFFFFF}))); //last number might need to be TAU / 16
	//probably makes more sense to have it on an octagon
	this.children[0].z = 0.0001;
	
	var pointRadius = 0.008;
	this.add( new THREE.Points(new THREE.Geometry(),new THREE.PointsMaterial({color:0x000000, size: pointRadius})) );
	
	this.num_visible_points = 20000;
	//eventually you want it to be lines and planes
	//if they're all in one geometry then that's one draw call...
	//...but if they're all separate geometries then that's better for the CPU because you just have to update their positions?
	//no, really you want it done in a shader
	
	for(var i = 0; i < this.num_visible_points; i++)
		this.children[1].geometry.vertices.push(new THREE.Vector3());
	
	this.scale.set(0.08,0.08,0.08);
	
	Protein.add(this);
	console.log("a")
}

var default_rightvector = new THREE.Vector4(1,0,0,0);
qcTablet.update = function()
{
	var papermatrix = new THREE.Matrix4();
	papermatrix.set(
			Math.sqrt(2),2,	-1,-1,
			0,Math.sqrt(2), -1, 1,
			1, 1,			Math.sqrt(2),0,
			1,-1,			0,Math.sqrt(2)
			);
	papermatrix.multiplyScalar(0.5);
	
	var whereWeLook = Camera.position.clone();
//	Protein.updateMatrixWorld();
	Protein.worldToLocal(whereWeLook);
	this.lookAt(whereWeLook);
//	this.rotation.x = Camera.rotation.x;
//	this.rotation.y = Camera.rotation.y;
//	this.rotation.z = Camera.rotation.z;
	
	/* Maybe worthless but: you don't need the entire 4-sphere.
	 * It's unfortunate how much of the set of directions you can look in are repeats. Probably things will change fast so you'd prefer to "magnify"
	 * Sooo, let them explore two "cubes", i.e. tesseract-faces, worth of configurations. Two because we glue them together in a way that simulates the 4-sphere/ tesseract.
	 * You could try to "visualize" how the two cubes are connected, but better to work it out algebraically
	 * The double cover thing gets cashed out as: You are only exploring half of a hypercube, normally. Hmm, so the magnification is not so pronounced and you would only get a 4x improvement?
	 * Here's something that does not have the magnifying effect but is something
	 * 	If your quaternion values are in [-0.25,0.25] you're fine.
	 * 	If not, they've just gone outside the face and you need to know where they are in the face they're in
	 */
	
	var planeNormal = new THREE.Vector4(Camera.quaternion.x,Camera.quaternion.y,Camera.quaternion.z,Camera.quaternion.w); //or should one be swapped?
	
	{
		//THIS IS NOT THE RIGHT WAY TO GET BASIS VECTORS, just a random thought
		//waaaaait a second, you need more than one vector! The set of points orthogonal to a line in 4D is a 3-volume!
		//Could try to work out what direction you're looking in within that three-volume? But wouldn't that cut out some possible lattices?
		//Can you make anything of the fact that orthogona
		//So you need two vectors. Well, one of them is just the vector (0,1,0,0). 
		//That's not hugely unnatural, it faces along a lattice basis vector. But can you get what you need? No
		//How about you take that 3-volume and just take a slice through it that is orthogonal to some line of vertices going through it?
		var upvector_4D = new THREE.Vector4(0,1,0,0);
		var ourDot = upvector_4D.dot( planeNormal );
		if( planeNormal.equals(upvector_4D) || ourDot === 0 )
			return; //There might be some better way of doing things
		var vectorProjection = (planeNormal.clone()).multiplyScalar(ourDot);
		var planeProjection = (upvector_4D.clone()).sub(vectorProjection);
		upvector_4D.copy(planeProjection);
		
		var rightvector_4D = default_rightvector.clone();
		ourDot = rightvector_4D.dot(planeNormal);
		if( planeNormal.equals(rightvector_4D) || ourDot === 0 )
			return;
		vectorProjection = (planeNormal.clone()).multiplyScalar(ourDot);
		planeProjection = (rightvector_4D.clone()).sub(vectorProjection);
		rightvector_4D.copy(planeProjection);
	}
	
	var lowest_unused_visiblevertex = 0;
	
	var lattice_radius = 15; //whatever you need. Whoah though, this gets ^4 so... 100,000,000
	/*
	 * Speedup opportunity: you don't need to go through all of them, just the ones near the plane, a very small amt
	 */
	var cutting_radius = 1; //not sure? can check later or even tweak
	var point4D = new THREE.Vector4();
	var planeProjection2D = new THREE.Vector2();
	
	var paper_mode = 0;
	
	for(var i = -lattice_radius; i <= lattice_radius; i++){
	for(var j = -lattice_radius; j <= lattice_radius; j++){
	for(var k = -lattice_radius; k <= lattice_radius; k++){
	for(var l = -lattice_radius; l <= lattice_radius; l++)
	{
		point4D.set(i,j,k,l);
		
		if(paper_mode)
		{
			point4D.applyMatrix4(papermatrix);
			
			if(point4D.x * point4D.x + point4D.y * point4D.y < this.radius * this.radius)
			{
				this.children[1].geometry.vertices[ lowest_unused_visiblevertex ].y = point4D.x;
				this.children[1].geometry.vertices[ lowest_unused_visiblevertex ].x = point4D.y;
			}
			
			lowest_unused_visiblevertex++;
			if(lowest_unused_visiblevertex >= this.num_visible_points) {
//				console.log("ran out of visible points")
				this.children[1].geometry.verticesNeedUpdate = true;
				return;
			}
		}
		else
		{
			ourDot = point4D.dot( planeNormal );
			if(Math.abs(ourDot) > cutting_radius)
				continue;
			vectorProjection= (planeNormal.clone()).multiplyScalar(ourDot);
			planeProjection = (point4D.clone()).sub(vectorProjection);
			planeProjection2D.set(planeProjection.dot( rightvector_4D ),planeProjection.dot( upvector_4D ) );
			
			if(planeProjection2D.length() < this.radius)
			{
				//again this is maybe a dumb way to do it
				this.children[1].geometry.vertices[ lowest_unused_visiblevertex ].y = planeProjection.dot( upvector_4D );
				this.children[1].geometry.vertices[ lowest_unused_visiblevertex ].x = planeProjection.dot( rightvector_4D );
				
				lowest_unused_visiblevertex++;
				if(lowest_unused_visiblevertex >= this.num_visible_points) {
//					console.log("ran out of visible points")
					this.children[1].geometry.verticesNeedUpdate = true;
					return;
				}
			}
			
			/*
			 * Tadashi Tokieda's overflow thing could help you
			 * The intersection of a 2-volume and a 2-volume in 4D is a 0-volume
			 * What you want is 1 volumes and 2-volumes, so you need the 3-volumes and 4-volumes
			 * 
			 * Edges:
			 * note that two points are connected by 3-planes iff they have i, j, k or l in common
			 * so maybe make an array of point indices used and then connect them up?
			 */
			
			/*
			 * Faces:
			 * 4-volumes could alternate color or be colored based on the distance of their center from the plane
			 * To work out the color between a trio of points, find the cube they have in common (is there one?)
			 * Could just... go through every set of three points and if they're in a common 4-volume then put a triangle in there. See if that leaves or overlaps anything...
			 */
		}
		
	}
	}
	}
	}
	for(var i = lowest_unused_visiblevertex; i < this.num_visible_points; i++)
		this.children[1].geometry.vertices[i].set(0,0,0);
	
	this.children[1].geometry.verticesNeedUpdate = true;
}