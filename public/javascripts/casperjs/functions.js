exports.avgArray = function(array) {
	var sum = 0;
	var len = array.length;
	for (var i = 0; i < len; i++) {
		sum += array[i];
	}
	return sum / len;
}

exports.convertIntoNumber = function(num) {
	// convert a string ("11.7k" or "11,7000") into the integer it represents (11700)
	try {
		if (typeof num == 'number') {
			return num;
		} else if (typeof num == 'string') {
			num = num.trim();
		}
		if (num == null) {
			return -1;
		} if (num.indexOf(",") != -1) {
			num = num.replace(/,/g, "");
		} if (num.indexOf("m") != -1) {
			var mil = num.replace("m", "");
			return parseFloat(mil) * Math.pow(10,6);
		} else if (num.indexOf("k") != -1) {
			var thousand = num.replace("k", "");
			return parseFloat(thousand) * Math.pow(10,3);
		}
			return parseInt(num);
		} catch (e) {
			return -1;
	}
}