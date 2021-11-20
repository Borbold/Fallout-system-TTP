const { refObject } = require('@tabletop-playground/api');
const { CreateCanvasElement, GetTextFont, GetTextColor } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
let snapingObjectId;
refObject.onSnapped.add((_1, _2, snapPoint) => {
  if (!snapPoint.snapsRotation()) {
    let snapingObject = snapPoint.getParentObject();
    if (snapingObject.SetCapWallet) {
      snapingObject.SetCapWallet(wallet);
      snapingObjectId = snapingObject.getId();
    }
  }
})

refObject.onGrab.add(() => {
  if (snapingObjectId) {
    let snapingObject = world.getObjectById(snapingObjectId);
    if (snapingObject.SetCapWallet) {
      snapingObject.SetCapWallet(null);
      snapingObjectId = 0;
    }
  }
})
//-----------------------------------------------------------------
const zPosition = refObject.getExtent().z + 0.05;
const widgetWidth = 200;
const widgetHeight = 200;
const nameFont = GetTextFont();
const textColor = GetTextColor();
//-----------------------------------------------------------------
let countCaps;
class Wallet {
  constructor(parent, position) {
    let t = this;
    this.showPos = position;
    this.hidePos = new Vector(0, 0, -zPosition);
    this.parent = parent;
    //-------------------------
    let nC = new Canvas();
    this.nCUI = CreateCanvasElement(nC, position, widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(0, 0, 0);
    parent.attachUI(this.nCUI);
    //-------------------------
    let info = new Button().setText("C").setTextColor(textColor).setFont(nameFont).setFontSize(30);
    nC.addChild(info, widgetWidth - 30, 0, 30, 50);
    info.onClicked.add(() => {
      t.ShowUI(t.nCUIInfo);
      t.HideUI(t.nCUI);
    })
    //-------------------------
    let nCInfo = new Canvas();
    this.nCUIInfo = CreateCanvasElement(nCInfo, this.hidePos, widgetWidth, widgetHeight);
    this.nCUIInfo.rotation = new Rotator(0, 0, 0);
    parent.attachUI(this.nCUIInfo);
    //-------------------------
    let backImage = new ImageWidget().setImage("brosok.png");
    nCInfo.addChild(backImage, 0, 0, widgetWidth, widgetHeight);
    //-------------------------
    let capTextCurrent = new Text().setText("Current").setTextColor(textColor).setFont(nameFont);
    capTextCurrent.setFontSize(30);
    nCInfo.addChild(capTextCurrent, widgetWidth / 2 - 60, widgetHeight - 185, 120, 50);
    //-------------------------
    this.countCapText = new TextBox().setText(countCaps).setTextColor(textColor).setFont(nameFont);
    this.countCapText.setFontSize(40).setInputType(1);
    nCInfo.addChild(this.countCapText, widgetWidth / 2 - 80, widgetHeight - 145, 160, 50);
    this.countCapText.onTextCommitted.add((_1, _2, text) => {
      countCaps = text;
      saveState();
    })
    //-------------------------
    let capTextChanged = new Text().setText("Changed").setTextColor(new Color(1, 0.5, 0.25)).setFont(nameFont);
    capTextChanged.setFontSize(30);
    nCInfo.addChild(capTextChanged, widgetWidth / 2 - 70, widgetHeight - 95, 140, 50);
    //-------------------------
    let changedCapText = new TextBox().setText(0).setTextColor(new Color(1, 0.5, 0.25)).setFont(nameFont);
    changedCapText.setFontSize(40).setInputType(1);
    nCInfo.addChild(changedCapText, widgetWidth / 2 - 80, widgetHeight - 55, 160, 50);
    changedCapText.onTextCommitted.add((_1, _2, text) => {
      t.Value += parseInt(text);
    })
    //-------------------------
    let cross = new Button().setText("X").setTextColor(new Color(1, 0.2, 0.2)).setFont(nameFont).setFontSize(30);
    nCInfo.addChild(cross, widgetWidth - 30, 0, 30, 50);
    cross.onClicked.add(() => {
      t.ShowUI(t.nCUI);
      t.HideUI(t.nCUIInfo);
    })
  }

  set Value(value) { this.countCapText.setText(value); }
  get Value() { return Math.round(this.countCapText.getText()); }

  HideUI(nCUI) {
    nCUI.scale = 0.01;
    nCUI.position = this.hidePos;
    this.parent.updateUI(nCUI);
  }
  ShowUI(nCUI) {
    nCUI.scale = 0.1;
    nCUI.position = this.showPos;
    this.parent.updateUI(nCUI);
  }
}
//-----------------------------------------------------------------
function saveState() {
  let state = {};

  state["countCaps"] = countCaps;

  refObject.setSavedData(JSON.stringify(state));
}

function loadState() {
  if (refObject.getSavedData() === "") {
    saveState();
    return;
  }

  let state = JSON.parse(refObject.getSavedData());

  countCaps = state["countCaps"] || "0";
}
//-----------------------------------------------------------------
loadState();
let wallet = new Wallet(refObject, new Vector(0, 0, zPosition));