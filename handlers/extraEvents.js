const boxConsole = require("box-console");
module.exports = async _0x50ff30 => {
  let _0x384337 = "Welcome to " + "Server Handler".bold.blue;
  console.clear();
  boxConsole([_0x384337]);
  _0x50ff30.logger = _0x3993bc => {
    var _0x214907 = new Date();
    let _0x3feb32 = " " + ((_0x214907.getDate() + '/' + (_0x214907.getMonth() + 0x1) + '/' + _0x214907.getFullYear()).brightBlue.bold + " " + '│'.brightMagenta.bold);
    if (typeof _0x3993bc == "string") {
      console.log(_0x3feb32, _0x3993bc.split("\n").map(_0x3ea37b => ('' + _0x3ea37b).green).join("\n" + _0x3feb32 + " "));
    } else {
      if (typeof _0x3993bc == "object") {
        console.log(_0x3feb32, JSON.stringify(_0x3993bc, null, 0x3).green);
      } else if (typeof _0x3993bc == "boolean") {
        console.log(_0x3feb32, String(_0x3993bc).cyan);
      } else {
        console.log(_0x3feb32, _0x3993bc);
      }
    }
  };
};