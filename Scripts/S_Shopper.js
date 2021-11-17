const { refObject, world } = require('@tabletop-playground/api');
const { CreateCanvasElement, GetTextFont, GetTextColor } = require('./general/General_Functions.js');
// Создание контейнера
//world.createObjectFromTemplate("4FAE907E424F76032216F4B2200F27CD", refObject.getPosition().add(new Vector(20, 0, 0)));
//-----------------------------------------------------------------
const zPosition = refObject.getExtent().z + 0.01;
const widgetWidth = 4000;
const widgetHeight = 2000;
const nameFont = GetTextFont();
const textColor = GetTextColor();
//-----------------------------------------------------------------
let dispersedItems = [];
let pounches = [];
class Store {
  constructor(parent, position) {
    let t = this;
    this.parent = parent;
    this.startText = "\t Group stores";
    //-------------------------
    let nC = new Canvas();
    this.nCUI = CreateCanvasElement(nC, position, widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(0, 0, 0);
    parent.attachUI(this.nCUI);
    //-------------------------
    this.storeBox = new MultilineTextBox().setText(this.startText).setTextColor(textColor).setFont(nameFont);
    this.storeBox.setFontSize(100).setBackgroundTransparent(true);
    nC.addChild(this.storeBox, widgetWidth - 1010, 25, 1000, widgetHeight - 690);
    this.storeBox.onTextCommitted.add((_1, _2, text) => {
      let brokenText = text.split(/\s?\n/);
      for (let i = 0; i < brokenText.length; i++) {
        if (brokenText[i].includes("+")) {
          dispersedItems = pounches[i - 1].getItems();
          for (let j = 0; j < dispersedItems.length; j++) {
            pounches[i - 1].take(dispersedItems[j],
              refObject.getSnapPoint(j).getGlobalPosition().add(new Vector(0, 0, zPosition)));
          }
        } else if (brokenText[i].includes("-")) {
          pounches[i - 1].addObjects(dispersedItems);
        }
      }
    })
    //-------------------------
    let but = new Button().setText("G");
    but.setFontSize(40);
    nC.addChild(but, 0, 0, 200, 200);
    but.onClicked.add(() => {
      let newPounch = world.createObjectFromTemplate("4FAE907E424F76032216F4B2200F27CD", refObject.getPosition().add(new Vector(20, 0, 0)));
      newPounch.addObjects(dispersedItems);
      pounches.push(newPounch);
      dispersedItems = [];
      store.SetNewStore();
    })
  }

  SetNewStore() {
    let newText = this.startText + "\n";
    for (const pounch of pounches) {
      newText += "New store" + "\n";
    }
    this.storeBox.setText(newText);
  }
}
let store = new Store(refObject, new Vector(0, 0, zPosition));
//-----------------------------------------------------------------
refObject.ChangeDispersedItems = (item, remove) => {
  if (remove) {
    for (let i = 0; i < dispersedItems.length; i++) {
      if (dispersedItems[i] == item) {
        dispersedItems[i] = null;
        break;
      }
    }
  } else {
    item.toggleLock();
    let flag;
    for (let i = 0; i < dispersedItems.length; i++) {
      if (!dispersedItems[i]) {
        dispersedItems[i] = item;
        flag = true;
        break;
      }
    }
    if (!flag) {
      dispersedItems.push(item);
    }
  }
}