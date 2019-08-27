var rgb_to_cmyk = {
  params: ['rgbScaled'],
  output: function (rgbScaled) {
    var min = rgbScaled.min;
    var max = rgbScaled.max;
    var red = rgbScaled.red;
    var green = rgbScaled.green;
    var blue = rgbScaled.blue;
    var k = (1 - max);
    var c = (1 - red - k ) / (1 - k);
    var m = (1 - green - k ) / (1 - k);
    var y = (1 - blue - k ) / (1 - k);
    return {
      cyan: c,
      magenta: m,
      yellow: y,
      black: k
    };
  }
};
