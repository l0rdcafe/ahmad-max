var da2ery = [
  ' e    xxxxx           ',
  '                      ',
  '       e           xxx',
  '                      ',
  'xxxxx                 ',
  '                      ',
  '                  e   ',
  '  xxxxx               ',
  '           e        xx',
  '                      ',
  '                      ',
  '       xxxxx    xxxx  ',
  '    xxxxxx       xxxxx',
  '                   e  ',
  '                      ',
  '        e             ',
  '  xxxxx               ',
  '                      ',
  '                      ',
  '            xxxxx     ',
  '     e                ',
  '                      ',
  'xxx            xx     ',
  '                      ',
  '              xxx     ',
  '                      ',
  '  xxx                 ',
  '                      ',
  '                      ',
  '          a           '
];

var model = {};

model.Level = function (plan) {
  var x;
  var y;
  var gridRow;
  var row;
  var field;
  var ch;
  var Actor;
  this.width = plan[0].length;
  this.height = plan.length;
  this.grid = [];
  this.actors = [];

  for (y = 0; y < this.height; y += 1) {
    row = plan[y];
    gridRow = [];
    for (x = 0; x < this.width; x += 1) {
      ch = row[x];
      field = null;
      Actor = model.actorChars[ch];
      if (Actor) {
        this.actors.push(new Actor(new model.Vector(x, y), ch));
      } else if (ch === 'x') {
        field = 'tire';
      } else if (ch === 'e') {
        field = 'baltagy';
      }
      gridRow.push(field);
    }
    this.grid.push(gridRow);
  }
  this.player = this.actors.filter(function (actor) {
    return actor.type === 'ahmad';
  })[0];
  this.finishDelay = null;
  this.status = this.finishDelay;
};

model.Level.prototype.isFinished = function () {
  return this.status !== null && this.finishDelay < 0;
};

model.Vector = function (x, y) {
  this.x = x;
  this.y = y;
};

model.Vector.prototype.plus = function (other) {
  return new model.Vector(this.x + other.x, this.y + other.x);
};

model.Vector.prototype.times = function (factor) {
  return new model.Vector(this.x * factor, this.y * factor);
};

model.Ahmad = function (pos) {
  this.pos = pos.plus(new model.Vector(0, -0.5));
  this.size = new model.Vector(0.8, 1.5);
  this.speed = new model.Vector(0, -10);
};

model.Ahmad.prototype.type = 'ahmad';

model.Baltagy = function (pos) {
  this.pos = pos;
  this.size = new model.Vector(2, 2);
  this.speed = new model.Vector(0, 5);
};

model.Baltagy.prototype.type = 'baltagy';

model.Tire = function (pos) {
  this.pos = pos.plus(new model.Vector(0.2, 0.1));
  this.basePos = this.pos;
  this.size = new model.Vector(1, 1);
  this.wobble = Math.random() * (Math.PI * 2);
};

model.Tire.prototype.type = 'tire';

model.actorChars = {
  a: model.Ahmad,
  x: model.Tire,
  e: model.Baltagy
};

console.log(new model.Level(da2ery));
