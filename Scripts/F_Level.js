﻿const { refObject, world } = require('@tabletop-playground/api');
const { SetCurrentLevel, CheckPlayerColor, UI } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
refObject.onCreated.add(() => {
  loadState();
})
//-----------------------------------------------------------------
const zPosition = 0.05;
const widgetWidth = 1600;
const widgetHeight = 400;
let nameFont = UI.GetTextFont();
let textColor = UI.GetTextColor();
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
    let nCUI = UI.CreateCanvasElement(this.nC, position, widgetWidth, widgetHeight);
    parent.attachUI(nCUI);
    //-------------------------
    this.changedButton = UI.CreateNumberButton([1, 5, 10, 25, 50, 100]);
    this.nC.addChild(this.changedButton, 440, 145, 100, 80);
    //-------------------------
    UI.CreatePlusMinusButton(this.nC,
    {
      func: () => {
        this.valueExperience += this.changedValueE;
        if (!this.firstTime) saveState(); else this.firstTime = false;
      }, x: 1505, y: 305, tex: "plus.png"
    },
    {
      func: () => {
        this.valueExperience -= this.changedValueE;
        if (!this.firstTime) saveState(); else this.firstTime = false;
      }, x: 15, y: 305, tex: "minus.png"
    }, 80);
    //-------------------------
    this.experienceSlider = new ImageWidget().setImage("barline1.png");
    UI.CreateImageSlider(this,
      { slider: this.experienceSlider, w: 60, h: 80 },
      { fontSize: 40, x: this.startPosition.x + 630, y: this.startPosition.y + 15, w: 200, h: 60 },
      { tex: "bar1.png", x: 100, y: 310, w: 1400, h: 80 });
    //--Level-----------------------
    this.textLevel = new Text().setText("1").setFont(nameFont).setEnabled(false).setTextColor(textColor);
    this.textLevel.setFontSize(50);
    this.nC.addChild(this.textLevel, 460, 50, 100, 80);
    //-------------------------
    UI.CreatePlusMinusButton(this.nC,
      {
        func: () => {
          this.valueLevel += 1;
          saveState();
        }, x: 540, y: 50, tex: "plus.png"
      },
      {
        func: () => {
          if (this.valueLevel > 1) {
            this.valueLevel -= 1;
            saveState();
          }
        }, x: 360, y: 50, tex: "minus.png"
      }, 80);
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
    UI.ChangeImageSlider(
      this.experienceSlider, this.Ex, this.maxEx, this.startPosition, this.fontText, this.nC, null, 80, 14);
  }

  SetMaxEx(value, resetEx) {
    this.Ex = !resetEx && this.Ex || 0;
    this.maxEx = value;
    UI.ChangeImageSlider(
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