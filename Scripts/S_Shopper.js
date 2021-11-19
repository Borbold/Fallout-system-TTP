const { refObject, world } = require('@tabletop-playground/api');
const { CreateCanvasElement, GetTextFont, GetTextColor } = require('./general/General_Functions.js');
// Создание контейнера
//world.createObjectFromTemplate("4FAE907E424F76032216F4B2200F27CD", refObject.getPosition().add(new Vector(20, 0, 0)));
//-----------------------------------------------------------------
const zPosition = refObject.getExtent().z + 0.01;
const widgetWidth = 4000;
const offsetPlateY = 200;
const widgetHeight = 2000 + offsetPlateY;
const nameFont = GetTextFont();
const textColor = GetTextColor();
//-----------------------------------------------------------------
let dispersedItems = [];
let pounches = [], namedStores = [];
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
      for (let i = 0; i < namedStores.length; i++) {
        if (namedStores[i].includes("+") && dispersedItems.length == 0) {
          let pounchItems = pounches[i - 1].getItems();
          for (let j = 0; j < pounchItems.length; j++) {
            let newObject = world.createObjectFromJSON(pounchItems[j].toJSONString(), new Vector());
            setTimeout(() => {
              dispersedItems.push(newObject);
              newObject.setPosition(refObject.getSnapPoint(j).getGlobalPosition().add(new Vector(0, 0, zPosition)));
              newObject.ShowBuyItem();
            }, 50);
          }
        } else if (namedStores[i].includes("-") && dispersedItems.length > 0) {
          for (const item of dispersedItems) {
            item.destroy();
          }
          dispersedItems = [];
        }
      }
      saveState();
    })
    //-------------------------
    this.butNewStore = new Button().setText("Create new store").setTextColor(textColor).setFont(nameFont).setEnabled(false);
    this.butNewStore.setFontSize(70);
    nC.addChild(this.butNewStore, widgetWidth - 840, 0, 650, offsetPlateY / 2);
    this.butNewStore.onClicked.add(() => {
      let newPounch = world.createObjectFromTemplate("4FAE907E424F76032216F4B2200F27CD", refObject.getPosition().add(new Vector(20, 0, 0)));
      newPounch.addObjects(dispersedItems);
      pounches.push(newPounch);
      dispersedItems = [];
      store.SetNewStore(true);
      t.butNewStore.setEnabled(false);
      saveState();
    })
  }

  SetNewStore(newStore) {
    let newText = "";
    if (namedStores.length > 0 && !newStore) {
      for (let i = 0; i < namedStores.length; i++) {
        newText += (i && "\n" || "") + namedStores[i];
      }
    } else {
      newText += this.startText;
      for (let i = 0; i < pounches.length; i++) {
        newText += "\n" + "New store";
      }
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
  if (dispersedItems.length > 0) {
    store.butNewStore.setEnabled(true);
  } else {
    store.butNewStore.setEnabled(false);
  }
}
//-----------------------------------------------------------------
let walletPlate;
refObject.SetCapWallet = (plate, remove) => {
  if (remove) {
    walletPlate = null;
  } else {
    walletPlate = plate;
  }
}
refObject.ChangeCountCap = (price) => {
  if (walletPlate) {
    if (walletPlate.Value -= price > 0) {
      walletPlate.Value -= price;
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