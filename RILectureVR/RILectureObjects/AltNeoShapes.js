
function initNeoShapes()
{
	function makeBasis()
	{
		//probably a bad idea to "privelege" any of them.
		//but obviously the level needs to be able to define the basis
		//The handle goes wherever your hand goes, but 
		//	axes have a maximum length. When you let go they go back
		//	you can't get it any closer to the center than the core radius though
		// maybe also - you can't "invert" objects?
		//labels appear are determined by how many axes there are from this basis. Could swap them though...
		//if the core is being grabbed, the next grab will get one of the axes. 
			//Might need to make it so that you *have* to be holding the core
			//they change color if you're about to grab them
		
		/* 
		 * Is there any other pattern that's nice when squashed down? You should try things, hell, you might even discover things.
		 * You are concerned about the large number of separate objects. But is drawcalls really about separate objects?
		 * 
		 * http://www.steelpillow.com/polyhedra/five_sf/five.htm
		 * when a shape is ready to snap, a "ghost" version of it appears in the prospective place. Letting go causes the snap
		 * 14 gon in skin https://elifesciences.org/content/5/e19593
		 * 
		 * To the politicians: there is a really strong correlation between enjoying Martin Gardner puzzles and being a person able to contribute to society. 
		 * 
		 * What you need is some real world object that is subject to a skew transformation that turns it into something real
		 * 
		 * Emergent shadow
		 * set up a copy of the lattice with all the points and edges and meshes black, meshbasicmaterial
		 * the basis vectors are the same as the basis vectors of the actual thing, just with z = 0. Jesus!
		 * I mean, that is a very cool moment. It's about the connection between computer science and games, consistency
		 * It is a design realization that has come from this "unification" process.
				Not only is it easier to program even if you don't want to have a separate basis
				But this "separate basis" thing, if you have it, is a new way to illustrate something that has been born from contemplating the programming/mathematical design
				My interests are aligned. As a programmer I want less code. As a game designer I want a clean set of mechanics so I can think of new phenomena. And as a teacher I get a clever new illustration
				Conventional science presenters eg Brian Cox - "I'll explain my shit, maybe I'll have some animator do something for me"
				
			The basis vector copy should look like a shadow of the basis. "How many dimensions does a shadow have?" A trick:
				1. Hey what's that over there? A shadow of our basis. Move vectors - see?
				2. And if we bring over a pattern of ours, we see it has a shadow too (flick through representations)
				3. Stick them together, no surprise, the shadow of our pattern gets the same things applied to it
				4. But so actually this is a lie! Take the pattern away; its shadow doesn't move. Change the basis again; shadow pattern changes, "actual" one doesn't
				5. Change the lattice colors so now the shadow looks like a normal pattern. Maybe demonstrate it still moves normally
				6. Change the basis colors so now the shadow looks like a normal basis. 
				7. Modify flat basis - "all I've done is set up a simple relationship between these two bases",
				8. Overlap them (can do this because no rotation from hands!) "one is a squashed version of the other. But that's actually what a shadow is"
				9. Modify "actual" basis into flat one and bring back "actual" pattern
		 */
		
		//snapping
		//go through triangles in shape A. Find the one closest to shape B. This does assume good centering
		//go through triangles in shape B. Find the one closest to that triangle. They must be some minimum distance
		//we are assuming all triangles on A and B are the same. Your tridecahedron would break that.
		
		//When you clone a shape in a bunch, it clones the whole bunch. Which suggests you do need to... "merge" them somehow
		
		//important!! Put the axes in the fish's world. Only when all the axes are in there can the shapes be in its world, that's why it can only see distorted cubes
		//maybe look down the fish's universe?
		var basis = new THREE.Object3D();

		var axisLength = 1;
		var axisRadius = axisLength * 0.01;
		var axisRadialDetail = 32;
		var coreRadius = axisRadius * 4;
		
		var core = new THREE.Mesh( new THREE.SphereGeometry(coreRadius), new THREE.MeshPhongMaterial({color:0x000000}) );
		basis.add(core);
		
		var axisGeometry = new THREE.CylinderGeometry(axisRadius,axisRadius, axisLength, axisRadialDetail,1,true); //the length should be 2.
		var upArrowhead = new THREE.ConeGeometry(axisRadius * 2, axisLength / 12, axisRadialDetail);
		for(var i = 0; i < upArrowhead.vertices.length; i++)
			upArrowhead.vertices[i].y += axisLength / 2;
		axisGeometry.merge(upArrowhead, new THREE.Matrix4() );
		var downArrowhead = upArrowhead.clone();
		var downArrowhead_matrix = new THREE.Matrix4();
		downArrowhead_matrix.makeRotationAxis(xAxis, TAU / 2);
		axisGeometry.merge(downArrowhead, downArrowhead_matrix );
		
		basis.axes = Array(6);
		
		function updateAxis()
		{
			{
				if( this.handle.position.length() < coreRadius )
					this.handle.position.setLength( coreRadius );
				if( this.handle.position.length() > 1 + coreRadius )
					this.handle.position.setLength( 1 + coreRadius );
				
				//various other things to do with handle position here. Assuming it is fine after this
			}
			
			var characteristicVector = this.handle.position.clone();
			characteristicVector.setLength( characteristicVector.length() - coreRadius );
			
			this.matrix.makeRotationAxis( (new THREE.Vector3()).crossVectors( yAxis, this.handle.position ), yAxis.angleTo( this.handle.position ) ); //might need to negate axis
			this.scale.setScalar( characteristicVector.length() );
		}
		
		function updateBasis()
		{
			//if you grab a handle and it has the wrong label, we swap its position with the one with the right label
		}
		
		for(var i = 0; i < 6; i++)
		{
			var basis.axes[i] = new THREE.Mesh(axisGeometry, new THREE.MeshPhongMaterial({color:0x000000}) );
			var basis.axes[i].handle = new THREE.Mesh( new THREE.SphereGeometry( axisRadius * 2 ), new THREE.MeshPhongMaterial(
				{
					color:0x888888, //silver?
					shininess: 100
				} ) );
			basis.add( basis.axes[i] );
			basis.add( basis.axes[i].handle );
			
			var axisColor;
			var labelstring;
			if( i === 0 ) { axisColor = 0xFF0000; labelstring = "  x"; basis.axes[i].handle.position.set(1,0,0); }
			if( i === 1 ) { axisColor = 0x00FF00; labelstring = "  y"; basis.axes[i].handle.position.set(0,1,0); }
			if( i === 2 ) { axisColor = 0x0000FF; labelstring = "  z"; basis.axes[i].handle.position.set(0,0,1); }
			if( i === 3 ) { axisColor = 0x00FFFF; labelstring = "  u"; basis.axes[i].handle.position.set(-1/Math.sqrt(2),0,-1/Math.sqrt(2)); }
			if( i === 4 ) { axisColor = 0xFF00FF; labelstring = "  v"; basis.axes[i].handle.position.set( 1/Math.sqrt(2), 1/Math.sqrt(2),0); }
			if( i === 5 ) { axisColor = 0xFFFF00; labelstring = "  w"; basis.axes[i].handle.position.set(0, 1/Math.sqrt(2), 1/Math.sqrt(2)); }
			
			basis.axes[i].handle.position.setLength( coreRadius ) );
			
			if(typeof gentilis !== 'undefined')
				basis.axes[i].label = new THREE.Mesh(new THREE.TextGeometry( labelstring, {size: axisLength / 13, height: axisLength / 80, font: gentilis});
															 new THREE.MeshPhongMaterial( { color: axisColor } ) );
			else
				basis.axes[i].label = new THREE.Mesh(new THREE.BoxGeometry( axisLength / 13,axisLength / 13, axisLength / 80 ),
															 new THREE.MeshPhongMaterial( { color: axisColor } ) );
			basis.add(basis.axes[i].label);
			
			basis.axes[i].update = updateAxis;
			
			//the label needs to change position and rotate to face you
			
		}
		
		
		return basis;
	}
}