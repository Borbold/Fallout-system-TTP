const { refObject } = require('@tabletop-playground/api');
const { SetValueChars, TypeCharacteristic, SetFreePoints, SetIdObject,
  GetCurrentLevel, UI, CalculateConditionValue } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
refObject.onCreated.add(() => {
  SetIdObject(refObject.getName(), refObject.getId());
  setTimeout(() => {
    loadState();
  }, 500);
})
//-----------------------------------------------------------------
const zPosition = 0.1;
const widgetWidth = 1600;
const widgetHeight = 1000;
let nameFont = UI.GetTextFont();
let textColor = UI.GetTextColor();
//-----------------------------------------------------------------
let countInfo = 7;
let allInfoText = [];
let allInfoTB = [];
for (let i = 0; i < countInfo; i++) {
  allInfoText[i] = "...";
  allInfoTB[i] = new TextBox().setText("...").setFont(nameFont).setTextColor(textColor);
  allInfoTB[i].setFontSize(44);
  allInfoTB[i].onTextCommitted.add((_1, _2, text) => {
    allInfoText[i] = text;
    saveState();
  })
}
//-----------------
let countReputation = 26;
let allReputation = [];
let reputationValues = [];
for (let i = 0; i < countReputation; i++) {
  reputationValues[i] = 0;
  allReputation[i] = new TextBox().setText("0").setFont(nameFont).setTextColor(textColor);
  allReputation[i].setFontSize(34);
  allReputation[i].onTextCommitted.add((_1, _2, text) => {
    reputationValues[i] = text;
    saveState();
  })
}
//-----------------
const countChar = 7;
let majorCharacteristics = [], valueMajorC = [];
let baffCharacteristics = [], valueBaffC = [];
let debaffCharacteristics = [], valueDebaffC = [];
let mainCharacteristics = [], valueMainC = [];
let additionValueMain = [], conditionValueMain = [];
for (let i = 0; i < countChar; i++) {
  valueMajorC[i] = 5;
  majorCharacteristics[i] = new TextBox().setFont(nameFont).setEnabled(false).setTextColor(textColor);
  majorCharacteristics[i].setFontSize(40);
  majorCharacteristics[i].onTextCommitted.add(() => {
    let value = parseInt(majorCharacteristics[i].getText());
    if (i == TypeCharacteristic.intelligence) {
      info.GrowthRate = value;
    } else if (i == TypeCharacteristic.strenght || i == TypeCharacteristic.endurance) {
      healthPlate.SetMaxValue(valueMajorC[TypeCharacteristic.strenght], valueMajorC[TypeCharacteristic.endurance], GetCurrentLevel());
    } else if (i == TypeCharacteristic.dextery) {
      actionPlate.SetMaxValue(valueMajorC[TypeCharacteristic.dextery]);
    }
    SetValueChars(refObject.getName(), valueMajorC);
  })
  //--
  valueBaffC[i] = 0;
  baffCharacteristics[i] = new TextBox().setText("0").setInputType(4).setFont(nameFont).setTextColor(textColor);
  baffCharacteristics[i].setFontSize(20);
  baffCharacteristics[i].onTextCommitted.add((_1, _2, text) => {
    valueBaffC[i] = text;
    RecalculationMajorCharacteristic(i);
  })
  //--
  valueDebaffC[i] = 0;
  debaffCharacteristics[i] = new TextBox().setText("0").setInputType(4).setFont(nameFont).setTextColor(textColor);
  debaffCharacteristics[i].setFontSize(20);
  debaffCharacteristics[i].onTextCommitted.add((_1, _2, text) => {
    valueDebaffC[i] = text;
    RecalculationMajorCharacteristic(i);
  })
  //--
  valueMainC[i] = 5;
  mainCharacteristics[i] = new TextBox().setText("5").setInputType(4).setFont(nameFont).setTextColor(textColor);
  mainCharacteristics[i].setFontSize(20);
  mainCharacteristics[i].onTextCommitted.add((_1, _2, text) => {
    valueMainC[i] = text;
    RecalculationMajorCharacteristic(i);
    let currentPoints = 0;
    for (let i = 0; i < countChar; i++) {
      currentPoints += parseInt(valueMainC[i]);
    }
    characteristics.RecalculationFreePoints(currentPoints);
  })
  //--
  additionValueMain[i] = 0;
  conditionValueMain[i] = "";
}

