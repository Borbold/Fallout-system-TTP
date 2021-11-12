const { refObject, ImageButton, Text, TextBox, Vector } = require('@tabletop-playground/api');
const { SetIdObject, TypeCharacteristic } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
refObject.onCreated.add(() => {
  SetIdObject(refObject.getName(), refObject.getId());
})
//-----------------------------------------------------------------
const zPosition = 0.1;
const widgetWidth = 1600;
const widgetHeight = 1000;
const nameFont = "Fallout.ttf";
//-----------------------------------------------------------------
let selectedSkills = [], countSelected = 0;
const countSkills = 19;
let majorSkills = [];
let baffSkills = [], baffValues = [];
let debaffSkills = [], debaffValues = [];
let mainSkills = [], mainValues = [];
let startValueMainSkills = [];
let additionValueMain = [];
for (let i = 0; i < countSkills; i++) {
  majorSkills[i] = new TextBox().setText("0").setEnabled(false).setFont(nameFont);
  majorSkills[i].setFontSize(40);
  majorSkills[i].onTextCommitted.add(() => {
    saveState();
  })
  //--
  baffValues[i] = "0";
  baffSkills[i] = new TextBox().setText("0").setInputType(4).setFont(nameFont);
  baffSkills[i].setFontSize(40);
  baffSkills[i].onTextCommitted.add((_1, _2, text) => {
    baffValues[i] = text;
    RecalculationMajorSkills(i);
  })
  //--
  debaffValues[i] = "0";
  debaffSkills[i] = new TextBox().setText("0").setInputType(4).setFont(nameFont);
  debaffSkills[i].setFontSize(40);
  debaffSkills[i].onTextCommitted.add((_1, _2, text) => {
    debaffValues[i] = text;
    RecalculationMajorSkills(i);
  })
  //--
  mainValues[i] = "0";
  mainSkills[i] = new TextBox().setText("0").setInputType(4).setFont(nameFont);
  mainSkills[i].setFontSize(40);
  mainSkills[i].onTextCommitted.add((_1, _2, text) => {
    mainValues[i] = text;
    RecalculationMajorSkills(i);
  })
  //--
  startValueMainSkills[i] = 0;
  additionValueMain[i] = 0;
}
//-----------------
function RecalculationMajorSkills(index) {
  let main = additionValueMain[index] + startValueMainSkills[index] + parseInt(mainValues[index]) * (selectedSkills[index] && 2 || 1);
  let debaff = parseInt(debaffValues[index]);
  let baff = parseInt(baffValues[index]);
  majorSkills[index].setText(main + baff - debaff);
  setTimeout(() => {
    skillsMajor.RecalculationFreePoints();
  }, 100);
}

function CreateChangerTextBox(parent, index, position, array, isMain) {
  let imageSize = 100;
  let buttonOffsetY = 10;
  let offsetWidth = 100, offsetPosPlus = 120;

  let decrement = new ImageButton().setImage("minus.png");
  decrement.setImageSize(imageSize);
  decrement.onClicked.add(() => {
    let currentValue = array[index].getText();
    if (currentValue > 0) {
      array[index].setText(currentValue - 1);
    }
  })
  parent.addChild(decrement, position.x - 60, position.y + buttonOffsetY, 50, 50);
  //--
  parent.addChild(array[index], position.x, position.y, (!isMain && 80 || offsetWidth), 65);
  //--
  let increment = new ImageButton().setImage("plus.png");
  increment.setImageSize(imageSize);
  increment.onClicked.add(() => {
    let currentValue = parseInt(array[index].getText());
    array[index].setText(currentValue + 1);
  })
  parent.addChild(increment, position.x + (!isMain && 90 || offsetPosPlus), position.y + buttonOffsetY, 50, 50);
}

