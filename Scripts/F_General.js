const { refObject } = require('@tabletop-playground/api');
const { ChangeImageSlider, PositionsFontUI, TypeShow, CreateCanvasElement, GetTextFont, GetTextColor } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
let figurePlate;
refObject.onCreated.add(() => {
  loadState();
  setTimeout(() => {
    let allObject = world.getAllObjects();
    let checkInfo = false;
    for (let i = 0; i < allObject.length; i++) {
      if (refObject != allObject[i] && refObject.getName() == allObject[i].getName()) {
        if (allObject[i].getTemplateMetadata() == "firgureCharacter") {
          figurePlate = allObject[i];
          figurePlate.SetHelthPlate(helthPoint, actionPoint);
        } else if (allObject[i].SetHealthActionPlate) {
          allObject[i].SetHealthActionPlate(helthPoint, actionPoint);
          checkInfo = true;
        }
        if (checkInfo && figurePlate)
          break;
      }
    }
  }, 200);
})
//-----------------------------------------------------------------
const zPosition = 0.1;
const widgetWidth = 1600;
const widgetHeight = 500;
let nameFont = GetTextFont();
let textColor = GetTextColor();
//-----------------------------------------------------------------
class HelthPoints {
  helthUI = new UIElement();
  firstTime = true;
  startImageSliderPosX = 3.3;
  constructor(parent, position) {
    let offsetX = -1.31;
    this.parent = parent;
    this.helthValue = 30;
    this.maxHelthValue = 30;
    this.startPosition = position.add(new Vector(offsetX, 0, 0));
    //-------------------------
    let nC = new Canvas();
    let nCUI = CreateCanvasElement(nC, position.add(new Vector(-1.25, 0, 0)), widgetWidth, widgetHeight / 2);
    parent.attachUI(nCUI);
    //-------------------------
    this.changedButton = new Button().setText("1").setFont(nameFont).setTextColor(textColor);
    this.changedButton.setFontSize(40);
    nC.addChild(this.changedButton, 440, 180, 100, 80);
    //-------------------------
    this.backText = new Button().setText(this.helthValue + "/" + this.maxHelthValue + " max").setFont(nameFont).setTextColor(textColor);
    this.backText.setFontSize(40);
    nC.addChild(this.backText, 15, 180, 350, 80);
    //-------------------------
    let helth = new ImageWidget().setImage("barline1.png");

    this.helthUI.useWidgetSize = false;
    this.helthUI.width = 0;
    this.helthUI.height = 65;
    this.helthUI.position = position.add(new Vector(offsetX, PositionsFontUI(this.startImageSliderPosX, this.helthUI.width), 0));
    this.helthUI.rotation = new Rotator(0, 0, 180);
    this.helthUI.widget = helth;
    this.helthUI.scale = 0.1;
    parent.attachUI(this.helthUI);
    //-------------------------
    this.decrement = new ImageButton().setImage("minus.png");
    this.decrement.setImageSize(100);
    nC.addChild(this.decrement, 390, 90, 60, 60);
    //-------------------------
    this.increment = new ImageButton().setImage("plus.png");
    this.increment.setImageSize(100);
    nC.addChild(this.increment, 1490, 90, 60, 60);
    //-------------------------
    this.fontText = new Text().setText("%").setTextColor(new Color(0.75, 0.75, 0.75)).setFont(nameFont).setTextColor(textColor);
    this.fontText.setFontSize(18);

    let fountTextUI = new UIElement();
    fountTextUI.position = position.add(new Vector(offsetX + 0.05, -1.7, 0.01));
    fountTextUI.rotation = new Rotator(0, 0, 180);
    fountTextUI.widget = this.fontText;
    fountTextUI.scale = 0.2;
    parent.attachUI(fountTextUI);
    //-------------------------
    let t = this;
    let boxTable = [1, 5, 10, 25, 50, 100];
    let boxIndex = 0;
    this.changedButton.onClicked.add(function () {
      boxIndex++;
      if (boxIndex >= boxTable.length) {
        boxIndex = 0;
      }
      t.changedValue = boxTable[boxIndex];
    });
    this.decrement.onClicked.add(function () {
      t.DecreaseValue();
    });
    this.increment.onClicked.add(function () {
      t.IncreaseValue();
    });
    this.backText.onClicked.add(() => {
      t.value = t.maxHelthValue;
    });
  }

