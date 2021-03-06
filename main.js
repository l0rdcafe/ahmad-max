var da2ery = [
  '                      ',
  '                      ',
  '       e              ',
  '                      ',
  '                      ',
  '                      ',
  '                  e   ',
  '                      ',
  '           e          ',
  '                      ',
  '                      ',
  '                      ',
  '                      ',
  '                   e  ',
  '                      ',
  '        e             ',
  '                      ',
  '                      ',
  '                      ',
  '                      ',
  '     e                ',
  '                      ',
  '                      ',
  '                      ',
  '                      ',
  '                      ',
  '                      ',
  '                      ',
  '                      ',
  '          a           '
];

var view = {};
var model = {};
var handlers = {};
var helpers = {};
var scale = 36.125;
var playerXSpeed = 7;
var maxStep = 0.1;
var arrowCodes = {
  37: 'left',
  38: 'up',
  39: 'right'
};
var arrows;

helpers.element = function (elt, className) {
  var el = document.createElement(elt);
  if (className) {
    el.className = className;
  }
  return el;
};

model.Vector = function (x, y) {
  this.x = x;
  this.y = y;
};

model.Vector.prototype.plus = function (other) {
  return new model.Vector(this.x + other.x, this.y + other.y);
};

model.Vector.prototype.times = function (factor) {
  return new model.Vector(this.x * factor, this.y * factor);
};

model.Ahmad = function (pos) {
  this.pos = pos.plus(new model.Vector(0, -0.5));
  this.size = new model.Vector(0.8, 1.5);
  this.speed = new model.Vector(0, 5);
};

model.Ahmad.prototype.moveX = function (step, level, keys) {
  var motion;
  var newPos;
  var obstacle;
  this.speed.x = 0;
  if (keys.left) {
    this.speed.x -= playerXSpeed;
  }
  if (keys.right) {
    this.speed.x += playerXSpeed;
  }
  motion = new model.Vector(this.speed.x * step, 0);
  newPos = this.pos.plus(motion);
  obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle) {
    level.playerTouched(obstacle);
  } else {
    this.pos = newPos;
    if (newPos.x === level.width) {
      this.speed.x = 0;
    }
  }
};

model.Ahmad.prototype.act = function (step, level, keys) {
  var otherActor;
  this.moveX(step, level, keys);

  otherActor = level.actorAt(this);
  if (otherActor) {
    level.playerTouched(otherActor.type, otherActor);
  }

  if (level.status === 'lost') {
    this.pos.y += step;
    this.size.y -= step;
  }
};

model.Ahmad.prototype.type = 'ahmad';

model.Baltagy = function (pos) {
  this.pos = pos;
  this.size = new model.Vector(1, 1);
  this.speed = new model.Vector(0, 3);
};

model.Baltagy.prototype.act = function (step, level) {
  var newPos = this.pos.plus(this.speed.times(step));
  if (!level.obstacleAt(newPos, this.size)) {
    this.pos = newPos;
  }
};

model.Baltagy.prototype.type = 'baltagy';

model.actorChars = {
  a: model.Ahmad,
  e: model.Baltagy
};

