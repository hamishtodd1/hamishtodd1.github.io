/*
    Debugging:
        Connect with mirco usb
        "adb devices" to hopefully see the thing
        If there's an old one sitting there saying "disconnected" clear it out with "adb disconnect"
        "adb tcpip 5555"
        "adb shell ip route" - the ip address of the headset is the second one
        "adb connect [ip address]:5555" though maybe it works without ip address?
        chrome://inspect/#devices
        Seeing "VR not allowed"? Check the console, something might not have let the function return

    On a new wifi? 
        On the laptop, cmd, "ipconfig". You want the IPv4 address
        In oculus browser, add "http://[ip address]:8000" to the insecure origins in that one place
        And then go to there
    Then when debugging

    Note the precariousness of needing to connect your headset to local wifi.
    Can use hotspot but should test that first
 */


///////////////
// IMPORTING //
///////////////

const express = require("express");
const app = express();
app.use(express.static(__dirname ));

//Sends files
app.get("/", function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

const http = require("http").Server(app);
const io = require("socket.io")(http);

const port = process.env.PORT || 8000
http.listen(port, () => {
	log("\nserver is listening on port ", port);
})

////////////////////
// INFRASTRUCTURE //
////////////////////

const log = console.log

let sockets = []

io.on('connection', socket => {
	// console.log("User connected")

    sockets.push(socket)

	socket.emit(`serverConnected`)

    let things = [
        `snappable`,
        `sclptable`,
        `spectatorCamera`,
        `refresh`,
        `cameraWanted`
    ]
    things.forEach(thing => {
        let theThing = thing
        socket.on(theThing, msg => {
            sockets.forEach(s => {
                if (s === socket)
                    return

                s.emit(theThing, msg)
            })
        })
    })
})