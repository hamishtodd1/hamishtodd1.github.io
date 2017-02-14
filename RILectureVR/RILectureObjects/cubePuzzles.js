function init_cubes(presentation)
{
	var cube_edgelen = 0.3;
	//we stack a bunch with normal cubes and get the whole thing
	var single_cube = new THREE.Mesh(new THREE.BoxGeometry(cube_edgelen,cube_edgelen,cube_edgelen), new THREE.MeshPhongMaterial({shading: THREE.FlatShading}));
	
	var single_sliced_cube = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({color:0xFFFF88}));
//	single_sliced_cube.geometry.vertices.push(new THREE.Vector3(1,1,1)); //"top"
	
	for(var i = 0; i < 3; i++) //this doesn't respond to cube_edgelen but that wouldn't be hard to change
	{
		single_sliced_cube.geometry.vertices.push(new THREE.Vector3(0,Math.sqrt(3) / 3, 2*Math.sqrt(6) / 3)); //pointing towards you
		single_sliced_cube.geometry.vertices.push(single_sliced_cube.geometry.vertices[single_sliced_cube.geometry.vertices.length - 1].clone()); //to the left
		single_sliced_cube.geometry.vertices[single_sliced_cube.geometry.vertices.length - 1].applyAxisAngle(yAxis,-TAU / 6);
		single_sliced_cube.geometry.vertices[single_sliced_cube.geometry.vertices.length - 1].y *=-1;
		single_sliced_cube.geometry.vertices[single_sliced_cube.geometry.vertices.length - 1].lerp(single_sliced_cube.geometry.vertices[single_sliced_cube.geometry.vertices.length - 2], 0.5);
		single_sliced_cube.geometry.vertices.push(single_sliced_cube.geometry.vertices[single_sliced_cube.geometry.vertices.length - 1].clone()); //to the right
		single_sliced_cube.geometry.vertices[single_sliced_cube.geometry.vertices.length - 1].x *= -1;
		
		single_sliced_cube.geometry.vertices[single_sliced_cube.geometry.vertices.length - 1].applyAxisAngle(yAxis, -i * TAU / 3);
		single_sliced_cube.geometry.vertices[single_sliced_cube.geometry.vertices.length - 2].applyAxisAngle(yAxis, -i * TAU / 3);
		single_sliced_cube.geometry.vertices[single_sliced_cube.geometry.vertices.length - 3].applyAxisAngle(yAxis, -i * TAU / 3);
		
		//face of the square
		single_sliced_cube.geometry.faces.push(new THREE.Face3(i*3,      9,i*3+1   ));
		single_sliced_cube.geometry.faces.push(new THREE.Face3(i*3+1,    9,(i*3+5)%9));
		single_sliced_cube.geometry.faces.push(new THREE.Face3((i*3+5)%9,9,(i*3+3)%9));
		
		single_sliced_cube.geometry.faces.push(new THREE.Face3(i*3+2,i*3,i*3+1)); //the bit of the other face poking out
		
		single_sliced_cube.geometry.faces.push(new THREE.Face3(i*3+2,i*3+1,10)); //the hexagon
		single_sliced_cube.geometry.faces.push(new THREE.Face3(i*3+1,(i*3+5)%9,10));
	}
	single_sliced_cube.geometry.vertices.push(new THREE.Vector3(0,Math.sqrt(3),0)); //"top"
	single_sliced_cube.geometry.vertices.push(new THREE.Vector3(0,0,0)); //"bottom"
	correct_vertices(single_sliced_cube.geometry);
	single_sliced_cube.geometry.computeFaceNormals();
	
	var cube_corner_slice = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({color:0xFFFF88}));
	cube_corner_slice.geometry.vertices.push(new THREE.Vector3(-1,1,-1));
	cube_corner_slice.geometry.vertices.push(new THREE.Vector3(-1,1,0));
	cube_corner_slice.geometry.vertices.push(new THREE.Vector3(-1,0,-1));
	cube_corner_slice.geometry.vertices.push(new THREE.Vector3(0,1,-1));
	cube_corner_slice.geometry.faces.push(new THREE.Face3(0,2,1));
	cube_corner_slice.geometry.faces.push(new THREE.Face3(0,1,3));
	cube_corner_slice.geometry.faces.push(new THREE.Face3(0,3,2));
	cube_corner_slice.geometry.faces.push(new THREE.Face3(1,2,3));
	for(var i = 0; i < cube_corner_slice.geometry.vertices.length; i++)
		cube_corner_slice.geometry.vertices[i].multiplyScalar(cube_edgelen / 2);
	
	var cube_truncated = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({color:0xFFFF88}));
	cube_truncated.geometry.vertices.push(new THREE.Vector3(-1,1,-1));
	cube_truncated.geometry.vertices.push(new THREE.Vector3(-1,1,1));
	cube_truncated.geometry.vertices.push(new THREE.Vector3(-1,-1,-1));
	cube_truncated.geometry.vertices.push(new THREE.Vector3(1,1,-1));
	cube_truncated.geometry.faces.push(new THREE.Face3(0,2,1));
	cube_truncated.geometry.faces.push(new THREE.Face3(0,1,3));
	cube_truncated.geometry.faces.push(new THREE.Face3(0,3,2));
	
	cube_truncated.geometry.vertices.push(new THREE.Vector3(-1,-1,1));
	cube_truncated.geometry.vertices.push(new THREE.Vector3(1,-1,-1));
	cube_truncated.geometry.vertices.push(new THREE.Vector3(1,1,1));
	cube_truncated.geometry.faces.push(new THREE.Face3(2,4,1));
	cube_truncated.geometry.faces.push(new THREE.Face3(1,4,6));
	cube_truncated.geometry.faces.push(new THREE.Face3(1,6,3));
	cube_truncated.geometry.faces.push(new THREE.Face3(6,5,3));
	cube_truncated.geometry.faces.push(new THREE.Face3(2,3,5));
	cube_truncated.geometry.faces.push(new THREE.Face3(2,5,4));
	
	cube_truncated.geometry.vertices.push(new THREE.Vector3(0,-1,1));
	cube_truncated.geometry.vertices.push(new THREE.Vector3(1,-1,0));
	cube_truncated.geometry.vertices.push(new THREE.Vector3(1,0,1));
	cube_truncated.geometry.faces.push(new THREE.Face3(7,6,4));
	cube_truncated.geometry.faces.push(new THREE.Face3(7,9,6));
	cube_truncated.geometry.faces.push(new THREE.Face3(9,5,6));
	cube_truncated.geometry.faces.push(new THREE.Face3(9,8,5));
	cube_truncated.geometry.faces.push(new THREE.Face3(8,4,5));
	cube_truncated.geometry.faces.push(new THREE.Face3(8,7,4));
	cube_truncated.geometry.faces.push(new THREE.Face3(7,8,9));
	for(var i = 0; i < cube_truncated.geometry.vertices.length; i++)
		cube_truncated.geometry.vertices[i].multiplyScalar(cube_edgelen / 2);
	cube_truncated.geometry.computeFaceNormals();
	
	var three_hole_cube = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({shading: THREE.FlatShading}));
	for(var i = 0; i < 3; i++)
		for(var j = 0; j < 3; j++)
			for(var k = 0; k < 3; k++)
			{
				if(j===1 && k===1)
					continue;
				if(i===1 && k===1)
					continue;
				if(i===1 && j===1)
					continue;
				
				var newcube_geo;
				if(i+j+k < 2)
					newcube_geo = single_cube.geometry.clone();
				else if(i+j+k === 2)
					newcube_geo = cube_truncated.geometry.clone();
				else if(i+j+k === 3)//half way through
					newcube_geo = single_sliced_cube.geometry.clone();
				else if(i+j+k === 4)
					newcube_geo = cube_corner_slice.geometry.clone();
				else continue;
				
				var newcube_mat = new THREE.Matrix4();
				newcube_mat.setPosition(new THREE.Vector3( (i-1) * cube_edgelen,-(j-1) * cube_edgelen,(k-1) * cube_edgelen));
				three_hole_cube.geometry.merge(newcube_geo, newcube_mat); //might need another argument?
			}
	three_hole_cube.geometry.mergeVertices();
	
	var two_hole_cube = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({shading: THREE.FlatShading}));
	for(var i = 0; i < 3; i++)
		for(var j = 0; j < 3; j++)
			for(var k = 0; k < 3; k++)
			{
				if(j===1 && k===1)
					continue;
				if(i===1 && k===1)
					continue;
				
				if( i+j+k > 3)
					continue;
				var newcube_geo;
				if(i+j+k < 3)
					newcube_geo = single_cube.geometry.clone();
				else //half way through
					newcube_geo = single_sliced_cube.geometry.clone();
				
				var newcube_mat = new THREE.Matrix4();
				newcube_mat.setPosition(new THREE.Vector3( (i-1) * cube_edgelen,-(j-1) * cube_edgelen,(k-1) * cube_edgelen));
				two_hole_cube.geometry.merge(newcube_geo, newcube_mat); //might need another argument?
			}
	two_hole_cube.geometry.mergeVertices();
	
	var one_hole_cube = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({shading: THREE.FlatShading}));
	for(var i = 0; i < 3; i++)
		for(var j = 0; j < 3; j++)
			for(var k = 0; k < 3; k++)
			{
				if(j===1 && k===1)
					continue; 
				
				var newcube_geo = single_cube.geometry.clone();
				var newcube_mat = new THREE.Matrix4();
				newcube_mat.setPosition(new THREE.Vector3( (i-1) * cube_edgelen,(j-1) * cube_edgelen,(k-1) * cube_edgelen));
				one_hole_cube.geometry.merge(newcube_geo, newcube_mat); //might need another argument?
			}
	one_hole_cube.geometry.mergeVertices();
	
	function correct_vertices(ourGeometry)
	{
		var rearup_angle = ((single_sliced_cube.geometry.vertices[0].clone()).sub(single_sliced_cube.geometry.vertices[9])).angleTo(zAxis);
		for(var i = 0; i < single_sliced_cube.geometry.vertices.length; i++)
		{
			ourGeometry.vertices[i].multiplyScalar(cube_edgelen / 2);
			ourGeometry.vertices[i].applyAxisAngle(xAxis,-rearup_angle);
			ourGeometry.vertices[i].applyAxisAngle(zAxis,TAU/8);
		}
	}
	three_hole_cube.scale.set(0.4,0.4,0.4);
	
	//then try making it with just normal cubes and see which ones need to be dealt with
	function makePuzzle(cubeHalf, objectToAddTo)
	{
		objectToAddTo.add(cubeHalf);
		cubeHalf.material.color.r = 0;
		var otherHalf = cubeHalf.clone();
		var cornerAxis = new THREE.Vector3(1,-1,1)
		cornerAxis.normalize();
		myPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.7,0.7), new THREE.MeshBasicMaterial({transparent:true, opacity: 0.5, color: 0x57007F, side: THREE.DoubleSide}));
		objectToAddTo.add(otherHalf);
		var newRearUp = (new THREE.Vector3(1,1,1)).angleTo(new THREE.Vector3(0,1,0));
		otherHalf.rotateOnAxis(new THREE.Vector3(-1/Math.sqrt(2),0,1/Math.sqrt(2)), -newRearUp );
		var edgeAxis = new THREE.Vector3(-0.5,-1,-0.5)
		edgeAxis.normalize()
		otherHalf.rotateOnAxis(cornerAxis,TAU / 6);
		otherHalf.rotateOnAxis(edgeAxis,TAU / 2);
		cubeHalf.rotateOnAxis(new THREE.Vector3(-1/Math.sqrt(2),0,1/Math.sqrt(2)), -newRearUp );
		myPlane.rotation.x = TAU / 4;
		objectToAddTo.add(myPlane);
	}
	
	var full3hole = presentation.createNewHoldable("full3hole");
	full3hole.scale.multiplyScalar(0.2);
	makePuzzle(three_hole_cube, full3hole);
	
	var fullNoHole = presentation.createNewHoldable("fullNoHole");
	fullNoHole.scale.multiplyScalar(0.2);
	makePuzzle(single_sliced_cube, fullNoHole);
	
	var half3hole = presentation.createNewHoldable("half3hole");
	half3hole.scale.multiplyScalar(0.2);
	half3hole.add(three_hole_cube.clone());
	
	var halfNoHole = presentation.createNewHoldable("halfNoHole");
	halfNoHole.scale.multiplyScalar(0.2);
	halfNoHole.add(single_sliced_cube.clone() );
	
	//the light puzzle
	{
//		var pentagonRadius = 0.1;
//		var shadowHeight = pentagonRadius * 19;
//		var shadowBottomRadius = pentagonRadius * 4;
//		var shadowVolume = new THREE.Mesh(new THREE.CylinderGeometry(pentagonRadius, shadowBottomRadius, shadowHeight, 5,1,false,TAU/2), new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.4}));
//		shadowVolume.position.z = -shadowHeight/2-0.001;
//		shadowVolume.rotation.x = TAU / 4;
//		//this is at the origin
//		var pentagon = new THREE.Mesh(new THREE.ConeGeometry(pentagonRadius,pentagonRadius/3,5, TAU/4), new THREE.MeshPhongMaterial({side:THREE.DoubleSide}));
//		pentagon.rotation.x = TAU/4;
//		pentagon.rotation.y = TAU/5*1.5;
//		pentagon.position.z = pentagonRadius/6;
//		var ourLight = new THREE.DirectionalLight( 0xffffff, 1 );
//		ourLight.color.setHSL( 0.1, 1, 0.95 );
//		var radiusGradient = ( shadowBottomRadius - pentagonRadius ) / shadowHeight;
//		ourLight.position.z = -pentagonRadius / radiusGradient;
//			//at 0, r = pentagonRadius, at shadowHeight it = 
//		OurObject.add( ourLight );
//		var shadowPlane = new THREE.Mesh(new THREE.CylinderGeometry(pentagonRadius*7,pentagonRadius*7,pentagonRadius*9,62,1,true,TAU/4*3,TAU/4), new THREE.MeshPhongMaterial({color: 0x57007F, side: THREE.DoubleSide}));
//		shadowPlane.position.z = -shadowHeight*0.8;
//		shadowPlane.position.y -= 0.3;
//		shadowPlane.rotation.z = -TAU / 4;
//		OurObject.add(shadowVolume, shadowPlane,pentagon);
		
//		Renderer.setClearColor(0xFFFFFF)
//		Scene.remove(Scene.children[4])
//		Scene.remove(Scene.children[3])
	}
	
	var treeSlicer = presentation.createNewHoldable("treeSlicer");
	treeSlicer.add(new THREE.Mesh(new THREE.RingGeometry(0.09,0.1,4,1, TAU/8), 
			new THREE.MeshBasicMaterial({color:0xFFFFFF, transparent:true, opacity:0.3, side:THREE.DoubleSide})));
