#http://www.remwebdevelopment.com/blog/python/simple-websocket-server-in-python-144.html
'''
To get the imports below (ensuring along the way that it is the python.exe installed in coot):
	get pip by downloading this https://bootstrap.pypa.io/get-pip.py and running python.exe get-pip.py
	pip install pypiwin32 - then you can import win32api
	pip install tornado
	subprocess should already be in there
	and you might need to restart coot
	
	map_contours(1, 0.6) #0.6 electrons per cubic angstrom, enough to see donuts in the tutorial data
	problem was it wasn't in the right directory
	
SimpleXMLRPCServer

	
	
TODO CHECK FOR FIREWALLS! So you can warn if they're there
'''





import signal
is_closing = False
def signal_handler(signum, frame):
    global is_closing
    is_closing = True
def try_exit(): 
    global is_closing
    if is_closing:
        tornado.ioloop.IOLoop.instance().stop()






#---------specific to our setup in some way
import os #platform independent
if os.name == 'nt':
	os.chdir("C:\CVR")
if os.name == 'posix':
	os.chdir("/home/htodd/CVR")

#to get these, open the python console (of the coot install but not in coot)
#the procedure is: download get-pip.py, put it in wincoot/python27. run python.exe get-pip.py. run python.exe -m pip install pypiwin32.
#from win32api import GetKeyState, GetSystemMetrics, GetCursorPos #gtk could do this instead and be platform independent

import subprocess

#yo paul, when I try importing from a file in this directory, it says "no module named blah". Even though it works fine from cmd!
VK_CODE = {    'lmb':0x01,    'rmb':0x02,    'backspace':0x08,    'tab':0x09,    'clear':0x0C,    'enter':0x0D,    'shift':0x10,    'ctrl':0x11,    'alt':0x12,    'pause':0x13,    'capsLock':0x14,    'esc':0x1B,    'spacebar':0x20,    'pageUp':0x21,    'pageDown':0x22,    'end':0x23,    'home':0x24,    'leftArrow':0x25,    'upArrow':0x26,    'rightArrow':0x27,    'downArrow':0x28,    'select':0x29,    'print':0x2A,    'execute':0x2B,    'printScreen':0x2C,    'ins':0x2D,    'del':0x2E,    'help':0x2F,    '0':0x30,    '1':0x31,    '2':0x32,    '3':0x33,    '4':0x34,    '5':0x35,    '6':0x36,    '7':0x37,    '8':0x38,    '9':0x39,    'a':0x41,    'b':0x42,    'c':0x43,    'd':0x44,    'e':0x45,    'f':0x46,    'g':0x47,    'h':0x48,    'i':0x49,    'j':0x4A,    'k':0x4B,    'l':0x4C,    'm':0x4D,    'n':0x4E,    'o':0x4F,    'p':0x50,    'q':0x51,    'r':0x52,    's':0x53,    't':0x54,    'u':0x55,    'v':0x56,    'w':0x57,    'x':0x58,    'y':0x59,    'z':0x5A,    'numpad0':0x60,    'numpad1':0x61,    'numpad2':0x62,    'numpad3':0x63,    'numpad4':0x64,    'numpad5':0x65,    'numpad6':0x66,    'numpad7':0x67,    'numpad8':0x68,    'numpad9':0x69,    'multiplyKey':0x6A,    'addKey':0x6B,    'separatorKey':0x6C,    'subtractKey':0x6D,    'decimalKey':0x6E,    'divideKey':0x6F,    'F1':0x70,    'F2':0x71,    'F3':0x72,    'F4':0x73,    'F5':0x74,    'F6':0x75,    'F7':0x76,    'F8':0x77,    'F9':0x78,    'F10':0x79,    'F11':0x7A,    'F12':0x7B,    'F13':0x7C,    'F14':0x7D,    'F15':0x7E,    'F16':0x7F,    'F17':0x80,    'F18':0x81,    'F19':0x82,    'F20':0x83,    'F21':0x84,    'F22':0x85,    'F23':0x86,    'F24':0x87,    'numLock':0x90,    'scrollLock':0x91,    'leftShift':0xA0,    'rightShift ':0xA1,    'leftControl':0xA2,    'rightControl':0xA3,    'leftMenu':0xA4,    'rightMenu':0xA5,    'browserBack':0xA6,    'browserForward':0xA7,    'browserRefresh':0xA8,    'browserStop':0xA9,    'browserSearch':0xAA,    'browserFavorites':0xAB,    '+':0xBB,    ',':0xBC,    '-':0xBD,    '.':0xBE,    '/':0xBF,    '`':0xC0,    ';':0xBA,    '[':0xDB,    '\\':0xDC,    ']':0xDD,    "'":0xDE,    '`':0xC0 }

#----------No longer specific
import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.template

#------variables
runningInCoot = True
try:
	get_map_radius()
except NameError:
	runningInCoot = False
	print("get_map_radius doesn't exist - we're probably not running in coot")

#You want the thing at the end of "IPv4 address"
ourIP = ''
if os.name == "nt":
	(ipconfigUTF8,err) = subprocess.Popen(["ipconfig"], stdout=subprocess.PIPE, shell=True).communicate()
	ipconfigDecoded = ipconfigUTF8.decode("utf-8")
	ipconfigParsed = ipconfigDecoded.split("\n")
	stringPrecedingIP = "IPv4 Address. . . . . . . . . . . : "
	ourIP = ""
	for line in ipconfigParsed:
		precessionLocation = line.find(stringPrecedingIP)
		if precessionLocation != -1:
			ourIP = str(line[ precessionLocation + len(stringPrecedingIP):])	
			#there are two of these fuckers and you want the second
	if ourIP == "":
		print("no ip found, are you connected to the internet? Or not on windows?")
