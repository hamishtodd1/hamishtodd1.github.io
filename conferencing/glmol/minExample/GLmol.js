/*! jQuery v1.7 jquery.com | jquery.org/license */
(function(a,b){function cA(a){return f.isWindow(a)?a:a.nodeType===9?a.defaultView||a.parentWindow:!1}function cx(a){if(!cm[a]){var b=c.body,d=f("<"+a+">").appendTo(b),e=d.css("display");d.remove();if(e==="none"||e===""){cn||(cn=c.createElement("iframe"),cn.frameBorder=cn.width=cn.height=0),b.appendChild(cn);if(!co||!cn.createElement)co=(cn.contentWindow||cn.contentDocument).document,co.write((c.compatMode==="CSS1Compat"?"<!doctype html>":"")+"<html><body>"),co.close();d=co.createElement(a),co.body.appendChild(d),e=f.css(d,"display"),b.removeChild(cn)}cm[a]=e}return cm[a]}function cw(a,b){var c={};f.each(cs.concat.apply([],cs.slice(0,b)),function(){c[this]=a});return c}function cv(){ct=b}function cu(){setTimeout(cv,0);return ct=f.now()}function cl(){try{return new a.ActiveXObject("Microsoft.XMLHTTP")}catch(b){}}function ck(){try{return new a.XMLHttpRequest}catch(b){}}function ce(a,c){a.dataFilter&&(c=a.dataFilter(c,a.dataType));var d=a.dataTypes,e={},g,h,i=d.length,j,k=d[0],l,m,n,o,p;for(g=1;g<i;g++){if(g===1)for(h in a.converters)typeof h=="string"&&(e[h.toLowerCase()]=a.converters[h]);l=k,k=d[g];if(k==="*")k=l;else if(l!=="*"&&l!==k){m=l+" "+k,n=e[m]||e["* "+k];if(!n){p=b;for(o in e){j=o.split(" ");if(j[0]===l||j[0]==="*"){p=e[j[1]+" "+k];if(p){o=e[o],o===!0?n=p:p===!0&&(n=o);break}}}}!n&&!p&&f.error("No conversion from "+m.replace(" "," to ")),n!==!0&&(c=n?n(c):p(o(c)))}}return c}function cd(a,c,d){var e=a.contents,f=a.dataTypes,g=a.responseFields,h,i,j,k;for(i in g)i in d&&(c[g[i]]=d[i]);while(f[0]==="*")f.shift(),h===b&&(h=a.mimeType||c.getResponseHeader("content-type"));if(h)for(i in e)if(e[i]&&e[i].test(h)){f.unshift(i);break}if(f[0]in d)j=f[0];else{for(i in d){if(!f[0]||a.converters[i+" "+f[0]]){j=i;break}k||(k=i)}j=j||k}if(j){j!==f[0]&&f.unshift(j);return d[j]}}function cc(a,b,c,d){if(f.isArray(b))f.each(b,function(b,e){c||bG.test(a)?d(a,e):cc(a+"["+(typeof e=="object"||f.isArray(e)?b:"")+"]",e,c,d)});else if(!c&&b!=null&&typeof b=="object")for(var e in b)cc(a+"["+e+"]",b[e],c,d);else d(a,b)}function cb(a,c){var d,e,g=f.ajaxSettings.flatOptions||{};for(d in c)c[d]!==b&&((g[d]?a:e||(e={}))[d]=c[d]);e&&f.extend(!0,a,e)}function ca(a,c,d,e,f,g){f=f||c.dataTypes[0],g=g||{},g[f]=!0;var h=a[f],i=0,j=h?h.length:0,k=a===bV,l;for(;i<j&&(k||!l);i++)l=h[i](c,d,e),typeof l=="string"&&(!k||g[l]?l=b:(c.dataTypes.unshift(l),l=ca(a,c,d,e,l,g)));(k||!l)&&!g["*"]&&(l=ca(a,c,d,e,"*",g));return l}function b_(a){return function(b,c){typeof b!="string"&&(c=b,b="*");if(f.isFunction(c)){var d=b.toLowerCase().split(bR),e=0,g=d.length,h,i,j;for(;e<g;e++)h=d[e],j=/^\+/.test(h),j&&(h=h.substr(1)||"*"),i=a[h]=a[h]||[],i[j?"unshift":"push"](c)}}}function bE(a,b,c){var d=b==="width"?a.offsetWidth:a.offsetHeight,e=b==="width"?bz:bA;if(d>0){c!=="border"&&f.each(e,function(){c||(d-=parseFloat(f.css(a,"padding"+this))||0),c==="margin"?d+=parseFloat(f.css(a,c+this))||0:d-=parseFloat(f.css(a,"border"+this+"Width"))||0});return d+"px"}d=bB(a,b,b);if(d<0||d==null)d=a.style[b]||0;d=parseFloat(d)||0,c&&f.each(e,function(){d+=parseFloat(f.css(a,"padding"+this))||0,c!=="padding"&&(d+=parseFloat(f.css(a,"border"+this+"Width"))||0),c==="margin"&&(d+=parseFloat(f.css(a,c+this))||0)});return d+"px"}function br(a,b){b.src?f.ajax({url:b.src,async:!1,dataType:"script"}):f.globalEval((b.text||b.textContent||b.innerHTML||"").replace(bi,"/*$0*/")),b.parentNode&&b.parentNode.removeChild(b)}function bq(a){var b=(a.nodeName||"").toLowerCase();b==="input"?bp(a):b!=="script"&&typeof a.getElementsByTagName!="undefined"&&f.grep(a.getElementsByTagName("input"),bp)}function bp(a){if(a.type==="checkbox"||a.type==="radio")a.defaultChecked=a.checked}function bo(a){return typeof a.getElementsByTagName!="undefined"?a.getElementsByTagName("*"):typeof a.querySelectorAll!="undefined"?a.querySelectorAll("*"):[]}function bn(a,b){var c;if(b.nodeType===1){b.clearAttributes&&b.clearAttributes(),b.mergeAttributes&&b.mergeAttributes(a),c=b.nodeName.toLowerCase();if(c==="object")b.outerHTML=a.outerHTML;else if(c!=="input"||a.type!=="checkbox"&&a.type!=="radio"){if(c==="option")b.selected=a.defaultSelected;else if(c==="input"||c==="textarea")b.defaultValue=a.defaultValue}else a.checked&&(b.defaultChecked=b.checked=a.checked),b.value!==a.value&&(b.value=a.value);b.removeAttribute(f.expando)}}function bm(a,b){if(b.nodeType===1&&!!f.hasData(a)){var c,d,e,g=f._data(a),h=f._data(b,g),i=g.events;if(i){delete h.handle,h.events={};for(c in i)for(d=0,e=i[c].length;d<e;d++)f.event.add(b,c+(i[c][d].namespace?".":"")+i[c][d].namespace,i[c][d],i[c][d].data)}h.data&&(h.data=f.extend({},h.data))}}function bl(a,b){return f.nodeName(a,"table")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function X(a){var b=Y.split(" "),c=a.createDocumentFragment();if(c.createElement)while(b.length)c.createElement(b.pop());return c}function W(a,b,c){b=b||0;if(f.isFunction(b))return f.grep(a,function(a,d){var e=!!b.call(a,d,a);return e===c});if(b.nodeType)return f.grep(a,function(a,d){return a===b===c});if(typeof b=="string"){var d=f.grep(a,function(a){return a.nodeType===1});if(R.test(b))return f.filter(b,d,!c);b=f.filter(b,d)}return f.grep(a,function(a,d){return f.inArray(a,b)>=0===c})}function V(a){return!a||!a.parentNode||a.parentNode.nodeType===11}function N(){return!0}function M(){return!1}function n(a,b,c){var d=b+"defer",e=b+"queue",g=b+"mark",h=f._data(a,d);h&&(c==="queue"||!f._data(a,e))&&(c==="mark"||!f._data(a,g))&&setTimeout(function(){!f._data(a,e)&&!f._data(a,g)&&(f.removeData(a,d,!0),h.fire())},0)}function m(a){for(var b in a){if(b==="data"&&f.isEmptyObject(a[b]))continue;if(b!=="toJSON")return!1}return!0}function l(a,c,d){if(d===b&&a.nodeType===1){var e="data-"+c.replace(k,"-$1").toLowerCase();d=a.getAttribute(e);if(typeof d=="string"){try{d=d==="true"?!0:d==="false"?!1:d==="null"?null:f.isNumeric(d)?parseFloat(d):j.test(d)?f.parseJSON(d):d}catch(g){}f.data(a,c,d)}else d=b}return d}function h(a){var b=g[a]={},c,d;a=a.split(/\s+/);for(c=0,d=a.length;c<d;c++)b[a[c]]=!0;return b}var c=a.document,d=a.navigator,e=a.location,f=function(){function K(){if(!e.isReady){try{c.documentElement.doScroll("left")}catch(a){setTimeout(K,1);return}e.ready()}}var e=function(a,b){return new e.fn.init(a,b,h)},f=a.jQuery,g=a.$,h,i=/^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,j=/\S/,k=/^\s+/,l=/\s+$/,m=/\d/,n=/^<(\w+)\s*\/?>(?:<\/\1>)?$/,o=/^[\],:{}\s]*$/,p=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,q=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,r=/(?:^|:|,)(?:\s*\[)+/g,s=/(webkit)[ \/]([\w.]+)/,t=/(opera)(?:.*version)?[ \/]([\w.]+)/,u=/(msie) ([\w.]+)/,v=/(mozilla)(?:.*? rv:([\w.]+))?/,w=/-([a-z]|[0-9])/ig,x=/^-ms-/,y=function(a,b){return(b+"").toUpperCase()},z=d.userAgent,A,B,C,D=Object.prototype.toString,E=Object.prototype.hasOwnProperty,F=Array.prototype.push,G=Array.prototype.slice,H=String.prototype.trim,I=Array.prototype.indexOf,J={};e.fn=e.prototype={constructor:e,init:function(a,d,f){var g,h,j,k;if(!a)return this;if(a.nodeType){this.context=this[0]=a,this.length=1;return this}if(a==="body"&&!d&&c.body){this.context=c,this[0]=c.body,this.selector=a,this.length=1;return this}if(typeof a=="string"){a.charAt(0)!=="<"||a.charAt(a.length-1)!==">"||a.length<3?g=i.exec(a):g=[null,a,null];if(g&&(g[1]||!d)){if(g[1]){d=d instanceof e?d[0]:d,k=d?d.ownerDocument||d:c,j=n.exec(a),j?e.isPlainObject(d)?(a=[c.createElement(j[1])],e.fn.attr.call(a,d,!0)):a=[k.createElement(j[1])]:(j=e.buildFragment([g[1]],[k]),a=(j.cacheable?e.clone(j.fragment):j.fragment).childNodes);return e.merge(this,a)}h=c.getElementById(g[2]);if(h&&h.parentNode){if(h.id!==g[2])return f.find(a);this.length=1,this[0]=h}this.context=c,this.selector=a;return this}return!d||d.jquery?(d||f).find(a):this.constructor(d).find(a)}if(e.isFunction(a))return f.ready(a);a.selector!==b&&(this.selector=a.selector,this.context=a.context);return e.makeArray(a,this)},selector:"",jquery:"1.7",length:0,size:function(){return this.length},toArray:function(){return G.call(this,0)},get:function(a){return a==null?this.toArray():a<0?this[this.length+a]:this[a]},pushStack:function(a,b,c){var d=this.constructor();e.isArray(a)?F.apply(d,a):e.merge(d,a),d.prevObject=this,d.context=this.context,b==="find"?d.selector=this.selector+(this.selector?" ":"")+c:b&&(d.selector=this.selector+"."+b+"("+c+")");return d},each:function(a,b){return e.each(this,a,b)},ready:function(a){e.bindReady(),B.add(a);return this},eq:function(a){return a===-1?this.slice(a):this.slice(a,+a+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(G.apply(this,arguments),"slice",G.call(arguments).join(","))},map:function(a){return this.pushStack(e.map(this,function(b,c){return a.call(b,c,b)}))},end:function(){return this.prevObject||this.constructor(null)},push:F,sort:[].sort,splice:[].splice},e.fn.init.prototype=e.fn,e.extend=e.fn.extend=function(){var a,c,d,f,g,h,i=arguments[0]||{},j=1,k=arguments.length,l=!1;typeof i=="boolean"&&(l=i,i=arguments[1]||{},j=2),typeof i!="object"&&!e.isFunction(i)&&(i={}),k===j&&(i=this,--j);for(;j<k;j++)if((a=arguments[j])!=null)for(c in a){d=i[c],f=a[c];if(i===f)continue;l&&f&&(e.isPlainObject(f)||(g=e.isArray(f)))?(g?(g=!1,h=d&&e.isArray(d)?d:[]):h=d&&e.isPlainObject(d)?d:{},i[c]=e.extend(l,h,f)):f!==b&&(i[c]=f)}return i},e.extend({noConflict:function(b){a.$===e&&(a.$=g),b&&a.jQuery===e&&(a.jQuery=f);return e},isReady:!1,readyWait:1,holdReady:function(a){a?e.readyWait++:e.ready(!0)},ready:function(a){if(a===!0&&!--e.readyWait||a!==!0&&!e.isReady){if(!c.body)return setTimeout(e.ready,1);e.isReady=!0;if(a!==!0&&--e.readyWait>0)return;B.fireWith(c,[e]),e.fn.trigger&&e(c).trigger("ready").unbind("ready")}},bindReady:function(){if(!B){B=e.Callbacks("once memory");if(c.readyState==="complete")return setTimeout(e.ready,1);if(c.addEventListener)c.addEventListener("DOMContentLoaded",C,!1),a.addEventListener("load",e.ready,!1);else if(c.attachEvent){c.attachEvent("onreadystatechange",C),a.attachEvent("onload",e.ready);var b=!1;try{b=a.frameElement==null}catch(d){}c.documentElement.doScroll&&b&&K()}}},isFunction:function(a){return e.type(a)==="function"},isArray:Array.isArray||function(a){return e.type(a)==="array"},isWindow:function(a){return a&&typeof a=="object"&&"setInterval"in a},isNumeric:function(a){return a!=null&&m.test(a)&&!isNaN(a)},type:function(a){return a==null?String(a):J[D.call(a)]||"object"},isPlainObject:function(a){if(!a||e.type(a)!=="object"||a.nodeType||e.isWindow(a))return!1;try{if(a.constructor&&!E.call(a,"constructor")&&!E.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}var d;for(d in a);return d===b||E.call(a,d)},isEmptyObject:function(a){for(var b in a)return!1;return!0},error:function(a){throw a},parseJSON:function(b){if(typeof b!="string"||!b)return null;b=e.trim(b);if(a.JSON&&a.JSON.parse)return a.JSON.parse(b);if(o.test(b.replace(p,"@").replace(q,"]").replace(r,"")))return(new Function("return "+b))();e.error("Invalid JSON: "+b)},parseXML:function(c){var d,f;try{a.DOMParser?(f=new DOMParser,d=f.parseFromString(c,"text/xml")):(d=new ActiveXObject("Microsoft.XMLDOM"),d.async="false",d.loadXML(c))}catch(g){d=b}(!d||!d.documentElement||d.getElementsByTagName("parsererror").length)&&e.error("Invalid XML: "+c);return d},noop:function(){},globalEval:function(b){b&&j.test(b)&&(a.execScript||function(b){a.eval.call(a,b)})(b)},camelCase:function(a){return a.replace(x,"ms-").replace(w,y)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toUpperCase()===b.toUpperCase()},each:function(a,c,d){var f,g=0,h=a.length,i=h===b||e.isFunction(a);if(d){if(i){for(f in a)if(c.apply(a[f],d)===!1)break}else for(;g<h;)if(c.apply(a[g++],d)===!1)break}else if(i){for(f in a)if(c.call(a[f],f,a[f])===!1)break}else for(;g<h;)if(c.call(a[g],g,a[g++])===!1)break;return a},trim:H?function(a){return a==null?"":H.call(a)}:function(a){return a==null?"":(a+"").replace(k,"").replace(l,"")},makeArray:function(a,b){var c=b||[];if(a!=null){var d=e.type(a);a.length==null||d==="string"||d==="function"||d==="regexp"||e.isWindow(a)?F.call(c,a):e.merge(c,a)}return c},inArray:function(a,b,c){var d;if(b){if(I)return I.call(b,a,c);d=b.length,c=c?c<0?Math.max(0,d+c):c:0;for(;c<d;c++)if(c in b&&b[c]===a)return c}return-1},merge:function(a,c){var d=a.length,e=0;if(typeof c.length=="number")for(var f=c.length;e<f;e++)a[d++]=c[e];else while(c[e]!==b)a[d++]=c[e++];a.length=d;return a},grep:function(a,b,c){var d=[],e;c=!!c;for(var f=0,g=a.length;f<g;f++)e=!!b(a[f],f),c!==e&&d.push(a[f]);return d},map:function(a,c,d){var f,g,h=[],i=0,j=a.length,k=a instanceof e||j!==b&&typeof j=="number"&&(j>0&&a[0]&&a[j-1]||j===0||e.isArray(a));if(k)for(;i<j;i++)f=c(a[i],i,d),f!=null&&(h[h.length]=f);else for(g in a)f=c(a[g],g,d),f!=null&&(h[h.length]=f);return h.concat.apply([],h)},guid:1,proxy:function(a,c){if(typeof c=="string"){var d=a[c];c=a,a=d}if(!e.isFunction(a))return b;var f=G.call(arguments,2),g=function(){return a.apply(c,f.concat(G.call(arguments)))};g.guid=a.guid=a.guid||g.guid||e.guid++;return g},access:function(a,c,d,f,g,h){var i=a.length;if(typeof c=="object"){for(var j in c)e.access(a,j,c[j],f,g,d);return a}if(d!==b){f=!h&&f&&e.isFunction(d);for(var k=0;k<i;k++)g(a[k],c,f?d.call(a[k],k,g(a[k],c)):d,h);return a}return i?g(a[0],c):b},now:function(){return(new Date).getTime()},uaMatch:function(a){a=a.toLowerCase();var b=s.exec(a)||t.exec(a)||u.exec(a)||a.indexOf("compatible")<0&&v.exec(a)||[];return{browser:b[1]||"",version:b[2]||"0"}},sub:function(){function a(b,c){return new a.fn.init(b,c)}e.extend(!0,a,this),a.superclass=this,a.fn=a.prototype=this(),a.fn.constructor=a,a.sub=this.sub,a.fn.init=function(d,f){f&&f instanceof e&&!(f instanceof a)&&(f=a(f));return e.fn.init.call(this,d,f,b)},a.fn.init.prototype=a.fn;var b=a(c);return a},browser:{}}),e.each("Boolean Number String Function Array Date RegExp Object".split(" "),function(a,b){J["[object "+b+"]"]=b.toLowerCase()}),A=e.uaMatch(z),A.browser&&(e.browser[A.browser]=!0,e.browser.version=A.version),e.browser.webkit&&(e.browser.safari=!0),j.test(" ")&&(k=/^[\s\xA0]+/,l=/[\s\xA0]+$/),h=e(c),c.addEventListener?C=function(){c.removeEventListener("DOMContentLoaded",C,!1),e.ready()}:c.attachEvent&&(C=function(){c.readyState==="complete"&&(c.detachEvent("onreadystatechange",C),e.ready())}),typeof define=="function"&&define.amd&&define.amd.jQuery&&define("jquery",[],function(){return e});return e}(),g={};f.Callbacks=function(a){a=a?g[a]||h(a):{};var c=[],d=[],e,i,j,k,l,m=function(b){var d,e,g,h,i;for(d=0,e=b.length;d<e;d++)g=b[d],h=f.type(g),h==="array"?m(g):h==="function"&&(!a.unique||!o.has(g))&&c.push(g)},n=function(b,f){f=f||[],e=!a.memory||[b,f],i=!0,l=j||0,j=0,k=c.length;for(;c&&l<k;l++)if(c[l].apply(b,f)===!1&&a.stopOnFalse){e=!0;break}i=!1,c&&(a.once?e===!0?o.disable():c=[]:d&&d.length&&(e=d.shift(),o.fireWith(e[0],e[1])))},o={add:function(){if(c){var a=c.length;m(arguments),i?k=c.length:e&&e!==!0&&(j=a,n(e[0],e[1]))}return this},remove:function(){if(c){var b=arguments,d=0,e=b.length;for(;d<e;d++)for(var f=0;f<c.length;f++)if(b[d]===c[f]){i&&f<=k&&(k--,f<=l&&l--),c.splice(f--,1);if(a.unique)break}}return this},has:function(a){if(c){var b=0,d=c.length;for(;b<d;b++)if(a===c[b])return!0}return!1},empty:function(){c=[];return this},disable:function(){c=d=e=b;return this},disabled:function(){return!c},lock:function(){d=b,(!e||e===!0)&&o.disable();return this},locked:function(){return!d},fireWith:function(b,c){d&&(i?a.once||d.push([b,c]):(!a.once||!e)&&n(b,c));return this},fire:function(){o.fireWith(this,arguments);return this},fired:function(){return!!e}};return o};var i=[].slice;f.extend({Deferred:function(a){var b=f.Callbacks("once memory"),c=f.Callbacks("once memory"),d=f.Callbacks("memory"),e="pending",g={resolve:b,reject:c,notify:d},h={done:b.add,fail:c.add,progress:d.add,state:function(){return e},isResolved:b.fired,isRejected:c.fired,then:function(a,b,c){i.done(a).fail(b).progress(c);return this},always:function(){return i.done.apply(i,arguments).fail.apply(i,arguments)},pipe:function(a,b,c){return f.Deferred(function(d){f.each({done:[a,"resolve"],fail:[b,"reject"],progress:[c,"notify"]},function(a,b){var c=b[0],e=b[1],g;f.isFunction(c)?i[a](function(){g=c.apply(this,arguments),g&&f.isFunction(g.promise)?g.promise().then(d.resolve,d.reject,d.notify):d[e+"With"](this===i?d:this,[g])}):i[a](d[e])})}).promise()},promise:function(a){if(a==null)a=h;else for(var b in h)a[b]=h[b];return a}},i=h.promise({}),j;for(j in g)i[j]=g[j].fire,i[j+"With"]=g[j].fireWith;i.done(function(){e="resolved"},c.disable,d.lock).fail(function(){e="rejected"},b.disable,d.lock),a&&a.call(i,i);return i},when:function(a){function m(a){return function(b){e[a]=arguments.length>1?i.call(arguments,0):b,j.notifyWith(k,e)}}function l(a){return function(c){b[a]=arguments.length>1?i.call(arguments,0):c,--g||j.resolveWith(j,b)}}var b=i.call(arguments,0),c=0,d=b.length,e=Array(d),g=d,h=d,j=d<=1&&a&&f.isFunction(a.promise)?a:f.Deferred(),k=j.promise();if(d>1){for(;c<d;c++)b[c]&&b[c].promise&&f.isFunction(b[c].promise)?b[c].promise().then(l(c),j.reject,m(c)):--g;g||j.resolveWith(j,b)}else j!==a&&j.resolveWith(j,d?[a]:[]);return k}}),f.support=function(){var a=c.createElement("div"),b=c.documentElement,d,e,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u;a.setAttribute("className","t"),a.innerHTML="   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/><nav></nav>",d=a.getElementsByTagName("*"),e=a.getElementsByTagName("a")[0];if(!d||!d.length||!e)return{};g=c.createElement("select"),h=g.appendChild(c.createElement("option")),i=a.getElementsByTagName("input")[0],k={leadingWhitespace:a.firstChild.nodeType===3,tbody:!a.getElementsByTagName("tbody").length,htmlSerialize:!!a.getElementsByTagName("link").length,style:/top/.test(e.getAttribute("style")),hrefNormalized:e.getAttribute("href")==="/a",opacity:/^0.55/.test(e.style.opacity),cssFloat:!!e.style.cssFloat,unknownElems:!!a.getElementsByTagName("nav").length,checkOn:i.value==="on",optSelected:h.selected,getSetAttribute:a.className!=="t",enctype:!!c.createElement("form").enctype,submitBubbles:!0,changeBubbles:!0,focusinBubbles:!1,deleteExpando:!0,noCloneEvent:!0,inlineBlockNeedsLayout:!1,shrinkWrapBlocks:!1,reliableMarginRight:!0},i.checked=!0,k.noCloneChecked=i.cloneNode(!0).checked,g.disabled=!0,k.optDisabled=!h.disabled;try{delete a.test}catch(v){k.deleteExpando=!1}!a.addEventListener&&a.attachEvent&&a.fireEvent&&(a.attachEvent("onclick",function(){k.noCloneEvent=!1}),a.cloneNode(!0).fireEvent("onclick")),i=c.createElement("input"),i.value="t",i.setAttribute("type","radio"),k.radioValue=i.value==="t",i.setAttribute("checked","checked"),a.appendChild(i),l=c.createDocumentFragment(),l.appendChild(a.lastChild),k.checkClone=l.cloneNode(!0).cloneNode(!0).lastChild.checked,a.innerHTML="",a.style.width=a.style.paddingLeft="1px",m=c.getElementsByTagName("body")[0],o=c.createElement(m?"div":"body"),p={visibility:"hidden",width:0,height:0,border:0,margin:0,background:"none"},m&&f.extend(p,{position:"absolute",left:"-999px",top:"-999px"});for(t in p)o.style[t]=p[t];o.appendChild(a),n=m||b,n.insertBefore(o,n.firstChild),k.appendChecked=i.checked,k.boxModel=a.offsetWidth===2,"zoom"in a.style&&(a.style.display="inline",a.style.zoom=1,k.inlineBlockNeedsLayout=a.offsetWidth===2,a.style.display="",a.innerHTML="<div style='width:4px;'></div>",k.shrinkWrapBlocks=a.offsetWidth!==2),a.innerHTML="<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>",q=a.getElementsByTagName("td"),u=q[0].offsetHeight===0,q[0].style.display="",q[1].style.display="none",k.reliableHiddenOffsets=u&&q[0].offsetHeight===0,a.innerHTML="",c.defaultView&&c.defaultView.getComputedStyle&&(j=c.createElement("div"),j.style.width="0",j.style.marginRight="0",a.appendChild(j),k.reliableMarginRight=(parseInt((c.defaultView.getComputedStyle(j,null)||{marginRight:0}).marginRight,10)||0)===0);if(a.attachEvent)for(t in{submit:1,change:1,focusin:1})s="on"+t,u=s in a,u||(a.setAttribute(s,"return;"),u=typeof a[s]=="function"),k[t+"Bubbles"]=u;f(function(){var a,b,d,e,g,h,i=1,j="position:absolute;top:0;left:0;width:1px;height:1px;margin:0;",l="visibility:hidden;border:0;",n="style='"+j+"border:5px solid #000;padding:0;'",p="<div "+n+"><div></div></div>"+"<table "+n+" cellpadding='0' cellspacing='0'>"+"<tr><td></td></tr></table>";m=c.getElementsByTagName("body")[0];!m||(a=c.createElement("div"),a.style.cssText=l+"width:0;height:0;position:static;top:0;margin-top:"+i+"px",m.insertBefore(a,m.firstChild),o=c.createElement("div"),o.style.cssText=j+l,o.innerHTML=p,a.appendChild(o),b=o.firstChild,d=b.firstChild,g=b.nextSibling.firstChild.firstChild,h={doesNotAddBorder:d.offsetTop!==5,doesAddBorderForTableAndCells:g.offsetTop===5},d.style.position="fixed",d.style.top="20px",h.fixedPosition=d.offsetTop===20||d.offsetTop===15,d.style.position=d.style.top="",b.style.overflow="hidden",b.style.position="relative",h.subtractsBorderForOverflowNotVisible=d.offsetTop===-5,h.doesNotIncludeMarginInBodyOffset=m.offsetTop!==i,m.removeChild(a),o=a=null,f.extend(k,h))}),o.innerHTML="",n.removeChild(o),o=l=g=h=m=j=a=i=null;return k}(),f.boxModel=f.support.boxModel;var j=/^(?:\{.*\}|\[.*\])$/,k=/([A-Z])/g;f.extend({cache:{},uuid:0,expando:"jQuery"+(f.fn.jquery+Math.random()).replace(/\D/g,""),noData:{embed:!0,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",applet:!0},hasData:function(a){a=a.nodeType?f.cache[a[f.expando]]:a[f.expando];return!!a&&!m(a)},data:function(a,c,d,e){if(!!f.acceptData(a)){var g,h,i,j=f.expando,k=typeof c=="string",l=a.nodeType,m=l?f.cache:a,n=l?a[f.expando]:a[f.expando]&&f.expando,o=c==="events";if((!n||!m[n]||!o&&!e&&!m[n].data)&&k&&d===b)return;n||(l?a[f.expando]=n=++f.uuid:n=f.expando),m[n]||(m[n]={},l||(m[n].toJSON=f.noop));if(typeof c=="object"||typeof c=="function")e?m[n]=f.extend(m[n],c):m[n].data=f.extend(m[n].data,c);g=h=m[n],e||(h.data||(h.data={}),h=h.data),d!==b&&(h[f.camelCase(c)]=d);if(o&&!h[c])return g.events;k?(i=h[c],i==null&&(i=h[f.camelCase(c)])):i=h;return i}},removeData:function(a,b,c){if(!!f.acceptData(a)){var d,e,g,h=f.expando,i=a.nodeType,j=i?f.cache:a,k=i?a[f.expando]:f.expando;if(!j[k])return;if(b){d=c?j[k]:j[k].data;if(d){f.isArray(b)?b=b:b in d?b=[b]:(b=f.camelCase(b),b in d?b=[b]:b=b.split(" "));for(e=0,g=b.length;e<g;e++)delete d[b[e]];if(!(c?m:f.isEmptyObject)(d))return}}if(!c){delete j[k].data;if(!m(j[k]))return}f.support.deleteExpando||!j.setInterval?delete j[k]:j[k]=null,i&&(f.support.deleteExpando?delete a[f.expando]:a.removeAttribute?a.removeAttribute(f.expando):a[f.expando]=null)}},_data:function(a,b,c){return f.data(a,b,c,!0)},acceptData:function(a){if(a.nodeName){var b=f.noData[a.nodeName.toLowerCase()];if(b)return b!==!0&&a.getAttribute("classid")===b}return!0}}),f.fn.extend({data:function(a,c){var d,e,g,h=null;if(typeof a=="undefined"){if(this.length){h=f.data(this[0]);if(this[0].nodeType===1&&!f._data(this[0],"parsedAttrs")){e=this[0].attributes;for(var i=0,j=e.length;i<j;i++)g=e[i].name,g.indexOf("data-")===0&&(g=f.camelCase(g.substring(5)),l(this[0],g,h[g]));f._data(this[0],"parsedAttrs",!0)}}return h}if(typeof a=="object")return this.each(function(){f.data(this,a)});d=a.split("."),d[1]=d[1]?"."+d[1]:"";if(c===b){h=this.triggerHandler("getData"+d[1]+"!",[d[0]]),h===b&&this.length&&(h=f.data(this[0],a),h=l(this[0],a,h));return h===b&&d[1]?this.data(d[0]):h}return this.each(function(){var b=f(this),e=[d[0],c];b.triggerHandler("setData"+d[1]+"!",e),f.data(this,a,c),b.triggerHandler("changeData"+d[1]+"!",e)})},removeData:function(a){return this.each(function(){f.removeData(this,a)})}}),f.extend({_mark:function(a,b){a&&(b=(b||"fx")+"mark",f._data(a,b,(f._data(a,b)||0)+1))},_unmark:function(a,b,c){a!==!0&&(c=b,b=a,a=!1);if(b){c=c||"fx";var d=c+"mark",e=a?0:(f._data(b,d)||1)-1;e?f._data(b,d,e):(f.removeData(b,d,!0),n(b,c,"mark"))}},queue:function(a,b,c){var d;if(a){b=(b||"fx")+"queue",d=f._data(a,b),c&&(!d||f.isArray(c)?d=f._data(a,b,f.makeArray(c)):d.push(c));return d||[]}},dequeue:function(a,b){b=b||"fx";var c=f.queue(a,b),d=c.shift(),e={};d==="inprogress"&&(d=c.shift()),d&&(b==="fx"&&c.unshift("inprogress"),f._data(a,b+".run",e),d.call(a,function(){f.dequeue(a,b)},e)),c.length||(f.removeData(a,b+"queue "+b+".run",!0),n(a,b,"queue"))}}),f.fn.extend({queue:function(a,c){typeof a!="string"&&(c=a,a="fx");if(c===b)return f.queue(this[0],a);return this.each(function(){var b=f.queue(this,a,c);a==="fx"&&b[0]!=="inprogress"&&f.dequeue(this,a)})},dequeue:function(a){return this.each(function(){f.dequeue(this,a)})},delay:function(a,b){a=f.fx?f.fx.speeds[a]||a:a,b=b||"fx";return this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,c){function m(){--h||d.resolveWith(e,[e])}typeof a!="string"&&(c=a,a=b),a=a||"fx";var d=f.Deferred(),e=this,g=e.length,h=1,i=a+"defer",j=a+"queue",k=a+"mark",l;while(g--)if(l=f.data(e[g],i,b,!0)||(f.data(e[g],j,b,!0)||f.data(e[g],k,b,!0))&&f.data(e[g],i,f.Callbacks("once memory"),!0))h++,l.add(m);m();return d.promise()}});var o=/[\n\t\r]/g,p=/\s+/,q=/\r/g,r=/^(?:button|input)$/i,s=/^(?:button|input|object|select|textarea)$/i,t=/^a(?:rea)?$/i,u=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,v=f.support.getSetAttribute,w,x,y;f.fn.extend({attr:function(a,b){return f.access(this,a,b,!0,f.attr)},removeAttr:function(a){return this.each(function(){f.removeAttr(this,a)})},prop:function(a,b){return f.access(this,a,b,!0,f.prop)},removeProp:function(a){a=f.propFix[a]||a;return this.each(function(){try{this[a]=b,delete this[a]}catch(c){}})},addClass:function(a){var b,c,d,e,g,h,i;if(f.isFunction(a))return this.each(function(b){f(this).addClass(a.call(this,b,this.className))});if(a&&typeof a=="string"){b=a.split(p);for(c=0,d=this.length;c<d;c++){e=this[c];if(e.nodeType===1)if(!e.className&&b.length===1)e.className=a;else{g=" "+e.className+" ";for(h=0,i=b.length;h<i;h++)~g.indexOf(" "+b[h]+" ")||(g+=b[h]+" ");e.className=f.trim(g)}}}return this},removeClass:function(a){var c,d,e,g,h,i,j;if(f.isFunction(a))return this.each(function(b){f(this).removeClass(a.call(this,b,this.className))});if(a&&typeof a=="string"||a===b){c=(a||"").split(p);for(d=0,e=this.length;d<e;d++){g=this[d];if(g.nodeType===1&&g.className)if(a){h=(" "+g.className+" ").replace(o," ");for(i=0,j=c.length;i<j;i++)h=h.replace(" "+c[i]+" "," ");g.className=f.trim(h)}else g.className=""}}return this},toggleClass:function(a,b){var c=typeof a,d=typeof b=="boolean";if(f.isFunction(a))return this.each(function(c){f(this).toggleClass(a.call(this,c,this.className,b),b)});return this.each(function(){if(c==="string"){var e,g=0,h=f(this),i=b,j=a.split(p);while(e=j[g++])i=d?i:!h.hasClass(e),h[i?"addClass":"removeClass"](e)}else if(c==="undefined"||c==="boolean")this.className&&f._data(this,"__className__",this.className),this.className=this.className||a===!1?"":f._data(this,"__className__")||""})},hasClass:function(a){var b=" "+a+" ",c=0,d=this.length;for(;c<d;c++)if(this[c].nodeType===1&&(" "+this[c].className+" ").replace(o," ").indexOf(b)>-1)return!0;return!1},val:function(a){var c,d,e,g=this[0];if(!arguments.length){if(g){c=f.valHooks[g.nodeName.toLowerCase()]||f.valHooks[g.type];if(c&&"get"in c&&(d=c.get(g,"value"))!==b)return d;d=g.value;return typeof d=="string"?d.replace(q,""):d==null?"":d}return b}e=f.isFunction(a);return this.each(function(d){var g=f(this),h;if(this.nodeType===1){e?h=a.call(this,d,g.val()):h=a,h==null?h="":typeof h=="number"?h+="":f.isArray(h)&&(h=f.map(h,function(a){return a==null?"":a+""})),c=f.valHooks[this.nodeName.toLowerCase()]||f.valHooks[this.type];if(!c||!("set"in c)||c.set(this,h,"value")===b)this.value=h}})}}),f.extend({valHooks:{option:{get:function(a){var b=a.attributes.value;return!b||b.specified?a.value:a.text}},select:{get:function(a){var b,c,d,e,g=a.selectedIndex,h=[],i=a.options,j=a.type==="select-one";if(g<0)return null;c=j?g:0,d=j?g+1:i.length;for(;c<d;c++){e=i[c];if(e.selected&&(f.support.optDisabled?!e.disabled:e.getAttribute("disabled")===null)&&(!e.parentNode.disabled||!f.nodeName(e.parentNode,"optgroup"))){b=f(e).val();if(j)return b;h.push(b)}}if(j&&!h.length&&i.length)return f(i[g]).val();return h},set:function(a,b){var c=f.makeArray(b);f(a).find("option").each(function(){this.selected=f.inArray(f(this).val(),c)>=0}),c.length||(a.selectedIndex=-1);return c}}},attrFn:{val:!0,css:!0,html:!0,text:!0,data:!0,width:!0,height:!0,offset:!0},attr:function(a,c,d,e){var g,h,i,j=a.nodeType;if(!a||j===3||j===8||j===2)return b;if(e&&c in f.attrFn)return f(a)[c](d);if(!("getAttribute"in a))return f.prop(a,c,d);i=j!==1||!f.isXMLDoc(a),i&&(c=c.toLowerCase(),h=f.attrHooks[c]||(u.test(c)?x:w));if(d!==b){if(d===null){f.removeAttr(a,c);return b}if(h&&"set"in h&&i&&(g=h.set(a,d,c))!==b)return g;a.setAttribute(c,""+d);return d}if(h&&"get"in h&&i&&(g=h.get(a,c))!==null)return g;g=a.getAttribute(c);return g===null?b:g},removeAttr:function(a,b){var c,d,e,g,h=0;if(a.nodeType===1){d=(b||"").split(p),g=d.length;for(;h<g;h++)e=d[h].toLowerCase(),c=f.propFix[e]||e,f.attr(a,e,""),a.removeAttribute(v?e:c),u.test(e)&&c in a&&(a[c]=!1)}},attrHooks:{type:{set:function(a,b){if(r.test(a.nodeName)&&a.parentNode)f.error("type property can't be changed");else if(!f.support.radioValue&&b==="radio"&&f.nodeName(a,"input")){var c=a.value;a.setAttribute("type",b),c&&(a.value=c);return b}}},value:{get:function(a,b){if(w&&f.nodeName(a,"button"))return w.get(a,b);return b in a?a.value:null},set:function(a,b,c){if(w&&f.nodeName(a,"button"))return w.set(a,b,c);a.value=b}}},propFix:{tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},prop:function(a,c,d){var e,g,h,i=a.nodeType;if(!a||i===3||i===8||i===2)return b;h=i!==1||!f.isXMLDoc(a),h&&(c=f.propFix[c]||c,g=f.propHooks[c]);return d!==b?g&&"set"in g&&(e=g.set(a,d,c))!==b?e:a[c]=d:g&&"get"in g&&(e=g.get(a,c))!==null?e:a[c]},propHooks:{tabIndex:{get:function(a){var c=a.getAttributeNode("tabindex");return c&&c.specified?parseInt(c.value,10):s.test(a.nodeName)||t.test(a.nodeName)&&a.href?0:b}}}}),f.attrHooks.tabindex=f.propHooks.tabIndex,x={get:function(a,c){var d,e=f.prop(a,c);return e===!0||typeof e!="boolean"&&(d=a.getAttributeNode(c))&&d.nodeValue!==!1?c.toLowerCase():b},set:function(a,b,c){var d;b===!1?f.removeAttr(a,c):(d=f.propFix[c]||c,d in a&&(a[d]=!0),a.setAttribute(c,c.toLowerCase()));return c}},v||(y={name:!0,id:!0},w=f.valHooks.button={get:function(a,c){var d;d=a.getAttributeNode(c);return d&&(y[c]?d.nodeValue!=="":d.specified)?d.nodeValue:b},set:function(a,b,d){var e=a.getAttributeNode(d);e||(e=c.createAttribute(d),a.setAttributeNode(e));return e.nodeValue=b+""}},f.attrHooks.tabindex.set=w.set,f.each(["width","height"],function(a,b){f.attrHooks[b]=f.extend(f.attrHooks[b],{set:function(a,c){if(c===""){a.setAttribute(b,"auto");return c}}})}),f.attrHooks.contenteditable={get:w.get,set:function(a,b,c){b===""&&(b="false"),w.set(a,b,c)}}),f.support.hrefNormalized||f.each(["href","src","width","height"],function(a,c){f.attrHooks[c]=f.extend(f.attrHooks[c],{get:function(a){var d=a.getAttribute(c,2);return d===null?b:d}})}),f.support.style||(f.attrHooks.style={get:function(a){return a.style.cssText.toLowerCase()||b},set:function(a,b){return a.style.cssText=""+b}}),f.support.optSelected||(f.propHooks.selected=f.extend(f.propHooks.selected,{get:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex);return null}})),f.support.enctype||(f.propFix.enctype="encoding"),f.support.checkOn||f.each(["radio","checkbox"],function(){f.valHooks[this]={get:function(a){return a.getAttribute("value")===null?"on":a.value}}}),f.each(["radio","checkbox"],function(){f.valHooks[this]=f.extend(f.valHooks[this],{set:function(a,b){if(f.isArray(b))return a.checked=f.inArray(f(a).val(),b)>=0}})});var z=/\.(.*)$/,A=/^(?:textarea|input|select)$/i,B=/\./g,C=/ /g,D=/[^\w\s.|`]/g,E=/^([^\.]*)?(?:\.(.+))?$/,F=/\bhover(\.\S+)?/,G=/^key/,H=/^(?:mouse|contextmenu)|click/,I=/^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,J=function(a){var b=I.exec(a);b&&
(b[1]=(b[1]||"").toLowerCase(),b[3]=b[3]&&new RegExp("(?:^|\\s)"+b[3]+"(?:\\s|$)"));return b},K=function(a,b){return(!b[1]||a.nodeName.toLowerCase()===b[1])&&(!b[2]||a.id===b[2])&&(!b[3]||b[3].test(a.className))},L=function(a){return f.event.special.hover?a:a.replace(F,"mouseenter$1 mouseleave$1")};f.event={add:function(a,c,d,e,g){var h,i,j,k,l,m,n,o,p,q,r,s;if(!(a.nodeType===3||a.nodeType===8||!c||!d||!(h=f._data(a)))){d.handler&&(p=d,d=p.handler),d.guid||(d.guid=f.guid++),j=h.events,j||(h.events=j={}),i=h.handle,i||(h.handle=i=function(a){return typeof f!="undefined"&&(!a||f.event.triggered!==a.type)?f.event.dispatch.apply(i.elem,arguments):b},i.elem=a),c=L(c).split(" ");for(k=0;k<c.length;k++){l=E.exec(c[k])||[],m=l[1],n=(l[2]||"").split(".").sort(),s=f.event.special[m]||{},m=(g?s.delegateType:s.bindType)||m,s=f.event.special[m]||{},o=f.extend({type:m,origType:l[1],data:e,handler:d,guid:d.guid,selector:g,namespace:n.join(".")},p),g&&(o.quick=J(g),!o.quick&&f.expr.match.POS.test(g)&&(o.isPositional=!0)),r=j[m];if(!r){r=j[m]=[],r.delegateCount=0;if(!s.setup||s.setup.call(a,e,n,i)===!1)a.addEventListener?a.addEventListener(m,i,!1):a.attachEvent&&a.attachEvent("on"+m,i)}s.add&&(s.add.call(a,o),o.handler.guid||(o.handler.guid=d.guid)),g?r.splice(r.delegateCount++,0,o):r.push(o),f.event.global[m]=!0}a=null}},global:{},remove:function(a,b,c,d){var e=f.hasData(a)&&f._data(a),g,h,i,j,k,l,m,n,o,p,q;if(!!e&&!!(m=e.events)){b=L(b||"").split(" ");for(g=0;g<b.length;g++){h=E.exec(b[g])||[],i=h[1],j=h[2];if(!i){j=j?"."+j:"";for(l in m)f.event.remove(a,l+j,c,d);return}n=f.event.special[i]||{},i=(d?n.delegateType:n.bindType)||i,p=m[i]||[],k=p.length,j=j?new RegExp("(^|\\.)"+j.split(".").sort().join("\\.(?:.*\\.)?")+"(\\.|$)"):null;if(c||j||d||n.remove)for(l=0;l<p.length;l++){q=p[l];if(!c||c.guid===q.guid)if(!j||j.test(q.namespace))if(!d||d===q.selector||d==="**"&&q.selector)p.splice(l--,1),q.selector&&p.delegateCount--,n.remove&&n.remove.call(a,q)}else p.length=0;p.length===0&&k!==p.length&&((!n.teardown||n.teardown.call(a,j)===!1)&&f.removeEvent(a,i,e.handle),delete m[i])}f.isEmptyObject(m)&&(o=e.handle,o&&(o.elem=null),f.removeData(a,["events","handle"],!0))}},customEvent:{getData:!0,setData:!0,changeData:!0},trigger:function(c,d,e,g){if(!e||e.nodeType!==3&&e.nodeType!==8){var h=c.type||c,i=[],j,k,l,m,n,o,p,q,r,s;h.indexOf("!")>=0&&(h=h.slice(0,-1),k=!0),h.indexOf(".")>=0&&(i=h.split("."),h=i.shift(),i.sort());if((!e||f.event.customEvent[h])&&!f.event.global[h])return;c=typeof c=="object"?c[f.expando]?c:new f.Event(h,c):new f.Event(h),c.type=h,c.isTrigger=!0,c.exclusive=k,c.namespace=i.join("."),c.namespace_re=c.namespace?new RegExp("(^|\\.)"+i.join("\\.(?:.*\\.)?")+"(\\.|$)"):null,o=h.indexOf(":")<0?"on"+h:"",(g||!e)&&c.preventDefault();if(!e){j=f.cache;for(l in j)j[l].events&&j[l].events[h]&&f.event.trigger(c,d,j[l].handle.elem,!0);return}c.result=b,c.target||(c.target=e),d=d!=null?f.makeArray(d):[],d.unshift(c),p=f.event.special[h]||{};if(p.trigger&&p.trigger.apply(e,d)===!1)return;r=[[e,p.bindType||h]];if(!g&&!p.noBubble&&!f.isWindow(e)){s=p.delegateType||h,n=null;for(m=e.parentNode;m;m=m.parentNode)r.push([m,s]),n=m;n&&n===e.ownerDocument&&r.push([n.defaultView||n.parentWindow||a,s])}for(l=0;l<r.length;l++){m=r[l][0],c.type=r[l][1],q=(f._data(m,"events")||{})[c.type]&&f._data(m,"handle"),q&&q.apply(m,d),q=o&&m[o],q&&f.acceptData(m)&&q.apply(m,d);if(c.isPropagationStopped())break}c.type=h,c.isDefaultPrevented()||(!p._default||p._default.apply(e.ownerDocument,d)===!1)&&(h!=="click"||!f.nodeName(e,"a"))&&f.acceptData(e)&&o&&e[h]&&(h!=="focus"&&h!=="blur"||c.target.offsetWidth!==0)&&!f.isWindow(e)&&(n=e[o],n&&(e[o]=null),f.event.triggered=h,e[h](),f.event.triggered=b,n&&(e[o]=n));return c.result}},dispatch:function(c){c=f.event.fix(c||a.event);var d=(f._data(this,"events")||{})[c.type]||[],e=d.delegateCount,g=[].slice.call(arguments,0),h=!c.exclusive&&!c.namespace,i=(f.event.special[c.type]||{}).handle,j=[],k,l,m,n,o,p,q,r,s,t,u;g[0]=c,c.delegateTarget=this;if(e&&!c.target.disabled&&(!c.button||c.type!=="click"))for(m=c.target;m!=this;m=m.parentNode||this){o={},q=[];for(k=0;k<e;k++)r=d[k],s=r.selector,t=o[s],r.isPositional?t=(t||(o[s]=f(s))).index(m)>=0:t===b&&(t=o[s]=r.quick?K(m,r.quick):f(m).is(s)),t&&q.push(r);q.length&&j.push({elem:m,matches:q})}d.length>e&&j.push({elem:this,matches:d.slice(e)});for(k=0;k<j.length&&!c.isPropagationStopped();k++){p=j[k],c.currentTarget=p.elem;for(l=0;l<p.matches.length&&!c.isImmediatePropagationStopped();l++){r=p.matches[l];if(h||!c.namespace&&!r.namespace||c.namespace_re&&c.namespace_re.test(r.namespace))c.data=r.data,c.handleObj=r,n=(i||r.handler).apply(p.elem,g),n!==b&&(c.result=n,n===!1&&(c.preventDefault(),c.stopPropagation()))}}return c.result},props:"attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){a.which==null&&(a.which=b.charCode!=null?b.charCode:b.keyCode);return a}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement wheelDelta".split(" "),filter:function(a,d){var e,f,g,h=d.button,i=d.fromElement;a.pageX==null&&d.clientX!=null&&(e=a.target.ownerDocument||c,f=e.documentElement,g=e.body,a.pageX=d.clientX+(f&&f.scrollLeft||g&&g.scrollLeft||0)-(f&&f.clientLeft||g&&g.clientLeft||0),a.pageY=d.clientY+(f&&f.scrollTop||g&&g.scrollTop||0)-(f&&f.clientTop||g&&g.clientTop||0)),!a.relatedTarget&&i&&(a.relatedTarget=i===a.target?d.toElement:i),!a.which&&h!==b&&(a.which=h&1?1:h&2?3:h&4?2:0);return a}},fix:function(a){if(a[f.expando])return a;var d,e,g=a,h=f.event.fixHooks[a.type]||{},i=h.props?this.props.concat(h.props):this.props;a=f.Event(g);for(d=i.length;d;)e=i[--d],a[e]=g[e];a.target||(a.target=g.srcElement||c),a.target.nodeType===3&&(a.target=a.target.parentNode),a.metaKey===b&&(a.metaKey=a.ctrlKey);return h.filter?h.filter(a,g):a},special:{ready:{setup:f.bindReady},focus:{delegateType:"focusin",noBubble:!0},blur:{delegateType:"focusout",noBubble:!0},beforeunload:{setup:function(a,b,c){f.isWindow(this)&&(this.onbeforeunload=c)},teardown:function(a,b){this.onbeforeunload===b&&(this.onbeforeunload=null)}}},simulate:function(a,b,c,d){var e=f.extend(new f.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?f.event.trigger(e,null,b):f.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},f.event.handle=f.event.dispatch,f.removeEvent=c.removeEventListener?function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)}:function(a,b,c){a.detachEvent&&a.detachEvent("on"+b,c)},f.Event=function(a,b){if(!(this instanceof f.Event))return new f.Event(a,b);a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||a.returnValue===!1||a.getPreventDefault&&a.getPreventDefault()?N:M):this.type=a,b&&f.extend(this,b),this.timeStamp=a&&a.timeStamp||f.now(),this[f.expando]=!0},f.Event.prototype={preventDefault:function(){this.isDefaultPrevented=N;var a=this.originalEvent;!a||(a.preventDefault?a.preventDefault():a.returnValue=!1)},stopPropagation:function(){this.isPropagationStopped=N;var a=this.originalEvent;!a||(a.stopPropagation&&a.stopPropagation(),a.cancelBubble=!0)},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=N,this.stopPropagation()},isDefaultPrevented:M,isPropagationStopped:M,isImmediatePropagationStopped:M},f.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){f.event.special[a]=f.event.special[b]={delegateType:b,bindType:b,handle:function(a){var b=this,c=a.relatedTarget,d=a.handleObj,e=d.selector,g,h;if(!c||d.origType===a.type||c!==b&&!f.contains(b,c))g=a.type,a.type=d.origType,h=d.handler.apply(this,arguments),a.type=g;return h}}}),f.support.submitBubbles||(f.event.special.submit={setup:function(){if(f.nodeName(this,"form"))return!1;f.event.add(this,"click._submit keypress._submit",function(a){var c=a.target,d=f.nodeName(c,"input")||f.nodeName(c,"button")?c.form:b;d&&!d._submit_attached&&(f.event.add(d,"submit._submit",function(a){this.parentNode&&f.event.simulate("submit",this.parentNode,a,!0)}),d._submit_attached=!0)})},teardown:function(){if(f.nodeName(this,"form"))return!1;f.event.remove(this,"._submit")}}),f.support.changeBubbles||(f.event.special.change={setup:function(){if(A.test(this.nodeName)){if(this.type==="checkbox"||this.type==="radio")f.event.add(this,"propertychange._change",function(a){a.originalEvent.propertyName==="checked"&&(this._just_changed=!0)}),f.event.add(this,"click._change",function(a){this._just_changed&&(this._just_changed=!1,f.event.simulate("change",this,a,!0))});return!1}f.event.add(this,"beforeactivate._change",function(a){var b=a.target;A.test(b.nodeName)&&!b._change_attached&&(f.event.add(b,"change._change",function(a){this.parentNode&&!a.isSimulated&&f.event.simulate("change",this.parentNode,a,!0)}),b._change_attached=!0)})},handle:function(a){var b=a.target;if(this!==b||a.isSimulated||a.isTrigger||b.type!=="radio"&&b.type!=="checkbox")return a.handleObj.handler.apply(this,arguments)},teardown:function(){f.event.remove(this,"._change");return A.test(this.nodeName)}}),f.support.focusinBubbles||f.each({focus:"focusin",blur:"focusout"},function(a,b){var d=0,e=function(a){f.event.simulate(b,a.target,f.event.fix(a),!0)};f.event.special[b]={setup:function(){d++===0&&c.addEventListener(a,e,!0)},teardown:function(){--d===0&&c.removeEventListener(a,e,!0)}}}),f.fn.extend({on:function(a,c,d,e,g){var h,i;if(typeof a=="object"){typeof c!="string"&&(d=c,c=b);for(i in a)this.on(i,c,d,a[i],g);return this}d==null&&e==null?(e=c,d=c=b):e==null&&(typeof c=="string"?(e=d,d=b):(e=d,d=c,c=b));if(e===!1)e=M;else if(!e)return this;g===1&&(h=e,e=function(a){f().off(a);return h.apply(this,arguments)},e.guid=h.guid||(h.guid=f.guid++));return this.each(function(){f.event.add(this,a,e,d,c)})},one:function(a,b,c,d){return this.on.call(this,a,b,c,d,1)},off:function(a,c,d){if(a&&a.preventDefault&&a.handleObj){var e=a.handleObj;f(a.delegateTarget).off(e.namespace?e.type+"."+e.namespace:e.type,e.selector,e.handler);return this}if(typeof a=="object"){for(var g in a)this.off(g,c,a[g]);return this}if(c===!1||typeof c=="function")d=c,c=b;d===!1&&(d=M);return this.each(function(){f.event.remove(this,a,d,c)})},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},live:function(a,b,c){f(this.context).on(a,this.selector,b,c);return this},die:function(a,b){f(this.context).off(a,this.selector||"**",b);return this},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return arguments.length==1?this.off(a,"**"):this.off(b,a,c)},trigger:function(a,b){return this.each(function(){f.event.trigger(a,b,this)})},triggerHandler:function(a,b){if(this[0])return f.event.trigger(a,b,this[0],!0)},toggle:function(a){var b=arguments,c=a.guid||f.guid++,d=0,e=function(c){var e=(f._data(this,"lastToggle"+a.guid)||0)%d;f._data(this,"lastToggle"+a.guid,e+1),c.preventDefault();return b[e].apply(this,arguments)||!1};e.guid=c;while(d<b.length)b[d++].guid=c;return this.click(e)},hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),f.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){f.fn[b]=function(a,c){c==null&&(c=a,a=null);return arguments.length>0?this.bind(b,a,c):this.trigger(b)},f.attrFn&&(f.attrFn[b]=!0),G.test(b)&&(f.event.fixHooks[b]=f.event.keyHooks),H.test(b)&&(f.event.fixHooks[b]=f.event.mouseHooks)}),function(){function x(a,b,c,e,f,g){for(var h=0,i=e.length;h<i;h++){var j=e[h];if(j){var k=!1;j=j[a];while(j){if(j[d]===c){k=e[j.sizset];break}if(j.nodeType===1){g||(j[d]=c,j.sizset=h);if(typeof b!="string"){if(j===b){k=!0;break}}else if(m.filter(b,[j]).length>0){k=j;break}}j=j[a]}e[h]=k}}}function w(a,b,c,e,f,g){for(var h=0,i=e.length;h<i;h++){var j=e[h];if(j){var k=!1;j=j[a];while(j){if(j[d]===c){k=e[j.sizset];break}j.nodeType===1&&!g&&(j[d]=c,j.sizset=h);if(j.nodeName.toLowerCase()===b){k=j;break}j=j[a]}e[h]=k}}}var a=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,d="sizcache"+(Math.random()+"").replace(".",""),e=0,g=Object.prototype.toString,h=!1,i=!0,j=/\\/g,k=/\r\n/g,l=/\W/;[0,0].sort(function(){i=!1;return 0});var m=function(b,d,e,f){e=e||[],d=d||c;var h=d;if(d.nodeType!==1&&d.nodeType!==9)return[];if(!b||typeof b!="string")return e;var i,j,k,l,n,q,r,t,u=!0,v=m.isXML(d),w=[],x=b;do{a.exec(""),i=a.exec(x);if(i){x=i[3],w.push(i[1]);if(i[2]){l=i[3];break}}}while(i);if(w.length>1&&p.exec(b))if(w.length===2&&o.relative[w[0]])j=y(w[0]+w[1],d,f);else{j=o.relative[w[0]]?[d]:m(w.shift(),d);while(w.length)b=w.shift(),o.relative[b]&&(b+=w.shift()),j=y(b,j,f)}else{!f&&w.length>1&&d.nodeType===9&&!v&&o.match.ID.test(w[0])&&!o.match.ID.test(w[w.length-1])&&(n=m.find(w.shift(),d,v),d=n.expr?m.filter(n.expr,n.set)[0]:n.set[0]);if(d){n=f?{expr:w.pop(),set:s(f)}:m.find(w.pop(),w.length===1&&(w[0]==="~"||w[0]==="+")&&d.parentNode?d.parentNode:d,v),j=n.expr?m.filter(n.expr,n.set):n.set,w.length>0?k=s(j):u=!1;while(w.length)q=w.pop(),r=q,o.relative[q]?r=w.pop():q="",r==null&&(r=d),o.relative[q](k,r,v)}else k=w=[]}k||(k=j),k||m.error(q||b);if(g.call(k)==="[object Array]")if(!u)e.push.apply(e,k);else if(d&&d.nodeType===1)for(t=0;k[t]!=null;t++)k[t]&&(k[t]===!0||k[t].nodeType===1&&m.contains(d,k[t]))&&e.push(j[t]);else for(t=0;k[t]!=null;t++)k[t]&&k[t].nodeType===1&&e.push(j[t]);else s(k,e);l&&(m(l,h,e,f),m.uniqueSort(e));return e};m.uniqueSort=function(a){if(u){h=i,a.sort(u);if(h)for(var b=1;b<a.length;b++)a[b]===a[b-1]&&a.splice(b--,1)}return a},m.matches=function(a,b){return m(a,null,null,b)},m.matchesSelector=function(a,b){return m(b,null,null,[a]).length>0},m.find=function(a,b,c){var d,e,f,g,h,i;if(!a)return[];for(e=0,f=o.order.length;e<f;e++){h=o.order[e];if(g=o.leftMatch[h].exec(a)){i=g[1],g.splice(1,1);if(i.substr(i.length-1)!=="\\"){g[1]=(g[1]||"").replace(j,""),d=o.find[h](g,b,c);if(d!=null){a=a.replace(o.match[h],"");break}}}}d||(d=typeof b.getElementsByTagName!="undefined"?b.getElementsByTagName("*"):[]);return{set:d,expr:a}},m.filter=function(a,c,d,e){var f,g,h,i,j,k,l,n,p,q=a,r=[],s=c,t=c&&c[0]&&m.isXML(c[0]);while(a&&c.length){for(h in o.filter)if((f=o.leftMatch[h].exec(a))!=null&&f[2]){k=o.filter[h],l=f[1],g=!1,f.splice(1,1);if(l.substr(l.length-1)==="\\")continue;s===r&&(r=[]);if(o.preFilter[h]){f=o.preFilter[h](f,s,d,r,e,t);if(!f)g=i=!0;else if(f===!0)continue}if(f)for(n=0;(j=s[n])!=null;n++)j&&(i=k(j,f,n,s),p=e^i,d&&i!=null?p?g=!0:s[n]=!1:p&&(r.push(j),g=!0));if(i!==b){d||(s=r),a=a.replace(o.match[h],"");if(!g)return[];break}}if(a===q)if(g==null)m.error(a);else break;q=a}return s},m.error=function(a){throw"Syntax error, unrecognized expression: "+a};var n=m.getText=function(a){var b,c,d=a.nodeType,e="";if(d){if(d===1){if(typeof a.textContent=="string")return a.textContent;if(typeof a.innerText=="string")return a.innerText.replace(k,"");for(a=a.firstChild;a;a=a.nextSibling)e+=n(a)}else if(d===3||d===4)return a.nodeValue}else for(b=0;c=a[b];b++)c.nodeType!==8&&(e+=n(c));return e},o=m.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/},leftMatch:{},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(a){return a.getAttribute("href")},type:function(a){return a.getAttribute("type")}},relative:{"+":function(a,b){var c=typeof b=="string",d=c&&!l.test(b),e=c&&!d;d&&(b=b.toLowerCase());for(var f=0,g=a.length,h;f<g;f++)if(h=a[f]){while((h=h.previousSibling)&&h.nodeType!==1);a[f]=e||h&&h.nodeName.toLowerCase()===b?h||!1:h===b}e&&m.filter(b,a,!0)},">":function(a,b){var c,d=typeof b=="string",e=0,f=a.length;if(d&&!l.test(b)){b=b.toLowerCase();for(;e<f;e++){c=a[e];if(c){var g=c.parentNode;a[e]=g.nodeName.toLowerCase()===b?g:!1}}}else{for(;e<f;e++)c=a[e],c&&(a[e]=d?c.parentNode:c.parentNode===b);d&&m.filter(b,a,!0)}},"":function(a,b,c){var d,f=e++,g=x;typeof b=="string"&&!l.test(b)&&(b=b.toLowerCase(),d=b,g=w),g("parentNode",b,f,a,d,c)},"~":function(a,b,c){var d,f=e++,g=x;typeof b=="string"&&!l.test(b)&&(b=b.toLowerCase(),d=b,g=w),g("previousSibling",b,f,a,d,c)}},find:{ID:function(a,b,c){if(typeof b.getElementById!="undefined"&&!c){var d=b.getElementById(a[1]);return d&&d.parentNode?[d]:[]}},NAME:function(a,b){if(typeof b.getElementsByName!="undefined"){var c=[],d=b.getElementsByName(a[1]);for(var e=0,f=d.length;e<f;e++)d[e].getAttribute("name")===a[1]&&c.push(d[e]);return c.length===0?null:c}},TAG:function(a,b){if(typeof b.getElementsByTagName!="undefined")return b.getElementsByTagName(a[1])}},preFilter:{CLASS:function(a,b,c,d,e,f){a=" "+a[1].replace(j,"")+" ";if(f)return a;for(var g=0,h;(h=b[g])!=null;g++)h&&(e^(h.className&&(" "+h.className+" ").replace(/[\t\n\r]/g," ").indexOf(a)>=0)?c||d.push(h):c&&(b[g]=!1));return!1},ID:function(a){return a[1].replace(j,"")},TAG:function(a,b){return a[1].replace(j,"").toLowerCase()},CHILD:function(a){if(a[1]==="nth"){a[2]||m.error(a[0]),a[2]=a[2].replace(/^\+|\s*/g,"");var b=/(-?)(\d*)(?:n([+\-]?\d*))?/.exec(a[2]==="even"&&"2n"||a[2]==="odd"&&"2n+1"||!/\D/.test(a[2])&&"0n+"+a[2]||a[2]);a[2]=b[1]+(b[2]||1)-0,a[3]=b[3]-0}else a[2]&&m.error(a[0]);a[0]=e++;return a},ATTR:function(a,b,c,d,e,f){var g=a[1]=a[1].replace(j,"");!f&&o.attrMap[g]&&(a[1]=o.attrMap[g]),a[4]=(a[4]||a[5]||"").replace(j,""),a[2]==="~="&&(a[4]=" "+a[4]+" ");return a},PSEUDO:function(b,c,d,e,f){if(b[1]==="not")if((a.exec(b[3])||"").length>1||/^\w/.test(b[3]))b[3]=m(b[3],null,null,c);else{var g=m.filter(b[3],c,d,!0^f);d||e.push.apply(e,g);return!1}else if(o.match.POS.test(b[0])||o.match.CHILD.test(b[0]))return!0;return b},POS:function(a){a.unshift(!0);return a}},filters:{enabled:function(a){return a.disabled===!1&&a.type!=="hidden"},disabled:function(a){return a.disabled===!0},checked:function(a){return a.checked===!0},selected:function(a){a.parentNode&&a.parentNode.selectedIndex;return a.selected===!0},parent:function(a){return!!a.firstChild},empty:function(a){return!a.firstChild},has:function(a,b,c){return!!m(c[3],a).length},header:function(a){return/h\d/i.test(a.nodeName)},text:function(a){var b=a.getAttribute("type"),c=a.type;return a.nodeName.toLowerCase()==="input"&&"text"===c&&(b===c||b===null)},radio:function(a){return a.nodeName.toLowerCase()==="input"&&"radio"===a.type},checkbox:function(a){return a.nodeName.toLowerCase()==="input"&&"checkbox"===a.type},file:function(a){return a.nodeName.toLowerCase()==="input"&&"file"===a.type},password:function(a){return a.nodeName.toLowerCase()==="input"&&"password"===a.type},submit:function(a){var b=a.nodeName.toLowerCase();return(b==="input"||b==="button")&&"submit"===a.type},image:function(a){return a.nodeName.toLowerCase()==="input"&&"image"===a.type},reset:function(a){var b=a.nodeName.toLowerCase();return(b==="input"||b==="button")&&"reset"===a.type},button:function(a){var b=a.nodeName.toLowerCase();return b==="input"&&"button"===a.type||b==="button"},input:function(a){return/input|select|textarea|button/i.test(a.nodeName)},focus:function(a){return a===a.ownerDocument.activeElement}},setFilters:{first:function(a,b){return b===0},last:function(a,b,c,d){return b===d.length-1},even:function(a,b){return b%2===0},odd:function(a,b){return b%2===1},lt:function(a,b,c){return b<c[3]-0},gt:function(a,b,c){return b>c[3]-0},nth:function(a,b,c){return c[3]-0===b},eq:function(a,b,c){return c[3]-0===b}},filter:{PSEUDO:function(a,b,c,d){var e=b[1],f=o.filters[e];if(f)return f(a,c,b,d);if(e==="contains")return(a.textContent||a.innerText||n([a])||"").indexOf(b[3])>=0;if(e==="not"){var g=b[3];for(var h=0,i=g.length;h<i;h++)if(g[h]===a)return!1;return!0}m.error(e)},CHILD:function(a,b){var c,e,f,g,h,i,j,k=b[1],l=a;switch(k){case"only":case"first":while(l=l.previousSibling)if(l.nodeType===1)return!1;if(k==="first")return!0;l=a;case"last":while(l=l.nextSibling)if(l.nodeType===1)return!1;return!0;case"nth":c=b[2],e=b[3];if(c===1&&e===0)return!0;f=b[0],g=a.parentNode;if(g&&(g[d]!==f||!a.nodeIndex)){i=0;for(l=g.firstChild;l;l=l.nextSibling)l.nodeType===1&&(l.nodeIndex=++i);g[d]=f}j=a.nodeIndex-e;return c===0?j===0:j%c===0&&j/c>=0}},ID:function(a,b){return a.nodeType===1&&a.getAttribute("id")===b},TAG:function(a,b){return b==="*"&&a.nodeType===1||!!a.nodeName&&a.nodeName.toLowerCase()===b},CLASS:function(a,b){return(" "+(a.className||a.getAttribute("class"))+" ").indexOf(b)>-1},ATTR:function(a,b){var c=b[1],d=m.attr?m.attr(a,c):o.attrHandle[c]?o.attrHandle[c](a):a[c]!=null?a[c]:a.getAttribute(c),e=d+"",f=b[2],g=b[4];return d==null?f==="!=":!f&&m.attr?d!=null:f==="="?e===g:f==="*="?e.indexOf(g)>=0:f==="~="?(" "+e+" ").indexOf(g)>=0:g?f==="!="?e!==g:f==="^="?e.indexOf(g)===0:f==="$="?e.substr(e.length-g.length)===g:f==="|="?e===g||e.substr(0,g.length+1)===g+"-":!1:e&&d!==!1},POS:function(a,b,c,d){var e=b[2],f=o.setFilters[e];if(f)return f(a,c,b,d)}}},p=o.match.POS,q=function(a,b){return"\\"+(b-0+1)};for(var r in o.match)o.match[r]=new RegExp(o.match[r].source+/(?![^\[]*\])(?![^\(]*\))/.source),o.leftMatch[r]=new RegExp(/(^(?:.|\r|\n)*?)/.source+o.match[r].source.replace(/\\(\d+)/g,q));var s=function(a,b){a=Array.prototype.slice.call(a,0);if(b){b.push.apply(b,a);return b}return a};try{Array.prototype.slice.call(c.documentElement.childNodes,0)[0].nodeType}catch(t){s=function(a,b){var c=0,d=b||[];if(g.call(a)==="[object Array]")Array.prototype.push.apply(d,a);else if(typeof a.length=="number")for(var e=a.length;c<e;c++)d.push(a[c]);else for(;a[c];c++)d.push(a[c]);return d}}var u,v;c.documentElement.compareDocumentPosition?u=function(a,b){if(a===b){h=!0;return 0}if(!a.compareDocumentPosition||!b.compareDocumentPosition)return a.compareDocumentPosition?-1:1;return a.compareDocumentPosition(b)&4?-1:1}:(u=function(a,b){if(a===b){h=!0;return 0}if(a.sourceIndex&&b.sourceIndex)return a.sourceIndex-b.sourceIndex;var c,d,e=[],f=[],g=a.parentNode,i=b.parentNode,j=g;if(g===i)return v(a,b);if(!g)return-1;if(!i)return 1;while(j)e.unshift(j),j=j.parentNode;j=i;while(j)f.unshift(j),j=j.parentNode;c=e.length,d=f.length;for(var k=0;k<c&&k<d;k++)if(e[k]!==f[k])return v(e[k],f[k]);return k===c?v(a,f[k],-1):v(e[k],b,1)},v=function(a,b,c){if(a===b)return c;var d=a.nextSibling;while(d){if(d===b)return-1;d=d.nextSibling}return 1}),function(){var a=c.createElement("div"),d="script"+(new Date).getTime(),e=c.documentElement;a.innerHTML="<a name='"+d+"'/>",e.insertBefore(a,e.firstChild),c.getElementById(d)&&(o.find.ID=function(a,c,d){if(typeof c.getElementById!="undefined"&&!d){var e=c.getElementById(a[1]);return e?e.id===a[1]||typeof e.getAttributeNode!="undefined"&&e.getAttributeNode("id").nodeValue===a[1]?[e]:b:[]}},o.filter.ID=function(a,b){var c=typeof a.getAttributeNode!="undefined"&&a.getAttributeNode("id");return a.nodeType===1&&c&&c.nodeValue===b}),e.removeChild(a),e=a=null}(),function(){var a=c.createElement("div");a.appendChild(c.createComment("")),a.getElementsByTagName("*").length>0&&(o.find.TAG=function(a,b){var c=b.getElementsByTagName(a[1]);if(a[1]==="*"){var d=[];for(var e=0;c[e];e++)c[e].nodeType===1&&d.push(c[e]);c=d}return c}),a.innerHTML="<a href='#'></a>",a.firstChild&&typeof a.firstChild.getAttribute!="undefined"&&a.firstChild.getAttribute("href")!=="#"&&(o.attrHandle.href=function(a){return a.getAttribute("href",2)}),a=null}(),c.querySelectorAll&&function(){var a=m,b=c.createElement("div"),d="__sizzle__";b.innerHTML="<p class='TEST'></p>";if(!b.querySelectorAll||b.querySelectorAll(".TEST").length!==0){m=function(b,e,f,g){e=e||c;if(!g&&!m.isXML(e)){var h=/^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(b);if(h&&(e.nodeType===1||e.nodeType===9)){if(h[1])return s(e.getElementsByTagName(b),f);if(h[2]&&o.find.CLASS&&e.getElementsByClassName)return s(e.getElementsByClassName(h[2]),f)}if(e.nodeType===9){if(b==="body"&&e.body)return s([e.body],f);if(h&&h[3]){var i=e.getElementById(h[3]);if(!i||!i.parentNode)return s([],f);if(i.id===h[3])return s([i],f)}try{return s(e.querySelectorAll(b),f)}catch(j){}}else if(e.nodeType===1&&e.nodeName.toLowerCase()!=="object"){var k=e,l=e.getAttribute("id"),n=l||d,p=e.parentNode,q=/^\s*[+~]/.test(b);l?n=n.replace(/'/g,"\\$&"):e.setAttribute("id",n),q&&p&&(e=e.parentNode);try{if(!q||p)return s(e.querySelectorAll("[id='"+n+"'] "+b),f)}catch(r){}finally{l||k.removeAttribute("id")}}}return a(b,e,f,g)};for(var e in a)m[e]=a[e];b=null}}(),function(){var a=c.documentElement,b=a.matchesSelector||a.mozMatchesSelector||a.webkitMatchesSelector||a.msMatchesSelector;if(b){var d=!b.call(c.createElement("div"),"div"),e=!1;try{b.call(c.documentElement,"[test!='']:sizzle")}catch(f){e=!0}m.matchesSelector=function(a,c){c=c.replace(/\=\s*([^'"\]]*)\s*\]/g,"='$1']");if(!m.isXML(a))try{if(e||!o.match.PSEUDO.test(c)&&!/!=/.test(c)){var f=b.call(a,c);if(f||!d||a.document&&a.document.nodeType!==11)return f}}catch(g){}return m(c,null,null,[a]).length>0}}}(),function(){var a=c.createElement("div");a.innerHTML="<div class='test e'></div><div class='test'></div>";if(!!a.getElementsByClassName&&a.getElementsByClassName("e").length!==0){a.lastChild.className="e";if(a.getElementsByClassName("e").length===1)return;o.order.splice(1,0,"CLASS"),o.find.CLASS=function(a,b,c){if(typeof b.getElementsByClassName!="undefined"&&!c)return b.getElementsByClassName(a[1])},a=null}}(),c.documentElement.contains?m.contains=function(a,b){return a!==b&&(a.contains?a.contains(b):!0)}:c.documentElement.compareDocumentPosition?m.contains=function(a,b){return!!(a.compareDocumentPosition(b)&16)}:m.contains=function(){return!1},m.isXML=function(a){var b=(a?a.ownerDocument||a:0).documentElement;return b?b.nodeName!=="HTML":!1};var y=function(a,b,c){var d,e=[],f="",g=b.nodeType?[b]:b;while(d=o.match.PSEUDO.exec(a))f+=d[0],a=a.replace(o.match.PSEUDO,"");a=o.relative[a]?a+"*":a;for(var h=0,i=g.length;h<i;h++)m(a,g[h],e,c);return m.filter(f,e)};m.attr=f.attr,m.selectors.attrMap={},f.find=m,f.expr=m.selectors,f.expr[":"]=f.expr.filters,f.unique=m.uniqueSort,f.text=m.getText,f.isXMLDoc=m.isXML,f.contains=m.contains}();var O=/Until$/,P=/^(?:parents|prevUntil|prevAll)/,Q=/,/,R=/^.[^:#\[\.,]*$/,S=Array.prototype.slice,T=f.expr.match.POS,U={children:!0,contents:!0,next:!0,prev:!0};f.fn.extend({find:function(a){var b=this,c,d;if(typeof a!="string")return f(a).filter(function(){for(c=0,d=b.length;c<d;c++)if(f.contains(b[c],this))return!0});var e=this.pushStack("","find",a),g,h,i;for(c=0,d=this.length;c<d;c++){g=e.length,f.find(a,this[c],e);if(c>0)for(h=g;h<e.length;h++)for(i=0;i<g;i++)if(e[i]===e[h]){e.splice(h--,1);break}}return e},has:function(a){var b=f(a);return this.filter(function(){for(var a=0,c=b.length;a<c;a++)if(f.contains(this,b[a]))return!0})},not:function(a){return this.pushStack(W(this,a,!1),"not",a)},filter:function(a){return this.pushStack(W(this,a,!0),"filter",a)},is:function(a){return!!a&&(typeof a=="string"?T.test(a)?f(a,this.context).index(this[0])>=0:f.filter(a,this).length>0:this.filter(a).length>0)},closest:function(a,b){var c=[],d,e,g=this[0];if(f.isArray(a)){var h=1;while(g&&g.ownerDocument&&g!==b){for(d=0;d<a.length;d++)f(g).is(a[d])&&c.push({selector:a[d],elem:g,level:h});g=g.parentNode,h++}return c}var i=T.test(a)||typeof a!="string"?f(a,b||this.context):0;for(d=0,e=this.length;d<e;d++){g=this[d];while(g){if(i?i.index(g)>-1:f.find.matchesSelector(g,a)){c.push(g);break}g=g.parentNode;if(!g||!g.ownerDocument||g===b||g.nodeType===11)break}}c=c.length>1?f.unique(c):c;return this.pushStack(c,"closest",a)},index:function(a){if(!a)return this[0]&&this[0].parentNode?this.prevAll().length:-1;if(typeof a=="string")return f.inArray(this[0],f(a));return f.inArray(a.jquery?a[0]:a,this)},add:function(a,b){var c=typeof a=="string"?f(a,b):f.makeArray(a&&a.nodeType?[a]:a),d=f.merge(this.get(),c);return this.pushStack(V(c[0])||V(d[0])?d:f.unique(d))},andSelf:function(){return this.add(this.prevObject)}}),f.each({parent:function(a){var b=a.parentNode;return b&&b.nodeType!==11?b:null},parents:function(a){return f.dir(a,"parentNode")},parentsUntil:function(a,b,c){return f.dir(a,"parentNode",c)},next:function(a){return f.nth(a,2,"nextSibling")},prev:function(a){return f.nth(a,2,"previousSibling")},nextAll:function(a){return f.dir(a,"nextSibling")},prevAll:function(a){return f.dir(a,"previousSibling")},nextUntil:function(a,b,c){return f.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return f.dir(a,"previousSibling",c)},siblings:function(a){return f.sibling(a.parentNode.firstChild,a)},children:function(a){return f.sibling(a.firstChild)},contents:function(a){return f.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:f.makeArray(a.childNodes)}},function(a,b){f.fn[a]=function(c,d){var e=f.map(this,b,c),g=S.call(arguments);O.test(a)||(d=c),d&&typeof d=="string"&&(e=f.filter(d,e)),e=this.length>1&&!U[a]?f.unique(e):e,(this.length>1||Q.test(d))&&P.test(a)&&(e=e.reverse());return this.pushStack(e,a,g.join(","))}}),f.extend({filter:function(a,b,c){c&&(a=":not("+a+")");return b.length===1?f.find.matchesSelector(b[0],a)?[b[0]]:[]:f.find.matches(a,b)},dir:function(a,c,d){var e=[],g=a[c];while(g&&g.nodeType!==9&&(d===b||g.nodeType!==1||!f(g).is(d)))g.nodeType===1&&e.push(g),g=g[c];return e},nth:function(a,b,c,d){b=b||1;var e=0;for(;a;a=a[c])if(a.nodeType===1&&++e===b)break;return a},sibling:function(a,b){var c=[];for(;a;a=a.nextSibling)a.nodeType===1&&a!==b&&c.push(a);return c}});var Y="abbr article aside audio canvas datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",Z=/ jQuery\d+="(?:\d+|null)"/g,$=/^\s+/,_=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,ba=/<([\w:]+)/,bb=/<tbody/i,bc=/<|&#?\w+;/,bd=/<(?:script|style)/i,be=/<(?:script|object|embed|option|style)/i,bf=new RegExp("<(?:"+Y.replace(" ","|")+")","i"),bg=/checked\s*(?:[^=]|=\s*.checked.)/i,bh=/\/(java|ecma)script/i,bi=/^\s*<!(?:\[CDATA\[|\-\-)/,bj={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]},bk=X(c);bj.optgroup=bj.option,bj.tbody=bj.tfoot=bj.colgroup=bj.caption=bj.thead,bj.th=bj.td,f.support.htmlSerialize||(bj._default=[1,"div<div>","</div>"]),f.fn.extend({text:function(a){if(f.isFunction(a))return this.each(function(b){var c=f(this);c.text(a.call(this,b,c.text()))});if(typeof a!="object"&&a!==b)return this.empty().append((this[0]&&this[0].ownerDocument||c).createTextNode(a));return f.text(this)},wrapAll:function(a){if(f.isFunction(a))return this.each(function(b){f(this).wrapAll(a.call(this,b))});if(this[0]){var b=f(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstChild&&a.firstChild.nodeType===1)a=a.firstChild;return a}).append(this)}return this},wrapInner:function(a){if(f.isFunction(a))return this.each(function(b){f(this).wrapInner(a.call(this,b))});return this.each(function(){var b=f(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){return this.each(function(){f(this).wrapAll(a)})},unwrap:function(){return this.parent().each(function(){f.nodeName(this,"body")||f(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,!0,function(a){this.nodeType===1&&this.appendChild(a)})},prepend:function(){return this.domManip(arguments,!0,function(a){this.nodeType===1&&this.insertBefore(a,this.firstChild)})},before:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this)});if(arguments.length){var a=f(arguments[0]);a.push.apply(a,this.toArray());return this.pushStack(a,"before",arguments)}},after:function(){if(this[0]&&this[0].parentNode)return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this.nextSibling)});if(arguments.length){var a=this.pushStack(this,"after"
,arguments);a.push.apply(a,f(arguments[0]).toArray());return a}},remove:function(a,b){for(var c=0,d;(d=this[c])!=null;c++)if(!a||f.filter(a,[d]).length)!b&&d.nodeType===1&&(f.cleanData(d.getElementsByTagName("*")),f.cleanData([d])),d.parentNode&&d.parentNode.removeChild(d);return this},empty:function(){for(var a=0,b;(b=this[a])!=null;a++){b.nodeType===1&&f.cleanData(b.getElementsByTagName("*"));while(b.firstChild)b.removeChild(b.firstChild)}return this},clone:function(a,b){a=a==null?!1:a,b=b==null?a:b;return this.map(function(){return f.clone(this,a,b)})},html:function(a){if(a===b)return this[0]&&this[0].nodeType===1?this[0].innerHTML.replace(Z,""):null;if(typeof a=="string"&&!bd.test(a)&&(f.support.leadingWhitespace||!$.test(a))&&!bj[(ba.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(_,"<$1></$2>");try{for(var c=0,d=this.length;c<d;c++)this[c].nodeType===1&&(f.cleanData(this[c].getElementsByTagName("*")),this[c].innerHTML=a)}catch(e){this.empty().append(a)}}else f.isFunction(a)?this.each(function(b){var c=f(this);c.html(a.call(this,b,c.html()))}):this.empty().append(a);return this},replaceWith:function(a){if(this[0]&&this[0].parentNode){if(f.isFunction(a))return this.each(function(b){var c=f(this),d=c.html();c.replaceWith(a.call(this,b,d))});typeof a!="string"&&(a=f(a).detach());return this.each(function(){var b=this.nextSibling,c=this.parentNode;f(this).remove(),b?f(b).before(a):f(c).append(a)})}return this.length?this.pushStack(f(f.isFunction(a)?a():a),"replaceWith",a):this},detach:function(a){return this.remove(a,!0)},domManip:function(a,c,d){var e,g,h,i,j=a[0],k=[];if(!f.support.checkClone&&arguments.length===3&&typeof j=="string"&&bg.test(j))return this.each(function(){f(this).domManip(a,c,d,!0)});if(f.isFunction(j))return this.each(function(e){var g=f(this);a[0]=j.call(this,e,c?g.html():b),g.domManip(a,c,d)});if(this[0]){i=j&&j.parentNode,f.support.parentNode&&i&&i.nodeType===11&&i.childNodes.length===this.length?e={fragment:i}:e=f.buildFragment(a,this,k),h=e.fragment,h.childNodes.length===1?g=h=h.firstChild:g=h.firstChild;if(g){c=c&&f.nodeName(g,"tr");for(var l=0,m=this.length,n=m-1;l<m;l++)d.call(c?bl(this[l],g):this[l],e.cacheable||m>1&&l<n?f.clone(h,!0,!0):h)}k.length&&f.each(k,br)}return this}}),f.buildFragment=function(a,b,d){var e,g,h,i,j=a[0];b&&b[0]&&(i=b[0].ownerDocument||b[0]),i.createDocumentFragment||(i=c),a.length===1&&typeof j=="string"&&j.length<512&&i===c&&j.charAt(0)==="<"&&!be.test(j)&&(f.support.checkClone||!bg.test(j))&&!f.support.unknownElems&&bf.test(j)&&(g=!0,h=f.fragments[j],h&&h!==1&&(e=h)),e||(e=i.createDocumentFragment(),f.clean(a,i,e,d)),g&&(f.fragments[j]=h?e:1);return{fragment:e,cacheable:g}},f.fragments={},f.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){f.fn[a]=function(c){var d=[],e=f(c),g=this.length===1&&this[0].parentNode;if(g&&g.nodeType===11&&g.childNodes.length===1&&e.length===1){e[b](this[0]);return this}for(var h=0,i=e.length;h<i;h++){var j=(h>0?this.clone(!0):this).get();f(e[h])[b](j),d=d.concat(j)}return this.pushStack(d,a,e.selector)}}),f.extend({clone:function(a,b,c){var d=a.cloneNode(!0),e,g,h;if((!f.support.noCloneEvent||!f.support.noCloneChecked)&&(a.nodeType===1||a.nodeType===11)&&!f.isXMLDoc(a)){bn(a,d),e=bo(a),g=bo(d);for(h=0;e[h];++h)g[h]&&bn(e[h],g[h])}if(b){bm(a,d);if(c){e=bo(a),g=bo(d);for(h=0;e[h];++h)bm(e[h],g[h])}}e=g=null;return d},clean:function(a,b,d,e){var g;b=b||c,typeof b.createElement=="undefined"&&(b=b.ownerDocument||b[0]&&b[0].ownerDocument||c);var h=[],i;for(var j=0,k;(k=a[j])!=null;j++){typeof k=="number"&&(k+="");if(!k)continue;if(typeof k=="string")if(!bc.test(k))k=b.createTextNode(k);else{k=k.replace(_,"<$1></$2>");var l=(ba.exec(k)||["",""])[1].toLowerCase(),m=bj[l]||bj._default,n=m[0],o=b.createElement("div");b===c?bk.appendChild(o):X(b).appendChild(o),o.innerHTML=m[1]+k+m[2];while(n--)o=o.lastChild;if(!f.support.tbody){var p=bb.test(k),q=l==="table"&&!p?o.firstChild&&o.firstChild.childNodes:m[1]==="<table>"&&!p?o.childNodes:[];for(i=q.length-1;i>=0;--i)f.nodeName(q[i],"tbody")&&!q[i].childNodes.length&&q[i].parentNode.removeChild(q[i])}!f.support.leadingWhitespace&&$.test(k)&&o.insertBefore(b.createTextNode($.exec(k)[0]),o.firstChild),k=o.childNodes}var r;if(!f.support.appendChecked)if(k[0]&&typeof (r=k.length)=="number")for(i=0;i<r;i++)bq(k[i]);else bq(k);k.nodeType?h.push(k):h=f.merge(h,k)}if(d){g=function(a){return!a.type||bh.test(a.type)};for(j=0;h[j];j++)if(e&&f.nodeName(h[j],"script")&&(!h[j].type||h[j].type.toLowerCase()==="text/javascript"))e.push(h[j].parentNode?h[j].parentNode.removeChild(h[j]):h[j]);else{if(h[j].nodeType===1){var s=f.grep(h[j].getElementsByTagName("script"),g);h.splice.apply(h,[j+1,0].concat(s))}d.appendChild(h[j])}}return h},cleanData:function(a){var b,c,d=f.cache,e=f.event.special,g=f.support.deleteExpando;for(var h=0,i;(i=a[h])!=null;h++){if(i.nodeName&&f.noData[i.nodeName.toLowerCase()])continue;c=i[f.expando];if(c){b=d[c];if(b&&b.events){for(var j in b.events)e[j]?f.event.remove(i,j):f.removeEvent(i,j,b.handle);b.handle&&(b.handle.elem=null)}g?delete i[f.expando]:i.removeAttribute&&i.removeAttribute(f.expando),delete d[c]}}}});var bs=/alpha\([^)]*\)/i,bt=/opacity=([^)]*)/,bu=/([A-Z]|^ms)/g,bv=/^-?\d+(?:px)?$/i,bw=/^-?\d/,bx=/^([\-+])=([\-+.\de]+)/,by={position:"absolute",visibility:"hidden",display:"block"},bz=["Left","Right"],bA=["Top","Bottom"],bB,bC,bD;f.fn.css=function(a,c){if(arguments.length===2&&c===b)return this;return f.access(this,a,c,!0,function(a,c,d){return d!==b?f.style(a,c,d):f.css(a,c)})},f.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=bB(a,"opacity","opacity");return c===""?"1":c}return a.style.opacity}}},cssNumber:{fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":f.support.cssFloat?"cssFloat":"styleFloat"},style:function(a,c,d,e){if(!!a&&a.nodeType!==3&&a.nodeType!==8&&!!a.style){var g,h,i=f.camelCase(c),j=a.style,k=f.cssHooks[i];c=f.cssProps[i]||i;if(d===b){if(k&&"get"in k&&(g=k.get(a,!1,e))!==b)return g;return j[c]}h=typeof d,h==="string"&&(g=bx.exec(d))&&(d=+(g[1]+1)*+g[2]+parseFloat(f.css(a,c)),h="number");if(d==null||h==="number"&&isNaN(d))return;h==="number"&&!f.cssNumber[i]&&(d+="px");if(!k||!("set"in k)||(d=k.set(a,d))!==b)try{j[c]=d}catch(l){}}},css:function(a,c,d){var e,g;c=f.camelCase(c),g=f.cssHooks[c],c=f.cssProps[c]||c,c==="cssFloat"&&(c="float");if(g&&"get"in g&&(e=g.get(a,!0,d))!==b)return e;if(bB)return bB(a,c)},swap:function(a,b,c){var d={};for(var e in b)d[e]=a.style[e],a.style[e]=b[e];c.call(a);for(e in b)a.style[e]=d[e]}}),f.curCSS=f.css,f.each(["height","width"],function(a,b){f.cssHooks[b]={get:function(a,c,d){var e;if(c){if(a.offsetWidth!==0)return bE(a,b,d);f.swap(a,by,function(){e=bE(a,b,d)});return e}},set:function(a,b){if(!bv.test(b))return b;b=parseFloat(b);if(b>=0)return b+"px"}}}),f.support.opacity||(f.cssHooks.opacity={get:function(a,b){return bt.test((b&&a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?parseFloat(RegExp.$1)/100+"":b?"1":""},set:function(a,b){var c=a.style,d=a.currentStyle,e=f.isNumeric(b)?"alpha(opacity="+b*100+")":"",g=d&&d.filter||c.filter||"";c.zoom=1;if(b>=1&&f.trim(g.replace(bs,""))===""){c.removeAttribute("filter");if(d&&!d.filter)return}c.filter=bs.test(g)?g.replace(bs,e):g+" "+e}}),f(function(){f.support.reliableMarginRight||(f.cssHooks.marginRight={get:function(a,b){var c;f.swap(a,{display:"inline-block"},function(){b?c=bB(a,"margin-right","marginRight"):c=a.style.marginRight});return c}})}),c.defaultView&&c.defaultView.getComputedStyle&&(bC=function(a,c){var d,e,g;c=c.replace(bu,"-$1").toLowerCase();if(!(e=a.ownerDocument.defaultView))return b;if(g=e.getComputedStyle(a,null))d=g.getPropertyValue(c),d===""&&!f.contains(a.ownerDocument.documentElement,a)&&(d=f.style(a,c));return d}),c.documentElement.currentStyle&&(bD=function(a,b){var c,d,e,f=a.currentStyle&&a.currentStyle[b],g=a.style;f===null&&g&&(e=g[b])&&(f=e),!bv.test(f)&&bw.test(f)&&(c=g.left,d=a.runtimeStyle&&a.runtimeStyle.left,d&&(a.runtimeStyle.left=a.currentStyle.left),g.left=b==="fontSize"?"1em":f||0,f=g.pixelLeft+"px",g.left=c,d&&(a.runtimeStyle.left=d));return f===""?"auto":f}),bB=bC||bD,f.expr&&f.expr.filters&&(f.expr.filters.hidden=function(a){var b=a.offsetWidth,c=a.offsetHeight;return b===0&&c===0||!f.support.reliableHiddenOffsets&&(a.style&&a.style.display||f.css(a,"display"))==="none"},f.expr.filters.visible=function(a){return!f.expr.filters.hidden(a)});var bF=/%20/g,bG=/\[\]$/,bH=/\r?\n/g,bI=/#.*$/,bJ=/^(.*?):[ \t]*([^\r\n]*)\r?$/mg,bK=/^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,bL=/^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,bM=/^(?:GET|HEAD)$/,bN=/^\/\//,bO=/\?/,bP=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,bQ=/^(?:select|textarea)/i,bR=/\s+/,bS=/([?&])_=[^&]*/,bT=/^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,bU=f.fn.load,bV={},bW={},bX,bY,bZ=["*/"]+["*"];try{bX=e.href}catch(b$){bX=c.createElement("a"),bX.href="",bX=bX.href}bY=bT.exec(bX.toLowerCase())||[],f.fn.extend({load:function(a,c,d){if(typeof a!="string"&&bU)return bU.apply(this,arguments);if(!this.length)return this;var e=a.indexOf(" ");if(e>=0){var g=a.slice(e,a.length);a=a.slice(0,e)}var h="GET";c&&(f.isFunction(c)?(d=c,c=b):typeof c=="object"&&(c=f.param(c,f.ajaxSettings.traditional),h="POST"));var i=this;f.ajax({url:a,type:h,dataType:"html",data:c,complete:function(a,b,c){c=a.responseText,a.isResolved()&&(a.done(function(a){c=a}),i.html(g?f("<div>").append(c.replace(bP,"")).find(g):c)),d&&i.each(d,[c,b,a])}});return this},serialize:function(){return f.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?f.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||bQ.test(this.nodeName)||bK.test(this.type))}).map(function(a,b){var c=f(this).val();return c==null?null:f.isArray(c)?f.map(c,function(a,c){return{name:b.name,value:a.replace(bH,"\r\n")}}):{name:b.name,value:c.replace(bH,"\r\n")}}).get()}}),f.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(a,b){f.fn[b]=function(a){return this.bind(b,a)}}),f.each(["get","post"],function(a,c){f[c]=function(a,d,e,g){f.isFunction(d)&&(g=g||e,e=d,d=b);return f.ajax({type:c,url:a,data:d,success:e,dataType:g})}}),f.extend({getScript:function(a,c){return f.get(a,b,c,"script")},getJSON:function(a,b,c){return f.get(a,b,c,"json")},ajaxSetup:function(a,b){b?cb(a,f.ajaxSettings):(b=a,a=f.ajaxSettings),cb(a,b);return a},ajaxSettings:{url:bX,isLocal:bL.test(bY[1]),global:!0,type:"GET",contentType:"application/x-www-form-urlencoded",processData:!0,async:!0,accepts:{xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript","*":bZ},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText"},converters:{"* text":a.String,"text html":!0,"text json":f.parseJSON,"text xml":f.parseXML},flatOptions:{context:!0,url:!0}},ajaxPrefilter:b_(bV),ajaxTransport:b_(bW),ajax:function(a,c){function w(a,c,l,m){if(s!==2){s=2,q&&clearTimeout(q),p=b,n=m||"",v.readyState=a>0?4:0;var o,r,u,w=c,x=l?cd(d,v,l):b,y,z;if(a>=200&&a<300||a===304){if(d.ifModified){if(y=v.getResponseHeader("Last-Modified"))f.lastModified[k]=y;if(z=v.getResponseHeader("Etag"))f.etag[k]=z}if(a===304)w="notmodified",o=!0;else try{r=ce(d,x),w="success",o=!0}catch(A){w="parsererror",u=A}}else{u=w;if(!w||a)w="error",a<0&&(a=0)}v.status=a,v.statusText=""+(c||w),o?h.resolveWith(e,[r,w,v]):h.rejectWith(e,[v,w,u]),v.statusCode(j),j=b,t&&g.trigger("ajax"+(o?"Success":"Error"),[v,d,o?r:u]),i.fireWith(e,[v,w]),t&&(g.trigger("ajaxComplete",[v,d]),--f.active||f.event.trigger("ajaxStop"))}}typeof a=="object"&&(c=a,a=b),c=c||{};var d=f.ajaxSetup({},c),e=d.context||d,g=e!==d&&(e.nodeType||e instanceof f)?f(e):f.event,h=f.Deferred(),i=f.Callbacks("once memory"),j=d.statusCode||{},k,l={},m={},n,o,p,q,r,s=0,t,u,v={readyState:0,setRequestHeader:function(a,b){if(!s){var c=a.toLowerCase();a=m[c]=m[c]||a,l[a]=b}return this},getAllResponseHeaders:function(){return s===2?n:null},getResponseHeader:function(a){var c;if(s===2){if(!o){o={};while(c=bJ.exec(n))o[c[1].toLowerCase()]=c[2]}c=o[a.toLowerCase()]}return c===b?null:c},overrideMimeType:function(a){s||(d.mimeType=a);return this},abort:function(a){a=a||"abort",p&&p.abort(a),w(0,a);return this}};h.promise(v),v.success=v.done,v.error=v.fail,v.complete=i.add,v.statusCode=function(a){if(a){var b;if(s<2)for(b in a)j[b]=[j[b],a[b]];else b=a[v.status],v.then(b,b)}return this},d.url=((a||d.url)+"").replace(bI,"").replace(bN,bY[1]+"//"),d.dataTypes=f.trim(d.dataType||"*").toLowerCase().split(bR),d.crossDomain==null&&(r=bT.exec(d.url.toLowerCase()),d.crossDomain=!(!r||r[1]==bY[1]&&r[2]==bY[2]&&(r[3]||(r[1]==="http:"?80:443))==(bY[3]||(bY[1]==="http:"?80:443)))),d.data&&d.processData&&typeof d.data!="string"&&(d.data=f.param(d.data,d.traditional)),ca(bV,d,c,v);if(s===2)return!1;t=d.global,d.type=d.type.toUpperCase(),d.hasContent=!bM.test(d.type),t&&f.active++===0&&f.event.trigger("ajaxStart");if(!d.hasContent){d.data&&(d.url+=(bO.test(d.url)?"&":"?")+d.data,delete d.data),k=d.url;if(d.cache===!1){var x=f.now(),y=d.url.replace(bS,"$1_="+x);d.url=y+(y===d.url?(bO.test(d.url)?"&":"?")+"_="+x:"")}}(d.data&&d.hasContent&&d.contentType!==!1||c.contentType)&&v.setRequestHeader("Content-Type",d.contentType),d.ifModified&&(k=k||d.url,f.lastModified[k]&&v.setRequestHeader("If-Modified-Since",f.lastModified[k]),f.etag[k]&&v.setRequestHeader("If-None-Match",f.etag[k])),v.setRequestHeader("Accept",d.dataTypes[0]&&d.accepts[d.dataTypes[0]]?d.accepts[d.dataTypes[0]]+(d.dataTypes[0]!=="*"?", "+bZ+"; q=0.01":""):d.accepts["*"]);for(u in d.headers)v.setRequestHeader(u,d.headers[u]);if(d.beforeSend&&(d.beforeSend.call(e,v,d)===!1||s===2)){v.abort();return!1}for(u in{success:1,error:1,complete:1})v[u](d[u]);p=ca(bW,d,c,v);if(!p)w(-1,"No Transport");else{v.readyState=1,t&&g.trigger("ajaxSend",[v,d]),d.async&&d.timeout>0&&(q=setTimeout(function(){v.abort("timeout")},d.timeout));try{s=1,p.send(l,w)}catch(z){s<2?w(-1,z):f.error(z)}}return v},param:function(a,c){var d=[],e=function(a,b){b=f.isFunction(b)?b():b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};c===b&&(c=f.ajaxSettings.traditional);if(f.isArray(a)||a.jquery&&!f.isPlainObject(a))f.each(a,function(){e(this.name,this.value)});else for(var g in a)cc(g,a[g],c,e);return d.join("&").replace(bF,"+")}}),f.extend({active:0,lastModified:{},etag:{}});var cf=f.now(),cg=/(\=)\?(&|$)|\?\?/i;f.ajaxSetup({jsonp:"callback",jsonpCallback:function(){return f.expando+"_"+cf++}}),f.ajaxPrefilter("json jsonp",function(b,c,d){var e=b.contentType==="application/x-www-form-urlencoded"&&typeof b.data=="string";if(b.dataTypes[0]==="jsonp"||b.jsonp!==!1&&(cg.test(b.url)||e&&cg.test(b.data))){var g,h=b.jsonpCallback=f.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,i=a[h],j=b.url,k=b.data,l="$1"+h+"$2";b.jsonp!==!1&&(j=j.replace(cg,l),b.url===j&&(e&&(k=k.replace(cg,l)),b.data===k&&(j+=(/\?/.test(j)?"&":"?")+b.jsonp+"="+h))),b.url=j,b.data=k,a[h]=function(a){g=[a]},d.always(function(){a[h]=i,g&&f.isFunction(i)&&a[h](g[0])}),b.converters["script json"]=function(){g||f.error(h+" was not called");return g[0]},b.dataTypes[0]="json";return"script"}}),f.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/javascript|ecmascript/},converters:{"text script":function(a){f.globalEval(a);return a}}}),f.ajaxPrefilter("script",function(a){a.cache===b&&(a.cache=!1),a.crossDomain&&(a.type="GET",a.global=!1)}),f.ajaxTransport("script",function(a){if(a.crossDomain){var d,e=c.head||c.getElementsByTagName("head")[0]||c.documentElement;return{send:function(f,g){d=c.createElement("script"),d.async="async",a.scriptCharset&&(d.charset=a.scriptCharset),d.src=a.url,d.onload=d.onreadystatechange=function(a,c){if(c||!d.readyState||/loaded|complete/.test(d.readyState))d.onload=d.onreadystatechange=null,e&&d.parentNode&&e.removeChild(d),d=b,c||g(200,"success")},e.insertBefore(d,e.firstChild)},abort:function(){d&&d.onload(0,1)}}}});var ch=a.ActiveXObject?function(){for(var a in cj)cj[a](0,1)}:!1,ci=0,cj;f.ajaxSettings.xhr=a.ActiveXObject?function(){return!this.isLocal&&ck()||cl()}:ck,function(a){f.extend(f.support,{ajax:!!a,cors:!!a&&"withCredentials"in a})}(f.ajaxSettings.xhr()),f.support.ajax&&f.ajaxTransport(function(c){if(!c.crossDomain||f.support.cors){var d;return{send:function(e,g){var h=c.xhr(),i,j;c.username?h.open(c.type,c.url,c.async,c.username,c.password):h.open(c.type,c.url,c.async);if(c.xhrFields)for(j in c.xhrFields)h[j]=c.xhrFields[j];c.mimeType&&h.overrideMimeType&&h.overrideMimeType(c.mimeType),!c.crossDomain&&!e["X-Requested-With"]&&(e["X-Requested-With"]="XMLHttpRequest");try{for(j in e)h.setRequestHeader(j,e[j])}catch(k){}h.send(c.hasContent&&c.data||null),d=function(a,e){var j,k,l,m,n;try{if(d&&(e||h.readyState===4)){d=b,i&&(h.onreadystatechange=f.noop,ch&&delete cj[i]);if(e)h.readyState!==4&&h.abort();else{j=h.status,l=h.getAllResponseHeaders(),m={},n=h.responseXML,n&&n.documentElement&&(m.xml=n),m.text=h.responseText;try{k=h.statusText}catch(o){k=""}!j&&c.isLocal&&!c.crossDomain?j=m.text?200:404:j===1223&&(j=204)}}}catch(p){e||g(-1,p)}m&&g(j,k,m,l)},!c.async||h.readyState===4?d():(i=++ci,ch&&(cj||(cj={},f(a).unload(ch)),cj[i]=d),h.onreadystatechange=d)},abort:function(){d&&d(0,1)}}}});var cm={},cn,co,cp=/^(?:toggle|show|hide)$/,cq=/^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,cr,cs=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]],ct;f.fn.extend({show:function(a,b,c){var d,e;if(a||a===0)return this.animate(cw("show",3),a,b,c);for(var g=0,h=this.length;g<h;g++)d=this[g],d.style&&(e=d.style.display,!f._data(d,"olddisplay")&&e==="none"&&(e=d.style.display=""),e===""&&f.css(d,"display")==="none"&&f._data(d,"olddisplay",cx(d.nodeName)));for(g=0;g<h;g++){d=this[g];if(d.style){e=d.style.display;if(e===""||e==="none")d.style.display=f._data(d,"olddisplay")||""}}return this},hide:function(a,b,c){if(a||a===0)return this.animate(cw("hide",3),a,b,c);var d,e,g=0,h=this.length;for(;g<h;g++)d=this[g],d.style&&(e=f.css(d,"display"),e!=="none"&&!f._data(d,"olddisplay")&&f._data(d,"olddisplay",e));for(g=0;g<h;g++)this[g].style&&(this[g].style.display="none");return this},_toggle:f.fn.toggle,toggle:function(a,b,c){var d=typeof a=="boolean";f.isFunction(a)&&f.isFunction(b)?this._toggle.apply(this,arguments):a==null||d?this.each(function(){var b=d?a:f(this).is(":hidden");f(this)[b?"show":"hide"]()}):this.animate(cw("toggle",3),a,b,c);return this},fadeTo:function(a,b,c,d){return this.filter(":hidden").css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){function g(){e.queue===!1&&f._mark(this);var b=f.extend({},e),c=this.nodeType===1,d=c&&f(this).is(":hidden"),g,h,i,j,k,l,m,n,o;b.animatedProperties={};for(i in a){g=f.camelCase(i),i!==g&&(a[g]=a[i],delete a[i]),h=a[g],f.isArray(h)?(b.animatedProperties[g]=h[1],h=a[g]=h[0]):b.animatedProperties[g]=b.specialEasing&&b.specialEasing[g]||b.easing||"swing";if(h==="hide"&&d||h==="show"&&!d)return b.complete.call(this);c&&(g==="height"||g==="width")&&(b.overflow=[this.style.overflow,this.style.overflowX,this.style.overflowY],f.css(this,"display")==="inline"&&f.css(this,"float")==="none"&&(!f.support.inlineBlockNeedsLayout||cx(this.nodeName)==="inline"?this.style.display="inline-block":this.style.zoom=1))}b.overflow!=null&&(this.style.overflow="hidden");for(i in a)j=new f.fx(this,b,i),h=a[i],cp.test(h)?(o=f._data(this,"toggle"+i)||(h==="toggle"?d?"show":"hide":0),o?(f._data(this,"toggle"+i,o==="show"?"hide":"show"),j[o]()):j[h]()):(k=cq.exec(h),l=j.cur(),k?(m=parseFloat(k[2]),n=k[3]||(f.cssNumber[i]?"":"px"),n!=="px"&&(f.style(this,i,(m||1)+n),l=(m||1)/j.cur()*l,f.style(this,i,l+n)),k[1]&&(m=(k[1]==="-="?-1:1)*m+l),j.custom(l,m,n)):j.custom(l,h,""));return!0}var e=f.speed(b,c,d);if(f.isEmptyObject(a))return this.each(e.complete,[!1]);a=f.extend({},a);return e.queue===!1?this.each(g):this.queue(e.queue,g)},stop:function(a,c,d){typeof a!="string"&&(d=c,c=a,a=b),c&&a!==!1&&this.queue(a||"fx",[]);return this.each(function(){function h(a,b,c){var e=b[c];f.removeData(a,c,!0),e.stop(d)}var b,c=!1,e=f.timers,g=f._data(this);d||f._unmark(!0,this);if(a==null)for(b in g)g[b].stop&&b.indexOf(".run")===b.length-4&&h(this,g,b);else g[b=a+".run"]&&g[b].stop&&h(this,g,b);for(b=e.length;b--;)e[b].elem===this&&(a==null||e[b].queue===a)&&(d?e[b](!0):e[b].saveState(),c=!0,e.splice(b,1));(!d||!c)&&f.dequeue(this,a)})}}),f.each({slideDown:cw("show",1),slideUp:cw("hide",1),slideToggle:cw("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){f.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),f.extend({speed:function(a,b,c){var d=a&&typeof a=="object"?f.extend({},a):{complete:c||!c&&b||f.isFunction(a)&&a,duration:a,easing:c&&b||b&&!f.isFunction(b)&&b};d.duration=f.fx.off?0:typeof d.duration=="number"?d.duration:d.duration in f.fx.speeds?f.fx.speeds[d.duration]:f.fx.speeds._default;if(d.queue==null||d.queue===!0)d.queue="fx";d.old=d.complete,d.complete=function(a){f.isFunction(d.old)&&d.old.call(this),d.queue?f.dequeue(this,d.queue):a!==!1&&f._unmark(this)};return d},easing:{linear:function(a,b,c,d){return c+d*a},swing:function(a,b,c,d){return(-Math.cos(a*Math.PI)/2+.5)*d+c}},timers:[],fx:function(a,b,c){this.options=b,this.elem=a,this.prop=c,b.orig=b.orig||{}}}),f.fx.prototype={update:function(){this.options.step&&this.options.step.call(this.elem,this.now,this),(f.fx.step[this.prop]||f.fx.step._default)(this)},cur:function(){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null))return this.elem[this.prop];var a,b=f.css(this.elem,this.prop);return isNaN(a=parseFloat(b))?!b||b==="auto"?0:b:a},custom:function(a,c,d){function h(a){return e.step(a)}var e=this,g=f.fx;this.startTime=ct||cu(),this.end=c,this.now=this.start=a,this.pos=this.state=0,this.unit=d||this.unit||(f.cssNumber[this.prop]?"":"px"),h.queue=this.options.queue,h.elem=this.elem,h.saveState=function(){e.options.hide&&f._data(e.elem,"fxshow"+e.prop)===b&&f._data(e.elem,"fxshow"+e.prop,e.start)},h()&&f.timers.push(h)&&!cr&&(cr=setInterval(g.tick,g.interval))},show:function(){var a=f._data(this.elem,"fxshow"+this.prop);this.options.orig[this.prop]=a||f.style(this.elem,this.prop),this.options.show=!0,a!==b?this.custom(this.cur(),a):this.custom(this.prop==="width"||this.prop==="height"?1:0,this.cur()),f(this.elem).show()},hide:function(){this.options.orig[this.prop]=f._data(this.elem,"fxshow"+this.prop)||f.style(this.elem,this.prop),this.options.hide=!0,this.custom(this.cur(),0)},step:function(a){var b,c,d,e=ct||cu(),g=!0,h=this.elem,i=this.options;if(a||e>=i.duration+this.startTime){this.now=this.end,this.pos=this.state=1,this.update(),i.animatedProperties[this.prop]=!0;for(b in i.animatedProperties)i.animatedProperties[b]!==!0&&(g=!1);if(g){i.overflow!=null&&!f.support.shrinkWrapBlocks&&f.each(["","X","Y"],function(a,b){h.style["overflow"+b]=i.overflow[a]}),i.hide&&f(h).hide();if(i.hide||i.show)for(b in i.animatedProperties)f.style(h,b,i.orig[b]),f.removeData(h,"fxshow"+b,!0),f.removeData(h,"toggle"+b,!0);d=i.complete,d&&(i.complete=!1,d.call(h))}return!1}i.duration==Infinity?this.now=e:(c=e-this.startTime,this.state=c/i.duration,this.pos=f.easing[i.animatedProperties[this.prop]](this.state,c,0,1,i.duration),this.now=this.start+(this.end-this.start)*this.pos),this.update();return!0}},f.extend(f.fx,{tick:function(){var a,b=f.timers,c=0;for(;c<b.length;c++)a=b[c],!a()&&b[c]===a&&b.splice(c--,1);b.length||f.fx.stop()},interval:13,stop:function(){clearInterval(cr),cr=null},speeds:{slow:600,fast:200,_default:400},step:{opacity:function(a){f.style(a.elem,"opacity",a.now)},_default:function(a){a.elem.style&&a.elem.style[a.prop]!=null?a.elem.style[a.prop]=a.now+a.unit:a.elem[a.prop]=a.now}}}),f.each(["width","height"],function(a,b){f.fx.step[b]=function(a){f.style(a.elem,b,Math.max(0,a.now))}}),f.expr&&f.expr.filters&&(f.expr.filters.animated=function(a){return f.grep(f.timers,function(b){return a===b.elem}).length});var cy=/^t(?:able|d|h)$/i,cz=/^(?:body|html)$/i;"getBoundingClientRect"in c.documentElement?f.fn.offset=function(a){var b=this[0],c;if(a)return this.each(function(b){f.offset.setOffset(this,a,b)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return f.offset.bodyOffset(b);try{c=b.getBoundingClientRect()}catch(d){}var e=b.ownerDocument,g=e.documentElement;if(!c||!f.contains(g,b))return c?{top:c.top,left:c.left}:{top:0,left:0};var h=e.body,i=cA(e),j=g.clientTop||h.clientTop||0,k=g.clientLeft||h.clientLeft||0,l=i.pageYOffset||f.support.boxModel&&g.scrollTop||h.scrollTop,m=i.pageXOffset||f.support.boxModel&&g.scrollLeft||h.scrollLeft,n=c.top+l-j,o=c.left+m-k;return{top:n,left:o}}:f.fn.offset=function(a){var b=this[0];if(a)return this.each(function(b){f.offset.setOffset(this,a,b)});if(!b||!b.ownerDocument)return null;if(b===b.ownerDocument.body)return f.offset.bodyOffset(b);var c,d=b.offsetParent,e=b,g=b.ownerDocument,h=g.documentElement,i=g.body,j=g.defaultView,k=j?j.getComputedStyle(b,null):b.currentStyle,l=b.offsetTop,m=b.offsetLeft;while((b=b.parentNode)&&b!==i&&b!==h){if(f.support.fixedPosition&&k.position==="fixed")break;c=j?j.getComputedStyle(b,null):b.currentStyle,l-=b.scrollTop,m-=b.scrollLeft,b===d&&(l+=b.offsetTop,m+=b.offsetLeft,f.support.doesNotAddBorder&&(!f.support.doesAddBorderForTableAndCells||!cy.test(b.nodeName))&&(l+=parseFloat(c.borderTopWidth)||0,m+=parseFloat(c.borderLeftWidth)||0),e=d,d=b.offsetParent),f.support.subtractsBorderForOverflowNotVisible&&c.overflow!=="visible"&&(l+=parseFloat(c.borderTopWidth)||0,m+=parseFloat(c.borderLeftWidth)||0),k=c}if(k.position==="relative"||k.position==="static")l+=i.offsetTop,m+=i.offsetLeft;f.support.fixedPosition&&k.position==="fixed"&&(l+=Math.max(h.scrollTop,i.scrollTop),m+=Math.max(h.scrollLeft,i.scrollLeft));return{top:l,left:m}},f.offset={bodyOffset:function(a){var b=a.offsetTop,c=a.offsetLeft;f.support.doesNotIncludeMarginInBodyOffset&&(b+=parseFloat(f.css(a,"marginTop"))||0,c+=parseFloat(f.css(a,"marginLeft"))||0);return{top:b,left:c}},setOffset:function(a,b,c){var d=f.css(a,"position");d==="static"&&(a.style.position="relative");var e=f(a),g=e.offset(),h=f.css(a,"top"),i=f.css(a,"left"),j=(d==="absolute"||d==="fixed")&&f.inArray("auto",[h,i])>-1,k={},l={},m,n;j?(l=e.position(),m=l.top,n=l.left):(m=parseFloat(h)||0,n=parseFloat(i)||0),f.isFunction(b)&&(b=b.call(a,c,g)),b.top!=null&&(k.top=b.top-g.top+m),b.left!=null&&(k.left=b.left-g.left+n),"using"in b?b.using.call(a,k):e.css(k)}},f.fn.extend({position:function(){if(!this[0])return null;var a=this[0],b=this.offsetParent(),c=this.offset(),d=cz.test(b[0].nodeName)?{top:0,left:0}:b.offset();c.top-=parseFloat(f.css(a,"marginTop"))||0,c.left-=parseFloat(f.css(a,"marginLeft"))||0,d.top+=parseFloat(f.css(b[0],"borderTopWidth"))||0,d.left+=parseFloat(f.css(b[0],"borderLeftWidth"))||0;return{top:c.top-d.top,left:c.left-d.left}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||c.body;while(a&&!cz.test(a.nodeName)&&f.css(a,"position")==="static")a=a.offsetParent;return a})}}),f.each(["Left","Top"],function(a,c){var d="scroll"+c;f.fn[d]=function(c){var e,g;if(c===b){e=this[0];if(!e)return null;g=cA(e);return g?"pageXOffset"in g?g[a?"pageYOffset":"pageXOffset"]:f.support.boxModel&&g.document.documentElement[d]||g.document.body[d]:e[d]}return this.each(function(){g=cA(this),g?g.scrollTo(a?f(g).scrollLeft():c,a?c:f(g).scrollTop()):this[d]=c})}}),f.each(["Height","Width"],function(a,c){var d=c.toLowerCase();f.fn["inner"+c]=function(){var a=this[0];return a?a.style?parseFloat(f.css(a,d,"padding")):this[d]():null},f.fn["outer"+c]=function(a){var b=this[0];return b?b.style?parseFloat(f.css(b,d,a?"margin":"border")):this[d]():null},f.fn[d]=function(a){var e=this[0];if(!e)return a==null?null:this;if(f.isFunction(a))return this.each(function(b){var c=f(this);c[d](a.call(this,b,c[d]()))});if(f.isWindow(e)){var g=e.document.documentElement["client"+c],h=e.document.body;return e.document.compatMode==="CSS1Compat"&&g||h&&h["client"+c]||g}if(e.nodeType===9)return Math.max(e.documentElement["client"+c],e.body["scroll"+c],e.documentElement["scroll"+c],e.body["offset"+c],e.documentElement["offset"+c]);if(a===b){var i=f.css(e,d),j=parseFloat(i);return f.isNumeric(j)?j:i}return this.css(d,typeof a=="string"?a:a+"px")}}),a.jQuery=a.$=f})(window);

