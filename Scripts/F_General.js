const { refObject } = require('@tabletop-playground/api');
const { UI } = require('./general/General_Functions.js');
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
          //Info_Reputation
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
let nameFont = UI.GetTextFont();
let textColor = UI.GetTextColor();
//-----------------------------------------------------------------
class HelthPoints {
  firstTime = true;
  constructor(parent, position) {
    let t = this;
    this.helthValue = 30;
    this.maxHelthValue = 30;
    this.startPosition = new Vector(470, 90);
    //-------------------------
    this.nC = new Canvas();
    let nCUI = UI.CreateCanvasElement(this.nC, position.add(new Vector(-1.25, 0, 0)), widgetWidth, widgetHeight / 2);
    parent.attachUI(nCUI);
    //-------------------------
    this.changedButton = UI.CreateNumberButton([1, 5, 10, 25, 50, 100]);
    this.nC.addChild(this.changedButton, 440, 180, 100, 80);
    //-------------------------
    this.backText = new Button().setText(this.helthValue + "/" + this.maxHelthValue + " max").setFont(nameFont).setTextColor(textColor);
    this.backText.setFontSize(40);
    this.nC.addChild(this.backText, 15, 180, 350, 80);
    //-------------------------
    UI.CreatePlusMinusButton(this.nC,
      {
        func: () => {
          this.IncreaseValue();
        }, x: 1490, y: 90, tex: "plus.png"
      },
      {
        func: () => {
          this.DecreaseValue();
        }, x: 390, y: 90, tex: "minus.png"
      }, 60);
    //-------------------------
    this.helth = new ImageWidget().setImage("barline1.png");
    UI.CreateImageSlider(this,
      { slider: this.helth, w: 60, h: 80 },
      { fontSize: 40, x: this.startPosition.x + 450, y: this.startPosition.y + 5, w: 110, h: 60 });
    //-------------------------
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
    UI.ChangeImageSlider(
      this.helth, number, this.maxHelthValue, this.startPosition, this.frontText, this.nC, UI.TypeShow.PROCENT, 60);
    if (!this.firstTime) saveState(); else this.firstTime = false;
    this.backText.setText(number + "/" + this.maxHelthValue + " max");
    figurePlate.SetValueH(number + "/" + this.maxHelthValue);
    //Info_Reputation
    if (this.RecalculationMajor) { this.RecalculationMajor(); }
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
      UI.ChangeImageSlider(
        this.helth, this.value, newMax, this.startPosition, this.frontText, this.nC, UI.TypeShow.PROCENT, 60);
      this.backText.setText(this.value + "/" + newMax + " max");
    }
  }
  set MaxValue(value) { this.maxHelthValue = value; }

  GetProcent() { return (this.value * 100) / this.maxHelthValue; }
}
let helthPoint = new HelthPoints(refObject, new Vector(0, 0, zPosition));

class ActionPoints {
  actionUI = new UIElement();
  activeActions = [];
  inactiveActions = [];
  positionsActionX = [];
  constructor(parent, position) {
    let t = this;
    this.parent = parent;
    this.quantityAction = 7;
    this.maxAction = 7;
    this.totalAction = 15;
    this.startPosition = new Vector(458, 0);
    //-------------------------
    this.nC = new Canvas();
    let nCUI = UI.CreateCanvasElement(this.nC, position.add(new Vector(1.46, 0, 0)), widgetWidth, widgetHeight / 2);
    parent.attachUI(nCUI);
    //-------------------------
    this.changedButton = UI.CreateNumberButton([1, 2, 4]);
    this.nC.addChild(this.changedButton, 440, 100, 100, 80);
    //-------------------------
    this.backText = new Button().setText(this.quantityAction + "/" + this.maxAction + " max").setFont(nameFont).setTextColor(textColor);
    this.backText.setFontSize(40);
    this.nC.addChild(this.backText, 15, 100, 350, 80);
    //-------------------------
    for (let i = 0; i < this.totalAction; i++) {
      this.positionsActionX.push(i * 68 + this.startPosition.x);

      this.activeActions.push(new ImageWidget().setImage("lampon.png"));
      this.activeActions[i].setImageSize(70);
      this.nC.addChild(this.activeActions[i], 0, widgetHeight, 1, 1);

      this.inactiveActions.push(new ImageWidget().setImage("lampoff.png"));
      this.inactiveActions[i].setImageSize(70);
      this.nC.addChild(this.inactiveActions[i], 0, widgetHeight, 1, 1);
    }
    //-------------------------
    UI.CreatePlusMinusButton(this.nC,
      {
        func: () => {
          t.value = ((t.quantityAction + t.changedValue) > t.maxAction && t.maxAction) || t.quantityAction + t.changedValue;
        }, x: 1490, y: 5, tex: "plus.png"
      },
      {
        func: () => {
          t.quantityAction = ((t.quantityAction - t.changedValue) < 0 && "0") || t.quantityAction - t.changedValue;
          t.value = parseInt(t.quantityAction);
        }, x: 390, y: 5, tex: "minus.png"
      }, 60);
    //-------------------------
    this.backText.onClicked.add(() => {
      t.value = t.maxAction;
    });
  }

  ChangeImageAction() {
    for (let i = 0; i < this.maxAction; i++) {
      if (i < this.quantityAction) {
        this.ChangeLampAction(this.activeActions[i], this.inactiveActions[i], i);
      } else {
        this.ChangeLampAction(this.inactiveActions[i], this.activeActions[i], i);
      }
    }
  }
  ChangeLampAction(widgetOn, widgetOff, i) {
    this.nC.updateChild(widgetOff, 0, widgetHeight, 1, 1);
    this.nC.updateChild(widgetOn, this.positionsActionX[i], this.startPosition.y, 70, 70);
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
  set MaxValue(value) { this.maxAction = value; }

  GetProcent() { return (this.value * 100) / this.maxAction; }

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
  helthPoint.MaxValue = 30;
  actionPoint.MaxValue = 7;
  saveState();
}