function CreateSelectedButton(parent, position, index) {
  let star = new ImageButton().setImage("stare.png").setEnabled(false);
  star.setImageSize(100);
  let selected = new ImageButton().setImage("black-squad.png");
  selected.setImageSize(100);
  selected.onClicked.add(() => {
    if (countSelected < 3) {
      countSelected++;
      selectedSkills[index] = true;
      parent.removeChild(selected);
      parent.addChild(star, position.x, position.y, 50, 50);
    }
  })
  parent.addChild(selectedSkills[index] && star || selected, position.x, position.y, 50, 50);
}
//-----------------------------------------------------------------
class SkillsMajor {
  constructor(parent, position) {
    this.parent = parent;
    this.showPosition = position;
    this.hidePosition = position.add(new Vector(0, 0, -zPosition));
    this.freeSPValue = 0;
    //-------------------------
    this.nC = new Canvas();

    this.nCUI = new UIElement();
    this.nCUI.useWidgetSize = false;
    this.nCUI.position = position;
    this.nCUI.rotation = new Rotator(0, 0, 180);
    this.nCUI.widget = this.nC;
    this.nCUI.width = widgetWidth;
    this.nCUI.height = widgetHeight;
    this.nCUI.scale = 0.1;
    parent.attachUI(this.nCUI);
    //-------------------------
    let offsetY = 0; let offsetX = 440; let offsetButtonX = 30;
    for (let i = 0; i < countSkills; i++, offsetY++) {
      CreateSelectedButton(this.nC, position.add(new Vector(offsetButtonX, 160 + offsetY * 70, 0)), i);
      this.nC.addChild(majorSkills[i], offsetX, 150 + offsetY * 70, 100, 70);
      CreateChangerTextBox(this.nC, i, position.add(new Vector(offsetX + 180, 150 + offsetY * 70, 0)), mainSkills, true);
      if (i == 9) { offsetY = -1; offsetX = 1170; offsetButtonX = 825; }
    }
    //-------------------------
    this.freeSkillPoint = new Text().setText("0").setFont(nameFont);
    this.freeSkillPoint.setFontSize(44);
    this.nC.addChild(this.freeSkillPoint, 775, 870, 170, 90);
    //-------------------------
    let borderMain = new Border();
    borderMain.setColor(new Color(0.05, 1, 0.05));
    this.nC.addChild(borderMain, 650, 100, 40, 40);
    this.nC.addChild(borderMain, 1380, 100, 40, 40);
    //-------------------------
    let arrow = new ImageButton().setImage("right arrow.png");
    arrow.setImageSize(50);
    this.nC.addChild(arrow, 1525, 25, 50, 50);
    //-------------------------
    let t = this;
    arrow.onClicked.add(function () {
      t.HideUI();
      skillsChanger.ShowUI();
    });
  }

