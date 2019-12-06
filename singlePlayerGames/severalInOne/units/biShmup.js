/*
	One axis can be thought of "time" and the other as some kind of "behaviour"

	We have two "binary fields", one is what you want to touch, one you want to avoid
	NO, NOT THAT. That'll lock you into some mathematical elegance bullshit
	Think of the objects, objects you want to avoid. You need control over those.
	Since they're points, their movements are curves

	It's similar to an "irritating stick" thing

	Could be super great because moving through "complex movements" is the interesting thing to do spatially
	And you have some control of that

	Under each hand, a bullet hell shmup. Lots of red blobs. Your fingers specify the location of your avatar in 4D space, move your finger and your avatar moves to that place (has a max speed though). Move one finger and the other might find that the red blobs surrounding it converge on it. Cool because it’s extremely similar to having time control. Could start it out such that one side just has horizontal stripes, all you need to do is move the thing up and down.
	If it was really time travel, when you “moved back” your thing would retrace its steps.
	Ok so you want the points to travel in circles, ellipses and sine waves. Wanna adjust those directly as the designer. Probably means corrugated planes, simple equations
	Start out with it being the case that there are no “enemies” on one of the sides, it is just like a timeline
	Start out with just some randomly oriented planes
	For any plane, can calculate its intersection with another plane, which is a point. Expand that point into a circle, and you’re done.
	3DS / Switch? Tablet is obvious, phone. Could use twin sticks
	Parabola = ellipse with focus at infinity. Blah blah, this is all somewhere else
*/

function initBiShmup()
{
	var speed = 0.01
	bindButton("w", function(){avatars[0].position.y += speed}, "" )
	bindButton("a", function(){avatars[0].position.x -= speed}, "" )
	bindButton("s", function(){avatars[0].position.y -= speed}, "" )
	bindButton("d", function(){avatars[0].position.x += speed}, "" )

	bindButton("up", function(){avatars[1].position.y += speed}, "" )
	bindButton("left", function(){avatars[1].position.x -= speed}, "" )
	bindButton("down", function(){avatars[1].position.y -= speed}, "" )
	bindButton("right", function(){avatars[1].position.x += speed}, "" )

	//the right way to do it is a shader

	var avatars = Array(2)
	avatars[0] = new THREE.Mesh(new THREE.SphereGeometry(0.01))
	avatars[1] = new THREE.Mesh(new THREE.SphereGeometry(0.01))
	avatars[1].position.x += 0.5
	scene.add(avatars[0],avatars[1])
}