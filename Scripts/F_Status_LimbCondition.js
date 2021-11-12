const { refObject, Button, ImageButton, Text, TextBox, Vector } = require('@tabletop-playground/api');
const { SetIdObject, TypeCharacteristic } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
refObject.onCreated.add(() => {
  SetIdObject(refObject.getName(), refObject.getId());
  loadState();
})
//-----------------------------------------------------------------
const zPosition = 0.1;
const widgetWidth = 1600;
const widgetHeight = 800;
const nameFont = "Fallout.ttf";
//-----------------------------------------------------------------
let statusName = [
  "radiation",
  "poisoning",
  "drowsiness",
  "dehydration",
  "hunger",
  "breakdown"
]
let allStatus = [];
let statusValue = [];
for (let i = 0; i < statusName.length; i++) {
  statusValue[i] = "0";
  allStatus[statusName[i]] = new TextBox().setText("0").setMaxLength(4).setFont(nameFont);
  allStatus[statusName[i]].setFontSize(38);
  allStatus[statusName[i]].setInputType(4);
  allStatus[statusName[i]].onTextCommitted.add((_1, _2, text) => {
    statusValue[i] = text;
    saveState();
  })
}
//-----------------
let countLimb = 8;
let allLimb = [], allLimbValue = [];
let reducedDamage = [];
for (let i = 0; i < countLimb; i++) {
  reducedDamage[i] = new TextBox().setText("0").setFont(nameFont).setTextColor(new Color(0.25, 0.25, 1));
  reducedDamage[i].setFontSize(40);
  //-----------------
  allLimbValue[i] = "100%";
  allLimb[i] = new TextBox().setText("100%").setEnabled(false).setFont(nameFont);
  allLimb[i].setFontSize(34);
  allLimb[i].onTextCommitted.add((_1, _2, text) => {
    allLimbValue[i] = text;
    saveState();
  })
}
//-----------------
let status2Name = [
  "response",
  "armor",
  "damage_limit",
  "res_damage",
  "res_energy_damage",
  "res_radiation",
  "res_poison",
  "critical_hit_rate"
];
let majorStatus2 = [];
let baffStatus2 = [], baffStatusValue = [];
let debaffStatus2 = [], debaffStatusValue = [];
let mainStatus2 = [], mainStatusValue = [];
let startValueMainStatus = [];
let additionValueMain = [];
for (let i = 0; i < status2Name.length; i++) {
  majorStatus2[status2Name[i]] = new TextBox().setText("0").setEnabled(false).setFont(nameFont);
  majorStatus2[status2Name[i]].setFontSize(38);
  majorStatus2[status2Name[i]].onTextCommitted.add(() => {
    if (status2Name[i] == "intelligence") {
      let current = parseInt(majorStatus2[status2Name[i]].getText());
      status2.GrowthRate = current;
    }
    saveState();
  })
  //--
  baffStatusValue[i] = 0;
  baffStatus2[status2Name[i]] = new TextBox().setText("0").setInputType(4).setFont(nameFont);
  baffStatus2[status2Name[i]].setFontSize(20);
  baffStatus2[status2Name[i]].onTextCommitted.add((_1, _2, text) => {
    baffStatusValue[i] = text;
    RecalculationMajorStatus(i);
  })
  //--
  debaffStatusValue[i] = 0;
  debaffStatus2[status2Name[i]] = new TextBox().setText("0").setInputType(4).setFont(nameFont);
  debaffStatus2[status2Name[i]].setFontSize(20);
  debaffStatus2[status2Name[i]].onTextCommitted.add((_1, _2, text) => {
    debaffStatusValue[i] = text;
    RecalculationMajorStatus(i);
  })
  //--
  mainStatusValue[i] = 0;
  mainStatus2[status2Name[i]] = new TextBox().setText("0").setInputType(4).setFont(nameFont);
  mainStatus2[status2Name[i]].setFontSize(20);
  mainStatus2[status2Name[i]].onTextCommitted.add((_1, _2, text) => {
    mainStatusValue[i] = text;
    RecalculationMajorStatus(i);
  })
  //--
  startValueMainStatus[status2Name[i]] = 0;
  additionValueMain[i] = 0;
}