/*


 GLmol - Molecular Viewer on WebGL/Javascript (0.47)
  (C) Copyright 2011-2012, biochem_fan
      License: dual license of MIT or LGPL3

  Contributors:
    Robert Hanson for parseXYZ, deferred instantiation

  This program uses
      Three.js 
         https://github.com/mrdoob/three.js
         Copyright (c) 2010-2012 three.js Authors. All rights reserved.
      jQuery
         http://jquery.org/
         Copyright (c) 2011 John Resig
 */

//-----------------code we have added
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}
THREE.Color.prototype.setHSV = function(h,s,v)
{
	var rgb = HSVtoRGB(h,s,v);
	this.setRGB(rgb.r,rgb.g,rgb.b);
}

//------------glmol (which had origin policy errors prior to jquery being copypasted above)

// Workaround for Intel GMA series (gl_FrontFacing causes compilation error)
THREE.ShaderLib.lambert.fragmentShader = THREE.ShaderLib.lambert.fragmentShader.replace("gl_FrontFacing", "true");
THREE.ShaderLib.lambert.vertexShader = THREE.ShaderLib.lambert.vertexShader.replace(/\}$/, "#ifdef DOUBLE_SIDED\n if (transformedNormal.z < 0.0) vLightFront = vLightBack;\n #endif\n }");

