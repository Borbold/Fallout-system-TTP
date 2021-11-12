const { refObject, ImageWidget, ImageButton, Text, Vector } = require('@tabletop-playground/api');
const { CreateCanvasElement } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
refObject.onCreated.add(() => {
  loadState();
})
//-----------------------------------------------------------------
const zPosition = 5.1;
const widgetWidth = 400;
const widgetHeight = 200;
const nameFont = "Fallout.ttf";
//-----------------------------------------------------------------
class MainIfo {
  constructor(parent, position) {
    this.parent = parent;
    this.maxPointsVal = 40;
    this.showPosition = position;
    this.hidePosition = position.add(new Vector(0, 0, -zPosition));
    let t = this;
    let centerX = widgetWidth / 2 - 30;
    let centerY = widgetHeight / 2 - 30;
    let offsetX = 140, offsetY = 50;
    //-------------------------
    let nC = new Canvas();
    this.nCUI = CreateCanvasElement(nC, position, widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(-65, 0, 180);
    parent.attachUI(this.nCUI);
    //-------------------------
    let borderMain = new ImageWidget().setImage("brosok.png");
    borderMain.scale = 0.1;
    nC.addChild(borderMain, 0, 0, widgetWidth, widgetHeight);
    //-------------------------
    this.decrementH = new ImageButton().setImage("minus.png");
    this.decrementH.setImageSize(100);
    nC.addChild(this.decrementH, centerX - offsetX, centerY - offsetY, 60, 60);
    //-------------------------
    this.incrementH = new ImageButton().setImage("plus.png");
    this.incrementH.setImageSize(100);
    nC.addChild(this.incrementH, centerX + offsetX, centerY - offsetY, 60, 60);
    //-------------------------
    this.fontTextH = new Text().setText("?").setTextColor(new Color(1, 0.25, 0.25)).setFont(nameFont);
    this.fontTextH.setFontSize(40);
    nC.addChild(this.fontTextH, centerX - 50, centerY - offsetY, 200, 60);
    //-------------------------
    this.decrementH.onClicked.add(function () {
      if ((helthPlate.helthValue - helthPlate.changedValue) < 0) {
        helthPlate.value = 0;
      } else {
        helthPlate.value = helthPlate.helthValue - helthPlate.changedValue;
      }
      t.fontTextH.setText(helthPlate.helthValue + "/" + helthPlate.changedValue);
    });
    this.incrementH.onClicked.add(function () {
      if (helthPlate.helthValue + helthPlate.changedValue > helthPlate.maxHelthValue) {
        helthPlate.value = helthPlate.maxHelthValue;
      } else {
        helthPlate.value = helthPlate.helthValue + helthPlate.changedValue;
      }
      t.fontTextH.setText(helthPlate.helthValue + "/" + helthPlate.changedValue);
    });
    //-------------------------
    this.decrementA = new ImageButton().setImage("minus.png");
    this.decrementA.setImageSize(100);
    nC.addChild(this.decrementA, centerX - offsetX, centerY + offsetY, 60, 60);
    //-------------------------
    this.incrementA = new ImageButton().setImage("plus.png");
    this.incrementA.setImageSize(100);
    nC.addChild(this.incrementA, centerX + offsetX, centerY + offsetY, 60, 60);
    //-------------------------
    this.fontTextA = new Text().setText("?").setTextColor(new Color(0.25, 1, 0.25)).setFont(nameFont);
    this.fontTextA.setFontSize(40);
    nC.addChild(this.fontTextA, centerX - 25, centerY + offsetY, 100, 60);
    //-------------------------
    this.decrementA.onClicked.add(function () {
      if ((actionPlate.quantityAction - actionPlate.changedValue) < 0) {
        actionPlate.value = 0;
      } else {
        actionPlate.value = actionPlate.quantityAction - actionPlate.changedValue;
      }
      t.fontTextA.setText(actionPlate.quantityAction + "/" + actionPlate.maxAction);
    });
    this.incrementA.onClicked.add(function () {
      if (actionPlate.quantityAction + actionPlate.changedValue > actionPlate.maxAction) {
        actionPlate.value = actionPlate.maxAction;
      } else {
        actionPlate.value = actionPlate.quantityAction + actionPlate.changedValue;
      }
      t.fontTextA.setText(actionPlate.quantityAction + "/" + actionPlate.maxAction);
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

function loadState() {

}