const { refObject } = require('@tabletop-playground/api');
const { CreateCanvasElement, GetTextFont, GetTextColor } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
let snapPointVector, grabbed = false;
refObject.onSnapped.add((o, _2, point) => {
  if (grabbed && snapPointVector) {
    let vectorO = new Vector(o.getPosition().x, o.getPosition().y, 0);
    let distanceMove = parseInt(vectorO.distance(snapPointVector));
    if (distanceMove > 0 && mainIfo.spendActionPoint.getValue()) {
      mainIfo.DecrementActionPoints(1);
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
const widgetHeight = 300;
let nameFont = GetTextFont();
let textColor = GetTextColor();
//-----------------------------------------------------------------
class MainIfo {
  constructor(parent, position) {
    let t = this;
    this.parent = parent;
    this.maxPointsVal = 40;
    this.showPosition = position;
    this.hidePosition = position.add(new Vector(0, 0, -zPosition));
    let localSize = 60;
    let centerX = widgetWidth / 2 - localSize / 2;
    let centerY = widgetHeight / 2 - localSize / 2 - 50;
    let offsetX = 140, offsetY = 50;
    //-------------------------
    let nC = new Canvas();
    this.nCUI = CreateCanvasElement(nC, position.add(new Vector(-0.6, 0, 0.45)), widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(-65, 0, 180);
    parent.attachUI(this.nCUI);
    //-------------------------
    let borderMain = new ImageWidget().setImage("brosok.png");
    borderMain.scale = 0.1;
    nC.addChild(borderMain, 0, 0, widgetWidth, widgetHeight);
    //-------------------------
    this.decrementH = new ImageButton().setImage("minus.png");
    this.decrementH.setImageSize(100);
    nC.addChild(this.decrementH, centerX - offsetX, centerY - offsetY, localSize, localSize);
    //-------------------------
    this.incrementH = new ImageButton().setImage("plus.png");
    this.incrementH.setImageSize(100);
    nC.addChild(this.incrementH, centerX + offsetX, centerY - offsetY, localSize, localSize);
    //-------------------------
    this.fontTextH = new Text().setText("?").setTextColor(new Color(1, 0.3, 0.25)).setFont(nameFont);
    this.fontTextH.setFontSize(40);
    nC.addChild(this.fontTextH, centerX - 30, centerY - offsetY, 200, localSize);
    //-------------------------
    this.decrementH.onClicked.add(function () {
      if ((helthPlate.helthValue - helthPlate.changedValue) < 0) {
        helthPlate.value = 0;
      } else {
        helthPlate.value = helthPlate.helthValue - helthPlate.changedValue;
      }
    });
    this.incrementH.onClicked.add(function () {
      if (helthPlate.helthValue + helthPlate.changedValue > helthPlate.maxHelthValue) {
        helthPlate.value = helthPlate.maxHelthValue;
      } else {
        helthPlate.value = helthPlate.helthValue + helthPlate.changedValue;
      }
    });
    //-------------------------
    this.decrementA = new ImageButton().setImage("minus.png");
    this.decrementA.setImageSize(100);
    nC.addChild(this.decrementA, centerX - offsetX, centerY + offsetY, localSize, localSize);
    //-------------------------
    this.incrementA = new ImageButton().setImage("plus.png");
    this.incrementA.setImageSize(100);
    nC.addChild(this.incrementA, centerX + offsetX, centerY + offsetY, localSize, localSize);
    //-------------------------
    this.fontTextA = new Text().setText("?").setTextColor(new Color(0.3, 1, 0.25)).setFont(nameFont);
    this.fontTextA.setFontSize(40);
    nC.addChild(this.fontTextA, centerX - 15, centerY + offsetY, 100, localSize);
    //-------------------------
    this.decrementA.onClicked.add(function () {
      t.DecrementActionPoints(actionPlate.changedValue);
    });
    this.incrementA.onClicked.add(function () {
      if (actionPlate.quantityAction + actionPlate.changedValue > actionPlate.maxAction) {
        actionPlate.value = actionPlate.maxAction;
      } else {
        actionPlate.value = actionPlate.quantityAction + actionPlate.changedValue;
      }
    });
    //-------------------------
    this.spendText = new Text().setText("Spend action point on the move").setFontSize(18).setTextColor(new Color(1, 0.1, 0));
    nC.addChild(this.spendText, widgetWidth / 2 - 180, widgetHeight - 80, 380, localSize);
    this.spendActionPoint = new Slider().setTextBoxWidth(0).setMaxValue(1).setMinValue(0).setStepSize(1);
    nC.addChild(this.spendActionPoint, widgetWidth / 2 - 150, widgetHeight - 60, 300, localSize);
    this.spendActionPoint.onValueChanged.add((_1, _2, value) => {
      if (value) {
        t.spendText.setTextColor(new Color(0.25, 1, 0));
      } else {
        t.spendText.setTextColor(new Color(1, 0.1, 0));
      }
    })
  }

  DecrementActionPoints(changedValue) {
    if (actionPlate.quantityAction - changedValue < 0) {
      actionPlate.value = 0;
    } else {
      actionPlate.value = actionPlate.quantityAction - changedValue;
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
let mainIfo = new MainIfo(refObject, new Vector(0, 0, zPosition));
//-----------------------------------------------------------------
refObject.ResetValue = function () { }

let helthPlate, actionPlate;
refObject.SetHelthPlate = (plate1, plate2) => {
  helthPlate = plate1;
  mainIfo.fontTextH.setText(helthPlate.helthValue + "/" + helthPlate.maxHelthValue);
  actionPlate = plate2;
  mainIfo.fontTextA.setText(actionPlate.quantityAction + "/" + actionPlate.maxAction);
}

refObject.SetValueH = (value) => { mainIfo.fontTextH.setText(value); }
refObject.SetValueA = (value) => { mainIfo.fontTextA.setText(value); }