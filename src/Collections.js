/*
  Copyright (C) 2015 by Takeshi Iwana, @iwatakeshi
    Copyright (C) 2011 by Andrea Giammarchi, @WebReflection

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
 */
/** @private shared pointer */
let i;
/** @private shortcut */
let defineProperty = Object.defineProperty;
let is = function (a, b) { return isNaN(a) ? isNaN(b) : a === b; };
/**
  * ES6 collection constructor
  * @return {Function} a collection class
  */
function createCollection(proto, objectOnly) {
  function Collection(a) {
    if (!(this instanceof arguments.callee))
      throw new Error('Constructor called as a function');
    this._keys = [];
    this._values = [];
    this._itp = []; // iteration pointers
    this.objectOnly = objectOnly;
        // parse initial iterable argument passed
    if (a)
      init.call(this, a);
  }
    // define size for non object-only collections
  if (!objectOnly) {
    defineProperty(proto, 'size', {
      get: sharedSize
    });
  }
    // set prototype
  proto.constructor = Collection;
  Collection.prototype = proto;
  return Collection;
}
/** parse initial iterable argument passed */
function init(a) {
  var i;
    // init Set argument, like `[1,2,3,{}]`
  if (this.add)
    a.forEach(this.add, this);
  else
        a.forEach(function (a) { this.set(a[0], a[1]); }, this);
}
/** delete */
function sharedDelete(key) {
  if (this.has(key)) {
    this._keys.splice(i, 1);
    this._values.splice(i, 1);
        // update iteration pointers
    this._itp.forEach(function (p) { if (i < p[0])
      p[0]--; });
  }
    // Aurora here does it while Canary doesn't
  return -1 < i;
}
function sharedGet(key) {
  return this.has(key) ? this._values[i] : undefined;
}
function has(list, key) {
  if (this.objectOnly && key !== Object(key))
    throw new TypeError('Invalid value used as weak collection key');
    // NaN or 0 passed
  if (key !== key || key === 0)
    for (i = list.length; i-- && !is(list[i], key);) {
    }
  else
        i = list.indexOf(key);
  return -1 < i;
}
function setHas(value) {
  return has.call(this, this._values, value);
}
function mapHas(value) {
  return has.call(this, this._keys, value);
}
/** @chainable */
function sharedSet(key, value) {
  this.has(key) ?
        this._values[i] = value :
        this._values[this._keys.push(key) - 1] = value;
  return this;
}
/** @chainable */
function sharedAdd(value) {
  if (!this.has(value))
    this._values.push(value);
  return this;
}
function sharedClear() {
  (this._keys || 0).length =
        this._values.length = 0;
}
/** keys, values, and iterate related methods */
function sharedKeys() {
  return sharedIterator(this._itp, this._keys);
}
function sharedValues() {
  return sharedIterator(this._itp, this._values);
}
function mapEntries() {
  return sharedIterator(this._itp, this._keys, this._values);
}
function setEntries() {
  return sharedIterator(this._itp, this._values, this._values);
}
function sharedIterator(itp, array, array2) {
  let p = [0], done = false;
  itp.push(p);
  return {
    next: function () {
      let v, k = p[0];
      if (!done && k < array.length) {
        v = array2 ? [array[k], array2[k]] : array[k];
        p[0]++;
      }
      else {
        done = true;
        itp.splice(itp.indexOf(p), 1);
      }
      return { done: done, value: v };
    }
  };
}
function sharedSize() {
  return this._values.length;
}
function sharedForEach(callback, context) {
  let it = this.entries();
  for (;;) {
    let r = it.next();
    if (r.done)
      break;
    callback.call(context, r.value[1], r.value[0], this);
  }
}
var Collections;
(function (Collections) {
  class Map {
    constructor() {
      return createCollection({
                // WeakMap#delete(key:void*):boolean
        'delete': sharedDelete,
                // :was Map#get(key:void*[, d3fault:void*]):void*
                // Map#has(key:void*):boolean
        has: mapHas,
                // Map#get(key:void*):boolean
        get: sharedGet,
                // Map#set(key:void*, value:void*):void
        set: sharedSet,
                // Map#keys(void):Iterator
        keys: sharedKeys,
                // Map#values(void):Iterator
        values: sharedValues,
                // Map#entries(void):Iterator
        entries: mapEntries,
                // Map#forEach(callback:Function, context:void*):void ==> callback.call(context, key, value, mapObject) === not in specs`
        forEach: sharedForEach,
                // Map#clear():
        clear: sharedClear
      }).apply(this, arguments);
    }
    delete(key) { }
    has(value) { }
    get(key) { }
    set(key, value) { }
    keys() { }
    values() { }
    entries() { }
    forEach(callback, thisArg) { }
    clear() { }
    }
  Collections.Map = Map;
  class WeakMap {
    constructor() {
      return createCollection({
                // WeakMap#delete(key:void*):boolean
        'delete': sharedDelete,
                // WeakMap#clear():
        clear: sharedClear,
                // WeakMap#get(key:void*):void*
        get: sharedGet,
                // WeakMap#set(key:void*, value:void*):void
        set: sharedSet,
                // WeakMap#has(key:void*):boolean
        has: mapHas
      }, true).apply(this, arguments);
    }
  }
  Collections.WeakMap = WeakMap;
  class Set {
    constructor() {
      return createCollection({
        // Set#has(value:void*):boolean
        has: setHas,
        // Set#add(value:void*):boolean
        add: sharedAdd,
        // Set#delete(key:void*):boolean
        delete: sharedDelete,
        // Set#clear():
        clear: sharedClear,
        // Set#keys(void):Iterator
        keys: sharedValues,
        // Set#values(void):Iterator
        values: sharedValues,
        // Set#entries(void):Iterator
        entries: setEntries,
        // Set#forEach(callback:Function, context:void*):void ==>
        // callback.call(context, value, index) === not in specs
        forEach: sharedForEach,
      }).apply(this, arguments);
    }
  }
  Collections.Set = Set;
  class WeakSet {
    constructor() {
      return createCollection({
                // WeakSet#delete(key:void*):boolean
        'delete': sharedDelete,
                // WeakSet#add(value:void*):boolean
        add: sharedAdd,
                // WeakSet#clear():
        clear: sharedClear,
                // WeakSet#has(value:void*):boolean
        has: setHas
      }, true).apply(this, arguments);
    }
    delete() { }
    add(value) { }
    clear() { }
    has(value) { }
    }
  Collections.WeakSet = WeakSet;
})(Collections || (Collections = {}));
export default Collections;
