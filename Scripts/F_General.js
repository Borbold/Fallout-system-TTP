const { refObject, Button, ImageButton, Text, Vector } = require('@tabletop-playground/api');
const { ChangeImageSlider, PositionsFontUI, TypeShow } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
let figurePlate;
refObject.onCreated.add(() => {
  loadState();
  setTimeout(() => {
    let allObject = world.getAllObjects();
    for (let i = 0; i < allObject.length; i++) {
      if (refObject != allObject[i] && refObject.getName() == allObject[i].getName() && allObject[i].getTemplateName() == "Figure") {
        figurePlate = allObject[i];
        figurePlate.SetHelthPlate(helthPoint, actionPoint);
        break;
      }
    }
  }, 200);
})
//-----------------------------------------------------------------
const zPosition = 0.1;
const widgetWidth = 1600;
const widgetHeight = 500;
const nameFont = "Fallout.ttf";
//-----------------------------------------------------------------
class HelthPoints {
  helthUI = new UIElement();
  firstTime = true;
  startImageSliderPosX = 3.3;
  constructor(parent, position) {
    this.parent = parent;
    this.helthValue = 50;
    this.maxHelthValue = 100;
    this.startPosition = position;
    //-------------------------
    let nC = new Canvas();

    this.nCUI = new UIElement();
    this.nCUI.useWidgetSize = false;
    this.nCUI.position = new Vector(0, 0, zPosition);
    this.nCUI.rotation = new Rotator(0, 0, 180);
    this.nCUI.widget = nC;
    this.nCUI.width = widgetWidth;
    this.nCUI.height = widgetHeight;
    this.nCUI.scale = 0.1;
    parent.attachUI(this.nCUI);
    //-------------------------
    this.box = new Button().setFont(nameFont);
    this.changeHelthValue = 1;
    this.box.setFontSize(40);
    nC.addChild(this.box, 440, 180, 100, 80);
    //-------------------------
    this.backText = new Button().setText(this.helthValue + "/" + this.maxHelthValue + " max").setFont(nameFont);
    this.backText.setFontSize(40);
    nC.addChild(this.backText, 15, 180, 350, 80);
    //-------------------------
    this.helth = new ImageWidget().setImage("barline1.png");

    let procent = (100 * this.helthValue) / this.maxHelthValue;
    this.helthUI.useWidgetSize = false;
    this.helthUI.width = procent * 10;
    this.helthUI.height = 65;
    this.helthUI.position = position.add(new Vector(0, PositionsFontUI(this.startImageSliderPosX, this.helthUI.width), 0));
    this.helthUI.rotation = new Rotator(0, 0, 180);
    this.helthUI.widget = this.helth;
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
    this.fontText = new Text().setText(procent + "%").setTextColor(new Color(0.75, 0.75, 0.75)).setFont(nameFont);
    this.fontText.setFontSize(18);

    let fountTextUI = new UIElement();
    fountTextUI.position = position.add(new Vector(0, -1.7, 0.01));
    fountTextUI.rotation = new Rotator(0, 0, 180);
    fountTextUI.widget = this.fontText;
    fountTextUI.scale = 0.2;
    parent.attachUI(fountTextUI);
    //-------------------------
    let t = this;
    let boxTable = [1, 5, 10, 25, 50, 100];
    let boxIndex = 0;
    this.box.onClicked.add(function () {
      boxIndex++;
      if (boxIndex >= boxTable.length) {
        boxIndex = 0;
      }
      t.changeHelthValue = boxTable[boxIndex];
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
    let locValue = ((this.helthValue + this.changeHelthValue) > this.maxHelthValue && this.maxHelthValue) || this.helthValue + this.changeHelthValue;
    this.value = locValue;
  }
  DecreaseValue() {
    let locValue = ((this.helthValue - this.changeHelthValue) < 0 && "0") || this.helthValue - this.changeHelthValue;
    this.value = parseInt(locValue);
  }

  get value() { return this.helthValue; }
  set value(number) {
    this.helthValue = number;
    ChangeImageSlider(
      this.helthUI, this.helthValue, this.maxHelthValue, this.startPosition, this.fontText, this.parent, this.startImageSliderPosX, TypeShow.PROCENT);
    if (!this.firstTime) saveState(); else this.firstTime = false;
    this.backText.setText(this.helthValue + "/" + this.maxHelthValue + " max");
    setTimeout(() => {
      figurePlate.SetValueH(this.helthValue + "/" + this.maxHelthValue);
    }, 210);
  }

  get changeHelthValue() { return parseInt(this.box.getText()); }
  set changeHelthValue(number) { this.box.setText(number.toString()); }
}
let helthPoint = new HelthPoints(refObject, new Vector(-1.31, 0, zPosition));

class ActionPoints {
  actionUI = new UIElement();
  activeActions = [];
  inactiveActions = [];
  positionsActionX = [];
  constructor(parent, position) {
    this.parent = parent;
    this.quantityAction = 5;
    this.maxAction = 10;
    this.totalAction = 15;
    this.startPosition = position;
    //-------------------------
    let nC = new Canvas();

    this.nCUI = new UIElement();
    this.nCUI.useWidgetSize = false;
    this.nCUI.position = new Vector(0, 0, zPosition);
    this.nCUI.rotation = new Rotator(0, 0, 180);
    this.nCUI.widget = nC;
    this.nCUI.width = widgetWidth;
    this.nCUI.height = widgetHeight;
    this.nCUI.scale = 0.1;
    parent.attachUI(this.nCUI);
    //-------------------------
    this.box = new Button().setFont(nameFont);
    this.changeActionValue = 1;
    this.box.setFontSize(40);
    nC.addChild(this.box, 440, 360, 100, 80);
    //-------------------------
    this.backText = new Button().setText(this.quantityAction + "/" + this.maxAction + " max").setFont(nameFont);
    this.backText.setFontSize(40);
    nC.addChild(this.backText, 15, 360, 350, 80);
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
    nC.addChild(this.decrement, 390, 275, 60, 60);
    //-------------------------
    this.increment = new ImageButton().setImage("plus.png");
    this.increment.setImageSize(100);
    nC.addChild(this.increment, 1490, 275, 60, 60);
    //-------------------------
    let t = this;
    let boxTable = [1, 2, 4];
    let boxIndex = 0;
    this.box.onClicked.add(function () {
      boxIndex++;
      if (boxIndex >= boxTable.length) {
        boxIndex = 0;
      }
      t.changeActionValue = boxTable[boxIndex];
    });
    this.decrement.onClicked.add(function () {
      t.quantityAction = ((t.quantityAction - t.changeActionValue) < 0 && "0") || t.quantityAction - t.changeActionValue;
      t.value = parseInt(t.quantityAction);
    });
    this.increment.onClicked.add(function () {
      t.value = ((t.quantityAction + t.changeActionValue) > t.maxAction && t.maxAction) || t.quantityAction + t.changeActionValue;
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
    setTimeout(() => {
      figurePlate.SetValueA(this.quantityAction + "/" + this.maxAction);
    }, 210);
  }

  get changeActionValue() { return parseInt(this.box.getText()); }
  set changeActionValue(number) { this.box.setText(number.toString()); }
}
let actionPoint = new ActionPoints(refObject, new Vector(0.55, 3, zPosition));
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

  helthPoint.value = state["helthPoint"];
  actionPoint.value = state["actionPoint"];
}

refObject.ResetValue = function () {
  helthPoint.value = 50;
  actionPoint.value = 5;
  saveState();
}