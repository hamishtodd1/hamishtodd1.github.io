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
    "b": new THREE.Color(0., 0., 1.),
    "g": new THREE.Color(.4, .4, .4),
    "o": new THREE.Color(.9, .5, .2),
    "p": new THREE.Color(.5, 0., .5),
    "r": new THREE.Color(1., 0., 0.),
    "w": new THREE.Color(1., 1., 1.),
    "y": new THREE.Color(1., 1., 0.)
}
for (let color in colors) colorCharacters += color