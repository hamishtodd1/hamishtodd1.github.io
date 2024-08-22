//Would also be nice if people could get in with a web link

socket.on("serverConnected", () =>
{
	log("connected")

	socket.emit("genericUpdate", {
		mrh: 5
	})

	socket.on("genericUpdate", msg => {
		log("got it:", msg)
	})
});