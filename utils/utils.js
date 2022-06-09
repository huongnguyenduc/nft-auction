export function isNumeric(str) {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

export function getShortAddress(address, userAddress = "") {
  if (!address || address.length === 0) return "";
  if (address.toLowerCase() === userAddress.toLowerCase()) return "you";
  return (
    address.substring(0, 6) + "..." + address.substring(address.length - 4)
  );
}

export function timeLeft(date) {
  var seconds = Math.floor((date - new Date()) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years left";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months left";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days left";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours left";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes left";
  }
  return Math.floor(seconds) + " seconds left";
}
