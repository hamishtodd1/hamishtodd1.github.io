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

# os.listdir()

#TODO revert! not coming from localhost = mic warning = slow and gets in way of recording
class websocketHandler(tornado.websocket.WebSocketHandler):
	def check_origin(self, origin):
		return True

	def open(self):
		self.set_nodelay(True)

	def on_message(self, message):
		#might do this if you have the audio open elsewhere, like in the browser
		deletionsDenied = False
		try:
			os.remove("record.wav");
		except:
			deletionsDenied = True
		try:
			os.remove("record.txt");
		except:
			deletionsDenied = True
			
		if deletionsDenied:
			self.write_message("oldAudioDeleted")
		else:
			print("deletions done")

			fileName = 'playbackAndRecording.js'
			monitoringFileRead = open(fileName, 'r')
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
					print("updated audio version to ", versionNumber)
				modifiedMonitoringFile += newLine
				lineNumber += 1
			monitoringFileWrite = open(fileName, 'w')
			monitoringFileWrite.write(modifiedMonitoringFile)
			print("\n")

			self.write_message("oldAudioDeleted")


class pageHandler(tornado.web.RequestHandler):
	def get(self):
		loader = tornado.template.Loader("..")
		self.write(loader.load("./index.html").generate())

application = tornado.web.Application([
	(r'/ws', websocketHandler),
	(r'/', pageHandler),
	(r"/(.*)", tornado.web.StaticFileHandler, {"path": ".."}), #the files
] )

print( "9090" )
signal.signal(signal.SIGINT, signal_handler)

application.listen(9090)
tornado.ioloop.PeriodicCallback(try_exit, 100).start() 
tornado.ioloop.IOLoop.instance().start()