var TV3 = THREE.Vector3, TF3 = THREE.Face3, TCo = THREE.Color;

THREE.Geometry.prototype.colorAll = function (color) {
   for (var i = 0; i < this.faces.length; i++) {
      this.faces[i].color = color;
   }
};

THREE.Matrix4.prototype.isIdentity = function() {
   for (var i = 0; i < 4; i++)
      for (var j = 0; j < 4; j++) 
         if (this.elements[i * 4 + j] != (i == j) ? 1 : 0) return false;
   return true;
};

var GLmol = (function() {
   function GLmol(id, suppressAutoload, force2d) {
   if (id) this.create(id, suppressAutoload, force2d);
   return true;
}

GLmol.prototype.create = function(id, suppressAutoload, force2d) {
   this.Nucleotides = ['  G', '  A', '  T', '  C', '  U', ' DG', ' DA', ' DT', ' DC', ' DU'];
   this.ElementColors = {"H": 0xCCCCCC, "C": 0xAAAAAA, "O": 0xCC0000, "N": 0x0000CC, "S": 0xCCCC00, "P": 0x6622CC,
                         "F": 0x00CC00, "CL": 0x00CC00, "BR": 0x882200, "I": 0x6600AA,
                         "FE": 0xCC6600, "CA": 0x8888AA};
// Reference: A. Bondi, J. Phys. Chem., 1964, 68, 441.
   this.vdwRadii = {"H": 1.2, "Li": 1.82, "Na": 2.27, "K": 2.75, "C": 1.7, "N": 1.55, "O": 1.52,
                   "F": 1.47, "P": 1.80, "S": 1.80, "CL": 1.75, "BR": 1.85, "SE": 1.90,
                   "ZN": 1.39, "CU": 1.4, "NI": 1.63};

   this.id = id;
   this.aaScale = 1; // or 2

   this.container = $('#' + this.id);
   this.WIDTH = this.container.width() * this.aaScale, this.HEIGHT = this.container.height() * this.aaScale;
   this.ASPECT = this.WIDTH / this.HEIGHT;
   this.NEAR = 1, FAR = 800;
   this.CAMERA_Z = -150;
   this.webglFailed = true;
   try {
      if (force2d) throw "WebGL disabled";
      this.renderer = new THREE.WebGLRenderer({antialias: true});
      this.renderer.sortObjects = false; // hopefully improve performance
   // 'antialias: true' now works in Firefox too!
   // setting this.aaScale = 2 will enable antialias in older Firefox but GPU load increases.
      this.renderer.domElement.style.width = "100%";
      this.renderer.domElement.style.height = "100%";
      this.container.append(this.renderer.domElement);
      this.renderer.setSize(this.WIDTH, this.HEIGHT);
      this.webglFailed = false;
   } catch (e) {
      this.canvas2d = $('<canvas></canvas');
      this.container.append(this.canvas2d);
      this.canvas2d[0].height = this.HEIGHT;
      this.canvas2d[0].width = this.WIDTH;
   }

   this.camera = new THREE.PerspectiveCamera(20, this.ASPECT, 1, 800); // will be updated anyway
   this.camera.position = new TV3(0, 0, this.CAMERA_Z);
   this.camera.lookAt(new TV3(0, 0, 0));
   this.perspectiveCamera = this.camera;
   this.orthoscopicCamera = new THREE.OrthographicCamera();
   this.orthoscopicCamera.position.z = this.CAMERA_Z;
   this.orthoscopicCamera.lookAt(new TV3(0, 0, 0));

   var self = this;
   $(window).resize(function() { // only window can capture resize event
      self.WIDTH = self.container.width() * self.aaScale;
      self.HEIGHT = self.container.height() * self.aaScale;
      if (!self.webglFailed) {
         self.ASPECT = self.WIDTH / self.HEIGHT;
         self.renderer.setSize(self.WIDTH, self.HEIGHT);
         self.camera.aspect = self.ASPECT;
         self.camera.updateProjectionMatrix();
      } else {
         self.canvas2d[0].height = self.HEIGHT;
         self.canvas2d[0].width = self.WIDTH;
      }
      self.show();
   });

   this.scene = null;
   this.rotationGroup = null; // which contains modelGroup
   this.modelGroup = null;

   this.bgColor = 0x000000;
   this.fov = 20;
   this.fogStart = 0.4;
   this.slabNear = -50; // relative to the center of rotationGroup
   this.slabFar = +50;

   // Default values
   this.sphereRadius = 1.5; 
   this.cylinderRadius = 0.4;
   this.lineWidth = 1.5 * this.aaScale;
   this.curveWidth = 3 * this.aaScale;
   this.defaultColor = 0xCCCCCC;
   this.sphereQuality = 16; //16;
   this.cylinderQuality = 16; //8;
   this.axisDIV = 5; // 3 still gives acceptable quality
   this.strandDIV = 6;
   this.nucleicAcidStrandDIV = 4;
   this.tubeDIV = 8;
   this.coilWidth = 0.3;
   this.helixSheetWidth = 1.3;
   this.nucleicAcidWidth = 0.8;
   this.thickness = 0.4;
 
   // UI variables
   this.cq = new THREE.Quaternion(1, 0, 0, 0);
   this.dq = new THREE.Quaternion(1, 0, 0, 0);
   this.isDragging = false;
   this.mouseStartX = 0;
   this.mouseStartY = 0;
   this.currentModelPos = 0;
   this.cz = 0;
   this.enableMouse();

   if (suppressAutoload) return;
   this.loadMolecule();
}

GLmol.prototype.setupLights = function(scene) {
   var directionalLight =  new THREE.DirectionalLight(0xFFFFFF);
   directionalLight.position = new TV3(0.2, 0.2, -1).normalize();
   directionalLight.intensity = 1.2;
   scene.add(directionalLight);
   var ambientLight = new THREE.AmbientLight(0x202020);
   scene.add(ambientLight);
};

GLmol.prototype.parseSDF = function(str) {
   var atoms = this.atoms;
   var protein = this.protein;

   var lines = str.split("\n");
   if (lines.length < 4) return;
   var atomCount = parseInt(lines[3].substr(0, 3));
   if (isNaN(atomCount) || atomCount <= 0) return;
   var bondCount = parseInt(lines[3].substr(3, 3));
   var offset = 4;
   if (lines.length < 4 + atomCount + bondCount) return;
   for (var i = 1; i <= atomCount; i++) {
      var line = lines[offset];
      offset++;
      var atom = {};
      atom.serial = i;
      atom.x = parseFloat(line.substr(0, 10));
      atom.y = parseFloat(line.substr(10, 10));
      atom.z = parseFloat(line.substr(20, 10));
      atom.hetflag = true;
      atom.atom = atom.elem = line.substr(31, 3).replace(/ /g, "");
      atom.bonds = [];
      atom.bondOrder = [];
      atoms[i] = atom;
   }
   for (i = 1; i <= bondCount; i++) {
      var line = lines[offset];
      offset++;
      var from = parseInt(line.substr(0, 3));
      var to = parseInt(line.substr(3, 3));
      var order = parseInt(line.substr(6, 3));
      atoms[from].bonds.push(to);
      atoms[from].bondOrder.push(order);
      atoms[to].bonds.push(from);
      atoms[to].bondOrder.push(order);
   }

   protein.smallMolecule = true;
   return true;
};

GLmol.prototype.parseXYZ = function(str) {
   var atoms = this.atoms;
   var protein = this.protein;

   var lines = str.split("\n");
   if (lines.length < 3) return;
   var atomCount = parseInt(lines[0].substr(0, 3));
   if (isNaN(atomCount) || atomCount <= 0) return;
   if (lines.length < atomCount + 2) return;
   var offset = 2;
   for (var i = 1; i <= atomCount; i++) {
      var line = lines[offset++];
      var tokens = line.replace(/^\s+/, "").replace(/\s+/g," ").split(" ");
      console.log(tokens);
      var atom = {};
      atom.serial = i;
      atom.atom = atom.elem = tokens[0];
      atom.x = parseFloat(tokens[1]);
      atom.y = parseFloat(tokens[2]);
      atom.z = parseFloat(tokens[3]);
      atom.hetflag = true;
      atom.bonds = [];
      atom.bondOrder = [];
      atoms[i] = atom;
   }
   for (var i = 1; i < atomCount; i++) // hopefully XYZ is small enough
      for (var j = i + 1; j <= atomCount; j++)
         if (this.isConnected(atoms[i], atoms[j])) {
	    atoms[i].bonds.push(j);
	    atoms[i].bondOrder.push(1);
    	    atoms[j].bonds.push(i);
     	    atoms[j].bondOrder.push(1);
         }
   protein.smallMolecule = true;
   return true;
};

GLmol.prototype.parsePDB2 = function(str) {
   var atoms = this.atoms;
   var protein = this.protein;
   var molID;

   var atoms_cnt = 0;
   lines = str.split("\n");
   for (var i = 0; i < lines.length; i++) {
      line = lines[i].replace(/^\s*/, ''); // remove indent
      var recordName = line.substr(0, 6);
      if (recordName == 'ATOM  ' || recordName == 'HETATM') {
         var atom, resn, chain, resi, x, y, z, hetflag, elem, serial, altLoc, b;
         altLoc = line.substr(16, 1);
         if (altLoc != ' ' && altLoc != 'A') continue; // FIXME: ad hoc
         serial = parseInt(line.substr(6, 5));
         atom = line.substr(12, 4).replace(/ /g, "");
         resn = line.substr(17, 3);
         chain = line.substr(21, 1);
         resi = parseInt(line.substr(22, 5)); 
         x = parseFloat(line.substr(30, 8));
         y = parseFloat(line.substr(38, 8));
         z = parseFloat(line.substr(46, 8));
         b = parseFloat(line.substr(60, 8));
         elem = line.substr(76, 2).replace(/ /g, "");
         if (elem == '') { // for some incorrect PDB files
            elem = line.substr(12, 4).replace(/ /g,"");
         }
         if (line[0] == 'H') hetflag = true;
         else hetflag = false;
         atoms[serial] = {'resn': resn, 'x': x, 'y': y, 'z': z, 'elem': elem,
  'hetflag': hetflag, 'chain': chain, 'resi': resi, 'serial': serial, 'atom': atom,
  'bonds': [], 'ss': 'c', 'color': 0xFFFFFF, 'bonds': [], 'bondOrder': [], 'b': b /*', altLoc': altLoc*/};
      } else if (recordName == 'SHEET ') {
         var startChain = line.substr(21, 1);
         var startResi = parseInt(line.substr(22, 4));
         var endChain = line.substr(32, 1);
         var endResi = parseInt(line.substr(33, 4));
         protein.sheet.push([startChain, startResi, endChain, endResi]);
     } else if (recordName == 'CONECT') {
// MEMO: We don't have to parse SSBOND, LINK because both are also 
// described in CONECT. But what about 2JYT???
         var from = parseInt(line.substr(6, 5));
         for (var j = 0; j < 4; j++) {
            var to = parseInt(line.substr([11, 16, 21, 26][j], 5));
            if (isNaN(to)) continue;
            if (atoms[from] != undefined) {
               atoms[from].bonds.push(to);
               atoms[from].bondOrder.push(1);
            }
         }
     } else if (recordName == 'HELIX ') {
         var startChain = line.substr(19, 1);
         var startResi = parseInt(line.substr(21, 4));
         var endChain = line.substr(31, 1);
         var endResi = parseInt(line.substr(33, 4));
         protein.helix.push([startChain, startResi, endChain, endResi]);
     } else if (recordName == 'CRYST1') {
         protein.a = parseFloat(line.substr(6, 9));
         protein.b = parseFloat(line.substr(15, 9));
         protein.c = parseFloat(line.substr(24, 9));
         protein.alpha = parseFloat(line.substr(33, 7));
         protein.beta = parseFloat(line.substr(40, 7));
         protein.gamma = parseFloat(line.substr(47, 7));
         protein.spacegroup = line.substr(55, 11);
         this.defineCell();
      } else if (recordName == 'REMARK') {
         var type = parseInt(line.substr(7, 3));
         if (type == 290 && line.substr(13, 5) == 'SMTRY') {
            var n = parseInt(line[18]) - 1;
            var m = parseInt(line.substr(21, 2));
            if (protein.symMat[m] == undefined) protein.symMat[m] = new THREE.Matrix4().identity();
            protein.symMat[m].elements[n] = parseFloat(line.substr(24, 9));
            protein.symMat[m].elements[n + 4] = parseFloat(line.substr(34, 9));
            protein.symMat[m].elements[n + 8] = parseFloat(line.substr(44, 9));
            protein.symMat[m].elements[n + 12] = parseFloat(line.substr(54, 10));
         } else if (type == 350 && line.substr(13, 5) == 'BIOMT') {
            var n = parseInt(line[18]) - 1;
            var m = parseInt(line.substr(21, 2));
            if (protein.biomtMatrices[m] == undefined) protein.biomtMatrices[m] = new THREE.Matrix4().identity();
            protein.biomtMatrices[m].elements[n] = parseFloat(line.substr(24, 9));
            protein.biomtMatrices[m].elements[n + 4] = parseFloat(line.substr(34, 9));
            protein.biomtMatrices[m].elements[n + 8] = parseFloat(line.substr(44, 9));
            protein.biomtMatrices[m].elements[n + 12] = parseFloat(line.substr(54, 10));
         } else if (type == 350 && line.substr(11, 11) == 'BIOMOLECULE') {
             protein.biomtMatrices = []; protein.biomtChains = '';
         } else if (type == 350 && line.substr(34, 6) == 'CHAINS') {
             protein.biomtChains += line.substr(41, 40);
         }
      } else if (recordName == 'HEADER') {
         protein.pdbID = line.substr(62, 4);
      } else if (recordName == 'TITLE ') {
         if (protein.title == undefined) protein.title = "";
            protein.title += line.substr(10, 70) + "\n"; // CHECK: why 60 is not enough???
      } else if (recordName == 'COMPND') {
              // TODO: Implement me!
      }
   }

   // Assign secondary structures 
   for (i = 0; i < atoms.length; i++) {
      atom = atoms[i]; if (atom == undefined) continue;

      var found = false;
      // MEMO: Can start chain and end chain differ?
      for (j = 0; j < protein.sheet.length; j++) {
         if (atom.chain != protein.sheet[j][0]) continue;
         if (atom.resi < protein.sheet[j][1]) continue;
         if (atom.resi > protein.sheet[j][3]) continue;
         atom.ss = 's';
         if (atom.resi == protein.sheet[j][1]) atom.ssbegin = true;
         if (atom.resi == protein.sheet[j][3]) atom.ssend = true;
      }
      for (j = 0; j < protein.helix.length; j++) {
         if (atom.chain != protein.helix[j][0]) continue;
         if (atom.resi < protein.helix[j][1]) continue;
         if (atom.resi > protein.helix[j][3]) continue;
         atom.ss = 'h';
         if (atom.resi == protein.helix[j][1]) atom.ssbegin = true;
         else if (atom.resi == protein.helix[j][3]) atom.ssend = true;
      }
   }
   protein.smallMolecule = false;
   return true;
};

// Catmull-Rom subdivision
GLmol.prototype.subdivide = function(_points, DIV) { // points as Vector3
   var ret = [];
   var points = _points;
   points = new Array(); // Smoothing test
   points.push(_points[0]);
   for (var i = 1, lim = _points.length - 1; i < lim; i++) {
      var p1 = _points[i], p2 = _points[i + 1];
      if (p1.smoothen) points.push(new TV3((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (p1.z + p2.z) / 2));
      else points.push(p1);
   }
   points.push(_points[_points.length - 1]);

   for (var i = -1, size = points.length; i <= size - 3; i++) {
      var p0 = points[(i == -1) ? 0 : i];
      var p1 = points[i + 1], p2 = points[i + 2];
      var p3 = points[(i == size - 3) ? size - 1 : i + 3];
      var v0 = new TV3().subVectors(p2, p0).multiplyScalar(0.5);
      var v1 = new TV3().subVectors(p3, p1).multiplyScalar(0.5);
      for (var j = 0; j < DIV; j++) {
         var t = 1.0 / DIV * j;
         var x = p1.x + t * v0.x 
                  + t * t * (-3 * p1.x + 3 * p2.x - 2 * v0.x - v1.x)
                  + t * t * t * (2 * p1.x - 2 * p2.x + v0.x + v1.x);
         var y = p1.y + t * v0.y 
                  + t * t * (-3 * p1.y + 3 * p2.y - 2 * v0.y - v1.y)
                  + t * t * t * (2 * p1.y - 2 * p2.y + v0.y + v1.y);
         var z = p1.z + t * v0.z 
                  + t * t * (-3 * p1.z + 3 * p2.z - 2 * v0.z - v1.z)
                  + t * t * t * (2 * p1.z - 2 * p2.z + v0.z + v1.z);
         ret.push(new TV3(x, y, z));
      }
   }
   ret.push(points[points.length - 1]);
   return ret;
};

GLmol.prototype.drawAtomsAsSphere = function(group, atomlist, defaultRadius, forceDefault, scale) {
   var sphereGeometry = new THREE.SphereGeometry(1, this.sphereQuality, this.sphereQuality); // r, seg, ring
   for (var i = 0; i < atomlist.length; i++) {
      var atom = this.atoms[atomlist[i]];
      if (atom == undefined) continue;

      var sphereMaterial = new THREE.MeshLambertMaterial({color: atom.color});
      var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      group.add(sphere);
      var r = (!forceDefault && this.vdwRadii[atom.elem] != undefined) ? this.vdwRadii[atom.elem] : defaultRadius;
      if (!forceDefault && scale) r *= scale;
      sphere.scale.x = sphere.scale.y = sphere.scale.z = r;
      sphere.position.x = atom.x;
      sphere.position.y = atom.y;
      sphere.position.z = atom.z;
   }
};

// about two times faster than sphere when div = 2
GLmol.prototype.drawAtomsAsIcosahedron = function(group, atomlist, defaultRadius, forceDefault) {
   var geo = this.IcosahedronGeometry();
   for (var i = 0; i < atomlist.length; i++) {
      var atom = this.atoms[atomlist[i]];
      if (atom == undefined) continue;

      var mat = new THREE.MeshLambertMaterial({color: atom.color});
      var sphere = new THREE.Mesh(geo, mat);
      sphere.scale.x = sphere.scale.y = sphere.scale.z = (!forceDefault && this.vdwRadii[atom.elem] != undefined) ? this.vdwRadii[atom.elem] : defaultRadius;
      group.add(sphere);
      sphere.position.x = atom.x;
      sphere.position.y = atom.y;
      sphere.position.z = atom.z;
   }
};

GLmol.prototype.isConnected = function(atom1, atom2) {
   var s = atom1.bonds.indexOf(atom2.serial);
   if (s != -1) return atom1.bondOrder[s];

   if (this.protein.smallMolecule && (atom1.hetflag || atom2.hetflag)) return 0; // CHECK: or should I ?

   var distSquared = (atom1.x - atom2.x) * (atom1.x - atom2.x) + 
                     (atom1.y - atom2.y) * (atom1.y - atom2.y) + 
                     (atom1.z - atom2.z) * (atom1.z - atom2.z);

//   if (atom1.altLoc != atom2.altLoc) return false;
   if (isNaN(distSquared)) return 0;
   if (distSquared < 0.5) return 0; // maybe duplicate position.

   if (distSquared > 1.3 && (atom1.elem == 'H' || atom2.elem == 'H' || atom1.elem == 'D' || atom2.elem == 'D')) return 0;
   if (distSquared < 3.42 && (atom1.elem == 'S' || atom2.elem == 'S')) return 1;
   if (distSquared > 2.78) return 0;
   return 1;
};

GLmol.prototype.drawBondAsStickSub = function(group, atom1, atom2, bondR, order) {
   var delta, tmp;
   if (order > 1) delta = this.calcBondDelta(atom1, atom2, bondR * 2.3);
   var p1 = new TV3(atom1.x, atom1.y, atom1.z);
   var p2 = new TV3(atom2.x, atom2.y, atom2.z);
   var mp = p1.clone().add(p2).multiplyScalar(0.5);

   var c1 = new TCo(atom1.color), c2 = new TCo(atom2.color);
   if (order == 1 || order == 3) {
      this.drawCylinder(group, p1, mp, bondR, atom1.color);
      this.drawCylinder(group, p2, mp, bondR, atom2.color);
   }
   if (order > 1) {
      tmp = mp.clone().add(delta);
      this.drawCylinder(group, p1.clone().add(delta), tmp, bondR, atom1.color);
      this.drawCylinder(group, p2.clone().add(delta), tmp, bondR, atom2.color);
      tmp = mp.clone().sub(delta);
      this.drawCylinder(group, p1.clone().sub(delta), tmp, bondR, atom1.color);
      this.drawCylinder(group, p2.clone().sub(delta), tmp, bondR, atom2.color);
   }
};

GLmol.prototype.drawBondsAsStick = function(group, atomlist, bondR, atomR, ignoreNonbonded, multipleBonds, scale) {
   var sphereGeometry = new THREE.SphereGeometry(1, this.sphereQuality, this.sphereQuality);
   var nAtoms = atomlist.length, mp;
   var forSpheres = [];
   if (!!multipleBonds) bondR /= 2.5;
   for (var _i = 0; _i < nAtoms; _i++) {
      var i = atomlist[_i];
      var atom1 = this.atoms[i];
      if (atom1 == undefined) continue;
      for (var _j = _i + 1; _j < _i + 30 && _j < nAtoms; _j++) {
         var j = atomlist[_j];
         var atom2 = this.atoms[j];
         if (atom2 == undefined) continue;
         var order = this.isConnected(atom1, atom2);
         if (order == 0) continue;
         atom1.connected = atom2.connected = true;
         this.drawBondAsStickSub(group, atom1, atom2, bondR, (!!multipleBonds) ? order : 1);
      }
      for (var _j = 0; _j < atom1.bonds.length; _j++) {
         var j = atom1.bonds[_j];
         if (j < i + 30) continue; // be conservative!
         if (atomlist.indexOf(j) == -1) continue;
         var atom2 = this.atoms[j];
         if (atom2 == undefined) continue;
         atom1.connected = atom2.connected = true;
         this.drawBondAsStickSub(group, atom1, atom2, bondR, (!!multipleBonds) ? atom1.bondOrder[_j] : 1);
      }
      if (atom1.connected) forSpheres.push(i);
   }
   this.drawAtomsAsSphere(group, forSpheres, atomR, !scale, scale);
};

GLmol.prototype.defineCell = function() {
    var p = this.protein;
    if (p.a == undefined) return;

    p.ax = p.a;
    p.ay = 0;
    p.az = 0;
    p.bx = p.b * Math.cos(Math.PI / 180.0 * p.gamma);
    p.by = p.b * Math.sin(Math.PI / 180.0 * p.gamma);
    p.bz = 0;
    p.cx = p.c * Math.cos(Math.PI / 180.0 * p.beta);
    p.cy = p.c * (Math.cos(Math.PI / 180.0 * p.alpha) - 
               Math.cos(Math.PI / 180.0 * p.gamma) 
             * Math.cos(Math.PI / 180.0 * p.beta)
             / Math.sin(Math.PI / 180.0 * p.gamma));
    p.cz = Math.sqrt(p.c * p.c * Math.sin(Math.PI / 180.0 * p.beta)
               * Math.sin(Math.PI / 180.0 * p.beta) - p.cy * p.cy);
};

GLmol.prototype.drawUnitcell = function(group) {
    var p = this.protein;
    if (p.a == undefined) return;

    var vertices = [[0, 0, 0], [p.ax, p.ay, p.az], [p.bx, p.by, p.bz], [p.ax + p.bx, p.ay + p.by, p.az + p.bz],
          [p.cx, p.cy, p.cz], [p.cx + p.ax, p.cy + p.ay,  p.cz + p.az], [p.cx + p.bx, p.cy + p.by, p.cz + p.bz], [p.cx + p.ax + p.bx, p.cy + p.ay + p.by, p.cz + p.az + p.bz]];
    var edges = [0, 1, 0, 2, 1, 3, 2, 3, 4, 5, 4, 6, 5, 7, 6, 7, 0, 4, 1, 5, 2, 6, 3, 7];    

    var geo = new THREE.Geometry();
    for (var i = 0; i < edges.length; i++) {
       geo.vertices.push(new TV3(vertices[edges[i]][0], vertices[edges[i]][1], vertices[edges[i]][2]));
    }
   var lineMaterial = new THREE.LineBasicMaterial({linewidth: 1, color: 0xcccccc});
   var line = new THREE.Line(geo, lineMaterial);
   line.type = THREE.LinePieces;
   group.add(line);
};

// TODO: Find inner side of a ring
GLmol.prototype.calcBondDelta = function(atom1, atom2, sep) {
   var dot;
   var axis = new TV3(atom1.x - atom2.x, atom1.y - atom2.y, atom1.z - atom2.z).normalize();
   var found = null;
   for (var i = 0; i < atom1.bonds.length && !found; i++) {
      var atom = this.atoms[atom1.bonds[i]]; if (!atom) continue;
      if (atom.serial != atom2.serial && atom.elem != 'H') found = atom;
   }
   for (var i = 0; i < atom2.bonds.length && !found; i++) {
      var atom = this.atoms[atom2.bonds[i]]; if (!atom) continue;
      if (atom.serial != atom1.serial && atom.elem != 'H') found = atom;
   }
   if (found) {
      var tmp = new TV3(atom1.x - found.x, atom1.y - found.y, atom1.z - found.z).normalize();
      dot = tmp.dot(axis);
      delta = new TV3(tmp.x - axis.x * dot, tmp.y - axis.y * dot, tmp.z - axis.z * dot);
   }
   if (!found || Math.abs(dot - 1) < 0.001 || Math.abs(dot + 1) < 0.001) {
      if (axis.x < 0.01 && axis.y < 0.01) {
         delta = new TV3(0, -axis.z, axis.y);
      } else {
         delta = new TV3(-axis.y, axis.x, 0);
      }
   }
   delta.normalize().multiplyScalar(sep);
   return delta;
};

GLmol.prototype.drawBondsAsLineSub = function(geo, atom1, atom2, order) {
   var delta, tmp, vs = geo.vertices, cs = geo.colors;
   if (order > 1) delta = this.calcBondDelta(atom1, atom2, 0.15);
   var p1 = new TV3(atom1.x, atom1.y, atom1.z);
   var p2 = new TV3(atom2.x, atom2.y, atom2.z);
   var mp = p1.clone().add(p2).multiplyScalar(0.5);

   var c1 = new TCo(atom1.color), c2 = new TCo(atom2.color);
   if (order == 1 || order == 3) {
      vs.push(p1); cs.push(c1); vs.push(mp); cs.push(c1);
      vs.push(p2); cs.push(c2); vs.push(mp); cs.push(c2);
   }
   if (order > 1) {
      vs.push(p1.clone().add(delta)); cs.push(c1);
      vs.push(tmp = mp.clone().add(delta)); cs.push(c1);
      vs.push(p2.clone().add(delta)); cs.push(c2);
      vs.push(tmp); cs.push(c2);
      vs.push(p1.clone().sub(delta)); cs.push(c1);
      vs.push(tmp = mp.clone().sub(delta)); cs.push(c1);
      vs.push(p2.clone().sub(delta)); cs.push(c2);
      vs.push(tmp); cs.push(c2);
   }
};

GLmol.prototype.drawBondsAsLine = function(group, atomlist, lineWidth) {
   var geo = new THREE.Geometry();   
   var nAtoms = atomlist.length;

   for (var _i = 0; _i < nAtoms; _i++) {
      var i = atomlist[_i];
      var  atom1 = this.atoms[i];
      if (atom1 == undefined) continue;
      for (var _j = _i + 1; _j < _i + 30 && _j < nAtoms; _j++) {
         var j = atomlist[_j];
         var atom2 = this.atoms[j];
         if (atom2 == undefined) continue;
         var order = this.isConnected(atom1, atom2);
         if (order == 0) continue;

         this.drawBondsAsLineSub(geo, atom1, atom2, order);
      }
      for (var _j = 0; _j < atom1.bonds.length; _j++) {
          var j = atom1.bonds[_j];
          if (j < i + 30) continue; // be conservative!
          if (atomlist.indexOf(j) == -1) continue;
          var atom2 = this.atoms[j];
          if (atom2 == undefined) continue;
          this.drawBondsAsLineSub(geo, atom1, atom2, atom1.bondOrder[_j]);
      }
    }
   var lineMaterial = new THREE.LineBasicMaterial({linewidth: lineWidth});
   lineMaterial.vertexColors = true;

   var line = new THREE.Line(geo, lineMaterial);
   line.type = THREE.LinePieces;
   group.add(line);
};

GLmol.prototype.drawSmoothCurve = function(group, _points, width, colors, div) {
   if (_points.length == 0) return;

   div = (div == undefined) ? 5 : div;

   var geo = new THREE.Geometry();
   var points = this.subdivide(_points, div);

   for (var i = 0; i < points.length; i++) {
      geo.vertices.push(points[i]);
      geo.colors.push(new TCo(colors[(i == 0) ? 0 : Math.round((i - 1) / div)]));
  }
  var lineMaterial = new THREE.LineBasicMaterial({linewidth: width});
  lineMaterial.vertexColors = true;
  var line = new THREE.Line(geo, lineMaterial);
  line.type = THREE.LineStrip;
  group.add(line);
};

GLmol.prototype.drawAsCross = function(group, atomlist, delta) {
   var geo = new THREE.Geometry();
   var points = [[delta, 0, 0], [-delta, 0, 0], [0, delta, 0], [0, -delta, 0], [0, 0, delta], [0, 0, -delta]];
 
   for (var i = 0, lim = atomlist.length; i < lim; i++) {
      var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      var c = new TCo(atom.color);
      for (var j = 0; j < 6; j++) {
         geo.vertices.push(new TV3(atom.x + points[j][0], atom.y + points[j][1], atom.z + points[j][2]));
         geo.colors.push(c);
      }
  }
  var lineMaterial = new THREE.LineBasicMaterial({linewidth: this.lineWidth});
  lineMaterial.vertexColors = true;
  var line = new THREE.Line(geo, lineMaterial, THREE.LinePieces);
  group.add(line);
};

// FIXME: Winkled...
GLmol.prototype.drawSmoothTube = function(group, _points, colors, radii) {
   if (_points.length < 2) return;

   var circleDiv = this.tubeDIV, axisDiv = this.axisDIV;
   var geo = new THREE.Geometry();
   var points = this.subdivide(_points, axisDiv);
   var prevAxis1 = new TV3(), prevAxis2;

   for (var i = 0, lim = points.length; i < lim; i++) {
      var r, idx = (i - 1) / axisDiv;
      if (i == 0) r = radii[0];
      else { 
         if (idx % 1 == 0) r = radii[idx];
         else {
            var floored = Math.floor(idx);
            var tmp = idx - floored;
            r = radii[floored] * tmp + radii[floored + 1] * (1 - tmp);
         }
      }
      var delta, axis1, axis2;

      if (i < lim - 1) {
         delta = new TV3().subVectors(points[i], points[i + 1]);
         axis1 = new TV3(0, - delta.z, delta.y).normalize().multiplyScalar(r);
         axis2 = new TV3().crossVectors(delta, axis1).normalize().multiplyScalar(r);
//      var dir = 1, offset = 0;
         if (prevAxis1.dot(axis1) < 0) {
                 axis1.negate(); axis2.negate();  //dir = -1;//offset = 2 * Math.PI / axisDiv;
         }
         prevAxis1 = axis1; prevAxis2 = axis2;
      } else {
         axis1 = prevAxis1; axis2 = prevAxis2;
      }

      for (var j = 0; j < circleDiv; j++) {
         var angle = 2 * Math.PI / circleDiv * j; //* dir  + offset;
         var c = Math.cos(angle), s = Math.sin(angle);
         geo.vertices.push(new TV3(
         points[i].x + c * axis1.x + s * axis2.x,
         points[i].y + c * axis1.y + s * axis2.y, 
         points[i].z + c * axis1.z + s * axis2.z));
      }
   }

   var offset = 0;
   for (var i = 0, lim = points.length - 1; i < lim; i++) {
      var c =  new TCo(colors[Math.round((i - 1)/ axisDiv)]);

      var reg = 0;
      var r1 = new TV3().subVectors(geo.vertices[offset], geo.vertices[offset + circleDiv]).lengthSq();
      var r2 = new TV3().subVectors(geo.vertices[offset], geo.vertices[offset + circleDiv + 1]).lengthSq();
      if (r1 > r2) {r1 = r2; reg = 1;};
      for (var j = 0; j < circleDiv; j++) {
          geo.faces.push(new TF3(offset + j, offset + (j + reg) % circleDiv + circleDiv, offset + (j + 1) % circleDiv));
          geo.faces.push(new TF3(offset + (j + 1) % circleDiv, offset + (j + reg) % circleDiv + circleDiv, offset + (j + reg + 1) % circleDiv + circleDiv));
          geo.faces[geo.faces.length -2].color = c;
          geo.faces[geo.faces.length -1].color = c;
      }
      offset += circleDiv;
   }
   geo.computeFaceNormals();
   geo.computeVertexNormals(false);
   var mat = new THREE.MeshLambertMaterial();
   mat.vertexColors = THREE.FaceColors;
   var mesh = new THREE.Mesh(geo, mat);
   mesh.doubleSided = true;
   group.add(mesh);
};


GLmol.prototype.drawMainchainCurve = function(group, atomlist, curveWidth, atomName, div) {
   var points = [], colors = [];
   var currentChain, currentResi;
   if (div == undefined) div = 5;

   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]];
      if (atom == undefined) continue;

      if ((atom.atom == atomName) && !atom.hetflag) {
         if (currentChain != atom.chain || currentResi + 1 != atom.resi) {
            this.drawSmoothCurve(group, points, curveWidth, colors, div);
            points = [];
            colors = [];
         }
         points.push(new TV3(atom.x, atom.y, atom.z));
         colors.push(atom.color);
         currentChain = atom.chain;
         currentResi = atom.resi;
      }
   }
    this.drawSmoothCurve(group, points, curveWidth, colors, div);
};