function RecalculationMajorStatus(index) {
  let type = status2Name[index];
  let main = additionValueMain[index] + startValueMainStatus[type] + parseInt(mainStatus2[type].getText());
  let debaff = parseInt(debaffStatus2[type].getText());
  let baff = parseInt(baffStatus2[type].getText());
  majorStatus2[type].setText(main + baff - debaff);
}

function CreateCharacteristicTextBox(parent, charName, position, typeChar, isMain) {
  let imageSize = 25;
  let offsetY = 20;
  let buttonOffsetY = offsetY + 5;

  let decrement = new ImageButton().setImage("minus.png");
  decrement.setImageSize(imageSize);
  decrement.onClicked.add(() => {
    let currentValue = typeChar[charName].getText();
    if (currentValue > 0) {
      typeChar[charName].setText(currentValue - 1);
    }
  })
  parent.addChild(decrement, position.x - 40, position.y + buttonOffsetY, 30, 30);
  //--
  parent.addChild(typeChar[charName], position.x, position.y + offsetY, 40, 40);
  //--
  let increment = new ImageButton().setImage("plus.png");
  increment.setImageSize(imageSize);
  increment.onClicked.add(() => {
    let currentValue = parseInt(typeChar[charName].getText());
    typeChar[charName].setText(currentValue + 1);
  })
  parent.addChild(increment, position.x + 50, position.y + buttonOffsetY, 30, 30);
}

