var rgb_scaled = {
  params: ['redValue', 'greenValue', 'blueValue'],
  constants: {
    rgbPartToScaleOf1: function (value) {
      var _value = parseFloat(value);
      return _value / 255;
    }
  },
  models: {
    redScaledTo1: function (redValue, rgbPartToScaleOf1) {
      return rgbPartToScaleOf1(redValue);
    },
    greenScaledTo1: function (greenValue, rgbPartToScaleOf1) {
      return rgbPartToScaleOf1(greenValue);
    },
    blueScaledTo1: function (blueValue, rgbPartToScaleOf1) {
      return rgbPartToScaleOf1(blueValue);
    },
    minOfRGB: function (redValue, greenValue, blueValue) {
      return Math.min(redValue, greenValue, blueValue);
    },
    minOfRGBScaledTo1: function (minOfRGB, rgbPartToScaleOf1) {
      return rgbPartToScaleOf1(minOfRGB);
    },
    maxOfRGB: function (redValue, greenValue, blueValue) {
      return Math.max(redValue, greenValue, blueValue);
    },
    maxOfRGBScaledTo1: function (maxOfRGB, rgbPartToScaleOf1) {
      return rgbPartToScaleOf1(maxOfRGB);
    }
  },
  output: function (redScaledTo1, greenScaledTo1, blueScaledTo1, minOfRGBScaledTo1, maxOfRGBScaledTo1) {
    return {
      red: redScaledTo1,
      green: greenScaledTo1,
      blue: blueScaledTo1,
      min: minOfRGBScaledTo1,
      max: maxOfRGBScaledTo1
    };
  }
};
