const { world } = require('@tabletop-playground/api');
let idObjects = [], ids = [];
//-----------------------------------------------------------------
function SetIdObject(name, id) {
  idObjects[name + id] = id;
  ids.push(id);
}
module.exports.SetIdObject = SetIdObject;

function GetObjectById(name) {
  for (const id of ids) {
    if (idObjects[name + id]) {
      return world.getObjectById(idObjects[name + id]);
    }
  }
}

function SetValueChars(name, array) {
  let o = GetObjectById(name);
  if (o && o.RecalculationMain)
    o.RecalculationMain(array);
}
module.exports.SetValueChars = SetValueChars;
//-----------------------------------------------------------------
let currentLevel = 1, currentFreePoints = 0;
function SetFreePoints(name, value) {
  currentFreePoints = value;

  let o = GetObjectById(name);
  if (o && o.SetFreeSkillPoint)
    o.SetFreeSkillPoint(value * currentLevel);
}
module.exports.SetFreePoints = SetFreePoints;

function ChangeMaxValue(name) {
  let o = GetObjectById(name);
  if (o && o.ChangeMaxHealth)
    o.ChangeMaxHealth();
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
  let o = GetObjectById(name);
  if (o && o.getTemplateMetadata() == type)
    o.AdditionMain(nameValue, value);
}
module.exports.AddValueMain = AddValueMain;

function AddConditionMain(name, nameValue, condition, type) {
  let o = GetObjectById(name);
  if (o && o.getTemplateMetadata() == type)
    o.ConditionMain(nameValue, condition);
}
module.exports.AddConditionMain = AddConditionMain;
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
//-----------------------------------------------------------------
function CalculateConditionValue(conditionValueMain, plate, wordCheck) {
  let conditionMain = 0;
  let condition = ConditionCheck(conditionValueMain);
  if (condition) {
    let brokenCondition = conditionValueMain.split(" ");
    if (brokenCondition[0] == wordCheck) {
      if (brokenCondition[2].includes("%")) {
        let checkValue = parseInt(brokenCondition[2].slice(0, brokenCondition[2].length - 1));
        if (ConditionValue(plate.GetProcent(), checkValue, condition)) {
          conditionMain += parseInt(brokenCondition[brokenCondition.length - 1]);
        }
      } else {
        let checkValue = parseInt(brokenCondition[2]);
        if (ConditionValue(plate.value, checkValue, condition)) {
          conditionMain += parseInt(brokenCondition[brokenCondition.length - 1]);
        }
      }
    }
  }
  return conditionMain;
}
module.exports.CalculateConditionValue = CalculateConditionValue;

function ConditionCheck(iLooking) {
  let condition;
  if (iLooking.includes("<")) {
    condition = "<";
  } else if (iLooking.includes(">")) {
    condition = ">";
  } else if (iLooking.includes("<=")) {
    condition = "<=";
  } else if (iLooking.includes(">=")) {
    condition = ">=";
  } else if (iLooking.includes("==")) {
    condition = "==";
  } else if (iLooking.includes("!+")) {
    condition = "!=";
  }
  return condition
}
module.exports.ConditionCheck = ConditionCheck;

function ConditionValue(value, checkValue, condition) {
  if (condition == "<") {
    return value < checkValue;
  } else if (condition == ">") {
    return value > checkValue;
  } else if (condition == "<=") {
    return value <= checkValue;
  } else if (condition == ">=") {
    return value >= checkValue;
  } else if (condition == "==") {
    return value == checkValue;
  } else if (condition == "!=") {
    return value != checkValue;
  }
}
//-----------------------------------------------------------------
function CheckPlayerColor(player, check) {
  if (player.r == check.r && player.g == check.g && player.b == check.b) {
    return true;
  } else {
    world.broadcastChatMessage("Only the GM (black player) is allowed to press this button", GetTextColor());
  }
}
module.exports.CheckPlayerColor = CheckPlayerColor;