

function textToJson(text) {
	let clearXml = clearXmlText(text)
	var xml = textToXml(clearXml)
	var json = xmlToJson(xml)
	return json
}

function clearXmlText(text) {
	return text.replace(/[\t\n]+|<!DOCTYPE.*?>[\n]?/g, "")
}

var textToXml = null

if (window.DOMParser) {
	console.log("textToXml by window.DOMParser")
    textToXml = function(text) {
        return ( new window.DOMParser() ).parseFromString(text, "text/xml")
    }
} else if (typeof window.ActiveXObject != "undefined") {
	var parser = new window.ActiveXObject("Microsoft.XMLDOM")
	if (parser) {
		console.log("textToXml by Microsoft.XMLDOM")
	    textToXml = function(text) {
	        parser.async = "false"
	        parser.loadXML(text)
	        return parser
	    }
	}
}
if (textToXml == null) {
	console.log("textToXml by NOTHING")
    textToXml = function() { return null; }
}


function xmlToJson(node, key) {
	var nodeName = node.nodeName
	var json = {}

	if (key !== undefined) {
		// needed for dictionary nodes
		json.key = key
	}

	json.type = nodeName

	var attrs = getAttrsForXml(node)
	if (attrs != null) {
		json.attrs = attrs
	}

	if (node.nodeType == 3) { // #text
		return node.nodeValue
	}

	if (nodeName == "string") {
		json.value = node.childNodes.item(0).nodeValue
	} else if (nodeName == "real") {
		json.value = parseFloat(node.childNodes.item(0).nodeValue)
	} else if (nodeName == "integer") {
		json.value = parseInt(node.childNodes.item(0).nodeValue)
	} else if (nodeName == "true" || nodeName == "false") {
		json.value = nodeName == "true"
	} else if (nodeName == "array") {
		json.value = toArray(node)
	} else if (nodeName == "dict") {
		json.value = dictToArray(node)
	} else { // #document | plist | <other>
		var nodes = node.childNodes
		var children = []
		for (let i = 0; i < nodes.length; i++)
			children.push(xmlToJson(nodes.item(i)))

		json.value = children
	}
	return json
}

function toArray(array) {
	var nodes = array.childNodes
	var items = []

	for (var i = 0; i < nodes.length; i++) {
		var item = {}
		var node = nodes.item(i)
		item.type = node.nodeName
		item.data = node.childNodes.item(0).nodeValue
		items.push(item)
	}
	return items
}

function dictToArray(dict) {
	var children = []
	var nodes = dict.childNodes
	for (var i = 0; i < nodes.length; i += 2) {
		var key = nodes.item(i)
		var keyChild = key.childNodes.item(0)
		var value = nodes.item(i + 1)

		var child = xmlToJson(value, keyChild.nodeValue)

		children.push(child)
	}
	return children
}

function getAttrsForXml(node) {
	if (node.attributes === undefined || node.attributes.length == 0) return null

	var attrs = {}
	for (var j = 0; j < node.attributes.length; j++) {
		var item = node.attributes.item(j)
		attrs[item.nodeName] = item.nodeValue
	}
	return attrs
}

function dump(el) {
	console.log("nodeName " + el.nodeName)
	var child = el.childNodes.item(0)
	if (child != null) {
		console.log("child nodeName " + child.nodeName)
		console.log("child nodeValue " + child.nodeValue)
	} else
		console.log("child null")
}
