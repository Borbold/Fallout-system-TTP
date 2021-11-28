const { world } = require('@tabletop-playground/api');
let idObjects = [], ids = [];
//-----------------------------------------------------------------
function SetIdObject(name, id) {
  idObjects[name + id] = id;
  ids.push(id);
}
module.exports.SetIdObject = SetIdObject;

function SetValueChars(name, array) {
  for (const id of ids) {
    if (idObjects[name + id]) {
      let o = world.getObjectById(idObjects[name + id]);
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

  for (const id of ids) {
    if (idObjects[name + id]) {
      let o = world.getObjectById(idObjects[name + id]);
      if (o.SetFreeSkillPoint)
        o.SetFreeSkillPoint(value * currentLevel);
    }
  }
}
module.exports.SetFreePoints = SetFreePoints;

function ChangeMaxValue(name) {
  for (const id of ids) {
    if (idObjects[name + id]) {
      let o = world.getObjectById(idObjects[name + id]);
      if (o.ChangeMaxHealth)
        o.ChangeMaxHealth();
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
  for (const id of ids) {
    if (idObjects[name + id]) {
      let o = world.getObjectById(idObjects[name + id]);
      if (o.getTemplateMetadata() == type)
        o.AdditionMain(nameValue, value);
    }
  }
}
module.exports.AddValueMain = AddValueMain;

function AddConditionMain(name, nameValue, condition, type) {
  for (const id of ids) {
    if (idObjects[name + id]) {
      let o = world.getObjectById(idObjects[name + id]);
      if (o.getTemplateMetadata() == type)
        o.ConditionMain(nameValue, condition);
    }
  }
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
const TypeShow = {
  STANDART: 0,
  PROCENT: 1,
}
module.exports.TypeShow = TypeShow;

function ChangeImageSlider(image, value, maxValue, position, text, parent, type, height, multiply) {
  type = type || TypeShow.STANDART; multiply = multiply || 10;
  let procent = parseInt((100 * value) / maxValue);
  let newWidth = procent * multiply || 1;
  if (TypeShow.STANDART == type)
    text.setText(value + "/" + maxValue);
  else if (TypeShow.PROCENT == type)
    text.setText(procent + "%");
  parent.updateChild(image, position.x, position.y, newWidth, height);
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
//-----------------------------------------------------------------
function CreateNumberButton(boxTable, fontSize) {
  let newButton = new Button().setText("1").setFont(GetTextFont()).setTextColor(GetTextColor()).setFontSize(fontSize || 40);
  let boxIndex = 0;
  newButton.onClicked.add(() => {
    boxIndex++;
    if (boxIndex >= boxTable.length) {
      boxIndex = 0;
    }
    newButton.setText(boxTable[boxIndex]);
  });
  return newButton;
}
module.exports.CreateNumberButton = CreateNumberButton;
//-----------------------------------------------------------------
function IncreaseParametersItem(obj, snapPoint) {
  let snapingObjectId;
  if (snapPoint.snapsRotation()) {
    let snapingObject = snapPoint.getParentObject();
    if (snapingObject.ChangeValues) {
      snapingObject.ChangeValues(obj.getName(), obj.getDescription().toLowerCase());
      snapingObjectId = snapingObject.getId();
    } else if (snapingObject.ChangeDispersedItems) {
      snapingObject.ChangeDispersedItems(obj);
      snapingObjectId = snapingObject.getId();
    }
  }
  return snapingObjectId;
}
module.exports.IncreaseParametersItem = IncreaseParametersItem;

function DecreaseParametersItem(obj, snapingObjectId) {
  if (snapingObjectId) {
    let snapingObject = world.getObjectById(snapingObjectId);
    if (snapingObject.ChangeValues) {
      snapingObject.ChangeValues(obj.getName(), obj.getDescription().toLowerCase(), true);
      return;
    } else if (snapingObject.ChangeDispersedItems) {
      snapingObject.ChangeDispersedItems(obj, true);
      return;
    }
  }
  return snapingObjectId;
}
module.exports.DecreaseParametersItem = DecreaseParametersItem;
//-----------------------------------------------------------------