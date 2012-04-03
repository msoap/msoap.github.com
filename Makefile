all:
	uglifyjs --no-copyright js/script.js > js/script.min.js
	uglifyjs --no-copyright js/libs/ecmascript5.compatibility.js > js/libs/ecmascript5.compatibility.min.js
