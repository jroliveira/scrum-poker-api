'use strict';

const
    compress = require('koa-compress'),
    cors = require('kcors'),
    koa = require('koa.io'),
    app = module.exports = koa();

require('koa-qs')(app);

app.use(cors());
app.use(compress());

var rooms = {};

app.io.use(function* userLeft(next) {
    yield* next;
    
    if (this.user) {
        this.leave(this.user.room);

        let index = rooms[this.user.room].users.indexOf(this.user);
        if (index > -1) {
            rooms[this.user.room].users.splice(index, 1);
        }

        this.broadcast.to(this.user.room).emit('user left', this.user);

        this.user = null;
    }
});

/*
 * router for socket event
 */

app.io.route('join', function* userJoin(next, user) {
    this.user = {
        id: this.socket.id,
        name: user.name,
        room: user.room
    };

    this.join(this.user.room);

    if (!rooms[this.user.room]) {
        rooms[this.user.room] = { users: [] };
    }

    this.emit('joined', rooms[this.user.room].users);
    this.broadcast.to(this.user.room).emit('user joined', this.user);

    rooms[this.user.room].users.push(this.user);
});

app.io.route('card reveal', function* (next, card) {
    let cardRevealed = {
        userId: this.user.id,
        points: card
    };

    this.broadcast.to(this.user.room).emit('card revealed', cardRevealed);
});

if (!module.parent) {
    let port = process.env.PORT || 8081;
    app.listen(port);

    console.log('listening on port 8081');
}
