## What is this?

A program for group discussions of protein and nucleic acid structures, in which you can all look at it and indicate parts of it and see what one another are looking at and indicating. Also works in VR! Oculus Rift, HTC Vive(?), and google daydream. And other "mobileVR" headsets, but the pointing device is important!

## Installation

I was using windows 10 and node v6.9.4. Go into the directory in the command prompt and write "node server.js". The terminal is now a server. If you go to "localhost:9090" in a web browser on the same machine you should see the same thing.

And then if you get your IP address and go to <ipadress>:9090 in any other computer, or phone or tablet, and you have no firewall problems, you should see the same thing. And if there are multiple users you can see each other and where your mice are pointing.

## Usage
On a desktop, left/right/forward/backward to move, hold shift to "become the master", and click in order for everyone to see your pointer.

## Modification

"Loadmodel" creates an Object3D. You can replace it if you want! Which will let you do things like add new representations. Hey, you can even bring in .obj files and talk about them if you like!

## License

Do what you like, I don't know much about this! Would like to hear about it though. @hamish_todd on twitter

## Backstory

Was sitting in a meeting at the Delft lab at Diamond, and I swear they spent *at least* an hour talking about/staring at a single structure. Three people in the room plus at least three others tuned into separate video programs. One of them screenshares the structure opened in some molecular graphics program, but it's like 2fps. It was Anthony Bradley who said he strongly believed software like this would be useful, and he also pointed out that you don't really get the 3D effect from shaking unless it's you doing the shaking.