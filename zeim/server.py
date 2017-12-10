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

class mainHandler(tornado.web.RequestHandler):
	def get(self):
		loader = tornado.template.Loader(".")
		self.write(loader.load("index.html").generate())

class wsHandler(tornado.websocket.WebSocketHandler):
	def check_origin(self, origin):
		return True

	def on_message(self, message):
		recordWrite = open('record.txt', 'w')
		recordWrite.write(message)
		print("file written")
			
		self.set_nodelay(True) #doesn't hurt to have this hopefully...

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