function RecalculationMajorCharacteristic(index) {
  let conditionMain = CalculateConditionValue(conditionValueMain[index], healthPlate, "health");

  let main = additionValueMain[index] + parseInt(mainCharacteristics[index].getText()) + conditionMain;
  let debaff = parseInt(debaffCharacteristics[index].getText());
  let baff = parseInt(baffCharacteristics[index].getText());
  valueMajorC[index] = main + baff - debaff;
  majorCharacteristics[index].setText(main + baff - debaff);
  saveState();
}

function CreateCharacteristicTextBox(parent, index, position, typeChar) {
  let imageSize = 25;
  let offsetY = 20;
  let buttonOffsetY = offsetY + 5;

  let decrement = new ImageButton().setImage("minus.png");
  decrement.setImageSize(imageSize);
  decrement.onClicked.add(() => {
    let currentValue = typeChar[index].getText();
    if (currentValue > 0) {
      typeChar[index].setText(currentValue - 1);
    }
  })
  parent.addChild(decrement, position.x - 40, position.y + buttonOffsetY, 30, 30);
  //--
  parent.addChild(typeChar[index], position.x, position.y + offsetY, 40, 40);
  //--
  let increment = new ImageButton().setImage("plus.png");
  increment.setImageSize(imageSize);
  increment.onClicked.add(() => {
    let currentValue = parseInt(typeChar[index].getText());
    typeChar[index].setText(currentValue + 1);
  })
  parent.addChild(increment, position.x + 50, position.y + buttonOffsetY, 30, 30);
}
//-----------------------------------------------------------------
class Info {
  constructor(parent, position) {
    this.parent = parent;
    let backUIPos = position.add(new Vector(0, 3.5, 0));
    this.showPosition = backUIPos;
    this.hidePosition = backUIPos.add(new Vector(0, 0, -zPosition));
    //-------------------------
    let nC = new Canvas();
    this.nCUI = UI.CreateCanvasElement(nC, backUIPos, widgetWidth / 2 + 100, widgetHeight);
    parent.attachUI(this.nCUI);
    //-------------------------
    for (let i = 0; i < countInfo; i++) {
      nC.addChild(allInfoTB[i], 330, 135 + i * 78, 400, 75);
    }
    //-------------------------
    this.karmaText = new TextBox().setInputType(3).setText("0").setFont(nameFont).setTextColor(textColor);
    this.karmaText.setFontSize(44);
    this.karmaText.onTextCommitted.add((_1, _2, text) => {
      this.Karma = parseInt(text);
      saveState();
    })
    nC.addChild(this.karmaText, 739, 850, 130, 75);
    //-------------------------
    this.growthRate = new Text().setText("15").setFont(nameFont).setTextColor(textColor);
    this.growthRate.setFontSize(44);
    nC.addChild(this.growthRate, 420, 765, 85, 85);
  }

  get GrowthRate() { return parseInt(this.growthRate.getText()); }
  set GrowthRate(value) {
    this.growthRate.setText(value * 2 + 5);
    setTimeout(() => {
      SetFreePoints(refObject.getName(), value * 2 + 5);
    }, 100);
  }

  get Karma() { return this.karmaText.getText(); }
  set Karma(value) {
    let absValue = Math.abs(value);
    let brightness = (absValue >= 1000 && 1) || (absValue >= 750 && 0.75) || (absValue >= 500 && 0.5) || (absValue >= 250 && 0.25) || 0.01;
    if (value > 0) {
      this.karmaText.setText(value).setTextColor(new Color(textColor.r - brightness, 1, textColor.b - brightness));
    } else {
      this.karmaText.setText(value).setTextColor(new Color(1, textColor.g - brightness, textColor.b - brightness));
    }
  }

