export default class Util {
  arrayRandom(array) {
    let value = ''
    while (true) {
      value = Math.random()
      if (!array.toString().includes(value)) {
        array.push(value)
        break
      }
    }
    return value.toString()
  }

  isJSON(arg) {
    arg = (typeof arg === "function") ? arg() : arg
    if (typeof arg !== "string") {
      return false
    }
    try {
      arg = (!JSON) ? eval("(" + arg + ")") : JSON.parse(arg)
      return true
    } catch (e) {
      return false
    }
  }

  bin2dec(num) {
    return num.split('').reverse().reduce(function (x, y, i) {
      return (y === '1') ? x + Math.pow(2, i) : x;
    }, 0);
  }

  parseBigInt(bigint, base) {
    //convert bigint string to array of digit values
    for (var values = [], i = 0; i < bigint.length; i++) {
      values[i] = parseInt(bigint.charAt(i), base);
    }
    return values;
  }

  formatBigInt(values, base) {
    //convert array of digit values to bigint string
    for (var bigint = '', i = 0; i < values.length; i++) {
      bigint += values[i].toString(base);
    }
    return bigint;
  }

  convertBase(bigint, inputBase, outputBase) {
    //takes a bigint string and converts to different base
    var inputValues = this.parseBigInt(bigint, inputBase),
      outputValues = [], //output array, little-endian/lsd order
      remainder,
      len = inputValues.length,
      pos = 0,
      i;
    while (pos < len) { //while digits left in input array
      remainder = 0; //set remainder to 0
      for (i = pos; i < len; i++) {
        //long integer division of input values divided by output base
        //remainder is added to output array
        remainder = inputValues[i] + remainder * inputBase;
        inputValues[i] = Math.floor(remainder / outputBase);
        remainder -= inputValues[i] * outputBase;
        if (inputValues[i] === 0 && i === pos) {
          pos++;
        }
      }
      outputValues.push(remainder);
    }
    outputValues.reverse(); //transform to big-endian/msd order
    return this.formatBigInt(outputValues, outputBase);
  }

  //convert largeNumber from base 2 to base 10
  //var largeIntDecimal = convertBase(largeNumber, 2, 10);

  groupDigits(bigint) { //3-digit grouping
    return bigint.replace(/(\d)(?=(\d{3})+$)/g, "$1 ");
  }

} 