if os.name == "posix":
	import socket
	ourIP = socket.gethostname()


class mainHandler(tornado.web.RequestHandler):
	def get(self):
		loader = tornado.template.Loader(".")
		#self.write(loader.load("daydreamControllerTesting.html").generate())
		self.write(loader.load("index.html").generate())

class wsHandler(tornado.websocket.WebSocketHandler):
	def check_origin(self, origin):
		return True
		
	def sendMap(self):
		print("going to send map")
		#Hey Paul, what would be the size for the whole thing? Answer: unit cell dimensions
		
		mapString = 'Map,'
		if runningInCoot == False:
			mapString += "0,0,0,1,1,1,2,2,2,3,3,3,"
		else:
			map = map_contours(1, 0.6)
			if map == False:
				print( "no map loaded" )
				mapString += "0,0,0,1,1,1,2,2,2,3,3,3,"
			else:
			#this data processing has to be done either here or in the browser so here it is. TODO have a function in coot that gives the precise string you want
				for i in map: #lines
					for j in i: #line ends
						for k in j: #coordinates
							mapString += str(k) + ","
		print("made map, gonna send")
		self.write_message(mapString)

	def open(self):
		#we change all these numbers to ensure that hard refresh actually works
		indexFile = open('index.html', 'r')
		modifiedIndexFile = ""
		for line in indexFile:
			newLine = ""
			versionNumber = "0"
			if line[len(line)-24:len(line)-18] != ".js?v=":
				newLine = line
			else:
				newLine += line[:len(line)-18]
				if versionNumber == "0":
					versionNumber = int( line[ len(line)-18:len(line)-12 ] )
					versionNumber += 1
					versionNumber = str(versionNumber)
				newLine += versionNumber
				newLine += line[len(line)-12:]
			modifiedIndexFile += newLine
		indexFileWrite = open('index.html', 'w')
		indexFileWrite.write(modifiedIndexFile)
			
		'''
		type in "window.location.reload(true)" on the remote debugging console if it's not reloading. Ctrl+refresh once worked too
		Note it only works through eduroam. Probably firewall crap
		'''
		self.set_nodelay(True) #doesn't hurt to have this hopefully...
		
		if runningInCoot:
			set_map_radius(15)
		self.sendMap()
		
		#-------update the version numbers so that the whole thing gets refreshed
		
		debug = True
		
	def on_message(self, message):
		#time to send the next one. TODO make it sooner?
		splitMessage = message.split(";")
		messageHeader = splitMessage[0]
		
		'''
		if messageHeader == "refine": #no addition or deletion
			if runningInCoot:
				imol = splitMessage[1]
				chain_id = splitMessage[2]
				res_no = splitMessage[3]
				ins_code = splitMessage[4]
				refine_residues( imol, [[chain_id,res_no,ins_code]] )
				atomDeltas = get_most_recent_atom_changes()
				
				#post_manipulation_hook?
				newModelData = get_bonds_representation(imol)
				self.write_message(newModelData)
			
				
		elif messageHeader == "increase radius":
			if runningInCoot:
				currentRadius = get_map_radius()
				set_map_radius(currentRadius + 4)
			self.sendMap()
			
		elif messageHeader == "mutate":
			if runningInCoot:
				mutate_and_auto_fit( splitMessage[1],splitMessage[2],splitMessage[3],splitMessage[4] )
				self.write_message(atomDeltas)
				
				refine_active_reside()
		elif messageHeader === "moveAtom":
			if runningInCoot:
				set_atom_attribute(imol, chain_id, res_no, ins_code, atom_name, alt_conf, "x", attribute_value);
		
		Also useful
		pepflip-active-residue
		%coot-listener-socket
		active_residue()
		add-molecule
		auto-fit-best-rotamer
		view-matrix
		set-view-matrix
		
		self.write_message("Didn't understand that")
		print('received unrecognized message:', message)
		'''
			
	def sendButtonState(self, buttonString):
		buttonState = 0
		if GetKeyState( VK_CODE[ buttonString ] ) < 0:
			buttonState = 1
		self.write_message( buttonString + "," + str( buttonState ) )

	def on_close(self):
		print('connection closed...')
		#tornado.ioloop.IOLoop.instance().stop()

application = tornado.web.Application([
	(r'/ws', wsHandler), #The websocket
	(r'/', mainHandler), #The page
	(r"/(.*)", tornado.web.StaticFileHandler, {"path": "."}), #the files
] ) #can put ", debug = True" in there

#to properly reload, need to open the chrome debugger for the device, click in the right place so the window is selected apparently, and ctrl+F5

#if __name__ == "__main__":

if ourIP:
	print( "go to the following :9090 " + ourIP )
signal.signal(signal.SIGINT, signal_handler)

#causes problems!
'''http_server = tornado.httpserver.HTTPServer(application,
ssl_options={
	"certfile": "keys/csr.txt",
	"keyfile": "keys/myserver.key",
})'''
application.listen(9090)
tornado.ioloop.PeriodicCallback(try_exit, 100).start() 
tornado.ioloop.IOLoop.instance().start()
	
#note that we need to be able to continue coot running and have things passed from coot to this
#but like... will there be a wait before coot gets back to you?
