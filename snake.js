var farmas = {};

(function ($, ns, undefined) {
    var object = function (o) {
        function F() { };
        F.prototype = o;
        return new F();
    };

    var Pixels = function (i) {
        var imageData = i;
        var pixels = imageData.data;

        this.getColor = function (x, y) {
            var pixelRedIndex = ((y - 1) * (imageData.width * 4)) + ((x - 1) * 4);

            if (pixels[pixelRedIndex + 3] == 0) {
                return '#ffffff';
            }

            return '#' + intToHex(pixels[pixelRedIndex]) + intToHex(pixels[pixelRedIndex + 1]) + intToHex(pixels[pixelRedIndex + 2]);
        };

        var intToHex = function (i) {
            var hex = parseInt(i).toString(16);
            return (hex.length < 2) ? "0" + hex : hex;
        };
    };

    var Arena = function (canvasId) {
        var canvas = document.getElementById(canvasId);
        var ctx = canvas.getContext('2d');

        this.drawPoint = function (x, y, color, width) {
            ctx.lineCap = 'butt';
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.rect(x, y, width, width);
            ctx.fill();
        };

        this.clear = function () {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.lineWidth = 20;
            ctx.strokeStyle = '#000000';
            ctx.beginPath();
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
        };

        this.drawText = function (text, x, y, color) {
            ctx.font = 'bold 20pt Arial';
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
        };

        this.getPixels = function () {
            return new Pixels(ctx.getImageData(0, 0, canvas.width, canvas.height));
        };
        this.getHeight = function () {
            return canvas.height;
        };
        this.getWidth = function () {
            return canvas.width;
        };

    };

    var Point = function (x, y, dir) {
        this.direction = dir;
        this.x = x;
        this.y = y;

        this.set = function (argX, argY, dir) {
            this.x = argX;
            this.y = argY;
            this.direction = dir;
        }

        this.move = function (width) {
            switch (this.direction) {
                case 'N':
                    this.y = this.y - width;
                    break;
                case 'S':
                    this.y = this.y + width;
                    break;
                case 'W':
                    this.x = this.x - width;
                    break;
                case 'E':
                    this.x = this.x + width;
            }
        };
    };

    var Snake = function (c, w) {
        var color = c;
        var width = w;
        var northColor = color.substr(0, 6) + 'a';
        var eastColor = color.substr(0, 6) + 'b';
        var westColor = color.substr(0, 6) + 'c';
        var southColor = color.substr(0, 6) + 'd';

        this.head = new Point(0, 0, 'E');
        this.tail = new Point(0, 0, 'E');
        this.score = 0;
        this.grow = 10;

        var addPixel = function (color, number) {

        };

        this.moveTail = function (pixels) {
            if (this.grow > 0) {
                this.grow--;
                return false;
            }

            var tailColor = pixels.getColor(this.tail.x + (width / 2), this.tail.y + (width / 2));

            switch (tailColor) {
                case westColor:
                    this.tail.direction = 'W';
                    break;
                case eastColor:
                    this.tail.direction = 'E';
                    break;
                case northColor:
                    this.tail.direction = 'N';
                    break;
                case southColor:
                    this.tail.direction = 'S';
                    break;
            }

            this.tail.move(width);
            return true;
        };

        this.moveHead = function () {
            this.head.move(width);
        };

        this.drawHead = function (arena) {
            arena.drawPoint(this.head.x, this.head.y, color, width);
        };

        this.setDirection = function (dir, arena) {
            if ((dir == 'W' && this.head.direction != 'E' && this.head.direction != 'W')) {
                this.head.direction = dir;
                arena.drawPoint(this.head.x, this.head.y, westColor, width);
            }
            else if ((dir == 'E' && this.head.direction != 'W' && this.head.direction != 'E')) {
                this.head.direction = dir;
                arena.drawPoint(this.head.x, this.head.y, eastColor, width);
            }
            else if ((dir == 'N' && this.head.direction != 'S' && this.head.direction != 'N')) {
                this.head.direction = dir;
                arena.drawPoint(this.head.x, this.head.y, northColor, width);
            }
            else if ((dir == 'S' && this.head.direction != 'N' && this.head.direction != 'S')) {
                this.head.direction = dir;
                arena.drawPoint(this.head.x, this.head.y, southColor, width);
            }
        };
    };

    var Game = function () {
        var self = this;
        var delay = 60;
        var timer = null;

        self.arena = new Arena('game');
        self.width = 10;

        self.start = function (ops) {
            if (timer) {
                window.clearInterval(timer);
            }

            self.arena.clear();
            self.drawFruit(self.width);

            ops.init();

            timer = window.setInterval(function () { ops.tick(); }, delay);
        };

        self.drawFruit = function (width, pixels) {
            do {
                var x = getRandomNumber(width, self.arena.getWidth() - width * 2);
                var y = getRandomNumber(width, self.arena.getHeight() - width * 2);
            } while (pixels && (pixels.getColor(x + (width / 2), y + (width / 2)) != '#ffffff'))

            self.arena.drawPoint(x, y, '#ff0000', width);
        };

        self.isDead = function (point, nextColor) {
            return point.x < 0 || point.x > self.arena.getWidth()
          || point.y < 0 || point.y > self.arena.getHeight()
          || (nextColor != '#ffffff' && nextColor != '#ff0000');
        };

        self.gameOver = function () {
            window.clearInterval(timer);
            self.arena.drawText('Game Over', (self.arena.getWidth() / 2) - 80, self.arena.getHeight() / 2, '#000000');
        };

        var getRandomNumber = function (min, max) {
            var val = Math.floor((Math.random() * max) + 1);

            val = (Math.floor(val / 10)) * 10;
            if (val < min)
                return min;

            return val;
        };
    };

    ns.createMultiGame = function(ops){
        var self = object(new Game());
        var baseStart = self.start;
        var p1KeyPressHistory;
        var p2KeyPressHistory;
        var p1;
        var p2;

        self.start = function () {
            baseStart({
                init: function () {
                    p1KeyPressHistory = [];
                    p1 = new Snake('#0000ff', self.width);
                    p1.head.set(10, self.arena.getHeight() / 2, 'E');
                    p1.tail.set(10, p1.head.y, p1.head.direction);
                    p1.grow = 10;
                    p1.score = 0;

                    p2KeyPressHistory = [];
                    p2 = new Snake('#999900', self.width);
                    p2.head.set(self.arena.getWidth() - 20, self.arena.getHeight() / 2, 'W');
                    p2.tail.set(p2.head.x, p2.head.y, p2.head.direction);
                    p2.grow = 10;
                    p2.score = 0;

                    ops.setScore(0, 0);
                },
                tick: function () {
                    //react to a previously pressed keys
                    if (p1KeyPressHistory.length > 0) {
                        p1.setDirection(p1KeyPressHistory.splice(0, 1)[0], self.arena);
                    }
                    if (p2KeyPressHistory.length > 0) {
                        p2.setDirection(p2KeyPressHistory.splice(0, 1)[0], self.arena);
                    }

                    // store the current tails
                    var p1CurrentTailX = p1.tail.x;
                    var p1CurrentTailY = p1.tail.y;
                    var p2CurrentTailX = p2.tail.x;
                    var p2CurrentTailY = p2.tail.y;


                    // get the pixels
                    var pixels = self.arena.getPixels();

                    // move and delete the tails
                    if (p1.moveTail(pixels)) {
                        self.arena.drawPoint(p1CurrentTailX, p1CurrentTailY, '#ffffff', self.width);
                    }
                    if (p2.moveTail(pixels)) {
                        self.arena.drawPoint(p2CurrentTailX, p2CurrentTailY, '#ffffff', self.width);
                    }

                    //move the head
                    p1.moveHead();
                    p2.moveHead();

                    // get color of the new heads
                    var p1NextColor = pixels.getColor(p1.head.x + (self.width / 2), p1.head.y + (self.width / 2));
                    var p2NextColor = pixels.getColor(p2.head.x + (self.width / 2), p2.head.y + (self.width / 2));

                    //check if is fruit
                    var fruitEaten = false;
                    if (p1NextColor == '#ff0000') {
                        p1.grow = 10;
                        p1.score++;
                        fruitEaten = true;
                        
                    }
                    if (p2NextColor == '#ff0000') {
                        p2.grow = 10;
                        p2.score++;
                        fruitEaten = true;
                    }
                    if(fruitEaten){
                        ops.setScore(p1.score, p2.score);
                        self.drawFruit(self.width, pixels);
                    }

                    //check if either is dead
                    // TODO: both should die if the new heads collide
                    var p1Dead = self.isDead(p1.head, p1NextColor);
                    var p2Dead = self.isDead(p2.head, p2NextColor);

                    if (p1Dead || p2Dead) {
                        if(p1Dead && !p2Dead) {
                            p2.score++;
                        }
                        if(p2Dead && !p1Dead) {
                            p1.score++;
                        }

                        ops.setScore(p1.score, p2.score);                        
                        self.gameOver();
                    }
                    else {
                        // otherwise draw the new heads
                        p1.drawHead(self.arena);
                        p2.drawHead(self.arena);
                    }
                }
            });
        };

        self.handleKeydown = function (e) {

            if (e.keyCode == 65 /*a*/) {
                p1KeyPressHistory.push('W');
                return false;
            }
            if (e.keyCode == 87 /*w*/) {
                p1KeyPressHistory.push('N');
                return false;
            }
            if (e.keyCode == 68 /*d*/) {
                p1KeyPressHistory.push('E');
                return false;
            }
            if (e.keyCode == 83 /*s*/) {
                p1KeyPressHistory.push('S');
                return false;
            }

            if (e.keyCode == 37) {
                p2KeyPressHistory.push('W');
                return false;
            }
            if (e.keyCode == 38) {
                p2KeyPressHistory.push('N');
                return false;
            }
            if (e.keyCode == 39) {
                p2KeyPressHistory.push('E');
                return false;
            }
            if (e.keyCode == 40) {
                p2KeyPressHistory.push('S');
                return false;
            }
        };

        return self;
    };

    ns.createSingleGame = function (ops) {
        var self = object(new Game());
        var baseStart = self.start;
        var keyPressHistory;
        var p1;

        self.start = function () {
            baseStart({
                init: function () {
                    keyPressHistory = [];
                    p1 = new Snake('#0000ff', self.width);
                    p1.head.set(10, self.arena.getHeight() / 2, 'E');
                    p1.tail.set(10, p1.head.y, p1.head.direction);
                    p1.grow = 10;
                    p1.score = 0;
                    ops.setScore(0);
                },
                tick: function () {
                    //react to a previously pressed key
                    if (keyPressHistory.length > 0) {
                        p1.setDirection(keyPressHistory.splice(0, 1)[0], self.arena);
                    }

                    // store the current tail
                    var currentTailX = p1.tail.x;
                    var currentTailY = p1.tail.y;

                    // get the pixels
                    var pixels = self.arena.getPixels();

                    // move and delete the tail
                    if (p1.moveTail(pixels)) {
                        self.arena.drawPoint(currentTailX, currentTailY, '#ffffff', self.width);
                    }

                    //move the head
                    p1.moveHead();

                    // get color of the new head
                    var nextColor = pixels.getColor(p1.head.x + (self.width / 2), p1.head.y + (self.width / 2));

                    //check if is fruit
                    if (nextColor == '#ff0000') {
                        p1.grow = 10;
                        p1.score++;
                        ops.setScore(p1.score);
                        self.drawFruit(self.width, pixels);
                    }

                    //check if I am dead
                    if (self.isDead(p1.head, nextColor)) {
                        self.gameOver();
                    }
                    else {
                        // otherwise draw the new head
                        p1.drawHead(self.arena);
                    }
                }
            });
        };

        self.handleKeydown = function (e) {
            if (e.keyCode == 37) {
                keyPressHistory.push('W');
                return false;
            }
            if (e.keyCode == 38) {
                keyPressHistory.push('N');
                return false;
            }
            if (e.keyCode == 39) {
                keyPressHistory.push('E');
                return false;
            }
            if (e.keyCode == 40) {
                keyPressHistory.push('S');
                return false;
            }
        };

        return self;
    };
})(jQuery, farmas);