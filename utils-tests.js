
let utils = require("./utils");

/* rget */
let a = {
    users: {
        user1: {
            username: "USER1",
            password: "password"
        },
        user2: {
            username: "USER2",
            password: "password"
        }
    }
};
console.log(utils.rget(a, "users/user1/username", {separator: "/"}));
console.log(utils.rget(a, "users.user1"));
console.log(utils.rget(a, "users.user3"));
console.log(utils.rget(null, "users.user1"));
console.log(utils.rget(a, ""));

/* rset */
utils.rset(a, "users.user2.publicname", "NEWUSER2");
console.log(utils.rget(a, "users.user2"));

/* rdelete */
utils.rdelete(a, "users.user2.publicname");
console.log(utils.rget(a, "users.user2"));

/* equals */
console.log("utils.equals(true, true): " + utils.equals(true, true));
console.log("utils.equals(0, 0): " + utils.equals(0, 0));
console.log("utils.equals([], []): " + utils.equals([], []));
console.log("utils.equals('test','test'): " + utils.equals("test", "test"));
console.log("utils.equals({}, {}): " + utils.equals({}, {}));
console.log("utils.equals({a:1}, {a:1}): " + utils.equals({a:1}, {a:1}));
console.log("utils.equals(null, null): " + utils.equals(null, null));
console.log("utils.equals(/.*/, /.*/): " + utils.equals(/.*/, /.*/));
console.log("utils.equals(null, {}): " + utils.equals(null, {}));

let date = new Date();
let date2 = new Date(date.getTime());
console.log(utils.equals(date, date2));

let foo = function(){};
console.log(utils.equals(foo, foo));

console.log(utils.equals({a:1}, {a:2}));


/* clone */
let b = utils.clone(a);
delete b.users;
console.log(a, b);



