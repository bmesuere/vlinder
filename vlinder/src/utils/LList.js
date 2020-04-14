class Node {
    empty = true;

    constructor(data, next = null) {
        if (arguments.length) Object.assign(this,{data,next,empty:false});
    }

    proxy() {
        const self = this;
        return new Proxy(this.data,{
            get: (_,prop) => {
                if (prop == "_lref") return self;
                return Reflect.get(...arguments);
            }
        });
    }

    pop() {
        if (this.empty) throw new Error("Can't pop tail element");
        const data = this.data;
        Object.assign(this,this.next);
        //free(this.next)
        return data;
    }

}

export default class LList {
    constructor() { this.head = new Node() }
    empty() { return this.head.empty }
    push(data) { return (this.head = new Node(data,this.head)).proxy(); }

    static pop(proxy) { return proxy._lref.pop(); }

    [Symbol.iterator]() {
        const self = this;
        return function* () {
            let node = self.head;
            while (!node.empty) {
                yield node.data;
                node = node.next;
            }
        }()
    }
}
