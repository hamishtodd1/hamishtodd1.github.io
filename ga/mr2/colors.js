/*
    Colors
        lambda a b c . [function body]
        string of letters = function name
	    you are expecting function, variable, variable. Get anything else puts an error sign in the column
        Colorblindness
            https://www.reddit.com/r/ColorBlind/comments/hjw6ie/i_am_making_a_game_and_i_want_to_use_a_large/
            https://personal.sron.nl/~pault/
            viridis folks https://www.youtube.com/watch?v=xAoljeRJ3lU
			mark brown https://www.youtube.com/watch?v=xrqdU4cZaLw

	Temporary:
	a ?auburn (red)
	b ?black blue? brown
	c cyan (blue)
	d
	e ?emerald (green)
	f ?fuscia (purple)
	g green gray
	h
	i ?indigo (purple)
	j
	k
	l ?lilac ?lemon
	m magenta (technical people should know. Colorblindness though. But so many will call it purple)
	n
	o orange
	p pink ("fuck purple") purple
	q
	r red
	s
	t turquoise or teal. People just call it blue or green
	u ultramarine
	v ?violet ?viridian
	w white
	x x axis
	y y axis yellow? cream? lemon?
	z z axis

	x,y,z
*/

let colorCharacters = ""
const colors = {
    "b": new Float32Array([0., 0., 1.]),
    "g": new Float32Array([.3, .3, .3]),
    "o": new Float32Array([.9, .5, .2]),
    "p": new Float32Array([.5, 0., .5]),
    "r": new Float32Array([1., 0., 0.]),
    "w": new Float32Array([1., 1., 1.]),
    "y": new Float32Array([1., 1., 0.])
}
for (let color in colors) colorCharacters += color


//ideal points are pure colors
//mix in some grey and those are real points
//2D is the color wheel, 3D is black and white


//might be fun to do in the language
//You care about its angle around that line
//its angle from red, (1,0,0)
//project onto the plane
function rgbToHue(r,g,b) {
	let huePlane = new Float32Array(16)
	plane(huePlane, 1., 1., 1., 0.)

	let redDirection = new Float32Array(16)
	point(redDirection, 1.,0.,0., 1.)
	projectPointOnPlane(redDirection, huePlane, redDirection)
	normalizeIdealPoint(redDirection)

	let rgbPoint = new Float32Array(16)
	point(rgbPoint, r,g,b,1.)
	let rgbDirection = new Float32Array(16)
	projectPointOnPlane(rgbPoint, huePlane, rgbDirection)
	normalizeIdealPoint(rgbDirection)

	join(redDirection,rgbDirection,mv0)





	//hues are directions after all!

	debugger
	// inner(rgbPoint,redPoint,mv0)
	// let redComponent = mv0[0]
	// let chatreuseComponent = r * chartreuseVector[0] + g * chartreuseVector[1] + b * chartreuseVector[2]
	// log(chatreuseComponent)
	// log(redComponent)
	// let hue = Math.atan2(chatreuseComponent,redComponent)

	



	// let centerPoint = new Float32Array(16)
	// point(centerPoint, 1./3., 1./3., 1./3., 1.)

	// let planeContainingRed = new Float32Array(16)
	// plane(planeContainingRed, 1.,1.,1.,-1.)

	

	// let hueDirection = new Float32Array(16)
	// gSub(projectedPoint, centerPoint, hueDirection)
	// log(hueDirection)

	// delete rgbPoint
	// delete planeContainingRed
	// delete planeDotPoint
	// delete projectedPoint
}
//line 
//dot with red direction
//dot with chartreuse (.5,1.,0.)

//atan2

function projectPointOnPlane(point,plane,target) {
	wNormalizePoint(point)
	let planeDotPoint = mv0
	inner(point, plane, planeDotPoint)
	gp(planeDotPoint, plane, target)
	wNormalizePoint(target)
	return target
}