GLmol.prototype.drawMainchainTube = function(group, atomlist, atomName, radius) {
   var points = [], colors = [], radii = [];
   var currentChain, currentResi;
   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]];
      if (atom == undefined) continue;

      if ((atom.atom == atomName) && !atom.hetflag) {
         if (currentChain != atom.chain || currentResi + 1 != atom.resi) {
            this.drawSmoothTube(group, points, colors, radii);
            points = []; colors = []; radii = [];
         }
         points.push(new TV3(atom.x, atom.y, atom.z));
         if (radius == undefined) {
            radii.push((atom.b > 0) ? atom.b / 100 : 0.3);
         } else {
            radii.push(radius);
         }
         colors.push(atom.color);
         currentChain = atom.chain;
         currentResi = atom.resi;
      }
   }
   this.drawSmoothTube(group, points, colors, radii);
};

GLmol.prototype.drawStrip = function(group, p1, p2, colors, div, thickness) {
   if ((p1.length) < 2) return;
   div = div || this.axisDIV;
   p1 = this.subdivide(p1, div);
   p2 = this.subdivide(p2, div);
   if (!thickness) return this.drawThinStrip(group, p1, p2, colors, div);

   var geo = new THREE.Geometry();
   var vs = geo.vertices, fs = geo.faces;
   var axis, p1v, p2v, a1v, a2v;
   for (var i = 0, lim = p1.length; i < lim; i++) {
      vs.push(p1v = p1[i]); // 0
      vs.push(p1v); // 1
      vs.push(p2v = p2[i]); // 2
      vs.push(p2v); // 3
      if (i < lim - 1) {
         var toNext = p1[i + 1].clone().sub(p1[i]);
         var toSide = p2[i].clone().sub(p1[i]);
         axis = toSide.cross(toNext).normalize().multiplyScalar(thickness);
      }
      vs.push(a1v = p1[i].clone().add(axis)); // 4
      vs.push(a1v); // 5
      vs.push(a2v = p2[i].clone().add(axis)); // 6
      vs.push(a2v); // 7
   }
   var faces = [[0, 2, -6, -8], [-4, -2, 6, 4], [7, 3, -5, -1], [-3, -7, 1, 5]];
   for (var i = 1, lim = p1.length; i < lim; i++) {
      var offset = 8 * i, color = new TCo(colors[Math.round((i - 1)/ div)]);
      for (var j = 0; j < 4; j++) {
         var f = new THREE.Face4(offset + faces[j][0], offset + faces[j][1], offset + faces[j][2], offset + faces[j][3], undefined, color);
         fs.push(f);
      }
   }
   var vsize = vs.length - 8; // Cap
   for (var i = 0; i < 4; i++) {vs.push(vs[i * 2]); vs.push(vs[vsize + i * 2])};
   vsize += 8;
   fs.push(new THREE.Face4(vsize, vsize + 2, vsize + 6, vsize + 4, undefined, fs[0].color));
   fs.push(new THREE.Face4(vsize + 1, vsize + 5, vsize + 7, vsize + 3, undefined, fs[fs.length - 3].color));
   geo.computeFaceNormals();
   geo.computeVertexNormals(false);
   var material =  new THREE.MeshLambertMaterial();
   material.vertexColors = THREE.FaceColors;
   var mesh = new THREE.Mesh(geo, material);
   mesh.doubleSided = true;
   group.add(mesh);
};


