"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/deprecation";
exports.ids = ["vendor-chunks/deprecation"];
exports.modules = {

/***/ "(rsc)/./node_modules/deprecation/dist-node/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/deprecation/dist-node/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({\n    value: true\n}));\nclass Deprecation extends Error {\n    constructor(message){\n        super(message); // Maintains proper stack trace (only available on V8)\n        /* istanbul ignore next */ if (Error.captureStackTrace) {\n            Error.captureStackTrace(this, this.constructor);\n        }\n        this.name = \"Deprecation\";\n    }\n}\nexports.Deprecation = Deprecation;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvZGVwcmVjYXRpb24vZGlzdC1ub2RlL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFBO0FBRUFBLDhDQUE2QztJQUFFRyxPQUFPO0FBQUssQ0FBQyxFQUFDO0FBRTdELE1BQU1DLG9CQUFvQkM7SUFDeEJDLFlBQVlDLE9BQU8sQ0FBRTtRQUNuQixLQUFLLENBQUNBLFVBQVUsc0RBQXNEO1FBRXRFLHdCQUF3QixHQUV4QixJQUFJRixNQUFNRyxpQkFBaUIsRUFBRTtZQUMzQkgsTUFBTUcsaUJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQ0YsV0FBVztRQUNoRDtRQUVBLElBQUksQ0FBQ0csSUFBSSxHQUFHO0lBQ2Q7QUFFRjtBQUVBUCxtQkFBbUIsR0FBR0UiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXh0anMvLi9ub2RlX21vZHVsZXMvZGVwcmVjYXRpb24vZGlzdC1ub2RlL2luZGV4LmpzP2E1M2QiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG5jbGFzcyBEZXByZWNhdGlvbiBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSkge1xuICAgIHN1cGVyKG1lc3NhZ2UpOyAvLyBNYWludGFpbnMgcHJvcGVyIHN0YWNrIHRyYWNlIChvbmx5IGF2YWlsYWJsZSBvbiBWOClcblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cbiAgICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIHRoaXMuY29uc3RydWN0b3IpO1xuICAgIH1cblxuICAgIHRoaXMubmFtZSA9ICdEZXByZWNhdGlvbic7XG4gIH1cblxufVxuXG5leHBvcnRzLkRlcHJlY2F0aW9uID0gRGVwcmVjYXRpb247XG4iXSwibmFtZXMiOlsiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJleHBvcnRzIiwidmFsdWUiLCJEZXByZWNhdGlvbiIsIkVycm9yIiwiY29uc3RydWN0b3IiLCJtZXNzYWdlIiwiY2FwdHVyZVN0YWNrVHJhY2UiLCJuYW1lIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/deprecation/dist-node/index.js\n");

/***/ })

};
;