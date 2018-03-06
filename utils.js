
(function (name, deps, definition) {
    if (!definition) {
        definition = deps;
        deps = [];
    }
    if (!Array.isArray(deps)) {
        deps = [deps];
    }
    if (typeof define === "function" && typeof define.amd === "object") {
        define(deps, definition);
    } else if (typeof module !== "undefined") {
        module.exports = definition.apply(this, deps.map(function (dep) {
            return require(dep);
        }));
    } else {
        var that = this;
        this[name] = definition.apply(this, deps.map(function (dep) {
            return that[dep.split("/").pop()];
        }));
    }
})("utils", function () {

    /**
     * A toolbox of commonly and repetitively needed routines.
     * @exports utils
     */
    var utils = {};

    /**
     * Recursive object property getter.
     * 
     * @param {*} target
     * @param {string} path
     * @param {object} [options]
     * @param {string} [options.separator="."] the symbol used to split the path into parts
     * @param {string} [options.prefix=""] add a prefix to each part of the split path
     * 
     * @returns {*} value
     */
    utils.rget = function (target, path, options) {
        options = options || {};
        var separator = options.separator || ".";
        var prefix = options.prefix || "";
        var parts = path.split(separator);
        for (var i = 0; i < parts.length; i++) {
            if (!target || typeof target !== "object") {
                return undefined;
            }
            var part = prefix + parts[i];
            target = target[part];
        }
        return target;
    };


    /**
     * 
     * Recursive object property setter.
     * 
     * @param {object} target
     * @param {string} path
     * @param {*} value
     * @param {object} [options]
     * @param {string} [options.separator="."]
     * @param {string} [options.prefix=""]
     * 
     * @returns {*} value
     * 
     * @throws {Error} target must be an object.
     * @throws {Error} all parts of the path must be objects.
     */
    utils.rset = function (target, path, value, options) {
        if (typeof target !== "object") {
            throw new Error("target must be an object");
        }
        options = options || {};
        var separator = options.separator || ".";
        var prefix = options.prefix || "";

        var parts = path.split(separator);
        var attr = prefix + parts.pop();
        for (var i = 0; i < parts.length; i++) {
            var part = prefix + parts[i];
            if (!target.hasOwnProperty(part)) {
                target[part] = {};
            } else if (typeof target[part] !== "object") {
                throw new Error("all parts of the path must be objects. cannot set a property on a non object at " + prefix + parts.join(separator + prefix) + separator + prefix + attr);
            }
            target = target[part];
        }
        target[attr] = value;
    };


    /**
     * Recursive object property deleter.
     * 
     * @param {object} target
     * @param {string} path
     * @param {object} [options]
     * @param {string} [options.separator="."]
     * @param {string} [options.prefix=""]
     * 
     * @returns {boolean} true if a property was deleted
     * 
     * @throws {Error} target must be an object.
     */
    utils.rdelete = function (target, path, options) {
        if (typeof target !== "object") {
            throw new Error("target must be an object");
        }
        options = options || {};
        var separator = options.separator || ".";
        var prefix = options.prefix || "";

        var parts = path.split(separator);
        var attr = parts.pop();
        for (var i = 0; i < parts.length; i++) {
            var part = prefix + parts[i];
            if (!target.hasOwnProperty(part)) {
                return false;
            } else if (typeof target[part] !== "object") {
                return false;
            }
            target = target[part];
        }
        delete target[attr];
        return true;
    };


    /**
     * Shallow compares js entities, supports arrays, dates, regexs and objects.
     * This routine extends the === comparison operator.
     * **Objects prototypes are ignored.**
     * 
     * @example
     *   utils.equals(12,12);       // true
     *   utils.equals({a:1},{a:1}); // true
     *   utils.equals({a:1},{a:2}); // false
     *   utils.equals([],[]);       // true
     *   utils.equals(/.+/,/.+/);   // true
     *   utils.equals({},null);     // false
     *   
     * @param {*} a
     * @param {*} b
     * @returns {boolean}
     */
    utils.equals = function (a, b) {
        if (a === b) {
            return true;
        } else if (typeof a === "object" && typeof b === "object") {
            if (a === null || b === null) {
                return false;
            } else if (Array.isArray(a) && Array.isArray(b)) {
                if (a.length !== b.length) {
                    return false;
                }
                for (var i = 0; i < a.length; i++) {
                    if (!utils.equals(a[i], b[i])) {
                        return false;
                    }
                }
                return true;
            } else if (a instanceof Date && b instanceof Date) {
                return a.getTime() === b.getTime();
            } else if (a instanceof RegExp && b instanceof RegExp) {
                return a.toString() === b.toString();
            } else {
                var props = [];
                for (var prop in a) {
                    if (a.hasOwnProperty(prop)) {
                        if ((!b.hasOwnProperty(prop) && a[prop] !== undefined) || !utils.equals(a[prop], b[prop])) {
                            return false;
                        }
                        props.push(prop);
                    }
                }
                for (var prop in b) {
                    if (b.hasOwnProperty(prop)) {
                        if (b[prop] !== undefined && props.indexOf(prop) < 0) {
                            return false;
                        }
                    }
                }
                return true;
            }
        }
        return false;
    };


    /**
     * Clones (deep-copy) simple js entities. Clones will be separate entities but 
     * will still yield true when compared using utils.equals().
     * 
     * If an object to clone possess a `.clone()` interface, it will be used instead of the default algorithm.
     * 
     * Clones:
     *  * string
     *  * number
     *  * boolean
     *  * null
     *  * undefined
     *  * Date
     *  * RegExp
     *  * Array
     *  * object (without methods nor prototype)
     * 
     * Shallow copies:
     *  * function
     *  * prototype
     * 
     * @param {*} target
     * @returns {*}
     */
    utils.clone = function (target) {
        if (typeof target !== "object") {
            return target;
        } else if (Array.isArray(target)) {
            return target.map(utils.clone);
        } else if (target instanceof RegExp) {
            return new RegExp(target);
        } else if (target instanceof Date) {
            return new Date(target);
        } else if (typeof target.clone === "function") {
            return target.clone();
        } else {
            var cpy = Object.create(Object.getPrototypeOf(target));
            for (var prop in target) {
                if (target.hasOwnProperty(prop)) {
                    cpy[prop] = utils.clone(target[prop]);
                }
            }
            return cpy;
        }
    };
    
    /**
     * Determines the detailed type of a js entity.
     * 
     * Supported types: object, null, array, regex, date, and the other js primitive types as returned by the `typeof` operator
     * 
     * @param {*} target
     * @returns {string}
     */
    utils.typeof = function (target) {
        if (typeof target === "object") {
            if (target === null) {
                return "null";
            } else if (Array.isArray(target)) {
                return "array";
            } else if (target instanceof RegExp) {
                return "regex";
            } else if (target instanceof Date) {
                return "date";
            } else {
                return "object";
            }
        } else {
            return typeof target;
        }
    };

    return utils;
});