GLmol.prototype.drawThinStrip = function(group, p1, p2, colors, div) {
   var geo = new THREE.Geometry();
   for (var i = 0, lim = p1.length; i < lim; i++) {
      geo.vertices.push(p1[i]); // 2i
      geo.vertices.push(p2[i]); // 2i + 1
   }
   for (var i = 1, lim = p1.length; i < lim; i++) {
      var f = new THREE.Face4(2 * i, 2 * i + 1, 2 * i - 1, 2 * i - 2);
      f.color = new TCo(colors[Math.round((i - 1)/ div)]);
      geo.faces.push(f);
   }
   geo.computeFaceNormals();
   geo.computeVertexNormals(false);
   var material =  new THREE.MeshLambertMaterial();
   material.vertexColors = THREE.FaceColors;
   var mesh = new THREE.Mesh(geo, material);
   mesh.doubleSided = true;
   group.add(mesh);
};


GLmol.prototype.IcosahedronGeometry = function() {
   if (!this.icosahedron) this.icosahedron = new THREE.IcosahedronGeometry(1);
   return this.icosahedron;
};

logged = 0;

function rotateX(matrix,angle)
{
	var te = matrix.elements;
	var m12 = te[4];
	var m22 = te[5];
	var m32 = te[6];
	var m42 = te[7];
	var m13 = te[8];
	var m23 = te[9];
	var m33 = te[10];
	var m43 = te[11];
	var c = Math.cos( angle );//0
	var s = Math.sin( angle );//1

	te[4] = c * m12 + s * m13;//8
	te[5] = c * m22 + s * m23;//9
	te[6] = c * m32 + s * m33;//10
	te[7] = c * m42 + s * m43;//11

	te[8] = c * m13 - s * m12;//-4
	te[9] = c * m23 - s * m22;//-5
	te[10] = c * m33 - s * m32;//-6
	te[11] = c * m43 - s * m42;//-7
}

