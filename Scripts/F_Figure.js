const { refObject } = require('@tabletop-playground/api');
const { UI } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
let snapPointVector, grabbed = false;
refObject.onSnapped.add((o, _2, point) => {
  if (grabbed && snapPointVector) {
    let vectorO = new Vector(o.getPosition().x, o.getPosition().y, 0);
    let distanceMove = parseInt(vectorO.distance(snapPointVector));
    if (distanceMove > 0 && mainInfo.spendActionPoint.getValue()) {
      mainInfo.DecrementActionPoints(Math.round(distanceMove / 4));
    }
    grabbed = false;
  }
  snapPointVector = new Vector(point.getGlobalPosition().x, point.getGlobalPosition().y, 0);
})
refObject.onGrab.add((o) => {
  if (snapPointVector) {
    grabbed = true;
  }
})
refObject.onHit.add(() => {
  if (snapPointVector) {
    snapPointVector = null;
  }
})
//-----------------------------------------------------------------
const zPosition = 5.1;
const widgetWidth = 400;
const offsetPlateY = 500;
const widgetHeight = 300 + offsetPlateY;
const nameFont = UI.GetTextFont();
const textColor = UI.GetTextColor();
//-----------------------------------------------------------------
class MainInfo {
  constructor(parent, position, isNPC) {
    this.isNPC = isNPC;
    let t = this;
    this.startPosition = position.add(new Vector(-0.7, 0, 0.45));
    this.parent = parent;
    let localSize = 60;
    let centerX = widgetWidth / 2 - localSize / 2;
    let centerY = widgetHeight / 2 - localSize / 2 - 50;
    let offsetX = 140, offsetY = 50;
    //-------------------------
    let nC = new Canvas();
    this.nCUI = UI.CreateCanvasElement(nC, position.add(new Vector(-0.6, 0, 0.45)), widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(-65, 0, 180);
    parent.attachUI(this.nCUI);
    //-------------------------
    let borderMain = new ImageWidget().setImage("brosok.png");
    borderMain.scale = 0.1;
    nC.addChild(borderMain, 0, offsetPlateY / 2, widgetWidth, widgetHeight - offsetPlateY);
    //-------------------------
    UI.CreatePlusMinusButton(nC,
      {
        func: () => {
          this.HealthValue += settings.ChangedValueHealth;
        }, x: centerX + offsetX, y: centerY - offsetY, tex: "plus.png"
      },
      {
        func: () => {
          this.HealthValue -= settings.ChangedValueHealth;
        }, x: centerX - offsetX, y: centerY - offsetY, tex: "minus.png"
      }, localSize);
    //-------------------------
    this.fontTextH = new Text().setText(mainValues && (mainValues["health"] + "/" + mainValues["healthMax"]) || "?").setTextColor(new Color(1, 0.3, 0.25)).setFont(nameFont);
    this.fontTextH.setFontSize(40);
    nC.addChild(this.fontTextH, centerX - 30, centerY - offsetY, 160, localSize);
    //-------------------------
    UI.CreatePlusMinusButton(nC,
      {
        func: () => {
          this.ActionValue += settings.ChangedValueAction;
        }, x: centerX + offsetX, y: centerY + offsetY, tex: "plus.png"
      },
      {
        func: () => {
          this.ActionValue -= settings.ChangedValueAction;
        }, x: centerX - offsetX, y: centerY + offsetY, tex: "minus.png"
      }, localSize);
    //-------------------------
    this.fontTextA = new Text().setText(mainValues && (mainValues["action"] + "/" + mainValues["actionMax"]) || "?").setTextColor(new Color(0.3, 1, 0.25)).setFont(nameFont);
    this.fontTextA.setFontSize(40);
    nC.addChild(this.fontTextA, centerX - 15, centerY + offsetY, 100, localSize);
    //-------------------------
    this.spendText = new Text().setText("Spend action point on the move").setFontSize(18).setTextColor(new Color(1, 0.1, 0));
    nC.addChild(this.spendText, widgetWidth / 2 - 180, widgetHeight - (localSize + offsetPlateY / 2 + 20), 380, localSize);
    this.spendActionPoint = new Slider().setTextBoxWidth(0).setMaxValue(1).setMinValue(0).setStepSize(1);
    nC.addChild(this.spendActionPoint, widgetWidth / 2 - 150, widgetHeight - (localSize + offsetPlateY / 2), 300, localSize);
    this.spendActionPoint.onValueChanged.add((_1, _2, value) => {
      if (value) {
        t.spendText.setTextColor(new Color(0.25, 1, 0));
      } else {
        t.spendText.setTextColor(new Color(1, 0.1, 0));
      }
    })
    //--Settings--Bonus---------------------
    if (isNPC) {
      let gear = new ImageButton().setImage("gear-icon.png");
      nC.addChild(gear, widgetWidth - 50, widgetHeight - offsetPlateY - 100, 50, 50);
      gear.onClicked.add(() => {
        settings.ShowUI();
        t.HideUI();
      })
    } else {
      let info = new ImageButton().setImage("info-icon.png");
      nC.addChild(info, widgetWidth - 50, widgetHeight - offsetPlateY - 100, 50, 50);
      info.onClicked.add(() => {
        bonusInfo.ShowUI();
        t.HideUI();
      })
    }
  }

  DecrementActionPoints(changedValue) {
    if (this.isNPC) {
      this.ActionValue = this.ActionValue - settings.ChangedValueAction > 0 && this.ActionValue - changedValue || "0";
    } else {
      if (actionPlate.quantityAction - changedValue < 0) {
        actionPlate.value = 0;
      } else {
        actionPlate.value = actionPlate.quantityAction - changedValue;
      }
    }
  }

  get HealthValue() { return parseInt(this.fontTextH.getText()); }
  set HealthValue(value) {
    if (value > mainValues["healthMax"])
      value = mainValues["healthMax"];
    else if (value < 0)
      value = 0;

    if (healthPlate)
      healthPlate.value = value;

    this.fontTextH.setText(value + "/" + mainValues["healthMax"]);
    saveState();
  }

  get ActionValue() { return parseInt(this.fontTextA.getText()); }
  set ActionValue(value) {
    if (value > mainValues["actionMax"])
      value = mainValues["actionMax"];
    else if (value < 0)
      value = 0;

    if (actionPlate)
      actionPlate.value = value;

    this.fontTextA.setText(value + "/" + mainValues["actionMax"]);
    saveState();
  }

  HideUI() {
    this.nCUI.scale = 0.01;
    this.nCUI.position = this.startPosition.add(new Vector(-0.1, 0, 0));
    this.parent.updateUI(this.nCUI);
  }
  ShowUI() {
    this.nCUI.scale = 0.1;
    this.nCUI.position = this.startPosition.add(new Vector(0.1, 0, 0));
    this.parent.updateUI(this.nCUI);
  }
}

class Settings {
  constructor(parent, position) {
    let t = this;
    this.startPosition = position.add(new Vector(-0.7, 0, 0.45));
    this.parent = parent;
    let localSize = 60;
    let centerX = widgetWidth / 2 - localSize;
    let centerY = widgetHeight / 2 - localSize / 2 - 50;
    let offsetX = 120, offsetY = 50;
    //-------------------------
    let nC = new Canvas();
    this.nCUI = UI.CreateCanvasElement(nC, position.add(new Vector(-0.7, 0, 0.45)), widgetWidth, widgetHeight);
    this.nCUI.scale = 0.01;
    this.nCUI.rotation = new Rotator(-65, 0, 180);
    parent.attachUI(this.nCUI);
    //-------------------------
    let borderMain = new ImageWidget().setImage("brosok.png");
    borderMain.scale = 0.1;
    nC.addChild(borderMain, 0, offsetPlateY / 2, widgetWidth, widgetHeight - offsetPlateY);
    //-------------------------
    let maxHealth = new TextBox().setText(mainValues["healthMax"]).setTextColor(new Color(1, 0.3, 0.25)).setFont(nameFont);
    maxHealth.setFontSize(40);
    nC.addChild(maxHealth, centerX, centerY - offsetY, 100, localSize);
    maxHealth.onTextCommitted.add((_1, _2, text) => {
      mainValues["healthMax"] = text;
      mainInfo.HealthValue = mainValues["health"];
    })
    let maxHealthButton = new Button().setText("MAX").setTextColor(textColor).setFont(nameFont);
    maxHealthButton.setFontSize(40);
    nC.addChild(maxHealthButton, centerX - offsetX, centerY - offsetY, 100, localSize);
    maxHealthButton.onClicked.add(() => {
      mainInfo.HealthValue = mainValues["healthMax"];
    })
    this.changedValueHealth = new Button().setText("1").setTextColor(textColor).setFont(nameFont);
    this.changedValueHealth.setFontSize(40);
    nC.addChild(this.changedValueHealth, centerX + offsetX, centerY - offsetY, 100, localSize);
    let boxTableH = [1, 5, 10, 25, 50, 100];
    let boxIndexH = 0;
    this.changedValueHealth.onClicked.add(() => {
      boxIndexH++;
      if (boxIndexH >= boxTableH.length) {
        boxIndexH = 0;
      }
      this.changedValueHealth.setText(boxTableH[boxIndexH]);
    })
    //-------------------------
    let maxAction = new TextBox().setText(mainValues["actionMax"]).setTextColor(new Color(0.3, 1, 0.25)).setFont(nameFont);
    maxAction.setFontSize(40);
    nC.addChild(maxAction, centerX, centerY + offsetY, 100, localSize);
    maxAction.onTextCommitted.add((_1, _2, text) => {
      mainValues["actionMax"] = text;
      mainInfo.ActionValue = mainValues["action"];
    })
    let maxActionMax = new Button().setText("MAX").setTextColor(textColor).setFont(nameFont);
    maxActionMax.setFontSize(40);
    nC.addChild(maxActionMax, centerX - offsetX, centerY + offsetY, 100, localSize);
    maxActionMax.onClicked.add(() => {
      mainInfo.ActionValue = mainValues["actionMax"];
    })
    this.changedValueAction = new Button().setText("1").setTextColor(textColor).setFont(nameFont);
    this.changedValueAction.setFontSize(40);
    nC.addChild(this.changedValueAction, centerX + offsetX, centerY + offsetY, 100, localSize);
    let boxTableA = [1, 2, 4];
    let boxIndexA = 0;
    this.changedValueAction.onClicked.add(() => {
      boxIndexA++;
      if (boxIndexA >= boxTableA.length) {
        boxIndexA = 0;
      }
      this.changedValueAction.setText(boxTableA[boxIndexA]);
    })
    //-------------------------
    let cross = new ImageButton().setImage("cross-icon.png");
    nC.addChild(cross, widgetWidth - 50, widgetHeight - offsetPlateY - 100, 50, 50);
    cross.onClicked.add(() => {
      mainInfo.ShowUI();
      t.HideUI();
    })
  }

