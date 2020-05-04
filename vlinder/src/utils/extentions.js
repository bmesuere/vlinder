(function (Set) {
    Set.prototype.toggle = function (value, bool) {
        if (bool) this.add(value);
        else this.delete(value);
        return this
    }
})(Set);

(function (Array) {
    Array.prototype.equals = function (otherArray) {
        return this.length === otherArray.length && this.every((value, index) => value === otherArray[index])
    }
})(Array);
