"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/wrappy";
exports.ids = ["vendor-chunks/wrappy"];
exports.modules = {

/***/ "(rsc)/./node_modules/wrappy/wrappy.js":
/*!***************************************!*\
  !*** ./node_modules/wrappy/wrappy.js ***!
  \***************************************/
/***/ ((module) => {

eval("// Returns a wrapper function that returns a wrapped callback\n// The wrapper function should do some stuff, and return a\n// presumably different callback function.\n// This makes sure that own properties are retained, so that\n// decorations and such are not lost along the way.\n\nmodule.exports = wrappy;\nfunction wrappy(fn, cb) {\n    if (fn && cb) return wrappy(fn)(cb);\n    if (typeof fn !== \"function\") throw new TypeError(\"need wrapper function\");\n    Object.keys(fn).forEach(function(k) {\n        wrapper[k] = fn[k];\n    });\n    return wrapper;\n    function wrapper() {\n        var args = new Array(arguments.length);\n        for(var i = 0; i < args.length; i++){\n            args[i] = arguments[i];\n        }\n        var ret = fn.apply(this, args);\n        var cb = args[args.length - 1];\n        if (typeof ret === \"function\" && ret !== cb) {\n            Object.keys(cb).forEach(function(k) {\n                ret[k] = cb[k];\n            });\n        }\n        return ret;\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvd3JhcHB5L3dyYXBweS5qcyIsIm1hcHBpbmdzIjoiQUFBQSw2REFBNkQ7QUFDN0QsMERBQTBEO0FBQzFELDBDQUEwQztBQUMxQyw0REFBNEQ7QUFDNUQsbURBQW1EOztBQUNuREEsT0FBT0MsT0FBTyxHQUFHQztBQUNqQixTQUFTQSxPQUFRQyxFQUFFLEVBQUVDLEVBQUU7SUFDckIsSUFBSUQsTUFBTUMsSUFBSSxPQUFPRixPQUFPQyxJQUFJQztJQUVoQyxJQUFJLE9BQU9ELE9BQU8sWUFDaEIsTUFBTSxJQUFJRSxVQUFVO0lBRXRCQyxPQUFPQyxJQUFJLENBQUNKLElBQUlLLE9BQU8sQ0FBQyxTQUFVQyxDQUFDO1FBQ2pDQyxPQUFPLENBQUNELEVBQUUsR0FBR04sRUFBRSxDQUFDTSxFQUFFO0lBQ3BCO0lBRUEsT0FBT0M7SUFFUCxTQUFTQTtRQUNQLElBQUlDLE9BQU8sSUFBSUMsTUFBTUMsVUFBVUMsTUFBTTtRQUNyQyxJQUFLLElBQUlDLElBQUksR0FBR0EsSUFBSUosS0FBS0csTUFBTSxFQUFFQyxJQUFLO1lBQ3BDSixJQUFJLENBQUNJLEVBQUUsR0FBR0YsU0FBUyxDQUFDRSxFQUFFO1FBQ3hCO1FBQ0EsSUFBSUMsTUFBTWIsR0FBR2MsS0FBSyxDQUFDLElBQUksRUFBRU47UUFDekIsSUFBSVAsS0FBS08sSUFBSSxDQUFDQSxLQUFLRyxNQUFNLEdBQUMsRUFBRTtRQUM1QixJQUFJLE9BQU9FLFFBQVEsY0FBY0EsUUFBUVosSUFBSTtZQUMzQ0UsT0FBT0MsSUFBSSxDQUFDSCxJQUFJSSxPQUFPLENBQUMsU0FBVUMsQ0FBQztnQkFDakNPLEdBQUcsQ0FBQ1AsRUFBRSxHQUFHTCxFQUFFLENBQUNLLEVBQUU7WUFDaEI7UUFDRjtRQUNBLE9BQU9PO0lBQ1Q7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL25leHRqcy8uL25vZGVfbW9kdWxlcy93cmFwcHkvd3JhcHB5LmpzPzk0ZDYiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUmV0dXJucyBhIHdyYXBwZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgd3JhcHBlZCBjYWxsYmFja1xuLy8gVGhlIHdyYXBwZXIgZnVuY3Rpb24gc2hvdWxkIGRvIHNvbWUgc3R1ZmYsIGFuZCByZXR1cm4gYVxuLy8gcHJlc3VtYWJseSBkaWZmZXJlbnQgY2FsbGJhY2sgZnVuY3Rpb24uXG4vLyBUaGlzIG1ha2VzIHN1cmUgdGhhdCBvd24gcHJvcGVydGllcyBhcmUgcmV0YWluZWQsIHNvIHRoYXRcbi8vIGRlY29yYXRpb25zIGFuZCBzdWNoIGFyZSBub3QgbG9zdCBhbG9uZyB0aGUgd2F5LlxubW9kdWxlLmV4cG9ydHMgPSB3cmFwcHlcbmZ1bmN0aW9uIHdyYXBweSAoZm4sIGNiKSB7XG4gIGlmIChmbiAmJiBjYikgcmV0dXJuIHdyYXBweShmbikoY2IpXG5cbiAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCduZWVkIHdyYXBwZXIgZnVuY3Rpb24nKVxuXG4gIE9iamVjdC5rZXlzKGZuKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgd3JhcHBlcltrXSA9IGZuW2tdXG4gIH0pXG5cbiAgcmV0dXJuIHdyYXBwZXJcblxuICBmdW5jdGlvbiB3cmFwcGVyKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldXG4gICAgfVxuICAgIHZhciByZXQgPSBmbi5hcHBseSh0aGlzLCBhcmdzKVxuICAgIHZhciBjYiA9IGFyZ3NbYXJncy5sZW5ndGgtMV1cbiAgICBpZiAodHlwZW9mIHJldCA9PT0gJ2Z1bmN0aW9uJyAmJiByZXQgIT09IGNiKSB7XG4gICAgICBPYmplY3Qua2V5cyhjYikuZm9yRWFjaChmdW5jdGlvbiAoaykge1xuICAgICAgICByZXRba10gPSBjYltrXVxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIHJldFxuICB9XG59XG4iXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIndyYXBweSIsImZuIiwiY2IiLCJUeXBlRXJyb3IiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImsiLCJ3cmFwcGVyIiwiYXJncyIsIkFycmF5IiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiaSIsInJldCIsImFwcGx5Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/wrappy/wrappy.js\n");

/***/ })

};
;