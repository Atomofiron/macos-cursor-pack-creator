var clog = console.log
var ln = "\n"

function jsonToXml(json) {
	if (json === undefined) {
		return "undefined"
	}
	if (json.type === undefined) {
		return json
	}
	if (json.type == "#document") {
		return parseDocument(json)
	} else if (json.type == "true" || json.type == "false") {
		return parseBoolean(json)
	} else if (json.type == "real") {
		return parseReal(json) // float x mast be x.0
	} else if (json.type == "plist") {
		return parsePlist(json)
	} else if (json.type == "dict") {
		return parseDict(json)
	} else if (json.type == "array") {
		return parseArray(json)
	} else if (Array.isArray(json)) {
		return parseChildren(json)
	} else {
		return "<" + json.type + getAttrsForJson(json) + ">" + jsonToXml(json.value) + "</" + json.type + ">" + ln
	}
}

function parseDocument(json) {
	var prefix = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
	let first = json.value[0]
	if (json.value && json.value[0] !== undefined) {
		let type = json.value[0].type
		prefix += "\n<!DOCTYPE " + type + " PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">" + ln
	}
	return prefix + parseChildren(json)
}

function getAttrsForJson(json) {
	if (json.attrs === null || json.attrs === undefined) return ""

	var attrs = ""
	for (let name in json.attrs) {
		attrs += " " + name
		var value = json.attrs[name]
		if (value !== null && value !== undefined)
			attrs += "=\"" + json.attrs[name] + "\""
	}
	return attrs
}

function parseBoolean(json) {
	return "<" + json.type + getAttrsForJson(json) + "/>" + ln
}

function parseReal(json) {
	// real 0 mast be 0.0 ???
	//var value = (json.value == 0) ? "0.0" : "0"
	return "<" + json.type + getAttrsForJson(json) + ">" + json.value + "</" + json.type + ">" + ln
}

function parsePlist(json) {
	var value = "<plist" + getAttrsForJson(json) + ">" + ln
	for (let i in json.value)
		value += jsonToXml(json.value[i])
	return value + "</plist>"
}

function parseDict(json) {
	var value = "<dict" + getAttrsForJson(json) + ">" + ln
	for (let i in json.value)
		value += dictItem(json.value[i])
	return value + "</dict>" + ln
}

function parseArray(json) {
	var value = "<array" + getAttrsForJson(json) + ">" + ln
	for (let i in json.value)
		value += arrayItem(json.value[i]) + ln
	return value + "</array>" + ln
}

function parseChildren(json) {
	var value = ""
	for (let i in json.value)
		value += jsonToXml(json.value[i]) + ln
	return value
}

function dictItem(item) {
	var key = "<key" + getAttrsForJson(item) + ">" + item.key + "</key>" + ln
	return key + jsonToXml(item)
}

function arrayItem(item) {
	return "<" + item.type + getAttrsForJson(item) + ">" + ln + item.data + ln + "</" + item.type + ">"
}
