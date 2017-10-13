var sand_risenness = -1; //change to -1 when you want a trigger
var sand_final_position = new THREE.Vector3(0,400,-67);
var sand_starting_position = sand_final_position.clone();
sand_starting_position.y = -416;

function update_sand()
{
	if(sand_risenness !== -1 )
	{
		sand_risenness += delta_t;
		
		Grain_of_sand.position.copy( move_smooth_vectors( sand_starting_position, sand_final_position, 19, sand_risenness ) );
			
		//make it shake too
	}
	else
	{
		Grain_of_sand.position.copy( sand_starting_position );
	}
}

function init_sand()
{
	Grain_of_sand = OurLoadedThings[2];
	Grain_of_sand.position.copy(sand_starting_position);
	Grain_of_sand.scale.set(1000,1000,1000)
	Scene.add(Grain_of_sand);
}