  get ChangedValueHealth() {
    if (healthPlate) return healthPlate.changedValue;
    return parseInt(this.changedValueHealth.getText());
  }

  get ChangedValueAction() {
    if (actionPlate) return actionPlate.changedValue;
    return parseInt(this.changedValueAction.getText());
  }

  HideUI() {
    this.nCUI.scale = 0.01;
    this.nCUI.position = this.startPosition.add(new Vector(-0.1, 0, 0));
    this.parent.updateUI(this.nCUI);
  }
  ShowUI() {
    this.nCUI.scale = 0.1;
    this.nCUI.position = this.startPosition.add(new Vector(0.1, 0, 0));
    this.parent.updateUI(this.nCUI);
  }
}

let arrayTextBonus = [], arrayDescriptionBonus = [];
for (let i = 0; i < 20; i++) {
  let newButton = new Button().setFontSize(40).setTextColor(textColor).setFont(nameFont);
  arrayTextBonus.push(newButton);
  let newDescription = new MultilineTextBox().setFontSize(30).setTextColor(new Color(.1, 1, .4)).setFont(nameFont);
  arrayDescriptionBonus.push(newDescription);
}
class BonusInfo {
  constructor(parent, position) {
    let t = this;
    this.startPosition = position.add(new Vector(-0.7, 0, 0.45));
    this.parent = parent;
    //-------------------------
    this.nC = new Canvas();
    this.nCUI = UI.CreateCanvasElement(this.nC, position.add(new Vector(-0.7, 0, 0.45)), widgetWidth, widgetHeight);
    this.nCUI.scale = 0.01;
    this.nCUI.rotation = new Rotator(-65, 0, 180);
    parent.attachUI(this.nCUI);
    //-------------------------
    let borderMain = new ImageWidget().setImage("brosok.png");
    borderMain.scale = 0.1;
    this.nC.addChild(borderMain, 0, offsetPlateY / 2, widgetWidth, widgetHeight - offsetPlateY);
    //-------------------------
    this.vertical = new VerticalBox();
    this.nC.addChild(this.vertical, 0, offsetPlateY / 2, widgetWidth, widgetHeight - offsetPlateY);
    //-------------------------
    let cross = new ImageButton().setImage("cross-icon.png");
    this.nC.addChild(cross, widgetWidth - 50, widgetHeight - offsetPlateY - 100, 50, 50);
    cross.onClicked.add(() => {
      mainInfo.ShowUI();
      t.HideUI();
    })
  }