  get FreePoints() { return parseInt(this.freeSkillPoint.getText()); }
  RecalculationFreePoints() {
    let value = 0;
    for (let i = 0; i < mainValues.length; i++) {
      let localMain = parseInt(mainValues[i]);
      value += localMain;
      if (localMain > 101) {
        localMain -= 101;
        value += localMain;
      }
      if (localMain > 128) {
        localMain -= 128;
        value += localMain;
      }
      if (localMain > 151) {
        localMain -= 151;
        value += localMain;
      }
      if (localMain > 176) {
        localMain -= 176;
        value += localMain;
      }
      if (localMain > 201) {
        localMain -= 201;
        value += localMain;
      }
    }
    this.freeSkillPoint.setText(this.freeSPValue - value);
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
//let skillsMajor = new SkillsMajor(refObject, new Vector(0, 0, zPosition));

class SkillsChanger {
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
    let offsetY = 0; let offsetX = 500;
    for (let i = 0; i < countSkills; i++, offsetY++) {
      CreateChangerTextBox(nC, i, position.add(new Vector(offsetX, 150 + offsetY * 70, 0)), baffSkills);
      CreateChangerTextBox(nC, i, position.add(new Vector(offsetX + 210, 150 + offsetY * 70, 0)), debaffSkills);
      if (i == 9) { offsetY = -1; offsetX = 1230; }
    }
    //-------------------------
    let borderBaff = new Border();
    borderBaff.setColor(new Color(0.05, 0, 1));
    nC.addChild(borderBaff, 520, 100, 40, 40);
    nC.addChild(borderBaff, 1250, 100, 40, 40);
    //-------------------------
    let borderDebaff = new Border();
    borderDebaff.setColor(new Color(1, 0, 0.05));
    nC.addChild(borderDebaff, 730, 100, 40, 40);
    nC.addChild(borderDebaff, 1460, 100, 40, 40);
    //-------------------------
    let arrow = new ImageButton().setImage("left arrow.png");
    arrow.setImageSize(50);
    nC.addChild(arrow, 1525, 25, 50, 50);
    //-------------------------
    let t = this;
    arrow.onClicked.add(function () {
      t.HideUI();
      skillsMajor.ShowUI();
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
let skillsChanger = new SkillsChanger(refObject, new Vector(0, 0, 0));
//-----------------------------------------------------------------
function saveState() {
  let state = {};

  state["baff"] = baffValues;
  state["debaff"] = debaffValues;
  state["main"] = mainValues;
  state["addition"] = additionValueMain;
  state["selected"] = selectedSkills;
  state["countSelected"] = countSelected;

  refObject.setSavedData(JSON.stringify(state));
}

function loadState() {
  if (refObject.getSavedData() === "") {
    saveState();
    return;
  }

  let state = JSON.parse(refObject.getSavedData());
  baffValues = state["baff"] || baffValues;
  debaffValues = state["debaff"] || debaffValues;
  mainValues = state["main"] || mainValues;
  if (state["addition"] && state["addition"].length != 0) {
    additionValueMain = state["addition"];
  } else {
    for (let i = 0; i < countSkills; i++) {
      additionValueMain[i] = 0;
    }
  }
  selectedSkills = state["selected"] || selectedSkills;
  countSelected = state["countSelected"] || 0;
  for (let i = 0; i < countSkills; i++) {
    baffSkills[i].setText(baffValues[i] || "0");
    debaffSkills[i].setText(debaffValues[i] || "0");
    mainSkills[i].setText(mainValues[i] || "0");
  }
}

refObject.ResetValue = function () {
  for (let i = 0; i < countSkills; i++) {
    majorSkills[i].setText("0");
    baffSkills[i].setText("0");
    debaffSkills[i].setText("0");
    mainSkills[i].setText("0");
  }
  selectedSkills = [];
  countSelected = 0;
  saveState();
}

refObject.RecalculationMain = (array) => {
  startValueMainSkills[0] = 5 + array[TypeCharacteristic.dextery] * 4;
  startValueMainSkills[1] = array[TypeCharacteristic.dextery] * 2;
  startValueMainSkills[2] = array[TypeCharacteristic.dextery] * 2;
  startValueMainSkills[3] = 5 + array[TypeCharacteristic.dextery] * 4;
  startValueMainSkills[4] = 30 + (array[TypeCharacteristic.dextery] + array[TypeCharacteristic.strenght]) * 2;
  startValueMainSkills[5] = 20 + (array[TypeCharacteristic.dextery] + array[TypeCharacteristic.strenght]) * 2;
  startValueMainSkills[6] = array[TypeCharacteristic.dextery] * 4;
  startValueMainSkills[7] = (array[TypeCharacteristic.perception] + array[TypeCharacteristic.intelligence]) * 2;
  startValueMainSkills[8] = parseInt(((array[TypeCharacteristic.perception] + array[TypeCharacteristic.intelligence]) / 3)) * 5;
  startValueMainSkills[9] = (array[TypeCharacteristic.perception] + array[TypeCharacteristic.intelligence]) * 2;
  startValueMainSkills[10] = 5 + array[TypeCharacteristic.dextery] * 3;
  startValueMainSkills[11] = 10 + array[TypeCharacteristic.dextery] + array[TypeCharacteristic.perception];
  startValueMainSkills[12] = array[TypeCharacteristic.dextery] * 3;
  startValueMainSkills[13] = 10 + array[TypeCharacteristic.dextery] + array[TypeCharacteristic.perception];
  startValueMainSkills[14] = array[TypeCharacteristic.intelligence] * 4;
  startValueMainSkills[15] = (array[TypeCharacteristic.perception] + array[TypeCharacteristic.intelligence]) * 3;
  startValueMainSkills[16] = array[TypeCharacteristic.charism] * 5;
  startValueMainSkills[17] = array[TypeCharacteristic.charism] * 4;
  startValueMainSkills[18] = array[TypeCharacteristic.luck] * 5;
  for (let i = 0; i < countSkills; i++) {
    RecalculationMajorSkills(i);
  }
}

refObject.AdditionMain = (index, value) => {
  additionValueMain[index] = value;
  RecalculationMajorSkills(index);
}

refObject.SetFreeSkillPoint = (value) => {
  skillsMajor.freeSkillPoint.setText(value);
  skillsMajor.freeSPValue = value;
  skillsMajor.RecalculationFreePoints();
}
//-----------------------------------------------------------------
loadState();
let skillsMajor = new SkillsMajor(refObject, new Vector(0, 0, zPosition));