function CreateLimbConditionTextBox(parent, canvas, index, position, array) {
  let imageSize = 100;
  let buttonOffsetY = 5;

  let decrement = new ImageButton().setImage("minus.png");
  decrement.setImageSize(imageSize);
  decrement.onClicked.add(() => {
    let text = array[index].getText();
    let currentValue = text.slice(0, text.indexOf("%"));
    let decriceValue = parent.box.getText() - reducedDamage[index].getText();
    currentValue -= decriceValue > 0 && decriceValue || 0;
    if (currentValue > 0) {
      array[index].setText(currentValue + "%");
    }
  })
  canvas.addChild(decrement, position.x - 55, position.y + buttonOffsetY, 50, 50);
  //--
  canvas.addChild(array[index], position.x, position.y, 125, 60);
  //--
  let increment = new ImageButton().setImage("plus.png");
  increment.setImageSize(imageSize);
  increment.onClicked.add(() => {
    let text = array[index].getText();
    let currentValue = parseInt(text.slice(0, text.indexOf("%")));
    currentValue += parseInt(parent.box.getText());
    if (currentValue <= 100) {
      array[index].setText(currentValue + "%");
    }
  })
  canvas.addChild(increment, position.x + 130, position.y + buttonOffsetY, 50, 50);
}
//-----------------------------------------------------------------
class Status {
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
    let maxStatus = new Text().setText("/1000").setFont(nameFont);
    maxStatus.setFontSize(38);
    for (let i = 0; i < statusName.length; i++) {
      nC.addChild(allStatus[statusName[i]], 380, 152 + i * 74, 130, 65);
      nC.addChild(maxStatus, 510, 152 + i * 74, 150, 65);
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
let status = new Status(refObject, new Vector(0, 0, zPosition));

class Status2 {
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
    for (let i = 0; i < status2Name.length; i++) {
      nC.addChild(majorStatus2[status2Name[i]], 1100, 152 + i * 74, 70, 65);
      CreateCharacteristicTextBox(nC, status2Name[i], position.add(new Vector(1250, 147 + i * 74, 0)), baffStatus2);
      CreateCharacteristicTextBox(nC, status2Name[i], position.add(new Vector(1380, 147 + i * 74, 0)), debaffStatus2);
      CreateCharacteristicTextBox(nC, status2Name[i], position.add(new Vector(1510, 147 + i * 74, 0)), mainStatus2, true);
    }
    //-------------------------
    let arrow = new ImageButton().setImage("right arrow.png");
    arrow.setImageSize(50);
    nC.addChild(arrow, 1525, 25, 50, 50);
    //-------------------------
    let t = this;
    arrow.onClicked.add(function () {
      t.HideUI();
      status.HideUI();
      limbCondition.ShowUI();
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
let status2 = new Status2(refObject, new Vector(0, 0, zPosition));

class LimbCondition {
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
    let image = new ImageWidget().setImage("konechnosti2.png");
    nC.addChild(image, 0, 0, widgetWidth, widgetHeight);
    //-------------------------
    let offsetY = 0; let offsetX = 70;
    for (let i = 0; i < countLimb; i++, offsetY++) {
      CreateLimbConditionTextBox(this, nC, i, position.add(new Vector(offsetX, 130 + offsetY * 140, 0)), allLimb);
      nC.addChild(reducedDamage[i], offsetX, 200 + offsetY * 140, 100, 60);
      if (i == countLimb / 2 - 1) { offsetY = -1; offsetX = 1410; }
    }
    //-------------------------
    this.box = new Button().setText("1").setFont(nameFont);
    this.box.setFontSize(40);
    nC.addChild(this.box, 780, 680, 70, 80);
    //-------------------------
    let arrow = new ImageButton().setImage("left arrow.png");
    arrow.setImageSize(50);
    nC.addChild(arrow, 1525, 25, 50, 50);
    //-------------------------
    let t = this;
    let boxTable = [1, 5, 10, 25, 50];
    let boxIndex = 0;
    this.box.onClicked.add(function () {
      boxIndex++;
      if (boxIndex >= boxTable.length) {
        boxIndex = 0;
      }
      t.box.setText(boxTable[boxIndex]);
    });
    arrow.onClicked.add(function () {
      status2.ShowUI();
      status.ShowUI();
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
let limbCondition = new LimbCondition(refObject, new Vector(0, 0, 0));
//-----------------------------------------------------------------
function saveState() {
  let state = {};

  state["status"] = statusValue;
  state["limb"] = allLimbValue;
  state["Main"] = mainStatusValue;
  state["addition"] = additionValueMain;
  state["Baff"] = baffStatusValue;
  state["Debaff"] = debaffStatusValue;

  refObject.setSavedData(JSON.stringify(state));
}

function loadState() {
  if (refObject.getSavedData() === "") {
    saveState();
    return;
  }

  let state = JSON.parse(refObject.getSavedData());
  statusValue = state["status"] || [];
  for (let i = 0; i < statusName.length; i++) {
    allStatus[statusName[i]].setText(statusValue[i] || "0");
  }
  allLimbValue = state["limb"] || [];
  for (let i = 0; i < countLimb; i++) {
    allLimb[i].setText(allLimbValue[i] || "100%");
  }
  mainStatusValue = state["Main"] || mainStatusValue;
  baffStatusValue = state["Baff"] || baffStatusValue;
  debaffStatusValue = state["Debaff"] || debaffStatusValue;
  if (state["addition"] && state["addition"].length != 0) {
    additionValueMain = state["addition"];
  } else {
    for (let i = 0; i < status2Name.length; i++) {
      additionValueMain[i] = 0;
    }
  }
  for (let i = 0; i < status2Name.length; i++) {
    let index = status2Name[i];
    mainStatus2[index].setText(mainStatusValue[i] || "0");
    baffStatus2[index].setText(baffStatusValue[i] || "0");
    debaffStatus2[index].setText(debaffStatusValue[i] || "0");
    RecalculationMajorStatus(i);
  }
}

refObject.ResetValue = function () {
  for (let i = 0; i < statusName.length; i++) {
    allStatus[statusName[i]].setText("0");
  }
  for (let i = 0; i < status2Name.length; i++) {
    let index = status2Name[i];
    majorStatus2[index].setText("0");
    baffStatus2[index].setText("0");
    debaffStatus2[index].setText("0");
    mainStatus2[index].setText("0");
  }
  saveState();
}

refObject.RecalculationMain = (array) => {
  startValueMainStatus["response"] = array[TypeCharacteristic.perception] * 2;
  startValueMainStatus["armor"] = array[TypeCharacteristic.dextery];
  startValueMainStatus["res_radiation"] = array[TypeCharacteristic.endurance] * 2;
  startValueMainStatus["res_poison"] = array[TypeCharacteristic.endurance] * 5;
  startValueMainStatus["critical_hit_rate"] = array[TypeCharacteristic.luck];
  for (let i = 0; i < status2Name.length; i++) {
    RecalculationMajorStatus(i);
  }
}

refObject.AdditionMain = (index, value) => {
  additionValueMain[index] = value;
  RecalculationMajorStatus(index);
}