//	treeSlicer.position
	treeSlicer.update = function()
	{
		//glue to face
		this.quaternion.copy(Camera.quaternion);
		this.position.copy(Camera.position);
		var forwardVector = new THREE.Vector3(0,0,1);
		Camera.localToWorld(forwardVector);
		forwardVector.setLength(Camera.near + 0.005);
		forwardVector.negate();
		this.position.add(forwardVector);
	}
	
	var sliceableTree = presentation.createNewHoldable("sliceableTree");
	var radiusSegments = 30; //probably a lot more
	var heightSegments = 60;
	var darkMat = new THREE.MeshBasicMaterial({color:0x7B2C1F, side:THREE.DoubleSide});
	var lightMat = new THREE.MeshBasicMaterial({color:0xE9A053, side:THREE.DoubleSide});
	var lightWidth = 0.004;
	var darkWidth = 0.0013;
	var pairWidth = lightWidth + darkWidth;
	var numRingPairs = 8;
	var trunkHeight = 2.5 * pairWidth * numRingPairs;
	
	function insertRoll(innerRadius, outerRadius, material)
	{
		sliceableTree.add(new THREE.Mesh( //annulus
				new THREE.CylinderGeometry(innerRadius, outerRadius, 0, radiusSegments, heightSegments, true), material ) );
		sliceableTree.children[ sliceableTree.children.length-1 ].position.y = trunkHeight/2;
		
		sliceableTree.add(new THREE.Mesh( //cylinder
				new THREE.CylinderGeometry(innerRadius, innerRadius, trunkHeight, radiusSegments, heightSegments, true), material ) );
		sliceableTree.add(new THREE.Mesh( //cylinder
				new THREE.CylinderGeometry(outerRadius, outerRadius, trunkHeight, radiusSegments, heightSegments, true), material ) );
		
		sliceableTree.add(new THREE.Mesh( //annulus
				new THREE.CylinderGeometry(innerRadius, outerRadius, 0, radiusSegments, heightSegments, true), material ) );
		sliceableTree.children[ sliceableTree.children.length-1 ].rotation.x = TAU/2;
		sliceableTree.children[ sliceableTree.children.length-1 ].position.y =-trunkHeight/2;
	}
	for(var i = 0; i < numRingPairs; i++)
	{
		insertRoll(i*pairWidth, i*pairWidth+lightWidth, lightMat);
		insertRoll(i*pairWidth+lightWidth+0.00001, (i+1)*pairWidth-0.00001, darkMat);
	}
	
	var treePuzzle = presentation.createNewHoldable( "treePuzzle" );
	var loader = new THREE.OBJLoader();
	loader.load(
		'http://hamishtodd1.github.io/RILecture/Data/Tree.obj',
		function ( TreeOBJ ) {
			var tree = TreeOBJ.children[0];
			tree.material.color.set(0x78533F)
			var treeScale = 0.002;
			tree.scale.set(treeScale,treeScale,treeScale )
			tree.position.set(-0.047,-0.5,0)
			tree.rotation.z = -0.04;
			
			var horizontalPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.28,0.28), new THREE.MeshBasicMaterial({transparent:true, opacity: 0.5, color: 0x57007F, side: THREE.DoubleSide}));
			var diagonalPlane = horizontalPlane.clone();
			var verticalPlane = horizontalPlane.clone();
			
			horizontalPlane.rotation.x = 1.57;
			horizontalPlane.position.y -= 0.44;
			
			verticalPlane.rotation.set(0,1.57,0)
			verticalPlane.position.set(0.02,-0.15,0)
			
			diagonalPlane.rotation.set(1.57,-0.563,0)
			diagonalPlane.position.set(0.02,-0.34,0);
			
			treePuzzle.add(tree);
