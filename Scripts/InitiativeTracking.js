const { refObject, world } = require('@tabletop-playground/api');
const { CreateCanvasElement, GetTextFont, GetTextColor } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
const zPosition = refObject.getExtent().z * 1.15;
const widgetWidth = 800;
const offsetPlateY = 200;
const widgetHeight = 1600 + offsetPlateY;
const nameFont = GetTextFont();
const textColor = GetTextColor();
//-----------------------------------------------------------------
class InitiativeTracker {
  constructor(parent, position) {
    let t = this;
    this.parent = parent;
    //-------------------------
    let nC = new Canvas();
    this.nCUI = CreateCanvasElement(nC, position, widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(0, 90, 0);
    parent.attachUI(this.nCUI);
    //-------------------------
    let initiative = new MultilineTextBox().setText("Hero 1\nHero 2").setTextColor(textColor).setFont(nameFont);
    initiative.setFontSize(70).setBackgroundTransparent(false);
    nC.addChild(initiative, 0, offsetPlateY / 2, widgetWidth / 1.5, widgetHeight - offsetPlateY - 200);
    //-------------------------
    let tracker = new MultilineTextBox().setText("<----").setFont(nameFont).setEnabled(false);
    tracker.setFontSize(70).setBackgroundTransparent(true);
    nC.addChild(tracker, widgetWidth / 1.5, offsetPlateY / 2, widgetWidth / 3, widgetHeight - offsetPlateY - 200);
    //-------------------------
    let buttonRoll = new Button().setText("Roll").setTextColor(textColor).setFont(nameFont);
    buttonRoll.setFontSize(60);
    nC.addChild(buttonRoll, widgetWidth / 2 - 80, widgetHeight - offsetPlateY / 2 - 125, 160, 100);
    //-------------------------
    let prevInitiative = new Button().setText("Prev").setTextColor(textColor).setFont(nameFont);
    prevInitiative.setFontSize(60);
    nC.addChild(prevInitiative, 25, widgetHeight - offsetPlateY / 2 - 125, 160, 100);
    //-------------------------
    let nextInitiative = new Button().setText("Next").setTextColor(textColor).setFont(nameFont);
    nextInitiative.setFontSize(60);
    nC.addChild(nextInitiative, widgetWidth - 185, widgetHeight - offsetPlateY / 2 - 125, 160, 100);
    //-------------------------
  }
}
let IT = new InitiativeTracker(refObject, new Vector(0, 0, zPosition));