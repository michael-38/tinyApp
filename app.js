module.exports = {
  generateRandomString: () => {
    var randomString = "";
    randomString += Math.random().toString(36).substr(2,6);
    return randomString;
  }
}
