const { refObject, world } = require('@tabletop-playground/api');
const { ChangeImageSlider, SetCurrentLevel, CreateCanvasElement, GetTextFont, GetTextColor, CheckPlayerColor, CreateNumberButton } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
refObject.onCreated.add(() => {
  loadState();
})
//-----------------------------------------------------------------
const zPosition = 0.05;
const widgetWidth = 1600;
const widgetHeight = 400;
let nameFont = GetTextFont();
let textColor = GetTextColor();
//-----------------------------------------------------------------
class LevelBox {
  constructor(parent, position) {
    let t = this;
    this.Ex = 0;
    this.maxEx = 50;
    this.firstTime = true;
    this.startPosition = new Vector(110, widgetHeight - 90);
    //--Experience-----------------------
    this.nC = new Canvas();
    let nCUI = CreateCanvasElement(this.nC, position, widgetWidth, widgetHeight);
    parent.attachUI(nCUI);
    //-------------------------
    this.changedButton = CreateNumberButton([1, 5, 10, 25, 50, 100]);
    this.nC.addChild(this.changedButton, 440, 145, 100, 80);
    //-------------------------
    let decrementE = new ImageButton().setImage("minus.png");
    decrementE.setImageSize(200);
    this.nC.addChild(decrementE, 15, 305, 80, 80);
    //-------------------------
    let incrementE = new ImageButton().setImage("plus.png");
    incrementE.setImageSize(200);
    this.nC.addChild(incrementE, 1505, 305, 80, 80);
    //-------------------------
    this.back = new ImageWidget().setImage("bar1.png");
    this.nC.addChild(this.back, 100, 310, 1400, 80);
    //-------------------------
    this.experienceSlider = new ImageWidget().setImage("barline1.png");
    this.nC.addChild(this.experienceSlider, this.startPosition.x, this.startPosition.y, 60, 80);
    //-------------------------
    this.fontText = new Text().setText(this.Ex + "/" + this.maxEx).setFont(nameFont).setTextColor(textColor);
    this.fontText.setFontSize(40);
    this.nC.addChild(this.fontText, this.startPosition.x + 630, this.startPosition.y + 15, 200, 60);
    //-------------------------
    decrementE.onClicked.add(function () {
      t.valueExperience -= t.changedValueE;
      if (!t.firstTime) saveState(); else t.firstTime = false;
    });
    incrementE.onClicked.add(function () {
      t.valueExperience += t.changedValueE;
      if (!t.firstTime) saveState(); else t.firstTime = false;
    });
    //--Level-----------------------
    this.textLevel = new Text().setText("1").setFont(nameFont).setEnabled(false).setTextColor(textColor);
    this.textLevel.setFontSize(50);
    this.nC.addChild(this.textLevel, 460, 50, 100, 80);
    //-------------------------
    let decrementL = new ImageButton().setImage("minus.png");
    decrementL.setImageSize(100);
    this.nC.addChild(decrementL, 350, 45, 80, 80);
    //-------------------------
    let incrementL = new ImageButton().setImage("plus.png");
    incrementL.setImageSize(100);
    this.nC.addChild(incrementL, 550, 45, 80, 80);
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
    let resetButton = new ImageButton().setImage("resetl1.png");
    resetButton.setImageSize(200);
    this.nC.addChild(resetButton, widgetWidth - 215, 15, 200, 100);
    resetButton.onClicked.add((obj, player) => {
      if (CheckPlayerColor(player.getPlayerColor(), new Color(0, 0, 0))) {
        t.valueLevel = 1;
        t.valueExperience = 0;
        let allObject = world.getAllObjects();
        for (let i = 0; i < allObject.length; i++) {
          if (refObject != allObject[i] && refObject.getName() == allObject[i].getName()) {
            allObject[i].ResetValue();
          }
        }
        saveState();
      }
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
      this.experienceSlider, this.Ex, this.maxEx, this.startPosition, this.fontText, this.nC, null, 80, 14);
  }

  SetMaxEx(value, resetEx) {
    this.Ex = !resetEx && this.Ex || 0;
    this.maxEx = value;
    ChangeImageSlider(
      this.experienceSlider, this.Ex, this.maxEx, this.startPosition, this.fontText, this.nC, null, 80, 14);
  }
}
let infoLevel = new LevelBox(refObject, new Vector(0, 0, zPosition));
//-----------------------------------------------------------------
function saveState() {
  let state = {};

  state["level"] = infoLevel.valueLevel;
  state["experience"] = infoLevel.valueExperience;

  refObject.setSavedData(JSON.stringify(state));
}

function loadState() {
  if (refObject.getSavedData() === "") {
    saveState();
    return;
  }

  let state = JSON.parse(refObject.getSavedData());

  setTimeout(() => {
    infoLevel.valueLevel = state["level"] || 1;
    infoLevel.valueExperience = state["experience"];
  }, 50);
}