  HideUI() {
    this.nCUI.position = this.hidePosition;
    this.parent.updateUI(this.nCUI);
  }
  ShowUI() {
    this.nCUI.position = this.showPosition;
    this.parent.updateUI(this.nCUI);
  }
}
let info = new Info(refObject, new Vector(0, 0, zPosition));

class Characteristics {
  constructor(parent, position) {
    let t = this;
    this.parent = parent;
    this.maxPointsVal = 40;
    let backUIPos = position.add(new Vector(0.15, -6, 0));
    this.showPosition = backUIPos;
    this.hidePosition = backUIPos.add(new Vector(0, 0, -zPosition));
    //-------------------------
    let nC = new Canvas();
    this.nCUI = UI.CreateCanvasElement(nC, backUIPos, widgetWidth / 2, widgetHeight);
    parent.attachUI(this.nCUI);
    //-------------------------
    let borderBaff = new Border();
    //Временная затычка!!! После фикса убрать
    borderBaff.setChild(new Text());
    borderBaff.setColor(new Color(0.05, 0, 1));
    nC.addChild(borderBaff, 250, 100, 40, 40);
    //-------------------------
    let borderDebaff = new Border();
    //Временная затычка!!! После фикса убрать
    borderDebaff.setChild(new Text());
    borderDebaff.setColor(new Color(1, 0, 0.05));
    nC.addChild(borderDebaff, 380, 100, 40, 40);
    //-------------------------
    let borderMain = new Border();
    //Временная затычка!!! После фикса убрать
    borderMain.setChild(new Text());
    borderMain.setColor(new Color(0.05, 1, 0.05));
    nC.addChild(borderMain, 510, 100, 40, 40);
    //-------------------------
    for (let i = 0; i < countChar; i++) {
      nC.addChild(majorCharacteristics[i], 135, 145 + i * 78, 70, 65);
      CreateCharacteristicTextBox(nC, i, position.add(new Vector(250, 140 + i * 78, 0)), baffCharacteristics);
      CreateCharacteristicTextBox(nC, i, position.add(new Vector(380, 140 + i * 78, 0)), debaffCharacteristics);
      CreateCharacteristicTextBox(nC, i, position.add(new Vector(510, 140 + i * 78, 0)), mainCharacteristics);
    }
    //-------------------------
    this.freePoints = new Text().setText("5").setFont(nameFont).setTextColor(textColor);
    this.freePoints.setFontSize(44);
    nC.addChild(this.freePoints, 340, 735, 85, 85);
    //-------------------------
    this.maxPoints = new Text().setText("/" + this.maxPointsVal).setFont(nameFont).setTextColor(textColor);
    this.maxPoints.setFontSize(44);
    nC.addChild(this.maxPoints, 400, 735, 105, 85);
    //-------------------------
    let arrow = new ImageButton().setImage("right arrow.png");
    arrow.setImageSize(50);
    nC.addChild(arrow, 525, 25, 50, 50);
    arrow.onClicked.add(function () {
      t.HideUI();
      info.HideUI();
      reputation.ShowUI();
    });
  }

  RecalculationFreePoints(currentPoints) {
    this.freePoints.setText(this.maxPointsVal - currentPoints);
  }

  get FreePoints() { return parseInt(this.freePoints.getText()); }

  HideUI() {
    this.nCUI.position = this.hidePosition;
    this.parent.updateUI(this.nCUI);
  }
  ShowUI() {
    this.nCUI.position = this.showPosition;
    this.parent.updateUI(this.nCUI);
  }
}
let characteristics = new Characteristics(refObject, new Vector(0, 0, zPosition));

