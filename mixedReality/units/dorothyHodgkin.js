/*
	Took part in protest, had cambridge conservative society throw stuff at them

	Hodgkin, Thatcher, Skywalker, and diabetes"

	Need pdb reader, contouring, zooming. Ideally you can put them side by side and see difference easily
	Her amazing drawings
		https://blogs.mhs.ox.ac.uk/insidemhs/files/2017/03/Dorothy-Crowfoot-Hodgkin-Insulin-Map-Bod-944x1024.jpg
		https://www.margaretalmon.com/wp-content/uploads/6a0105362f4359970b0120a859270a970b.png

	FFT / crystallography
		http://www.ysbl.york.ac.uk/~cowtan/sfapplet/sfintro.html

	Intro
		Incredible scientist
			Oxford Professor
			Nobel prize
			directly saved the lives of tens or hundreds of millions of people, indirectly billions
			First person to do biological crystallography
		Left wing: adviser to Marxist prime minister of Ghana
			"Dorothy Crowfoot Hodgkin" because she held out for a long time against taking her husband's name for twelve years; she took it under pressure from a publisher.
			Married to a communist
			Campaigned a lot against nuclear proliferation
			A woman
				attentive mother to three kids IN THE THIRTIES
				one of the first women to get a first class degree
				Possibly the first scientist ever to receive maternity leave
	Structural biology
		have a video of a nice growing crystal
		Her penicillin thing looks great, have that
		The stuff in epipens
		First medically relevant protein
		Three decades
		https://pdb101.rcsb.org/motm/14 insulin
		http://pdb101.rcsb.org/motm/194 designer insulin
		pig insulin being a bit different, show the structure
		And the pictures of the awesome models. And data!
		GMO made it cheaper and more humane
		The thing about a part being chopped off
	Thatcher
		amazing student, a young woman with humble origins
		We know Thatcher (then Roberts) admired Dorothy enormously, and was an enthusiastic chemist
		Angela Merkel chemist connection
		She delivers on her potential, first woman prime minister
		1987, awarded the order of Lenin, which she went behind the iron curtain to collect
		It is amazing to me that the BBC has not done a drama about this
	Luke Skywalker
		She likes you so much she has a portrait of you in her office
		but using her position to do everything Dorothy saw as evil?
		Reducing funding for public education; deregulation, tax cuts; nuclear proliferation
		And with what she did to [X], it's fair to say she turned her back on Hodgkin's ideas of how. I mean feminism!
		Imagine being Dorothy, the person who did all that for politics, and then your student is literally Margaret Thatcher
		At some point the idea was floated that she could be on the £50 note
		I would most certainly be in favour of that
		Britain is incredibly well represented amongst structural biologists, and amongst early feminists
		Whenever they were going to meet, Thatcher would read up on recent discoveries in chemistry
		There's something very British about the idea of two extremely influential political people...
			sitting and talking about chemistry

			opposed giving her an honorary doctorate
			Thatcher most certainly did not care about whether anybody on the left liked her
			https://twitter.com/SomervilleOx/status/1072544277660618752
			She later helped to found Somerville nursery with her Nobel Prize. To date, Somerville is one of the few colleges with onsite childcare provision in the university.

	Imagine her in the room, trying to persuade her old student to lay down her weapon
*/

function arrayOfArraysWithCertainValue(n,m,v)
{
	var result = [];
	for ( var i = 0; i<n; i++ )
	{
		result[i] = [];
		for ( var j = 0; j<m; j++ )
		{
			result[i][j] = v;
		}
	}
	return result;
}

{
	let ox = this.ox; let oy = this.oy;
	let sx = this.sx; let sy = this.sy; let sxy = this.sxy;
	let su = this.su; let sv = this.sv; let suv = this.suv;

	// calculate map. Use coarse grid for speed
	let map = arrayOfArraysWithCertainValue(canvasWidth,canvasHeight,sfcanvas.f[sfcanvas.maxhk][sfcanvas.maxhk]);
	let s = 2
	// calculate the contribution at a point - need frac coords
	for ( let h = -sfcanvas.maxhk; h<=sfcanvas.maxhk; h++ )
	{
		for ( let k = -sfcanvas.maxhk; k<=sfcanvas.maxhk; k++ )
		{
			if ( h > 0 || ( h == 0 && k > 0 ) )
			{
				f = sfcanvas.f[h+sfcanvas.maxhk][k+sfcanvas.maxhk];
				if ( f > 0.0 )
				{
					phi = sfcanvas.phi[h+sfcanvas.maxhk][k+sfcanvas.maxhk];
					for ( let y = 0; y<canvasHeight; y+=s )
					{
						let v = sv*(y-oy);
						for ( let x = 0; x<canvasWidth; x+=s )
						{
							let u = suv*(y-oy)+su*(x-ox);
							map[x][y] += 2*f*Math.cos(2*Math.PI*(h*u+k*v-phi/360));
						}
					}
				}
			}
		}
	}
	// interpolate remaining points
	if ( s == 2 )
	{
		for (let y = 0;y<canvasHeight;y+=2)
			for (let x = 1;x<canvasWidth-1;x+=2)
				map[x][y] = (map[x-1][y]+map[x+1][y])/2;
		for (let y = 1;y<canvasHeight-1;y+=2)
			for (let x = 0;x<canvasWidth-1;x++)
				map[x][y] = (map[x][y-1]+map[x][y+1])/2;
	}

	// draw map
	let highestMapValue = 1.0e-6;
	for (let y = 0;y<canvasHeight;y++)
		for (let x = 0;x<canvasWidth;x++)
			highestMapValue = Math.max(highestMapValue,Math.abs(map[x][y]));

	let r; let g;
	for (let y = 0;y<canvasHeight;y++)
	{
		for (let x = 0;x<canvasWidth;x++)
		{
			let val = map[x][y]/highestMapValue;
			if ( val >= 0 )
			{
				r = 255;
				g = Math.round(255*(1-val));
			} else {
				r = Math.round(255*Math.max(1+1.5*val,0));
				g = Math.round(255*Math.max(1+0.5*val,0));
			}
			let i = 4*(x+canvasWidth*(y));
			this.img.data[i+0] = r;
			this.img.data[i+1] = g;
			this.img.data[i+2] = g;
			this.img.data[i+3] = 255;
		}
	}
}