  IncreaseValue() {
    let locValue = ((this.helthValue + this.changedValue) > this.maxHelthValue && this.maxHelthValue) || this.helthValue + this.changedValue;
    this.value = locValue;
  }
  DecreaseValue() {
    let locValue = ((this.helthValue - this.changedValue) < 0 && "0") || this.helthValue - this.changedValue;
    this.value = parseInt(locValue);
  }

  get value() { return this.helthValue; }
  set value(number) {
    this.helthValue = number;
    ChangeImageSlider(
      this.helthUI, number, this.maxHelthValue, this.startPosition, this.fontText, this.parent, this.startImageSliderPosX, TypeShow.PROCENT);
    if (!this.firstTime) saveState(); else this.firstTime = false;
    this.backText.setText(number + "/" + this.maxHelthValue + " max");
    figurePlate.SetValueH(number + "/" + this.maxHelthValue);
  }

  get changedValue() { return parseInt(this.changedButton.getText()); }
  set changedValue(number) { this.changedButton.setText(number.toString()); }

  SetMaxValue(strenght, endurance, currentLevel) {
    let newMax = 0;
    for (let i = 1; i <= currentLevel; i++) {
      if (i == 1) {
        newMax += 15 + strenght + endurance * 2;
      } else {
        newMax += (parseInt(endurance / 2) + 2) * currentLevel;
      }
    }
    this.maxHelthValue = newMax;

    if (this.value > newMax) {
      this.value = newMax;
    } else {
      ChangeImageSlider(
        this.helthUI, this.value, newMax, this.startPosition, this.fontText, this.parent, this.startImageSliderPosX, TypeShow.PROCENT);
      this.backText.setText(this.value + "/" + newMax + " max");
    }
  }
  set maxValue(value) {
    this.maxHelthValue = value;
  }
}
let helthPoint = new HelthPoints(refObject, new Vector(0, 0, zPosition));

class ActionPoints {
  actionUI = new UIElement();
  activeActions = [];
  inactiveActions = [];
  positionsActionX = [];
  constructor(parent, position) {
    let t = this;
    let offsetVec = new Vector(0.55, 3, 0);
    this.parent = parent;
    this.quantityAction = 7;
    this.maxAction = 7;
    this.totalAction = 15;
    this.startPosition = position.add(offsetVec);
    //-------------------------
    let nC = new Canvas();
    let nCUI = CreateCanvasElement(nC, position.add(new Vector(0.6, 0, 0)), widgetWidth, widgetHeight / 2);
    parent.attachUI(nCUI);
    //-------------------------
    this.changedButton = new Button().setText("1").setFont(nameFont).setTextColor(textColor);
    this.changedButton.setFontSize(40);
    nC.addChild(this.changedButton, 440, 180, 100, 80);
    //-------------------------
    this.backText = new Button().setText(this.quantityAction + "/" + this.maxAction + " max").setFont(nameFont).setTextColor(textColor);
    this.backText.setFontSize(40);
    nC.addChild(this.backText, 15, 180, 350, 80);
    //-------------------------
    for (let i = 0; i < this.totalAction; i++) {
      this.positionsActionX.push(-i / 1.5);

      this.activeActions.push(new ImageWidget().setImage("lampon.png"));
      this.activeActions[i].setImageSize(70);

      this.inactiveActions.push(new ImageWidget().setImage("lampoff.png"));
      this.inactiveActions[i].setImageSize(70);
    }
    this.actionUI.rotation = new Rotator(0, 0, 180);
    this.actionUI.scale = 0.1;
    for (let i = 0; i < this.totalAction; i++) {
      if (i < this.quantityAction) {
        this.ChangeActiveAction(0.01, 0, i);
      } else {
        this.ChangeActiveAction(0, 0.01, i);
      }
    }
    //-------------------------
    this.decrement = new ImageButton().setImage("minus.png");
    this.decrement.setImageSize(100);
    nC.addChild(this.decrement, 390, 90, 60, 60);
    //-------------------------
    this.increment = new ImageButton().setImage("plus.png");
    this.increment.setImageSize(100);
    nC.addChild(this.increment, 1490, 90, 60, 60);
    //-------------------------
    let boxTable = [1, 2, 4];
    let boxIndex = 0;
    this.changedButton.onClicked.add(function () {
      boxIndex++;
      if (boxIndex >= boxTable.length) {
        boxIndex = 0;
      }
      t.changedValue = boxTable[boxIndex];
    });
    this.decrement.onClicked.add(function () {
      t.quantityAction = ((t.quantityAction - t.changedValue) < 0 && "0") || t.quantityAction - t.changedValue;
      t.value = parseInt(t.quantityAction);
    });
    this.increment.onClicked.add(function () {
      t.value = ((t.quantityAction + t.changedValue) > t.maxAction && t.maxAction) || t.quantityAction + t.changedValue;
    });
    this.backText.onClicked.add(() => {
      t.value = t.maxAction;
    });
  }

