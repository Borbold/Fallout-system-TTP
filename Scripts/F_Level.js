const { refObject, world } = require('@tabletop-playground/api');
const { ChangeImageSlider, PositionsFontUI, SetCurrentLevel, CreateCanvasElement } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
refObject.onCreated.add(() => {
  loadState();
})
//-----------------------------------------------------------------
const zPosition = 0.05;
const widgetWidth = 1600;
const widgetHeight = 400;
const nameFont = "Fallout.ttf";
let nCUI = CreateCanvasElement(null, new Vector(0, 0, zPosition), widgetWidth, widgetHeight);
//-----------------------------------------------------------------
class LevelBox {
  constructor(parent, position) {
    this.parent = parent;
    this.Ex = 0;
    this.maxEx = 50;
    this.firstTime = true;
    this.startImageSliderPosX = 9.9;
    //--Experience-----------------------
    let nC = new Canvas();
    nCUI.widget = nC;
    parent.attachUI(nCUI);
    //-------------------------
    this.changedButton = new Button().setText("1").setFont(nameFont);
    this.changedButton.setFontSize(40);
    nC.addChild(this.changedButton, 440, 145, 100, 80);
    //-------------------------
    position = position.add(new Vector(1.59, -3, 0));
    this.startPosition = position.add(new Vector(-0.08, 0, 0.01));
    //-------------------------
    this.font = new ImageWidget().setImage("barline1.png");

    this.fontUI = new UIElement();
    this.fontUI.useWidgetSize = false;
    this.fontUI.width = 1;
    this.fontUI.height = 80;
    this.fontUI.position = position.add(new Vector(0, PositionsFontUI(this.startImageSliderPosX, this.fontUI.width), 0));
    this.fontUI.rotation = new Rotator(0, 0, 180);
    this.fontUI.widget = this.font;
    this.fontUI.scale = 0.1;
    parent.attachUI(this.fontUI);
    //-------------------------
    let decrementE = new ImageButton().setImage("minus.png");
    decrementE.setImageSize(200);
    nC.addChild(decrementE, 15, 305, 80, 80);
    //-------------------------
    let incrementE = new ImageButton().setImage("plus.png");
    incrementE.setImageSize(200);
    nC.addChild(incrementE, 1505, 305, 80, 80);
    //-------------------------
    this.back = new ImageWidget().setImage("bar1.png");
    nC.addChild(this.back, 100, 310, 1400, 80);
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
    this.changedButton.onClicked.add(function () {
      boxIndex++;
      if (boxIndex >= boxTable.length) {
        boxIndex = 0;
      }
      t.changedValueE = boxTable[boxIndex];
    });
    decrementE.onClicked.add(function () {
      t.valueExperience -= t.changedValueE;
      if (!t.firstTime) saveState(); else t.firstTime = false;
    });
    incrementE.onClicked.add(function () {
      t.valueExperience += t.changedValueE;
      if (!t.firstTime) saveState(); else t.firstTime = false;
    });
    //--Level-----------------------
    this.textLevel = new Text().setText("1").setFont(nameFont).setEnabled(false);
    this.textLevel.setFontSize(50);
    nC.addChild(this.textLevel, 460, 50, 100, 80);
    //-------------------------
    let decrementL = new ImageButton().setImage("minus.png");
    decrementL.setImageSize(100);
    nC.addChild(decrementL, 350, 45, 80, 80);
    //-------------------------
    let incrementL = new ImageButton().setImage("plus.png");
    incrementL.setImageSize(100);
    nC.addChild(incrementL, 550, 45, 80, 80);
    //-------------------------
    decrementL.onClicked.add(function () {
      if (t.valueLevel > 1) {
        t.valueLevel -= 1;
        saveState();
      }
    });
    incrementL.onClicked.add(function () {
      t.valueLevel += 1;
      saveState();
    });
    //--Reset-----------------------
    this.resetButton = new ImageButton().setImage("resetl1.png");
    this.resetButton.setImageSize(200);
    nC.addChild(this.resetButton, 1385, 15, 200, 100);
    //-------------------------
    this.resetButton.onClicked.add((obj, player) => {
      t.valueLevel = 1;
      t.valueExperience = 0;
      let allObject = world.getAllObjects();
      for (let i = 0; i < allObject.length; i++) {
        if (refObject != allObject[i] && refObject.getName() == allObject[i].getName()) {
          allObject[i].ResetValue();
        }
      }
      saveState();
    })
  }
  //-------------------------
  get valueLevel() { return parseInt(this.textLevel.getText()); }
  set valueLevel(number) {
    this.SetMaxEx(50 * number, parseInt(this.textLevel.getText()) > number);
    this.textLevel.setText(number.toString());
    SetCurrentLevel(refObject.getName(), number);
  }
  //-------------------------
  get changedValueE() { return parseInt(this.changedButton.getText()); }
  set changedValueE(number) { this.changedButton.setText(number.toString()); }

  get valueExperience() { return this.Ex; }
  set valueExperience(number) {
    this.Ex = number;
    if (this.Ex >= this.maxEx) {
      this.Ex -= this.maxEx;
      this.valueLevel += 1;
    } else if (this.Ex < 0) {
      this.Ex = 0;
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
let infoLevel = new LevelBox(refObject, new Vector(0, 0, zPosition));
//-----------------------------------------------------------------
function saveState() {
  let state = {};

  state["level"] = infoLevel.valueLevel;
  state["experience"] = infoLevel.experience;

  refObject.setSavedData(JSON.stringify(state));
}

function loadState() {
  if (refObject.getSavedData() === "") {
    saveState();
    return;
  }

  let state = JSON.parse(refObject.getSavedData());

  infoLevel.valueLevel = state["level"];
  infoLevel.valueExperience = state["experience"];
}