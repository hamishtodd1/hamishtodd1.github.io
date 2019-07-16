import tornado.ioloop
import tornado.web
import tornado.websocket

from os import listdir

cvrDirectoryString = "."

try:
	coot_version()
except NameError:
	runningInCoot = False
	print("Not running in coot")
	ip = "localhost"
else:
	cvrDirectoryString = "CVR"
	runningInCoot = True
	print("Running in coot")
	import imp
	serverReactions = imp.load_source('serverReactionsName', '/home/htodd/CVR/serverReactions.py')
	ip = "192.168.56.101"

port = 9090
print("websocket (NOT address bar) link: " + ip + ":" + str(port))

class wsHandler(tornado.websocket.WebSocketHandler):
	def check_origin(self, origin):
		return True
		
	def open(self):
		self.set_nodelay(True)
		print('Opened connection')

		if runningInCoot == True:
			serverReactions.connect(self)
		else:
			self.write_message({"command":"you aren't connected to coot"})

	def on_message(self, msgContainer):
		msg = eval(msgContainer) #TODO unsecure

		if msg["command"] == "pdbAndMapFilenames":
			returnMsg = {"command":"pdbAndMapFilenames"}
			returnMsg["filenames"] = listdir(cvrDirectoryString + "/modelsAndMaps")
			self.write_message(returnMsg)

		if msg["command"] == "loadPolarAndAzimuthals":

			file = open( cvrDirectoryString + "/settings/" + "polarAndAzimuthals.txt","r" )				
			returnMsg = {"command":"polarAndAzimuthals"}
			returnMsg["polarAndAzimuthals"] = file.read()
			file.close()
			self.write_message(returnMsg)

		if msg["command"] == "savePolarAndAzimuthals":

			file = open( cvrDirectoryString + "/settings/" + "polarAndAzimuthals.txt","w" )
			file.write( str(msg["polarAndAzimuthals"]) )
			file.close()

		elif runningInCoot == True:
			serverReactions.command(msg)

	def on_close(self):
		print('Closed connection')

application = tornado.web.Application([(r'/ws', wsHandler)])
application.listen(port)

#---------------So that you can ctrl+c
isClosing = False
def signalHandler(signum, frame):
	global isClosing
	isClosing = True
def tryExit(): 
	global isClosing
	if isClosing:
		tornado.ioloop.IOLoop.instance().stop()
import signal
signal.signal(signal.SIGINT, signalHandler)
tornado.ioloop.PeriodicCallback(tryExit, 100).start()

tornado.ioloop.IOLoop.instance().start()