GLmol.prototype.drawCylinder = function(group, from, to, radius, color, cap) {
   if (!from || !to) return;

   var midpoint = new TV3().addVectors(from, to).multiplyScalar(0.5);
   var color = new TCo(color);

   if (!this.cylinderGeometry) {
      this.cylinderGeometry = new THREE.CylinderGeometry(1, 1, 1, this.cylinderQuality, 1, !cap);
      this.cylinderGeometry.faceUvs = [];
      this.faceVertexUvs = [];
   }
   var cylinderMaterial = new THREE.MeshLambertMaterial({color: color.getHex()});
   var cylinder = new THREE.Mesh(this.cylinderGeometry, cylinderMaterial);
   cylinder.position = midpoint;
   cylinder.lookAt(from);
   cylinder.updateMatrix();
   cylinder.matrixAutoUpdate = false;
   
//   var m = new THREE.Matrix4().makeScale(radius, radius, from.distanceTo(to));
//   m.rotateX(Math.PI / 2);
   //changed in order to update, may screw things up!
   var m = new THREE.Matrix4().makeScale(radius, radius, from.distanceTo(to));
   if(!logged)
	  {
	   console.log(new THREE.Matrix4().makeRotationX ( Math.PI / 2 ))
	   logged = 1;
	  }
   rotateX(m,Math.PI / 2);
   
   
   
   cylinder.matrix.multiply(m);
   group.add(cylinder);
};