//			treePuzzle.add(horizontalPlane);
//			treePuzzle.add(verticalPlane);
//			treePuzzle.add(diagonalPlane);
		}
	);
//	loader.load(
//		'http://hamishtodd1.github.io/RILecture/Data/banana.obj',
//		function ( bananaOBJ ) {
//			var banana = bananaOBJ.children[0];
//			banana.material = new THREE.MeshBasicMaterial({color: 0xDBB94C, side: THREE.DoubleSide})
//			for(var i = 0, il = banana.geometry.attributes.position.array.length; i<il; i++) 
//				banana.geometry.attributes.position.array[i] *=0.1;
//			banana.position.set(-2.55,0,1.79)
////			OurObject.add(banana)
//			
//			var slicePlane = new THREE.Mesh(new THREE.PlaneGeometry(0.28,0.28), new THREE.MeshBasicMaterial({transparent:true, opacity: 0.5, color: 0x57007F, side: THREE.DoubleSide}));
////			OurObject.add(slicePlane);
//		}
//	);
//	loader.load(
//		'http://hamishtodd1.github.io/RILecture/Data/clebsch.obj',
//		function ( clebschOBJ ) {
//			var clebsch = clebschOBJ.children[0];
//			clebsch.material.color.b = 0;
//			var newRearUp = (new THREE.Vector3(1,1,1)).angleTo(new THREE.Vector3(0,1,0));
//			var clebschMatrix = (new THREE.Matrix4()).makeRotationAxis ( new THREE.Vector3(1/Math.sqrt(2),0,1/Math.sqrt(2)), -newRearUp );
//			clebsch.geometry.applyMatrix(clebschMatrix);
//			for(var i = 0, il = clebsch.geometry.attributes.position.array.length; i<il; i++) 
//				clebsch.geometry.attributes.position.array[i] *=0.1;
//			var cutoff = -0.58;
//			for(var i = 0, il = clebsch.geometry.attributes.position.array.length/3; i<il; i++)
//			{
//				clebsch.geometry.attributes.position.array[i*3+1] *= 5;
//				
//				if( clebsch.geometry.attributes.position.array[i*3+1] < cutoff )
//					clebsch.geometry.attributes.position.array[i*3+1] = cutoff;
//			}	
//			OurObject.add(clebsch)
//			
//			slicePlane = new THREE.Mesh(new THREE.PlaneGeometry(0.28,0.28), new THREE.MeshBasicMaterial({transparent:true, opacity: 0.5, color: 0x57007F, side: THREE.DoubleSide}));
//			OurObject.add(slicePlane);
//		}
//	);
	
}