class Reputation {
  constructor(parent, position) {
    this.parent = parent;
    this.showPosition = position.add(new Vector(0, 0, zPosition));
    this.hidePosition = position;
    //-------------------------
    let nC = new Canvas();
    this.nCUI = UI.CreateCanvasElement(nC, position, widgetWidth, widgetHeight);
    parent.attachUI(this.nCUI);
    //-------------------------
    let image = new ImageWidget().setImage("reput3.png");
    nC.addChild(image, 0, 0, widgetWidth, widgetHeight);
    //-------------------------
    let offsetY = 0; let offsetX = 430;
    for (let i = 0; i < countReputation; i++, offsetY++) {
      nC.addChild(allReputation[i], offsetX, 95 + offsetY * 65, 400, 60);
      if (i == 12) { offsetY = -1; offsetX = 1180; }
    }
    //-------------------------
    let arrow = new ImageButton().setImage("left arrow.png");
    arrow.setImageSize(50);
    nC.addChild(arrow, 1525, 25, 50, 50);
    //-------------------------
    let t = this;
    arrow.onClicked.add(function () {
      characteristics.ShowUI();
      info.ShowUI();
      t.HideUI();
    });
  }

  HideUI() {
    this.nCUI.position = this.hidePosition;
    this.parent.updateUI(this.nCUI);
  }
  ShowUI() {
    this.nCUI.position = this.showPosition;
    this.parent.updateUI(this.nCUI);
  }
}
let reputation = new Reputation(refObject, new Vector(0, 0, 0));
//-----------------------------------------------------------------
function saveState() {
  let state = {};

  state["info"] = allInfoText;
  state["karma"] = info.Karma;

  state["Baff"] = valueBaffC;
  state["Debaff"] = valueDebaffC;
  state["Main"] = valueMainC;
  state["addition"] = additionValueMain;
  state["condition"] = conditionValueMain;
  state["reputation"] = reputationValues;

  refObject.setSavedData(JSON.stringify(state));
}

function loadState() {
  if (refObject.getSavedData() === "") {
    saveState();
    return;
  }

  let state = JSON.parse(refObject.getSavedData());
  allInfoText = state["info"] || [];
  for (let i = 0; i < countInfo; i++) {
    allInfoTB[i].setText(allInfoText[i]);
  }
  info.Karma = state["karma"] || "0";

  valueBaffC = state["Baff"] || valueBaffC;
  valueDebaffC = state["Debaff"] || valueDebaffC;
  valueMainC = state["Main"] || valueMainC;
  additionValueMain = state["addition"] || additionValueMain;
  conditionValueMain = state["condition"] || conditionValueMain;
  for (let i = 0; i < countChar; i++) {
    baffCharacteristics[i].setText(valueBaffC[i]);
    debaffCharacteristics[i].setText(valueDebaffC[i]);
    mainCharacteristics[i].setText(valueMainC[i]);
    RecalculationMajorCharacteristic(i);
  }

  reputationValues = state["reputation"] || [];
  for (let i = 0; i < countReputation; i++) {
    allReputation[i].setText(reputationValues[i] || "0");
  }
}

refObject.ResetValue = function () {
  for (let i = 0; i < countInfo; i++) {
    allInfoTB[i].setText("...");
  }
  info.Karma = "0";
  for (let i = 0; i < countChar; i++) {
    majorCharacteristics[i].setText("5");
    baffCharacteristics[i].setText("0");
    debaffCharacteristics[i].setText("0");
    mainCharacteristics[i].setText("5");
  }
  saveState();
}

refObject.AdditionMain = (index, value) => {
  additionValueMain[index] = value;
  RecalculationMajorCharacteristic(index);
}

refObject.ConditionMain = (index, condition) => {
  conditionValueMain[index] = condition;
  RecalculationMajorCharacteristic(index);
}

let healthPlate, actionPlate;
refObject.SetHealthActionPlate = (plate1, plate2) => {
  healthPlate = plate1;
  healthPlate.RecalculationMajor = () => {
    for (let i = 0; i < conditionValueMain.length; i++) {
      if (conditionValueMain[i].length > 0) {
        RecalculationMajorCharacteristic(i);
      }
    }
  }
  actionPlate = plate2;
}

refObject.ChangeMaxHealth = () => {
  setTimeout(() => {
    healthPlate.SetMaxValue(valueMajorC[TypeCharacteristic.strenght], valueMajorC[TypeCharacteristic.endurance], GetCurrentLevel());
  }, 210);
}