model.Level = function (plan) {
  var x;
  var y;
  var row;
  var gridRow;
  var ch;
  var field;
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

model.Level.prototype.obstacleAt = function (pos, size) {
  var xStart = Math.floor(pos.x);
  var xEnd = Math.ceil(pos.x + size.x);
  var yStart = Math.floor(pos.y);
  var yEnd = Math.ceil(pos.y + size.y);
  var x;
  var y;
  var field;

  if (yEnd > this.height) {
    return 'baltagy';
  } else if (xEnd > this.width || xStart < 0) {
    return 'bas';
  }
  for (y = yStart; y < yEnd; y += 1) {
    for (x = xStart; x < xEnd; x += 1) {
      field = this.grid[y][x];
      if (field) {
        return field;
      }
    }
  }
};

model.Level.prototype.actorAt = function (actor) {
  var i;
  var other;
  for (i = 0; i < this.actors.length; i += 1) {
    other = this.actors[i];
    if (
      other !== actor &&
      actor.pos.x + actor.size.x > other.pos.x &&
      actor.pos.x < other.pos.x + other.size.x &&
      actor.pos.y + actor.size.y > other.pos.y &&
      actor.pos.y < other.pos.y + other.size.y
    ) {
      return other;
    }
  }
};

model.Level.prototype.animate = function (step, keys) {
  var thisStep;
  if (this.status !== null) {
    this.finishDelay -= step;
  }

  while (step > 0) {
    thisStep = Math.min(step, maxStep);
    this.actors.forEach(function (actor) {
      actor.act(thisStep, this, keys);
    }, this);
    step -= thisStep;
  }
};

model.Level.prototype.playerTouched = function (type) {
  if (type === 'baltagy' && this.status === null) {
    this.status = 'lost';
    this.finishDelay = 1;
  }
};

model.Level.prototype.isFinished = function () {
  return this.status !== null && this.finishDelay < 0;
};

model.runLevel = function (level, Display, andThen) {
  var game = new Display(document.querySelector('.container'), level);
  view.runAnimation(function (step) {
    level.animate(step, arrows);
    game.drawFrame(step);
    if (level.isFinished()) {
      game.clear();
      if (andThen) {
        andThen(level.status);
      }
      return false;
    }
  });
};

view.DOMView = function (parent, level) {
  this.wrapper = parent.appendChild(helpers.element('div', 'game'));
  this.level = level;

  this.wrapper.appendChild(this.drawBackground());
  this.actorLayer = null;
  this.drawFrame();
};

view.DOMView.prototype.drawBackground = function () {
  var background = helpers.element('table', 'background');
  background.style.width = this.level.width * scale + 'px';
  this.level.grid.forEach(function (row) {
    var rowEl = background.appendChild(helpers.element('tr'));
    rowEl.style.height = scale + 'px';
    row.forEach(function (type) {
      rowEl.appendChild(helpers.element('td', type));
    });
  });
  return background;
};

view.DOMView.prototype.drawActors = function () {
  var wrap = helpers.element('div');
  this.level.actors.forEach(function (actor) {
    var rect = wrap.appendChild(helpers.element('div', 'actor ' + actor.type));
    rect.style.width = actor.size.x * scale + 'px';
    rect.style.height = actor.size.y * scale + 'px';
    rect.style.left = actor.pos.x * scale + 'px';
    rect.style.top = actor.pos.y * scale + 'px';
  });
  return wrap;
};

view.DOMView.prototype.drawFrame = function () {
  if (this.actorLayer) {
    this.wrapper.removeChild(this.actorLayer);
  }
  this.actorLayer = this.wrapper.appendChild(this.drawActors());
  this.wrapper.className = 'game ' + (this.level.status || '');
};

view.DOMView.prototype.clear = function () {
  this.wrapper.parentNode.removeChild(this.wrapper);
};

view.runAnimation = function (frameFunc) {
  var lastTime = null;

  function frame(time) {
    var stop = false;
    var timeStep;
    if (lastTime !== null) {
      timeStep = Math.min(time - lastTime, 100) / 1000;
      stop = frameFunc(timeStep) === false;
    }
    lastTime = time;
    if (!stop) {
      requestAnimationFrame(frame);
    }
  }
  requestAnimationFrame(frame);
};

handlers.trackKeys = function (codes) {
  var pressed = Object.create(null);

  function handler(event) {
    var down;
    if (codes.hasOwnProperty(event.keyCode)) {
      down = event.type === 'keydown';
      pressed[codes[event.keyCode]] = down;
      event.preventDefault();
    }
  }
  addEventListener('keydown', handler);
  addEventListener('keyup', handler);
  return pressed;
};

arrows = handlers.trackKeys(arrowCodes);
model.runLevel(new model.Level(da2ery), view.DOMView, function (status) {
  if (status === 'lost') {
    model.runLevel(new model.Level(da2ery), view.DOMView, function () {
      document.querySelector('.container').textContent = 'Game Over';
    });
  }
});
console.log(new model.Level(da2ery));
