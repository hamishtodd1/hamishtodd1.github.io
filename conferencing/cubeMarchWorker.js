/*
 * Note these fail silently if you try to run them locally without "allow-access-from-files"
 */

var i = 0;

function timedCount() {
    i++;
    console.log(i);
    
    if(i>4)
    {
    	console.log("done!")
    	self.close();
    }
    else
    	setTimeout("timedCount()",2000);
}

self.addEventListener('message', function(e) {
	console.log("got a message: ", ," and now we're sending it back")
	self.postMessage(e.data);
}, false);

timedCount();