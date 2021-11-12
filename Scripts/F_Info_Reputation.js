const { refObject, ImageButton, ImageWidget, Text, TextBox, Vector } = require('@tabletop-playground/api');
const { SetValueChars, TypeCharacteristic, SetFreePoints, SetIdObject } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
refObject.onCreated.add(() => {
  SetIdObject(refObject.getName(), refObject.getId());
  loadState();
})
//-----------------------------------------------------------------
const zPosition = 0.1;
const widgetWidth = 1600;
const widgetHeight = 1000;
const nameFont = "Fallout.ttf";
//-----------------------------------------------------------------
let countInfo = 7;
let allInfoText = [];
let allInfoTB = [];
for (let i = 0; i < countInfo; i++) {
  allInfoText[i] = "...";
  allInfoTB[i] = new TextBox().setText("...").setFont(nameFont);
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
  allReputation[i] = new TextBox().setText("0").setFont(nameFont);
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
let additionValueMain = [];
for (let i = 0; i < countChar; i++) {
  valueMajorC[i] = 5;
  majorCharacteristics[i] = new TextBox().setFont(nameFont).setEnabled(false);
  majorCharacteristics[i].setFontSize(40);
  majorCharacteristics[i].onTextCommitted.add(() => {
    let value = parseInt(majorCharacteristics[i].getText());
    if (i == TypeCharacteristic.intelligence) {
      characteristics.GrowthRate = value;
    }
    setTimeout(() => {
      SetValueChars(refObject.getName(), valueMajorC);
    }, 100);
    saveState();
  })
  //--
  valueBaffC[i] = 0;
  baffCharacteristics[i] = new TextBox().setText("0").setInputType(4).setFont(nameFont);
  baffCharacteristics[i].setFontSize(20);
  baffCharacteristics[i].onTextCommitted.add((_1, _2, text) => {
    valueBaffC[i] = text;
    RecalculationMajorCharacteristic(i);
  })
  //--
  valueDebaffC[i] = 0;
  debaffCharacteristics[i] = new TextBox().setText("0").setInputType(4).setFont(nameFont);
  debaffCharacteristics[i].setFontSize(20);
  debaffCharacteristics[i].onTextCommitted.add((_1, _2, text) => {
    valueDebaffC[i] = text;
    RecalculationMajorCharacteristic(i);
  })
  //--
  valueMainC[i] = 5;
  mainCharacteristics[i] = new TextBox().setText("5").setInputType(4).setFont(nameFont);
  mainCharacteristics[i].setFontSize(20);
  mainCharacteristics[i].onTextCommitted.add((_1, _2, text) => {
    valueMainC[i] = text;
    RecalculationMajorCharacteristic(i);
    characteristics.RecalculationFreePoints();
  })
  //--
  additionValueMain[i] = 0;
}

function RecalculationMajorCharacteristic(index) {
  let main = additionValueMain[index] + parseInt(mainCharacteristics[index].getText());
  let debaff = parseInt(debaffCharacteristics[index].getText());
  let baff = parseInt(baffCharacteristics[index].getText());
  valueMajorC[index] = main + baff - debaff;
  majorCharacteristics[index].setText(main + baff - debaff);
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
    this.showPosition = position;
    this.hidePosition = position.add(new Vector(0, 0, -zPosition));
    //-------------------------
    let nC = new Canvas();

    this.nCUI = new UIElement();
    this.nCUI.useWidgetSize = false;
    this.nCUI.position = position;
    this.nCUI.rotation = new Rotator(0, 0, 180);
    this.nCUI.widget = nC;
    this.nCUI.width = widgetWidth;
    this.nCUI.height = widgetHeight;
    this.nCUI.scale = 0.1;
    parent.attachUI(this.nCUI);
    //-------------------------
    for (let i = 0; i < countInfo; i++) {
      nC.addChild(allInfoTB[i], 330, 135 + i * 78, 400, 75);
    }
    //-------------------------
    this.karmaText = new TextBox().setInputType(3).setText("0").setFont(nameFont);
    this.karmaText.setFontSize(44);
    this.karmaText.onTextCommitted.add(() => {
      saveState();
    })
    nC.addChild(this.karmaText, 725, 850, 160, 75);
    //-------------------------
    let arrow = new ImageButton().setImage("right arrow.png");
    arrow.setImageSize(50);
    nC.addChild(arrow, 1525, 25, 50, 50);
    //-------------------------
    let t = this;
    arrow.onClicked.add(function () {
      characteristics.HideUI();
      t.HideUI();
      reputation.ShowUI();
    });
  }

  get Karma() { return this.karmaText.getText(); }
  set Karma(value) { this.karmaText.setText(value); }

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
    this.parent = parent;
    this.maxPointsVal = 40;
    this.showPosition = position;
    this.hidePosition = position.add(new Vector(0, 0, -zPosition));
    //-------------------------
    let nC = new Canvas();

    this.nCUI = new UIElement();
    this.nCUI.useWidgetSize = false;
    this.nCUI.position = position;
    this.nCUI.rotation = new Rotator(0, 0, 180);
    this.nCUI.widget = nC;
    this.nCUI.width = widgetWidth;
    this.nCUI.height = widgetHeight;
    this.nCUI.scale = 0.1;
    parent.attachUI(this.nCUI);
    //-------------------------
    let borderBaff = new Border();
    borderBaff.setColor(new Color(0.05, 0, 1));
    nC.addChild(borderBaff, 1250, 100, 40, 40);
    //-------------------------
    let borderDebaff = new Border();
    borderDebaff.setColor(new Color(1, 0, 0.05));
    nC.addChild(borderDebaff, 1380, 100, 40, 40);
    //-------------------------
    let borderMain = new Border();
    borderMain.setColor(new Color(0.05, 1, 0.05));
    nC.addChild(borderMain, 1510, 100, 40, 40);
    //-------------------------
    for (let i = 0; i < countChar; i++) {
      nC.addChild(majorCharacteristics[i], 1135, 145 + i * 78, 70, 65);
      CreateCharacteristicTextBox(nC, i, position.add(new Vector(1250, 140 + i * 78, 0)), baffCharacteristics);
      CreateCharacteristicTextBox(nC, i, position.add(new Vector(1380, 140 + i * 78, 0)), debaffCharacteristics);
      CreateCharacteristicTextBox(nC, i, position.add(new Vector(1510, 140 + i * 78, 0)), mainCharacteristics);
    }
    //-------------------------
    this.growthRate = new Text().setText("15").setFont(nameFont);
    this.growthRate.setFontSize(44);
    nC.addChild(this.growthRate, 420, 765, 85, 85);
    //-------------------------
    this.freePoints = new Text().setText("5").setFont(nameFont);
    this.freePoints.setFontSize(44);
    nC.addChild(this.freePoints, 1340, 735, 85, 85);
    //-------------------------
    this.maxPoints = new Text().setText("/" + this.maxPointsVal).setFont(nameFont);
    this.maxPoints.setFontSize(44);
    nC.addChild(this.maxPoints, 1400, 735, 105, 85);
  }

  RecalculationFreePoints() {
    let currentPoints = 0;
    for (let i = 0; i < countChar; i++) {
      currentPoints += parseInt(mainCharacteristics[i].getText());
    }
    this.freePoints.setText(this.maxPointsVal - currentPoints);
  }

  get FreePoints() { return parseInt(this.freePoints.getText()); }

  get GrowthRate() { return parseInt(this.growthRate.getText()); }
  set GrowthRate(value) {
    this.growthRate.setText(value * 2 + 5);
    setTimeout(() => {
      SetFreePoints(refObject.getName(), value * 2 + 5);
    }, 100);
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
let characteristics = new Characteristics(refObject, new Vector(0, 0, zPosition));

class Reputation {
  constructor(parent, position) {
    this.parent = parent;
    this.showPosition = position.add(new Vector(0, 0, zPosition));
    this.hidePosition = position;
    //-------------------------
    let nC = new Canvas();

    this.nCUI = new UIElement();
    this.nCUI.useWidgetSize = false;
    this.nCUI.position = position;
    this.nCUI.rotation = new Rotator(0, 0, 180);
    this.nCUI.widget = nC;
    this.nCUI.width = widgetWidth;
    this.nCUI.height = widgetHeight;
    this.nCUI.scale = 0.1;
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
  if (!state["addition"] && state["addition"].length == countChar) {
    for (let i = 0; i < countChar; i++) {
      additionValueMain[i] = 0;
    }
  } else {
    additionValueMain = state["addition"];
  }
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