  SetNamesBonus() {
    for (let i = 0; i < bonuses.length; i++) {
      if (bonuses[i] != "") {
        if (!arrayTextBonus[i].getParent()) {
          arrayTextBonus[i].onClicked.add(() => {
            if (this.tb) {
              this.nC.removeChild(this.tb);
              this.tb = null;
            } else {
              this.tb = arrayDescriptionBonus[i].setText(descriptionB[i]);
              this.nC.addChild(this.tb, 0, 0, widgetWidth, widgetHeight - offsetPlateY - 50);
            }
          })
          this.vertical.addChild(arrayTextBonus[i].setText(bonuses[i]));
        }
      }
      else {
        arrayTextBonus[i].onClicked.clear();
        this.vertical.removeChild(arrayTextBonus[i]);
      }
    }
  }

  HideUI() {
    this.nCUI.scale = 0.01;
    this.nCUI.position = this.startPosition.add(new Vector(-0.1, 0, 0));
    this.parent.updateUI(this.nCUI);
  }
  ShowUI() {
    this.nCUI.scale = 0.1;
    this.nCUI.position = this.startPosition.add(new Vector(0.1, 0, 0));
    this.parent.updateUI(this.nCUI);
  }
}
//-----------------------------------------------------------------
refObject.ResetValue = function () { }

let healthPlate, actionPlate;
refObject.SetHelthPlate = (plate1, plate2) => {
  healthPlate = plate1;
  mainInfo.fontTextH.setText(healthPlate.helthValue + "/" + healthPlate.maxHelthValue);
  mainValues["healthMax"] = healthPlate.maxHelthValue;

  actionPlate = plate2;
  mainInfo.fontTextA.setText(actionPlate.quantityAction + "/" + actionPlate.maxAction);
  mainValues["actionMax"] = actionPlate.maxAction;
}

refObject.SetValueH = (value) => { mainInfo.fontTextH.setText(value); }
refObject.SetValueA = (value) => { mainInfo.fontTextA.setText(value); }

let bonuses = [], descriptionB = [];
refObject.ChangeNameBonus = (name, remove, description) => {
  if (remove) {
    for (let i = 0; i < bonuses.length; i++) {
      if (bonuses[i] == name) {
        bonuses[i] = "";
        descriptionB[i] = "";
        break;
      }
    }
  } else {
    let flag;
    for (let i = 0; i < bonuses.length; i++) {
      if (bonuses[i] == "") {
        bonuses[i] = name;
        descriptionB[i] = description;
        flag = true;
        break;
      }
    }
    if (!flag) {
      bonuses.push(name);
      descriptionB.push(description);
    }
  }
  bonusInfo.SetNamesBonus();
  saveState();
}
//-----------------------------------------------------------------
let mainInfo, bonusInfo;
let mainValues = [];
if (refObject.getTemplateMetadata() == "firgureNPC") {
  mainValues["health"] = "0"; mainValues["healthMax"] = "5";
  mainValues["action"] = "0"; mainValues["actionMax"] = "5";
  mainInfo = new MainInfo(refObject, new Vector(0, 0, zPosition), true);
  loadState();
} else if (refObject.getTemplateMetadata() == "firgureCharacter") {
  mainInfo = new MainInfo(refObject, new Vector(0, 0, zPosition));
  bonusInfo = new BonusInfo(refObject, new Vector(0, 0, zPosition));
  loadState();
  bonusInfo.SetNamesBonus();
}
let settings = new Settings(refObject, new Vector(0, 0, zPosition));
//-----------------------------------------------------------------
function saveState() {
  let state = {};
  
  state["bonuses"] = bonuses;
  state["descriptionB"] = descriptionB;
  state["healthMax"] = mainValues["healthMax"];
  state["actionMax"] = mainValues["actionMax"];
  state["health"] = mainInfo.HealthValue;
  state["action"] = mainInfo.ActionValue;
  
  refObject.setSavedData(JSON.stringify(state));
}

function loadState() {
  if (refObject.getSavedData() === "") {
    saveState();
    return;
  }

  let state = JSON.parse(refObject.getSavedData());

  let locDes = state["descriptionB"], locBon = state["bonuses"];
  for (let i = 0; i < locBon.length; i++) {
    if (locBon[i] != "") {
      bonuses[i] = locBon[i];
      descriptionB[i] = locDes[i];
    }
  }
  mainValues["healthMax"] = state["healthMax"];
  mainValues["actionMax"] = state["actionMax"];
  mainInfo.HealthValue = state["health"];
  mainInfo.ActionValue = state["action"];
}