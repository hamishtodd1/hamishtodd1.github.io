function init_cubes()
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
//	Protein.add(single_sliced_cube);
	
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
	Protein.add(three_hole_cube)
}