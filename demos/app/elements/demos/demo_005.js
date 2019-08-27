var demo = {
  params: ['title'],
  constants: {
    labelStyling: 'display: inline-block; width: 100px;',
    rgbPartToHex: function (value) {
      var _value = parseInt(value);
      var hex = _value.toString(16);
      var needsPadding = hex.length === 1;
      var formatted = needsPadding ? '0' + hex : hex;
      return formatted.toString();
    },
    roundToTwoDecimalPlaces: function (value) {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Arithmetic_Operators#Unary_plus
      return +(value).toFixed(2);
    }
  },
  variables: {
    redValue: 71,
    greenValue: 199,
    blueValue: 92
  },
  models: {
    rgbToHex: function (redValue, greenValue, blueValue, rgbPartToHex) {
      var RR = rgbPartToHex(redValue);
      var GG = rgbPartToHex(greenValue);
      var BB = rgbPartToHex(blueValue);
      return '#' + RR + GG + BB;
    },
    rgbScaled: {
      args: { redValue: 'redValue', greenValue: 'greenValue', blueValue: 'blueValue' }, // Explicitly pass args by specifying them in the args key.
      type: 'rgb_scaled' // See demos/app/models/rgb_scaled.js
    },
    rgbToCMYK: { type: 'rgb_to_cmyk' }, // Implicitly pass args by omitting the args key.
    cmykPercent: function (rgbToCMYK) {
      return {
        c: Math.round(rgbToCMYK.cyan * 100),
        m: Math.round(rgbToCMYK.magenta * 100),
        y: Math.round(rgbToCMYK.yellow * 100),
        k: Math.round(rgbToCMYK.black * 100)
      };
    },
    rgbToHSL: { // How to convert RGB to HSL: https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
      args: { rgbScaled: 'rgbScaled' }, // This line may be omitted to take advantage of implicit arg/parameter passing.
      type: {
        params: ['rgbScaled'],
        models: {
          luminance: function (rgbScaled) {
            return (rgbScaled.min + rgbScaled.max) / 2;
          },
          saturation: function (rgbScaled, luminance) {
            var min = rgbScaled.min;
            var max = rgbScaled.max;
            var noSaturation = min === max;
            if (noSaturation) return 0;
            if (luminance <= 0.5) return (max - min) / (min + max);
            else return (max - min) / (2 - min - max);
          },
          hue: function (rgbScaled, saturation) {
            if (saturation === 0) return 0;
            var min = rgbScaled.min;
            var max = rgbScaled.max;
            var red = rgbScaled.red;
            var green = rgbScaled.green;
            var blue = rgbScaled.blue;
            var redIsDominant = max === red;
            var greenIsDominant = max === green;
            var blueIsDominant = max === blue;
            var hue, degrees;
            if (redIsDominant) {
              hue = (green - blue) / (max - min);
            } else if (greenIsDominant) {
              hue = 2 + (blue - red) / (max - min);
            } else if (blueIsDominant) {
              hue = 4 + (red - green) / (max - min);
            }
            degrees = hue * 60;
            if (degrees < 0) degrees = degrees + 360;
            return Math.round(degrees);
          }
        },
        output: function (hue, saturation, luminance) {
          return {
            h: hue,
            s: saturation,
            l: luminance
          };
        }
      }
    },
    hslPercent: function (rgbToHSL, roundToTwoDecimalPlaces) {
      return {
        s: roundToTwoDecimalPlaces(rgbToHSL.s * 100),
        l: roundToTwoDecimalPlaces(rgbToHSL.l * 100)
      };
    }
  }
};
