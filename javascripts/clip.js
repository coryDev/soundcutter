var Clip = new Class({
  Extends: Widget,

  initialize: function(options) {
    Widget.prototype.initialize.call(this, options);

    this.start = 0;
    this.sampleRate = 44100;
    this.sampleLength = 0;
    this.sampleStart = 0;
    this.playing = false;
    this.source = this.context.createBufferSource();
    this.source.connect(this.context.destination);
  },

  length: function() {
    return this.sampleLength / this.sampleRate;
  },

  updateTime: function(time) {
    return;
    if (this.wave) {
      if (!this.playing && time + 50 >= this.start) {
        this.source.noteOn(this.context.currentTime + this.start - time);
        this.playing = true;
      }
      if (this.playing && time + 50 >= this.start + this.length()) {
        this.source.noteOff(this.context.currentTime + this.start + this.length() - time);
        this.playing = false;
      }
    }
  },

  doLayout: function() {
    this.x = this.start * this.pixelsPerSecond;
    this.width = this.length() * this.pixelsPerSecond;
  },

  setBuffer: function(buffer) {
    this.source.buffer = this.context.createBuffer(buffer, false);
    this.wave = new Int16Array(buffer);
    this.sampleLength = this.wave.length;
  },

  drawCanvas: function(context) {
    context.fillStyle = '#eee';
    context.fillRect(0, 0, this.width, this.height);

    context.fillStyle = '#ccc';
    context.fillRect(0, 0, 20, this.height);
    context.fillRect(this.width - 20, 0, 20, this.height);

    if (this.wave) {
      var yscale = this.height / 65536 * 2;
      var ymid = this.height / 2;
      var xstep = parseInt(this.sampleRate / this.pixelsPerSecond);
      var offset = this.sampleStart;

      context.fillStyle = "#666";
      context.beginPath();
      context.moveTo(0, ymid);

      for (var i = 0; i < this.width; i++) {
        context.lineTo(i, ymid + this.wave[offset + i * xstep] * yscale);
      }

      context.stroke();
    }

    context.fillStyle = '#000';
    context.font = 'Arial';
    context.fillText(this.name, 10, 10);
  },

  onTouchDown: function(event) {
    this.drag = {
      start: this.start,
      sampleStart: this.sampleStart,
      sampleLength: this.sampleLength,
      pageX: event.pageX
    };

    if (event.localX < 20) {
      this.drag.type = 'start';
    }
    else if ((this.width - event.localX) < 20) {
      this.drag.type = 'end';
    }
    else {
      this.drag.type = 'move';
    }

    return true;
  },

  onTouchMove: function(event) {
    var deltaX = event.pageX - this.drag.pageX;

    switch (this.drag.type) {
    case 'move':
      this.start = this.drag.start + deltaX / this.pixelsPerSecond;
      break;
    case 'start':
      this.start = this.drag.start + deltaX / this.pixelsPerSecond;
      this.sampleStart = this.drag.sampleStart + (deltaX / this.pixelsPerSecond) * this.sampleRate;
      this.sampleLength = this.drag.sampleLength - (deltaX / this.pixelsPerSecond) * this.sampleRate;
      break;
    case 'end':
      this.sampleLength = this.drag.sampleLength + (deltaX / this.pixelsPerSecond) * this.sampleRate;
      break;
    }

    this.start = Math.max(0, this.start);
    this.sampleStart = Math.max(0, this.sampleStart);
    this.sampleLength = Math.min(this.sampleLength, this.wave.length);

    return true;
  }

});