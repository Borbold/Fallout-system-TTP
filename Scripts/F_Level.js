const { refObject, Button, ImageButton, Text, Vector, world } = require('@tabletop-playground/api');
const { ChangeImageSlider, PositionsFontUI, SetCurrentLevel } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
refObject.onCreated.add(() => {
  loadState();
})
//-----------------------------------------------------------------
const zPosition = 0.05;
const widgetWidth = 1600;
const widgetHeight = 400;
const nameFont = "Fallout.ttf";
//-----------------------------------------------------------------
class ExperienceBox {
  startImageSliderPosX = 9.9;
  firstTime = true;
  fontUI = new UIElement();
  //-------------------------
  constructor(parent, position) {
    this.parent = parent;
    this.Ex = 0;
    this.maxEx = 50;
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
    this.box = new Button().setFont(nameFont);
    this.changeExValue = 1;
    this.box.setFontSize(40);
    nC.addChild(this.box, 440, 145, 100, 80);
    //-------------------------
    position = position.add(new Vector(1.59, -3, 0));
    this.startPosition = position.add(new Vector(-0.08, 0, 0.01));
    //-------------------------
    this.decrement = new ImageButton().setImage("minus.png");
    this.decrement.setImageSize(200);
    nC.addChild(this.decrement, 15, 305, 80, 80);
    //-------------------------
    this.increment = new ImageButton().setImage("plus.png");
    this.increment.setImageSize(200);
    nC.addChild(this.increment, 1505, 305, 80, 80);
    //-------------------------
    this.back = new ImageWidget().setImage("bar1.png");
    nC.addChild(this.back, 100, 310, 1400, 80);
    //-------------------------
    this.font = new ImageWidget().setImage("barline1.png");

    let procent = (100 * this.Ex) / this.maxEx;
    this.fontUI.useWidgetSize = false;
    this.fontUI.width = procent * 14;
    this.fontUI.height = 80;
    this.fontUI.position = position.add(new Vector(0, PositionsFontUI(this.startImageSliderPosX, this.fontUI.width), 0));
    this.fontUI.rotation = new Rotator(0, 0, 180);
    this.fontUI.widget = this.font;
    this.fontUI.scale = 0.1;
    parent.attachUI(this.fontUI);
    //-------------------------
    this.fontText = new Text().setText(this.Ex + "/" + this.maxEx).setFont(nameFont);
    this.fontText.setFontSize(18);

    let posB = position.add(new Vector(0, 3, -0.01));
    let fountTextUI = new UIElement();
    fountTextUI.position = posB.add(new Vector(-0.05, 0, 0.04));
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
      t.changeExValue = boxTable[boxIndex];
    });
    this.decrement.onClicked.add(function () {
      t.Ex -= t.changeExValue;
      if (t.Ex < 0) {
        t.Ex = 0;
      }
      ChangeImageSlider(
        t.fontUI, t.Ex, t.maxEx, t.startPosition, t.fontText, t.parent, t.startImageSliderPosX, null, 14);
      if (!t.firstTime) saveState(); else t.firstTime = false;
    });
    this.increment.onClicked.add(function () {
      t.value += t.changeExValue;
      ChangeImageSlider(
        t.fontUI, t.Ex, t.maxEx, t.startPosition, t.fontText, t.parent, t.startImageSliderPosX, null, 14);
      if (!t.firstTime) saveState(); else t.firstTime = false;
    });
  }

  get changeExValue() { return parseInt(this.box.getText()); }
  set changeExValue(number) { this.box.setText(number.toString()); }

  get value() { return this.Ex; }
  set value(number) {
    this.Ex = number;
    if (this.Ex >= this.maxEx) {
      this.Ex -= this.maxEx;
      level.value = level.value + 1;
    }
    ChangeImageSlider(
      this.fontUI, this.Ex, this.maxEx, this.startPosition, this.fontText, this.parent, this.startImageSliderPosX, null, 14);
  }

  SetMaxEx(value, resetEx) {
    this.Ex = !resetEx && this.Ex || 0;
    this.maxEx = value;
    ChangeImageSlider(
      this.fontUI, this.Ex, this.maxEx, this.startPosition, this.fontText, this.parent, this.startImageSliderPosX, null, 14);
  }
}
let experience = new ExperienceBox(refObject, new Vector(0, 0, zPosition));

class LevelBox {
  constructor(parent, position) {
    this.parent = parent;
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
    this.box = new Text().setText("1").setFont(nameFont);
    this.box.setEnabled(false);
    this.box.setFontSize(50);
    this.value = 1;
    nC.addChild(this.box, 460, 50, 100, 80);
    //-------------------------
    this.decrement = new ImageButton().setImage("minus.png");
    this.decrement.setImageSize(100);
    nC.addChild(this.decrement, 350, 45, 80, 80);
    //-------------------------
    this.increment = new ImageButton().setImage("plus.png");
    this.increment.setImageSize(100);
    nC.addChild(this.increment, 550, 45, 80, 80);
    //-------------------------
    let t = this
    this.decrement.onClicked.add(function () {
      if (t.value > 1) {
        t.value -= 1;
        saveState();
      }
    });
    this.increment.onClicked.add(function () {
      t.value += 1;
      saveState();
    });
  }

  get value() { return parseInt(this.box.getText()); }
  set value(number) {
    experience.SetMaxEx(50 * number, parseInt(this.box.getText()) > number);
    this.box.setText(number.toString());
    SetCurrentLevel(refObject.getName(), number);
  }
}
let level = new LevelBox(refObject, new Vector(0, 0, zPosition));

class ResetLevel {
  constructor(parent, position) {
    this.parent = parent;
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
    this.reset = new ImageButton().setImage("resetl1.png");
    this.reset.setImageSize(200);
    nC.addChild(this.reset, 1385, 15, 200, 100);
    //-------------------------
    this.reset.onClicked.add((obj, player) => {
      level.value = 1;
      experience.value = 0;
      let allObject = world.getAllObjects();
      for (let i = 0; i < allObject.length; i++) {
        //world.broadcastChatMessage(allObject[i].getName() + ":" + i);
        if (refObject != allObject[i] && refObject.getName() == allObject[i].getName()) {
          allObject[i].ResetValue();
        }
      }
      saveState();
    })
  }
}
let reset = new ResetLevel(refObject, new Vector(0, 0, zPosition));
//-----------------------------------------------------------------
function saveState() {
  let state = {};

  state["level"] = level.value;
  state["experience"] = experience.value;

  refObject.setSavedData(JSON.stringify(state));
}

function loadState() {
  if (refObject.getSavedData() === "") {
    saveState();
    return;
  }

  let state = JSON.parse(refObject.getSavedData());

  level.value = state["level"];
  experience.value = state["experience"];
}