// FIXME: transition!
GLmol.prototype.drawHelixAsCylinder = function(group, atomlist, radius) {
   var start = null;
   var currentChain, currentResi;

   var others = [], beta = [];

   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]];
      if (atom == undefined || atom.hetflag) continue;
      if ((atom.ss != 'h' && atom.ss != 's') || atom.ssend || atom.ssbegin) others.push(atom.serial);
      if (atom.ss == 's') beta.push(atom.serial);
      if (atom.atom != 'CA') continue;

      if (atom.ss == 'h' && atom.ssend) {
         if (start != null) this.drawCylinder(group, new TV3(start.x, start.y, start.z), new TV3(atom.x, atom.y, atom.z), radius, atom.color, true);
         start = null;
      }
      currentChain = atom.chain;
      currentResi = atom.resi;
      if (start == null && atom.ss == 'h' && atom.ssbegin) start = atom;
   }
   if (start != null) this.drawCylinder(group, new TV3(start.x, start.y, start.z), new TV3(atom.x, atom.y, atom.z), radius, atom.color);
   this.drawMainchainTube(group, others, "CA", 0.3);
   this.drawStrand(group, beta, undefined, undefined, true,  0, this.helixSheetWidth, false, this.thickness * 2);
};

GLmol.prototype.drawCartoon = function(group, atomlist, doNotSmoothen, thickness) {
   this.drawStrand(group, atomlist, 2, undefined, true, undefined, undefined, doNotSmoothen, thickness);
};

GLmol.prototype.drawStrand = function(group, atomlist, num, div, fill, coilWidth, helixSheetWidth, doNotSmoothen, thickness) {
   num = num || this.strandDIV;
   div = div || this.axisDIV;
   coilWidth = coilWidth || this.coilWidth;
   doNotSmoothen == (doNotSmoothen == undefined) ? false : doNotSmoothen;
   helixSheetWidth = helixSheetWidth || this.helixSheetWidth;
   var points = []; for (var k = 0; k < num; k++) points[k] = [];
   var colors = [];
   var currentChain, currentResi, currentCA;
   var prevCO = null, ss=null, ssborder = false;

   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]];
      if (atom == undefined) continue;

      if ((atom.atom == 'O' || atom.atom == 'CA') && !atom.hetflag) {
         if (atom.atom == 'CA') {
            if (currentChain != atom.chain || currentResi + 1 != atom.resi) {
               for (var j = 0; !thickness && j < num; j++)
                  this.drawSmoothCurve(group, points[j], 1 ,colors, div);
               if (fill) this.drawStrip(group, points[0], points[num - 1], colors, div, thickness);
               var points = []; for (var k = 0; k < num; k++) points[k] = [];
               colors = [];
               prevCO = null; ss = null; ssborder = false;
            }
            currentCA = new TV3(atom.x, atom.y, atom.z);
            currentChain = atom.chain;
            currentResi = atom.resi;
            ss = atom.ss; ssborder = atom.ssstart || atom.ssend;
            colors.push(atom.color);
         } else { // O
            var O = new TV3(atom.x, atom.y, atom.z);
            O.sub(currentCA);
            O.normalize(); // can be omitted for performance
            O.multiplyScalar((ss == 'c') ? coilWidth : helixSheetWidth); 
            if (prevCO != undefined && O.dot(prevCO) < 0) O.negate();
            prevCO = O;
            for (var j = 0; j < num; j++) {
               var delta = -1 + 2 / (num - 1) * j;
               var v = new TV3(currentCA.x + prevCO.x * delta, 
                               currentCA.y + prevCO.y * delta, currentCA.z + prevCO.z * delta);
               if (!doNotSmoothen && ss == 's') v.smoothen = true;
               points[j].push(v);
            }                         
         }
      }
   }
   for (var j = 0; !thickness && j < num; j++)
      this.drawSmoothCurve(group, points[j], 1 ,colors, div);
   if (fill) this.drawStrip(group, points[0], points[num - 1], colors, div, thickness);
};

GLmol.prototype.drawNucleicAcidLadderSub = function(geo, lineGeo, atoms, color) {
//        color.r *= 0.9; color.g *= 0.9; color.b *= 0.9;
   if (atoms[0] != undefined && atoms[1] != undefined && atoms[2] != undefined &&
       atoms[3] != undefined && atoms[4] != undefined && atoms[5] != undefined) {
      var baseFaceId = geo.vertices.length;
      for (var i = 0; i <= 5; i++) geo.vertices.push(atoms[i]);
          geo.faces.push(new TF3(baseFaceId, baseFaceId + 1, baseFaceId + 2));
          geo.faces.push(new TF3(baseFaceId, baseFaceId + 2, baseFaceId + 3));
          geo.faces.push(new TF3(baseFaceId, baseFaceId + 3, baseFaceId + 4));
          geo.faces.push(new TF3(baseFaceId, baseFaceId + 4, baseFaceId + 5));
          for (var j = geo.faces.length - 4, lim = geo.faces.length; j < lim; j++) geo.faces[j].color = color;
    }
    if (atoms[4] != undefined && atoms[3] != undefined && atoms[6] != undefined &&
       atoms[7] != undefined && atoms[8] != undefined) {
       var baseFaceId = geo.vertices.length;
       geo.vertices.push(atoms[4]);
       geo.vertices.push(atoms[3]);
       geo.vertices.push(atoms[6]);
       geo.vertices.push(atoms[7]);
       geo.vertices.push(atoms[8]);
       for (var i = 0; i <= 4; i++) geo.colors.push(color);
       geo.faces.push(new TF3(baseFaceId, baseFaceId + 1, baseFaceId + 2));
       geo.faces.push(new TF3(baseFaceId, baseFaceId + 2, baseFaceId + 3));
       geo.faces.push(new TF3(baseFaceId, baseFaceId + 3, baseFaceId + 4));
       for (var j = geo.faces.length - 3, lim = geo.faces.length; j < lim; j++) geo.faces[j].color = color;
    }
};

GLmol.prototype.drawNucleicAcidLadder = function(group, atomlist) {
   var geo = new THREE.Geometry();
   var lineGeo = new THREE.Geometry();
   var baseAtoms = ["N1", "C2", "N3", "C4", "C5", "C6", "N9", "C8", "N7"];
   var currentChain, currentResi, currentComponent = new Array(baseAtoms.length);
   var color = new TCo(0xcc0000);
   
   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]];
      if (atom == undefined || atom.hetflag) continue;

      if (atom.resi != currentResi || atom.chain != currentChain) {
         this.drawNucleicAcidLadderSub(geo, lineGeo, currentComponent, color);
         currentComponent = new Array(baseAtoms.length);
      }
      var pos = baseAtoms.indexOf(atom.atom);
      if (pos != -1) currentComponent[pos] = new TV3(atom.x, atom.y, atom.z);
      if (atom.atom == 'O3\'') color = new TCo(atom.color);
      currentResi = atom.resi; currentChain = atom.chain;
   }
   this.drawNucleicAcidLadderSub(geo, lineGeo, currentComponent, color);
   geo.computeFaceNormals();
   var mat = new THREE.MeshLambertMaterial();
   mat.vertexColors = THREE.VertexColors;
   var mesh = new THREE.Mesh(geo, mat);
   mesh.doubleSided = true;
   group.add(mesh);
};

GLmol.prototype.drawNucleicAcidStick = function(group, atomlist) {
   var currentChain, currentResi, start = null, end = null;
   
   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]];
      if (atom == undefined || atom.hetflag) continue;

      if (atom.resi != currentResi || atom.chain != currentChain) {
         if (start != null && end != null)
            this.drawCylinder(group, new TV3(start.x, start.y, start.z), 
                              new TV3(end.x, end.y, end.z), 0.3, start.color, true);
         start = null; end = null;
      }
      if (atom.atom == 'O3\'') start = atom;
      if (atom.resn == '  A' || atom.resn == '  G' || atom.resn == ' DA' || atom.resn == ' DG') {
         if (atom.atom == 'N1')  end = atom; //  N1(AG), N3(CTU)
      } else if (atom.atom == 'N3') {
         end = atom;
      }
      currentResi = atom.resi; currentChain = atom.chain;
   }
   if (start != null && end != null)
      this.drawCylinder(group, new TV3(start.x, start.y, start.z), 
                        new TV3(end.x, end.y, end.z), 0.3, start.color, true);
};

GLmol.prototype.drawNucleicAcidLine = function(group, atomlist) {
   var currentChain, currentResi, start = null, end = null;
   var geo = new THREE.Geometry();

   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]];
      if (atom == undefined || atom.hetflag) continue;

      if (atom.resi != currentResi || atom.chain != currentChain) {
         if (start != null && end != null) {
            geo.vertices.push(new TV3(start.x, start.y, start.z));
            geo.colors.push(new TCo(start.color));
            geo.vertices.push(new TV3(end.x, end.y, end.z));
            geo.colors.push(new TCo(start.color));
         }
         start = null; end = null;
      }
      if (atom.atom == 'O3\'') start = atom;
      if (atom.resn == '  A' || atom.resn == '  G' || atom.resn == ' DA' || atom.resn == ' DG') {
         if (atom.atom == 'N1')  end = atom; //  N1(AG), N3(CTU)
      } else if (atom.atom == 'N3') {
         end = atom;
      }
      currentResi = atom.resi; currentChain = atom.chain;
   }
   if (start != null && end != null) {
      geo.vertices.push(new TV3(start.x, start.y, start.z));
      geo.colors.push(new TCo(start.color));
      geo.vertices.push(new TV3(end.x, end.y, end.z));
      geo.colors.push(new TCo(start.color));
    }
   var mat =  new THREE.LineBasicMaterial({linewidth: 1, linejoin: false});
   mat.linewidth = 1.5; mat.vertexColors = true;
   var line = new THREE.Line(geo, mat, THREE.LinePieces);
   group.add(line);
};

GLmol.prototype.drawCartoonNucleicAcid = function(group, atomlist, div, thickness) {
        this.drawStrandNucleicAcid(group, atomlist, 2, div, true, undefined, thickness);
};

GLmol.prototype.drawStrandNucleicAcid = function(group, atomlist, num, div, fill, nucleicAcidWidth, thickness) {
   nucleicAcidWidth = nucleicAcidWidth || this.nucleicAcidWidth;
   div = div || this.axisDIV;
   num = num || this.nucleicAcidStrandDIV;
   var points = []; for (var k = 0; k < num; k++) points[k] = [];
   var colors = [];
   var currentChain, currentResi, currentO3;
   var prevOO = null;

   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]];
      if (atom == undefined) continue;

      if ((atom.atom == 'O3\'' || atom.atom == 'OP2') && !atom.hetflag) {
         if (atom.atom == 'O3\'') { // to connect 3' end. FIXME: better way to do?
            if (currentChain != atom.chain || currentResi + 1 != atom.resi) {               
               if (currentO3) {
                  for (var j = 0; j < num; j++) {
                     var delta = -1 + 2 / (num - 1) * j;
                     points[j].push(new TV3(currentO3.x + prevOO.x * delta, 
                      currentO3.y + prevOO.y * delta, currentO3.z + prevOO.z * delta));
                  }
               }
               if (fill) this.drawStrip(group, points[0], points[1], colors, div, thickness);
               for (var j = 0; !thickness && j < num; j++)
                  this.drawSmoothCurve(group, points[j], 1 ,colors, div);
               var points = []; for (var k = 0; k < num; k++) points[k] = [];
               colors = [];
               prevOO = null;
            }
            currentO3 = new TV3(atom.x, atom.y, atom.z);
            currentChain = atom.chain;
            currentResi = atom.resi;
            colors.push(atom.color);
         } else { // OP2
            if (!currentO3) {prevOO = null; continue;} // for 5' phosphate (e.g. 3QX3)
            var O = new TV3(atom.x, atom.y, atom.z);
            O.sub(currentO3);
            O.normalize().multiplyScalar(nucleicAcidWidth);  // TODO: refactor
            if (prevOO != undefined && O.dot(prevOO) < 0) {
               O.negate();
            }
            prevOO = O;
            for (var j = 0; j < num; j++) {
               var delta = -1 + 2 / (num - 1) * j;
               points[j].push(new TV3(currentO3.x + prevOO.x * delta, 
                 currentO3.y + prevOO.y * delta, currentO3.z + prevOO.z * delta));
            }
            currentO3 = null;
         }
      }
   }
   if (currentO3) {
      for (var j = 0; j < num; j++) {
         var delta = -1 + 2 / (num - 1) * j;
         points[j].push(new TV3(currentO3.x + prevOO.x * delta, 
           currentO3.y + prevOO.y * delta, currentO3.z + prevOO.z * delta));
      }
   }
   if (fill) this.drawStrip(group, points[0], points[1], colors, div, thickness); 
   for (var j = 0; !thickness && j < num; j++)
      this.drawSmoothCurve(group, points[j], 1 ,colors, div);
};

