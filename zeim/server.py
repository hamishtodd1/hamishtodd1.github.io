import signal
is_closing = False
def signal_handler(signum, frame):
    global is_closing
    is_closing = True
def try_exit(): 
    global is_closing
    if is_closing:
        tornado.ioloop.IOLoop.instance().stop()

import subprocess

#----------No longer specific
import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.template

import os

class mainHandler(tornado.web.RequestHandler):
	def get(self):
		loader = tornado.template.Loader(".")
		self.write(loader.load("index.html").generate())

class wsHandler(tornado.websocket.WebSocketHandler):
	def check_origin(self, origin):
		return True

	def open(self):
		self.set_nodelay(True)

	def on_message(self, message):
		try:
			os.remove("record.wav");
		except:
			#might do this if you have the audio open elsewhere, like in the browser
			self.write_message("audioDeletionDenied")
			print("audio deletion denied")
		else:
			print("old audio deleted")
			recordWrite = open('record.txt', 'w')
			recordWrite.write(message)
			print("frames written")

			monitoringFileRead = open('markingSystem.js', 'r')
			modifiedMonitoringFile = ""
			lineNumber = 0
			for line in monitoringFileRead:
				positionOfFirstCharacterOfVersionString = len(line)-7
				newLine = ""
				if line[positionOfFirstCharacterOfVersionString-13:positionOfFirstCharacterOfVersionString] != "record.wav?v=":
					newLine = line
				else:
					newLine += line[:positionOfFirstCharacterOfVersionString]
					versionNumber = int( line[ positionOfFirstCharacterOfVersionString:positionOfFirstCharacterOfVersionString+4 ] )
					versionNumber += 1
					versionNumber = str(versionNumber)
					newLine += versionNumber
					newLine += line[positionOfFirstCharacterOfVersionString+4:]
				modifiedMonitoringFile += newLine
				lineNumber += 1
			monitoringFileWrite = open('markingSystem.js', 'w')
			monitoringFileWrite.write(modifiedMonitoringFile)
			print("updated audio version")

			self.write_message("oldAudioDeleted")


application = tornado.web.Application([
	(r'/ws', wsHandler), #The websocket
	(r'/', mainHandler), #The page
	(r"/(.*)", tornado.web.StaticFileHandler, {"path": "."}), #the files
] )

print( "9090" )
signal.signal(signal.SIGINT, signal_handler)

application.listen(9090)
tornado.ioloop.PeriodicCallback(try_exit, 100).start() 
tornado.ioloop.IOLoop.instance().start()