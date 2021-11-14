let idObjects = [], ids = [];
//-----------------------------------------------------------------
function SetIdObject(name, id) {
  idObjects[name + id] = id;
  ids.push(id);
}
module.exports.SetIdObject = SetIdObject;

function SetValueChars(name, array) {
  for (let i = 0; i < ids.length; i++) {
    if (idObjects[name + ids[i]]) {
      let o = world.getObjectById(idObjects[name + ids[i]]);
      if (o.RecalculationMain)
        o.RecalculationMain(array);
    }
  }
}
module.exports.SetValueChars = SetValueChars;
//-----------------------------------------------------------------
let currentLevel = 1, currentFreePoints = 0;
function SetFreePoints(name, value) {
  currentFreePoints = value;
  for (let i = 0; i < ids.length; i++) {
    if (idObjects[name + ids[i]]) {
      let o = world.getObjectById(idObjects[name + ids[i]]);
      if (o.SetFreeSkillPoint) {
        o.SetFreeSkillPoint(value * currentLevel);
        break;
      }
    }
  }
}
module.exports.SetFreePoints = SetFreePoints;

function ChangeMaxValue(name) {
  for (let i = 0; i < ids.length; i++) {
    if (idObjects[name + ids[i]]) {
      let o = world.getObjectById(idObjects[name + ids[i]]);
      if (o.ChangeMaxHealth) {
        o.ChangeMaxHealth();
        break;
      }
    }
  }
}

function SetCurrentLevel(name, value) {
  currentLevel = value;
  SetFreePoints(name, currentFreePoints);
  ChangeMaxValue(name);
}
module.exports.SetCurrentLevel = SetCurrentLevel;
function GetCurrentLevel() {
  return currentLevel;
}
module.exports.GetCurrentLevel = GetCurrentLevel;
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
module.exports.AddValueMain = AddValueMain;
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
module.exports.TypeCharacteristic = TypeCharacteristic
//-----------------------------------------------------------------
function PositionsFontUI(startX, i) { return startX - 0.005 * i; }
module.exports.PositionsFontUI = PositionsFontUI;

const TypeShow = {
  STANDART: 0,
  PROCENT: 1,
}
module.exports.TypeShow = TypeShow;

function ChangeImageSlider(image, value, maxValue, position, text, parent, startX, type, multiply) {
  type = type || TypeShow.STANDART; multiply = multiply || 10;
  let procent = parseInt((100 * value) / maxValue);
  image.width = procent * multiply || 1;
  image.position = position.add(new Vector(0, PositionsFontUI(startX, image.width), 0));
  if (TypeShow.STANDART == type)
    text.setText(value + "/" + maxValue);
  else if (TypeShow.PROCENT == type)
    text.setText(procent + "%");
  parent.updateUI(image);
}
module.exports.ChangeImageSlider = ChangeImageSlider;
//-----------------------------------------------------------------
function CreateCanvasElement(nC, position, widgetWidth, widgetHeight) {
  let nCUI = new UIElement();
  nCUI.useWidgetSize = false;
  nCUI.position = position;
  nCUI.rotation = new Rotator(0, 0, 180);
  if (nC) {
    nCUI.widget = nC;
  }
  nCUI.width = widgetWidth;
  nCUI.height = widgetHeight;
  nCUI.scale = 0.1;
  return nCUI;
}
module.exports.CreateCanvasElement = CreateCanvasElement;
//-----------------------------------------------------------------
function GetTextFont() {
  return "Fallout.ttf";
}
module.exports.GetTextFont = GetTextFont;
function GetTextColor() {
  return new Color(1, 0.71, 0.25);
}
module.exports.GetTextColor = GetTextColor;