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
module.exports.TypeCharacteristic = TypeCharacteristic;
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
function CheckPlayerColor(playerColor, check) {
  if (playerColor.r == check.r && playerColor.g == check.g && playerColor.b == check.b) {
    return true;
  } else {
    world.broadcastChatMessage(`Only the ${check} is allowed to press this button`, check);
  }
}
module.exports.CheckPlayerColor = CheckPlayerColor;
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
function CreateBackUI(backA) {
  if (backA) {
    let back = new ImageWidget().setImage(backA.tex);
    this.nC.addChild(back, backA.x, backA.y, backA.w, backA.h);
  }
}

function ChangeValuesSlider(text, value, maxValue, type, multiply) {
  type = type || this.TypeShow.STANDART;
  this.multiply = multiply || 10;
  this.procent = parseInt((100 * value) / maxValue);
  if (text) {
    if (this.TypeShow.STANDART == type)
      text.setText(value + "/" + maxValue);
    else if (this.TypeShow.PROCENT == type)
      text.setText(this.procent + "%");
  }
}

class UI {
  constructor() {
    this.nameFont = this.GetTextFont();
    this.textColor = this.GetTextColor();
  }

  CreatePlusMinusButton(parent, plusF, minusF, size) {
    let increment = new ImageButton().setImage(plusF.tex).setImageSize(100);
    parent.addChild(increment, plusF.x, plusF.y, size, size);
    increment.onClicked.add(plusF.func);
    //-------------------------
    let decrement = new ImageButton().setImage(minusF.tex).setImageSize(100);
    parent.addChild(decrement, minusF.x, minusF.y, size, size);
    decrement.onClicked.add(minusF.func);
  }
  //-------------------------
  CreateNumberButton(boxTable, fontSize) {
    let newButton = new Button().setText("1").setFont(this.nameFont).setTextColor(this.textColor).setFontSize(fontSize || 40);
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
  //-------------------------
  TypeShow = {
    STANDART: 0,
    PROCENT: 1,
  }

  CreateImageSlider(parent, frontSlider, fText, backA) {
    CreateBackUI.call(parent, backA);
    //-------------------------
    parent.nC.addChild(frontSlider.slider, parent.startPosition.x, parent.startPosition.y, frontSlider.w, frontSlider.h);
    //-------------------------
    if (fText) {
      parent.frontText = new Text().setText(parent.Ex + "/" + parent.maxEx).setFont(this.nameFont).setTextColor(this.textColor).setFontSize(fText.fontSize || 40);
      fText.x += parent.startPosition.x; fText.y += parent.startPosition.y;
      parent.nC.addChild(parent.frontText, fText.x, fText.y, fText.w, fText.h);
    }
  }
  //**Functionality for change a slider with width change
  ChangeImageSlider(image, value, maxValue, position, text, parent, type, height, multiply) {
    ChangeValuesSlider.call(this, text, value, maxValue, type, multiply);
    let newWidth = this.procent * this.multiply || 1;
    parent.updateChild(image, position.x, position.y, newWidth, height);
  }
  //**Functionality for change a slider with position changing
  ChangeMaskSlider(image, value, maxValue, position, text, parent, type, size, multiply) {
    ChangeValuesSlider.call(this, text, value, maxValue, type, multiply);
    let newPosX = (this.procent * this.multiply) || 1;
    parent.updateChild(image, position.x - size.width + newPosX, position.y, size.width, size.height);
  }
  //-------------------------
  CreateCanvasElement(nC, position, widgetWidth, widgetHeight) {
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
  //-------------------------
  GetTextFont() {
    let _ = new Text().setFont("Fallout.ttf");
    return "Fallout.ttf";
  }
  GetTextColor() {
    return new Color(1, 0.71, 0.25);
  }
  //-------------------------
  SetHideShowPosition(hidePos, showPos) {
    this.hidePosition = new Vector(0, 0, hidePos);
    this.showPosition = new Vector(0, 0, showPos);
  }
  HideUI(object, parent) {
    object.nCUI.position = this.hidePosition;
    parent.updateUI(object.nCUI);
  }
  ShowUI(object, parent) {
    object.nCUI.position = this.showPosition;
    parent.updateUI(object.nCUI);
  }
}
let ui = new UI();
module.exports.UI = ui;