const { refObject, world } = require('@tabletop-playground/api');
const { CreateCanvasElement, GetTextFont, GetTextColor } = require('./general/General_Functions.js');
// Создание контейнера
//world.createObjectFromTemplate("4FAE907E424F76032216F4B2200F27CD", refObject.getPosition().add(new Vector(20, 0, 0)));
//-----------------------------------------------------------------
const zPosition = refObject.getExtent().z * 1.05;
const widgetWidth = 4000;
const offsetPlateY = 200;
const widgetHeight = 2000 + offsetPlateY;
const nameFont = GetTextFont();
const textColor = GetTextColor();
//-----------------------------------------------------------------
let dispersedItems = [];
let pounches = [], namedStores = [];
let discontValue = 0;
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
    nC.addChild(this.storeBox, widgetWidth - 1010, offsetPlateY / 2 + 25, 1000, widgetHeight - 690 - offsetPlateY);
    this.storeBox.onTextCommitted.add((_1, _2, text) => {
      namedStores = text.split(/\s?\n/);
      saveState();
    })
    this.storeBox.onTextChanged.add((_1, _2, text) => {
      let beakText = text.split(/\s?\n/);
      for (let i = 0; i < beakText.length; i++) {
        if (beakText[i].includes("+") && dispersedItems.length == 0) {
          let pounchItems = pounches[i - 1].getItems();
          for (let j = 0; j < pounchItems.length; j++) {
            let newObject = world.createObjectFromJSON(pounchItems[j].toJSONString(), new Vector());
            setTimeout(() => {
              let posJ = newObject.getExtent().y * 2 > 1.6 && j + 10 || j;
              dispersedItems.push(newObject);
              newObject.setPosition(refObject.getSnapPoint(posJ).getGlobalPosition().add(new Vector(0, 0, zPosition)));
              newObject.ShowBuyItem(refObject.getId());
            }, 50);
            discontText.setText("").setEnabled(true);
            discontText.setMaxLength(3).setInputType(3);
          }
          this.SetNewStore();
          break;
        } else if (beakText[i].includes("-") && dispersedItems.length > 0) {
          for (const item of dispersedItems) {
            item.destroy();
          }
          dispersedItems = [];
          discontText.setMaxLength(10).setInputType(0);
          discontText.setText("Discont %").setEnabled(false);
          t.SetNewStore();
          break;
        } else if (beakText[i].includes("+") || beakText[i].includes("-")) {
          this.SetNewStore();
        }
      }
    })
    //-------------------------
    this.butNewStore = new Button().setText("Create new store").setTextColor(textColor).setFont(nameFont).setEnabled(false);
    this.butNewStore.setFontSize(70);
    nC.addChild(this.butNewStore, widgetWidth - 840, 0, 650, offsetPlateY / 2);
    this.butNewStore.onClicked.add(() => {
      let newPounch = world.createObjectFromTemplate("4FAE907E424F76032216F4B2200F27CD", refObject.getPosition().add(new Vector(20, 0, 0)));
      newPounch.addObjects(dispersedItems);
      pounches.push(newPounch);
      dispersedItems = []; namedStores.push("");
      store.SetNewStore();
      t.butNewStore.setEnabled(false);
      saveState();
    })
    //-------------------------
    let discontText = new TextBox().setText("Discont %").setTextColor(textColor).setFont(nameFont).setEnabled(false);
    discontText.setFontSize(70);
    nC.addChild(discontText, widgetWidth - 2500, 0, 350, offsetPlateY / 2);
    discontText.onTextCommitted.add((_1, _2, text) => {
      discontValue = parseInt(text);
    });
  }

  SetNewStore() {
    for (const item of dispersedItems) {
      item.toggleLock();
    }

    let newText = this.startText;
    if (namedStores.length > 1) {
      for (let i = 1; i < namedStores.length; i++) {
        newText += "\n" + (namedStores[i] != "" && namedStores[i] || "New store");
      }
    }
    this.storeBox.setText(newText);
  }
}
let store = new Store(refObject, new Vector(0, 0, zPosition));
//-----------------------------------------------------------------
refObject.ChangeDispersedItems = (item, remove) => {
  if (remove) {
    for (const t of dispersedItems) {
      let shiftItem = dispersedItems.shift();
      if (shiftItem == item) {
        break;
      } else {
        dispersedItems.push(shiftItem);
      }
    }
  } else {
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
  
  if (dispersedItems.length > 0) {
    store.butNewStore.setEnabled(true);
  } else {
    store.butNewStore.setEnabled(false);
  }
}
//-----------------------------------------------------------------
let walletPlate;
refObject.SetCapWallet = (plate) => {
  walletPlate = plate;
}
refObject.ChangeCountCap = (price) => {
  let locPrice = price - ((price * (discontValue / 100)) || "0");
  if (walletPlate) {
    if (walletPlate.Value - locPrice > 0) {
      walletPlate.Value -= locPrice;
      return true;
    } else {
      world.broadcastChatMessage("You don't have enough money", new Color(1, 0.25, 0.25));
    }
  } else {
    world.broadcastChatMessage("Wallet is not posted on the store", new Color(1, 0.25, 0.25));
  }
}
//-----------------------------------------------------------------
function saveState() {
  let state = {};

  let pounchesId = []
  for (const pounche of pounches) {
    pounchesId.push(pounche.getId());
  }
  state["pounchesId"] = pounchesId;
  state["namedStores"] = namedStores;

  refObject.setSavedData(JSON.stringify(state));
}

function loadState() {
  if (refObject.getSavedData() === "") {
    saveState();
    return;
  }

  let state = JSON.parse(refObject.getSavedData());

  let pounchesId = state["pounchesId"] || [];
  for (const id of pounchesId) {
    if(id)
      pounches.push(world.getObjectById(id));
  }
  namedStores = state["namedStores"] || [];
  
  store.SetNewStore();
}
loadState();