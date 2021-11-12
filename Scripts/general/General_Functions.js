const { Vector } = require('@tabletop-playground/api');
//-----------------------------------------------------------------
let idObjects = [];
let ids = [];
function SetIdObject(name, id) {
  idObjects[name + id] = id;
  ids.push(id);
}
function SetValueChars(name, array) {
  for (let i = 0; i < ids.length; i++) {
    if (idObjects[name + ids[i]]) {
      let o = world.getObjectById(idObjects[name + ids[i]]);
      if (o.RecalculationMain)
        o.RecalculationMain(array);
    }
  }
}
//-----------------------------------------------------------------
let currentLevel = 1, currentFreePoints = 0;
function SetFreePoints(name, value) {
  currentFreePoints = value;
  for (let i = 0; i < ids.length; i++) {
    if (idObjects[name + ids[i]]) {
      let o = world.getObjectById(idObjects[name + ids[i]]);
      if (o.SetFreeSkillPoint)
        o.SetFreeSkillPoint(value * currentLevel);
    }
  }
}
function SetCurrentLevel(name, value) {
  currentLevel = value;
  SetFreePoints(name, currentFreePoints);
}
//-----------------------------------------------------------------
function AddValueMain(name, nameValue, value, type) {
  for (let i = 0; i < ids.length; i++) {
    if (idObjects[name + ids[i]]) {
      let o = world.getObjectById(idObjects[name + ids[i]]);
      if (o.getTemplateMetadata() == type) {
        o.AdditionMain(nameValue, value);
      }
    }
  }
}
//-----------------------------------------------------------------
const TypeCharacteristic = {
  strenght: 0,
  perception: 1,
  endurance: 2,
  charism: 3,
  intelligence: 4,
  dextery: 5,
  luck: 6
}
//-----------------------------------------------------------------
function PositionsFontUI(startX, i) { return startX - 0.005 * i; }

const TypeShow = {
  STANDART: 0,
  PROCENT: 1,
}
function ChangeImageSlider(image, value, maxValue, position, text, parent, startX, type, multiply) {
  type = type || TypeShow.STANDART; multiply = multiply || 10;
  let procent = (100 * value) / maxValue;
  image.width = procent * multiply;
  image.position = position.add(new Vector(0, PositionsFontUI(startX, image.width), 0));
  if (TypeShow.STANDART == type)
    text.setText(value + "/" + maxValue);
  else if (TypeShow.PROCENT == type)
    text.setText(procent + "%");
  parent.updateUI(image);
}
//-----------------------------------------------------------------
module.exports.ChangeImageSlider = ChangeImageSlider;
module.exports.PositionsFontUI = PositionsFontUI;
module.exports.TypeShow = TypeShow;
module.exports.SetValueChars = SetValueChars;
module.exports.SetIdObject = SetIdObject;
module.exports.TypeCharacteristic = TypeCharacteristic
module.exports.AddValueMain = AddValueMain;
module.exports.SetFreePoints = SetFreePoints;
module.exports.SetCurrentLevel = SetCurrentLevel;