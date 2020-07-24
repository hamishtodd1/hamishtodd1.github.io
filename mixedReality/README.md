## What is this for?

Making videos like this: https://www.youtube.com/watch?v=g5XWNwBJWeY&feature=youtu.be&t=20

## License?

MIT

## How do I use it?

When shooting, I start rolling the camera, then I press a button on my controller that records all the state of all the objects in the world

I do the whole thing (multiple "takes" for some parts, but not stopping rolling), then stop rolling the camera and stop recording the state of the objects. I've got two things: an ordinary video file (where you can see my head with the headset on and no objects at all), and a bunch of arrays giving the visibility, position, orientation of all objects, including the headset in the VR simulation

Oh yes, and before I started rolling I set, inside the VR world, the position of a "virtual camera" - this is helpful for me because I need to know what direction to look in while shooting

So now, inside the same program, you can "play back" everything you recorded. The hand will move around, the objects will move, ghost-like, in the way I made them move when I was recording

Then we import the video into the scene. It's just a textured quad, it's about 18 lines of simple code in three.js

Then the two painful parts. You have to find out exactly where to put the quad such that my head lines up with where the VR headset is, and my hands, and the timing is right (i.e. the few seconds at beginning and end during which the camera was rolling but I wasn't recording the positions etc of simulation objects are cut out)

This was horrible and one day we won't have to

## How does the eye tracking work?

1: At initialization time, create an array of all those 3D objects in the world that you might look at

2: Make it so that the eyes follow a certain line-of-sight vector that can (with a slight delay) be made to point in any direction from the head

3. At every frame, loop through those 3D objects in your array that are also in the scene and visible. Whichever one the eyes could look at that would be the closest to looking directly forward, that is the one they are looking at.

Done!

There is a little bit of fudging, I hacked in a "radius" requirement that made some more likely than others to be looked at, because there was a bit too much flicking back and forth. Genuinely unsure if my eyes were flicking back and forth in the headset, but anyway it looked bad

And by the way the camera is an example of a thing you might look at