  ChangeImageAction() {
    for (let i = 0; i < this.maxAction; i++) {
      if (i < this.quantityAction) {
        this.ChangeActiveAction(0.01, 0, i, true);
      } else {
        this.ChangeActiveAction(0, 0.01, i, true);
      }
    }
  }
  ChangeActiveAction(posActive, posInactive, i, update) {
    this.actionUI.position = this.startPosition.add(new Vector(0, this.positionsActionX[i], posActive));
    this.actionUI.widget = this.activeActions[i];
    if (update) this.parent.updateUI(this.actionUI); else this.parent.attachUI(this.actionUI);

    this.actionUI.position = this.startPosition.add(new Vector(0, this.positionsActionX[i], posInactive));
    this.actionUI.widget = this.inactiveActions[i];
    if (update) this.parent.updateUI(this.actionUI); else this.parent.attachUI(this.actionUI);
  }

  get value() { return this.quantityAction; }
  set value(number) {
    this.quantityAction = number;
    this.ChangeImageAction();
    if (!this.firstTime) saveState(); else this.firstTime = false;
    this.backText.setText(this.quantityAction + "/" + this.maxAction + " max");
    figurePlate.SetValueA(this.quantityAction + "/" + this.maxAction);
  }

  SetMaxValue(dextery) {
    this.maxAction = parseInt(5 + dextery / 2);

    if (this.value > this.maxAction) {
      this.value = this.maxAction;
    } else {
      this.backText.setText(this.value + "/" + this.maxAction + " max");
    }
  }
  set maxValue(value) {
    this.maxAction = value;
  }

  get changedValue() { return parseInt(this.changedButton.getText()); }
  set changedValue(number) { this.changedButton.setText(number.toString()); }
}
let actionPoint = new ActionPoints(refObject, new Vector(0, 0, zPosition));
//-----------------------------------------------------------------
function saveState() {
  let state = {};

  state["helthPoint"] = helthPoint.value;
  state["actionPoint"] = actionPoint.value;

  refObject.setSavedData(JSON.stringify(state));
}

function loadState() {
  if (refObject.getSavedData() === "") {
    saveState();
    return;
  }

  let state = JSON.parse(refObject.getSavedData());

  setTimeout(() => {
    helthPoint.value = state["helthPoint"];
    actionPoint.value = state["actionPoint"];
  }, 210);
}

refObject.ResetValue = function () {
  helthPoint.value = 30;
  actionPoint.value = 7;
  helthPoint.maxValue = 30;
  actionPoint.maxValue = 7;
  saveState();
}