GLmol.prototype.drawDottedLines = function(group, points, color) {
    var geo = new THREE.Geometry();
    var step = 0.3;

    for (var i = 0, lim = Math.floor(points.length / 2); i < lim; i++) {
        var p1 = points[2 * i], p2 = points[2 * i + 1];
        var delta = p2.clone().sub(p1);
        var dist = delta.length();
        delta.normalize().multiplyScalar(step);
        var jlim =  Math.floor(dist / step);
        for (var j = 0; j < jlim; j++) {
           var p = new TV3(p1.x + delta.x * j, p1.y + delta.y * j, p1.z + delta.z * j);
           geo.vertices.push(p);
        }
        if (jlim % 2 == 1) geo.vertices.push(p2);
    }

    var mat = new THREE.LineBasicMaterial({'color': color.getHex()});
    mat.linewidth = 2;
    var line = new THREE.Line(geo, mat, THREE.LinePieces);
    group.add(line);
};

GLmol.prototype.getAllAtoms = function() {
   var ret = [];
   for (var i in this.atoms) {
      ret.push(this.atoms[i].serial);
   }
   return ret;
};

// Probably I can refactor using higher-order functions.
GLmol.prototype.getHetatms = function(atomlist) {
   var ret = [];
   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      if (atom.hetflag) ret.push(atom.serial);
   }
   return ret;
};

GLmol.prototype.removeSolvents = function(atomlist) {
   var ret = [];
   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      if (atom.resn != 'HOH') ret.push(atom.serial);
   }
   return ret;
};

GLmol.prototype.getProteins = function(atomlist) {
   var ret = [];
   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      if (!atom.hetflag) ret.push(atom.serial);
   }
   return ret;
};

// TODO: Test
GLmol.prototype.excludeAtoms = function(atomlist, deleteList) {
   var ret = [];
   var blackList = new Object();
   for (var _i in deleteList) blackList[deleteList[_i]] = true;

   for (var _i in atomlist) {
      var i = atomlist[_i];

      if (!blackList[i]) ret.push(i);
   }
   return ret;
};

GLmol.prototype.getSidechains = function(atomlist) {
   var ret = [];
   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      if (atom.hetflag) continue;
      if (atom.atom == 'C' || atom.atom == 'O' || (atom.atom == 'N' && atom.resn != "PRO")) continue;
      ret.push(atom.serial);
   }
   return ret;
};

GLmol.prototype.getAtomsWithin = function(atomlist, extent) {
   var ret = [];

   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      if (atom.x < extent[0][0] || atom.x > extent[1][0]) continue;
      if (atom.y < extent[0][1] || atom.y > extent[1][1]) continue;
      if (atom.z < extent[0][2] || atom.z > extent[1][2]) continue;
      ret.push(atom.serial);      
   }
   return ret;
};

GLmol.prototype.getExtent = function(atomlist) {
   var xmin = ymin = zmin = 9999;
   var xmax = ymax = zmax = -9999;
   var xsum = ysum = zsum = cnt = 0;

   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;
      cnt++;
      xsum += atom.x; ysum += atom.y; zsum += atom.z;

      xmin = (xmin < atom.x) ? xmin : atom.x;
      ymin = (ymin < atom.y) ? ymin : atom.y;
      zmin = (zmin < atom.z) ? zmin : atom.z;
      xmax = (xmax > atom.x) ? xmax : atom.x;
      ymax = (ymax > atom.y) ? ymax : atom.y;
      zmax = (zmax > atom.z) ? zmax : atom.z;
   }
   return [[xmin, ymin, zmin], [xmax, ymax, zmax], [xsum / cnt, ysum / cnt, zsum / cnt]];
};

GLmol.prototype.getResiduesById = function(atomlist, resi) {
   var ret = [];
   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      if (resi.indexOf(atom.resi) != -1) ret.push(atom.serial);
   }
   return ret;
};

GLmol.prototype.getResidueBySS = function(atomlist, ss) {
   var ret = [];
   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      if (ss.indexOf(atom.ss) != -1) ret.push(atom.serial);
   }
   return ret;
};

GLmol.prototype.getChain = function(atomlist, chain) {
   var ret = [], chains = {};
   chain = chain.toString(); // concat if Array
   for (var i = 0, lim = chain.length; i < lim; i++) chains[chain.substr(i, 1)] = true;
   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      if (chains[atom.chain]) ret.push(atom.serial);
   }
   return ret;
};

// for HETATM only
GLmol.prototype.getNonbonded = function(atomlist, chain) {
   var ret = [];
   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      if (atom.hetflag && atom.bonds.length == 0) ret.push(atom.serial);
   }
   return ret;
};

GLmol.prototype.colorByAtom = function(atomlist, colors) {
   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      var c = colors[atom.elem];
      if (c == undefined) c = this.ElementColors[atom.elem];
      if (c == undefined) c = this.defaultColor;
      atom.color = c;
   }
};


// MEMO: Color only CA. maybe I should add atom.cartoonColor.
GLmol.prototype.colorByStructure = function(atomlist, helixColor, sheetColor, colorSidechains) {
   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      if (!colorSidechains && (atom.atom != 'CA' || atom.hetflag)) continue;
      if (atom.ss[0] == 's') atom.color = sheetColor;
      else if (atom.ss[0] == 'h') atom.color = helixColor;
   }
};

GLmol.prototype.colorByBFactor = function(atomlist, colorSidechains) {
   var minB = 1000, maxB = -1000;

   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      if (atom.hetflag) continue;
      if (colorSidechains || atom.atom == 'CA' || atom.atom == 'O3\'') {
         if (minB > atom.b) minB = atom.b;
         if (maxB < atom.b) maxB = atom.b;
      }
   }

   var mid = (maxB + minB) / 2;

   var range = (maxB - minB) / 2;
   if (range < 0.01 && range > -0.01) return;
   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      if (atom.hetflag) continue;
      if (colorSidechains || atom.atom == 'CA' || atom.atom == 'O3\'') {
         var color = new TCo(0);
         if (atom.b < mid)
            color.setHSV(0.667, (mid - atom.b) / range, 1);
         else
            color.setHSV(0, (atom.b - mid) / range, 1);
         atom.color = color.getHex();
      }
   }
};

GLmol.prototype.colorByChain = function(atomlist, colorSidechains) {
   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      if (atom.hetflag) continue;
      if (colorSidechains || atom.atom == 'CA' || atom.atom == 'O3\'') {
         var color = new TCo(0);
         color.setHSV((atom.chain.charCodeAt(0) * 5) % 17 / 17.0, 1, 0.9);
         atom.color = color.getHex();
      }
   }
};

GLmol.prototype.colorByResidue = function(atomlist, residueColors) {
   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      c = residueColors[atom.resn]
      if (c != undefined) atom.color = c;
   }
};

GLmol.prototype.colorAtoms = function(atomlist, c) {
   for (var i in atomlist) {
      var atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      atom.color = c;
   }
};

GLmol.prototype.colorByPolarity = function(atomlist, polar, nonpolar) {
   var polarResidues = ['ARG', 'HIS', 'LYS', 'ASP', 'GLU', 'SER', 'THR', 'ASN', 'GLN', 'CYS'];
   var nonPolarResidues = ['GLY', 'PRO', 'ALA', 'VAL', 'LEU', 'ILE', 'MET', 'PHE', 'TYR', 'TRP'];
   var colorMap = {};
   for (var i in polarResidues) colorMap[polarResidues[i]] = polar;
   for (i in nonPolarResidues) colorMap[nonPolarResidues[i]] = nonpolar;
   this.colorByResidue(atomlist, colorMap);   
};

// TODO: Add near(atomlist, neighbor, distanceCutoff)
// TODO: Add expandToResidue(atomlist)

GLmol.prototype.colorChainbow = function(atomlist, colorSidechains) {
   var cnt = 0;
   var atom, i;
   for (i in atomlist) {
      atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      if ((colorSidechains || atom.atom != 'CA' || atom.atom != 'O3\'') && !atom.hetflag)
         cnt++;
   }

   var total = cnt;
   cnt = 0;
   for (i in atomlist) {
      atom = this.atoms[atomlist[i]]; if (atom == undefined) continue;

      if ((colorSidechains || atom.atom != 'CA' || atom.atom != 'O3\'') && !atom.hetflag) {
         var color = new TCo(0);
         color.setHSV(240.0 / 360 * (1 - cnt / total), 1, 0.9);
         atom.color = color.getHex();
         cnt++;
      }
   }
};

GLmol.prototype.drawSymmetryMates2 = function(group, asu, matrices) {
   if (matrices == undefined) return;
   asu.matrixAutoUpdate = false;

   var cnt = 1;
   this.protein.appliedMatrix = new THREE.Matrix4();
   for (var i = 0; i < matrices.length; i++) {
      var mat = matrices[i];
      if (mat == undefined || mat.isIdentity()) continue;
      var symmetryMate = asu.clone();
      symmetryMate.matrix = mat;
      group.add(symmetryMate);
      for (var j = 0; j < 16; j++) this.protein.appliedMatrix.elements[j] += mat.elements[j];
      cnt++;
   }
   this.protein.appliedMatrix.multiplyScalar(cnt);
};


GLmol.prototype.drawSymmetryMatesWithTranslation2 = function(group, asu, matrices) {
   if (matrices == undefined) return;
   var p = this.protein;
   asu.matrixAutoUpdate = false;

   for (var i = 0; i < matrices.length; i++) {
      var mat = matrices[i];
      if (mat == undefined) continue;

      for (var a = -1; a <=0; a++) {
         for (var b = -1; b <= 0; b++) {
             for (var c = -1; c <= 0; c++) {
                var translationMat = new THREE.Matrix4().makeTranslation(
                   p.ax * a + p.bx * b + p.cx * c,
                   p.ay * a + p.by * b + p.cy * c,
                   p.az * a + p.bz * b + p.cz * c);
                var symop = mat.clone().multiplySelf(translationMat);
                if (symop.isIdentity()) continue;
                var symmetryMate = THREE.SceneUtils.cloneObject(asu);
                symmetryMate.matrix = symop;
                group.add(symmetryMate);
             }
         }
      }
   }
};

GLmol.prototype.defineRepresentation = function() {
   var all = this.getAllAtoms();
   var hetatm = this.removeSolvents(this.getHetatms(all));
   this.colorByAtom(all, {});
   this.colorByChain(all);

   this.drawAtomsAsSphere(this.modelGroup, hetatm, this.sphereRadius); 
   this.drawMainchainCurve(this.modelGroup, all, this.curveWidth, 'P');
   this.drawCartoon(this.modelGroup, all, this.curveWidth);
};

GLmol.prototype.getView = function() {
   if (!this.modelGroup) return [0, 0, 0, 0, 0, 0, 0, 1];
   var pos = this.modelGroup.position;
   var q = this.rotationGroup.quaternion;
   return [pos.x, pos.y, pos.z, this.rotationGroup.position.z, q.x, q.y, q.z, q.w];
};

GLmol.prototype.setView = function(arg) {
   if (!this.modelGroup || !this.rotationGroup) return;
   this.modelGroup.position.x = arg[0];
   this.modelGroup.position.y = arg[1];
   this.modelGroup.position.z = arg[2];
   this.rotationGroup.position.z = arg[3];
   this.rotationGroup.quaternion.x = arg[4];
   this.rotationGroup.quaternion.y = arg[5];
   this.rotationGroup.quaternion.z = arg[6];
   this.rotationGroup.quaternion.w = arg[7];
   this.show();
};

GLmol.prototype.setBackground = function(hex, a) {
   a = a | 1.0;
   this.bgColor = hex;
   if (this.renderer) this.renderer.setClearColorHex(hex, a);
   this.scene.fog.color = new TCo(hex);
};

GLmol.prototype.initializeScene = function() {
   // CHECK: Should I explicitly call scene.deallocateObject?
   this.scene = new THREE.Scene();
   this.scene.fog = new THREE.Fog(this.bgColor, 100, 200);

   this.modelGroup = new THREE.Object3D();
   this.rotationGroup = new THREE.Object3D();
   this.rotationGroup.quaternion = new THREE.Quaternion(1, 0, 0, 0);
   this.rotationGroup.add(this.modelGroup);

   console.log(this.rotationGroup)
   this.scene.add(this.rotationGroup);
   this.setupLights(this.scene);
};

GLmol.prototype.zoomInto = function(atomlist, keepSlab) {
   var tmp = this.getExtent(atomlist);
   var center = new TV3(tmp[2][0], tmp[2][1], tmp[2][2]);//(tmp[0][0] + tmp[1][0]) / 2, (tmp[0][1] + tmp[1][1]) / 2, (tmp[0][2] + tmp[1][2]) / 2);
   if (this.protein.appliedMatrix) {center.applyMatrix4(this.protein.appliedMatrix)}
   this.modelGroup.position = center.multiplyScalar(-1);
   var x = tmp[1][0] - tmp[0][0], y = tmp[1][1] - tmp[0][1], z = tmp[1][2] - tmp[0][2];

   var maxD = Math.sqrt(x * x + y * y + z * z);
   if (maxD < 25) maxD = 25;

   if (!keepSlab) {
      this.slabNear = -maxD / 1.9;
      this.slabFar = maxD / 3;
   }

   this.rotationGroup.position.z = maxD * 0.35 / Math.tan(Math.PI / 180.0 * this.camera.fov / 2) - 150;
   this.rotationGroup.quaternion = new THREE.Quaternion(1, 0, 0, 0);
};

GLmol.prototype.rebuildScene = function() {
   time = new Date();

   var view = this.getView();
   this.initializeScene();
   this.defineRepresentation();
   this.setView(view);
};

GLmol.prototype.loadMolecule = function(repressZoom) {
   this.loadMoleculeStr(repressZoom, $('#' + this.id + '_src').val());
};

GLmol.prototype.loadMoleculeStr = function(repressZoom, source) {
   var time = new Date();

   this.protein = {sheet: [], helix: [], biomtChains: '', biomtMatrices: [], symMat: [], pdbID: '', title: ''};
   this.atoms = [];

   this.parsePDB2(source);
   if (!this.parseSDF(source)) this.parseXYZ(source);
   console.log("parsed in " + (+new Date() - time) + "ms");
   
   var title = $('#' + this.id + '_pdbTitle');
   var titleStr = '';
   if (this.protein.pdbID != '') titleStr += '<a href="http://www.rcsb.org/pdb/explore/explore.do?structureId=' + this.protein.pdbID + '">' + this.protein.pdbID + '</a>';
   if (this.protein.title != '') titleStr += '<br>' + this.protein.title;
   title.html(titleStr);

   this.rebuildScene(true);
   if (repressZoom == undefined || !repressZoom) this.zoomInto(this.getAllAtoms());

   this.show();
 };

GLmol.prototype.setSlabAndFog = function() {
   var center = this.rotationGroup.position.z - this.camera.position.z;
   if (center < 1) center = 1;
   this.camera.near = center + this.slabNear;
   if (this.camera.near < 1) this.camera.near = 1;
   this.camera.far = center + this.slabFar;
   if (this.camera.near + 1 > this.camera.far) this.camera.far = this.camera.near + 1;
   if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.fov = this.fov;
   } else {
      this.camera.right = center * Math.tan(Math.PI / 180 * this.fov);
      this.camera.left = - this.camera.right;
      this.camera.top = this.camera.right / this.ASPECT;
      this.camera.bottom = - this.camera.top;
   }
   this.camera.updateProjectionMatrix();
   this.scene.fog.near = this.camera.near + this.fogStart * (this.camera.far - this.camera.near);
//   if (this.scene.fog.near > center) this.scene.fog.near = center;
   this.scene.fog.far = this.camera.far;
};

GLmol.prototype.enableMouse = function() {
   var me = this, glDOM = $(this.container);

   // TODO: Better touch panel support. 
   // Contribution is needed as I don't own any iOS or Android device with WebGL support.
   glDOM.bind('mousedown touchstart', function(ev) {
      ev.preventDefault();
      if (!me.scene) return;
      var x = ev.pageX, y = ev.pageY;
      if (ev.originalEvent.targetTouches && ev.originalEvent.targetTouches[0]) {
         x = ev.originalEvent.targetTouches[0].pageX;
         y = ev.originalEvent.targetTouches[0].pageY;
      }
      if (x == undefined) return;
      me.isDragging = true;
      me.mouseButton = ev.which;
      me.mouseStartX = x;
      me.mouseStartY = y;
      me.cq = me.rotationGroup.quaternion;
      me.cz = me.rotationGroup.position.z;
      me.currentModelPos = me.modelGroup.position.clone();
      me.cslabNear = me.slabNear;
      me.cslabFar = me.slabFar;
    });

   glDOM.bind('DOMMouseScroll mousewheel', function(ev) { // Zoom
      ev.preventDefault();
      if (!me.scene) return;
      var scaleFactor = (me.rotationGroup.position.z - me.CAMERA_Z) * 0.85;
      if (ev.originalEvent.detail) { // Webkit
         me.rotationGroup.position.z += scaleFactor * ev.originalEvent.detail / 10;
      } else if (ev.originalEvent.wheelDelta) { // Firefox
         me.rotationGroup.position.z -= scaleFactor * ev.originalEvent.wheelDelta / 400;
      }
      me.show();
   });
   glDOM.bind("contextmenu", function(ev) {ev.preventDefault();});
   $('body').bind('mouseup touchend', function(ev) {
      me.isDragging = false;
   });

   glDOM.bind('mousemove touchmove', function(ev) { // touchmove
      ev.preventDefault();
      if (!me.scene) return;
      if (!me.isDragging) return;
      var mode = 0;
      var modeRadio = $('input[name=' + me.id + '_mouseMode]:checked');
      if (modeRadio.length > 0) mode = parseInt(modeRadio.val());

      var x = ev.pageX, y = ev.pageY;
      if (ev.originalEvent.targetTouches && ev.originalEvent.targetTouches[0]) {
         x = ev.originalEvent.targetTouches[0].pageX;
         y = ev.originalEvent.targetTouches[0].pageY;
      }
      if (x == undefined) return;
      var dx = (x - me.mouseStartX) / me.WIDTH;
      var dy = (y - me.mouseStartY) / me.HEIGHT;
      var r = Math.sqrt(dx * dx + dy * dy);
      if (mode == 3 || (me.mouseButton == 3 && ev.ctrlKey)) { // Slab
          me.slabNear = me.cslabNear + dx * 100;
          me.slabFar = me.cslabFar + dy * 100;
      } else if (mode == 2 || me.mouseButton == 3 || ev.shiftKey) { // Zoom
         var scaleFactor = (me.rotationGroup.position.z - me.CAMERA_Z) * 0.85; 
         if (scaleFactor < 80) scaleFactor = 80;
         me.rotationGroup.position.z = me.cz - dy * scaleFactor;
      } else if (mode == 1 || me.mouseButton == 2 || ev.ctrlKey) { // Translate
         var scaleFactor = (me.rotationGroup.position.z - me.CAMERA_Z) * 0.85;
         if (scaleFactor < 20) scaleFactor = 20;
         if (me.webglFailed) { dx *= -1; dy *= -1;}
         var translationByScreen = new TV3(- dx * scaleFactor, - dy * scaleFactor, 0);
         var q = me.rotationGroup.quaternion;
         var qinv = new THREE.Quaternion(q.x, q.y, q.z, q.w).inverse().normalize(); 
         var translation = qinv.multiplyVector3(translationByScreen);
         me.modelGroup.position.x = me.currentModelPos.x + translation.x;
         me.modelGroup.position.y = me.currentModelPos.y + translation.y;
         me.modelGroup.position.z = me.currentModelPos.z + translation.z;
      } else if ((mode == 0 || me.mouseButton == 1) && r != 0) { // Rotate
         var rs = Math.sin(r * Math.PI) / r;
         me.dq.x = Math.cos(r * Math.PI); 
         me.dq.y = 0;
         me.dq.z =  rs * dx; 
         me.dq.w =  rs * dy; 
         me.rotationGroup.quaternion = new THREE.Quaternion(1, 0, 0, 0); 
         me.rotationGroup.quaternion.multiply(me.dq);
         me.rotationGroup.quaternion.multiply(me.cq);
      }
      me.show();
   });
};


GLmol.prototype.show = function() {
   if (!this.scene) return;

   var time = new Date();
   this.setSlabAndFog();
   if (!this.webglFailed) this.renderer.render(this.scene, this.camera);
   else this.render2d();
};

GLmol.prototype.render2d = function() {
  var ctx = this.canvas2d[0].getContext("2d");  
  this.scene.updateMatrixWorld();
  ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
  ctx.save();

  ctx.translate(this.WIDTH / 2, this.HEIGHT / 2);
  ctx.scale(30, 30);
  ctx.lineCap = "round";
  var mvMat = new THREE.Matrix4();
  mvMat.multiply(this.camera.matrixWorldInverse, this.modelGroup.matrixWorld);
//  var pmvMat = new THREE.Matrix4();
//  pmvMat.multiply(this.camera.projectionMatrix, mvMat);

  var PI2 = Math.PI * 2;
  var toDraw = [];
  var atoms = this.atoms;
  for (var i = 0, ilim = this.atoms.length; i < ilim; i++) {
      var atom = atoms[i];
      if (atom == undefined) continue;
  
      if (atom.screen == undefined) atom.screen = new THREE.Vector3;
      atom.screen.set(atom.x, atom.y, atom.z);
      /*p*/mvMat.multiplyVector3(atom.screen);
      if (!this.webglFailed) atom.screen.y *= -1; // plus direction of y-axis: up in OpenGL, down in Canvas

      toDraw.push([false, atom.screen.z, i]);
  }

  // TODO: do it in 1-pass
  for (var i = 0, ilim = this.atoms.length; i < ilim; i++) {
      var atom = atoms[i];
      if (atom == undefined) continue;

      for (var j = 0, jlim = atom.bonds.length; j < jlim; j++) {
         var atom2 = atoms[atom.bonds[j]];
         if (atom2 == undefined) continue;
         if (atom.serial > atom2.serial) continue;

         toDraw.push([true, (atom.screen.z + atom2.screen.z) / 2, i, atom.bonds[j]]);
      }
  }

  toDraw.sort(function(l, r) {
     return l[1] - r[1];
  });

  for (var i = 0, ilim = toDraw.length; i < ilim; i++) {
      var atom = atoms[toDraw[i][2]];
      if (!toDraw[i][0]) {
         ctx.fillStyle = "rgb(" + (atom.color >> 16) + "," + (atom.color >> 8 & 255) + 
                    "," + (atom.color & 255) + ")";
         ctx.lineWidth = 0.03;
         ctx.beginPath();
         ctx.arc(atom.screen.x, atom.screen.y, 0.4, 0, PI2, true);
         ctx.closePath();
         ctx.fill();
         ctx.strokeStyle ="#000000";
         ctx.stroke();
      } else {
        var atom2 = atoms[toDraw[i][3]];
        ctx.lineWidth = 0.3;
        var cx = (atom.screen.x + atom2.screen.x) / 2;
        var cy = (atom.screen.y + atom2.screen.y) / 2;
        ctx.strokeStyle = "rgb(" + (atom.color >> 16) + "," + (atom.color >> 8 & 255) + 
                   "," + (atom.color & 255) + ")";
        ctx.beginPath();
        ctx.moveTo(atom.screen.x, atom.screen.y);
        ctx.lineTo(cx, cy);
        ctx.closePath(); 
        ctx.stroke();
        ctx.strokeStyle = "rgb(" + (atom2.color >> 16) + "," + (atom2.color >> 8 & 255) + 
                   "," + (atom2.color & 255) + ")";
        ctx.beginPath();
        ctx.moveTo(atom2.screen.x, atom2.screen.y);
        ctx.lineTo(cx, cy);
        ctx.closePath(); 
        ctx.stroke();
      }
  }

  ctx.restore();
};

// For scripting
GLmol.prototype.doFunc = function(func) {
    func(this);
};

return GLmol;
}());
