var Token_1 = require('./Token');
var Location_1 = require('./Location');
var TokenType = Token_1["default"].TokenType, Token = Token_1["default"].Token;
var Parser = (function () {
    function Parser(stream) {
        this.stream = stream;
        this.info = { time: { elapsed: 0 }, errors: [] };
    }
    Parser.prototype.parse = function (driver, parser) {
        // Bind the context if the scanner object is provided
        if (parser) {
            for (var fn in parser) {
                if (parser.hasOwnProperty(fn) && typeof parser[fn] === 'function') {
                    parser[fn] = parser[fn].bind(this);
                }
            }
        }
        if (typeof driver === 'function') {
            var start = Date.now();
            var ast = {};
            ast = driver.call(this);
            this.info.time.elapsed = (Date.now() - start);
            return ast;
        }
    };
    Parser.prototype.lookBack = function (peek) {
        return this.stream.peekBack(peek);
    };
    Parser.prototype.peek = function (peek) {
        if (peek === void 0) { peek = 0; }
        return this.stream.peek(peek);
    };
    Parser.prototype.previous = function () {
        return this.stream.previous();
    };
    Parser.prototype.next = function () {
        return this.stream.next();
    };
    Parser.prototype.location = function () {
        if (this.peek()) {
            return this.peek().location();
        }
        else if (this.stream.length === 0) {
            return {
                start: new Location_1["default"](0, 0),
                end: new Location_1["default"](0, 0)
            };
        }
        else
            return this.lookBack(1).location();
    };
    Parser.prototype.match = function (type, value) {
        // Get the current token
        var current = this.peek();
        if ((type || typeof type === 'number') && (!value || value === null))
            return current && current.isEqual(type);
        if ((type || typeof type === 'number') && value)
            return current && current.isEqual(type, value);
    };
    /*
      Match any should match the tokens with "||" (or)
     */
    Parser.prototype.matchAny = function (array) {
        var results = [];
        for (var i = 0; i < array.length; i++) {
            results.push(this.match.apply(this, array[i]));
        }
        return results.indexOf(true) > -1;
    };
    Parser.prototype.expect = function (type, value) {
        var token = this.peek();
        if (this.match(type, value))
            this.next();
        else
            throw new Error("Expected type \"" + Token.typeToString(type) + "\"\" but received \"" + token.stype + "\"");
    };
    /*
      @method {raise} - Adds an error message into the errors stack.
      @param {message?: string} - The message to add to the error.
      @param {type?: string} - The type of error.
     */
    Parser.prototype.raise = function (message, type) {
        this.info.errors.push({
            error: "Unexpected token: " + this.peek().typeToString(),
            type: type || 'ParseError',
            message: message || '',
            location: this.location()
        });
    };
    return Parser;
})();
exports["default"] = Parser;
