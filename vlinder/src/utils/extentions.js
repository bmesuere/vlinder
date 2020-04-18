( function (Set) {
    Set.prototype.toggle = function(value, bool) {
        if (bool) this.add(value);
        else      this.delete(value);
        return this
    }
}) (Set);
