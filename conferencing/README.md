## What is this?

A program for group discussions of protein and nucleic acid structures, in which you can all look at it and indicate parts of it and see what one another are looking at and indicating. Also works on google cardboard and, in principle, on Oculus Rift!

## Installation

Go into the directory in the command prompt and write "node server.js". I was using node v6.9.4. Connect to that server you just made (your ip address:9090) and, firewall problems notwithstanding, you should be be greeted with a self-explanatory page.

## Controls
On a desktop, left/right/forward/backward to move, press or hold shift to "broadcast your point of view", and hold the mouse button down in order for everyone to see your pointer.

On a mobile, tapping the screen should make it fullscreen, but I'm not quite sure.

## Modification

Oculus rift and Vive integration were in there but were deprecated. Email me if you'd like it added back in, it would only take me a few hours. This would allow multiple oculus rifts in the same "room" which would be interesting.

If you want to strengthen the molecular graphics capabilities you may find it to be very easy! "Loadmodel" creates a simple threejs Object3D, that's what the molecule is. If you understand threejs you can replace it very easily! Which will let you do things like add new representations. Hey, you can even bring in .obj or .x3D files and talk about them if you like! That would give you all the labelling abilities of Chimera/Pymol.

I didn't test it with many phones. In my experience you have to change settings yourself to improve google cardboard-type capabilites (like not having the keyboard come up or getting rid of the address bar. There may be things you can do to improve it in the code though.

## License

MIT license. Would be interested to hear what you do with this, I'm @hamish_todd on twitter.

## Backstory

Was sitting in a meeting at the Delft lab, the meeting involved about three people in the room and about 4 tuning in via a video chat program. During this meeting they spent *at least* an hour talking about/staring at a *single* structure.

They had been looking at powerpoint slides, they had two or three from different angles. Anthony Bradley gets the structure up in a viewing program and screenshares, which is something one can do today very easily - however, it was 2fps, so nobody except Anthony could really "see" the animation. And of course only he had a mouse pointer - other people were trying to say things about its different features by pointing, but it obviously didn't work.

I was there working on CootVR, but the idea of taking some time off to make a small thing to help this situation made sense. People have been talking about getting together in VR to look at a structure for a while I think(?), but here was an opportunity to help a group in a clear way. What's maybe interesting is that we got started talking about this in VR and how you could get something useful with cheapo google cardboards, but the VR aspect ism't necessarily, er, necessary for this to be useful.

It was Anthony Bradley who said he strongly believed software like this would be useful, and he also pointed out that the common "shake the view to get a feel for the 3D nature of the thing" is a thing you don't really get unless you are the one controlling the view. We don't have empirical data on this but folks I've talked to about it agree.

This was two weeks' work, orthogonal to my PhD project (CVR) which is funded by the BBSRC.