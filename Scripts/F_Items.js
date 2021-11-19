const { refObject, world, refPackageId } = require('@tabletop-playground/api');
const { CreateCanvasElement } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
const zPosition = refObject.getExtent().z + 0.01;
const widgetWidth = refObject.getExtent().x * 200;
const widgetHeight = refObject.getExtent().y * 200;
//-----------------------------------------------------------------
refObject.onCreated.add(() => {
  loadState();
})

let snapingObjectId;
refObject.onSnapped.add((o, _2, snapPoint) => {
  if (snapPoint.snapsRotation()) {
    let snapingObject = snapPoint.getParentObject();
    if (snapingObject.ChangeValues) {
      snapingObject.ChangeValues(o.getName(), o.getDescription().toLowerCase());
      snapingObjectId = snapingObject.getId();
      saveState();
    } else if (snapingObject.ChangeDispersedItems) {
      snapingObject.ChangeDispersedItems(o);
      snapingObjectId = snapingObject.getId();
      saveState();
    }
  }
})

refObject.onGrab.add((o) => {
  if (snapingObjectId) {
    let snapingObject = world.getObjectById(snapingObjectId);
    if (snapingObject.ChangeValues) {
      snapingObject.ChangeValues(o.getName(), o.getDescription().toLowerCase(), true);
      snapingObjectId = 0;
      saveState();
    } else if (snapingObject.ChangeDispersedItems) {
      snapingObject.ChangeDispersedItems(o, true);
      snapingObjectId = 0;
      saveState();
    }
  }
})
//-----------------------------------------------------------------
let itemsPurchased = [];
class BuyItem {
  constructor(parent, position) {
    let description = refObject.getDescription();
    let brokenDescription = description.split(/\s?\n/);
    let price = 0; let wLooking = "price:"
    for (const text of brokenDescription) {
      if (text.includes("price:")) {
        price = parseInt(text.slice(wLooking.length + 1));
      }
    }
    //-------------------------
    let t = this;
    this.parent = refObject;
    this.hidePosition = position;
    this.startPosition = new Vector(0, 0, zPosition);
    //-------------------------
    this.nC = new Canvas();
    this.nCUI = CreateCanvasElement(this.nC, position, widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(0, 0, 0);
    parent.attachUI(this.nCUI);
    //-------------------------
    this.buyItemIcon = new ImageButton().setImage("buy-icon.png");
    this.nC.addChild(this.buyItemIcon, widgetWidth - 30, 0, 30, 30);
    this.buyItemIcon.onClicked.add(() => {
      //-1 так как в данном месте код багает
      if (t.snapingObject.ChangeCountCap(price - 1)) {
        let allSnap = t.snapingObject.getAllSnapPoints();
        let newObject = world.createObjectFromTemplate(refObject.getTemplateId(),
          t.snapingObject.getSnapPoint(allSnap.length - 1).getGlobalPosition());
        newObject.setName(refObject.getName()); newObject.setDescription(refObject.getDescription());
        itemsPurchased.push(newObject);
      }
    })
    //-------------------------
    this.crossIcon = new ImageButton().setImage("cross-icon-2.png");
    this.nC.addChild(this.crossIcon, 0, 0, 30, 30);
    this.crossIcon.onClicked.add(() => {
      if (itemsPurchased.length > 0) {
        let deleteItem = itemsPurchased.pop();
        deleteItem.destroy();
        t.snapingObject.ChangeCountCap(-price);
      }
    })
  }

  HideUI() {
    this.nCUI.position = this.hidePosition;
    this.parent.updateUI(this.nCUI);
  }
  ShowUI() {
    this.nCUI.position = this.startPosition;
    this.snapingObject = world.getObjectById(snapingObjectId);
    this.parent.updateUI(this.nCUI);
  }
}
let buyItem = new BuyItem(refObject, new Vector(0, 0, 0));
//-----------------------------------------------------------------
refObject.ShowBuyItem = () => {
  buyItem.ShowUI();
}
//-----------------------------------------------------------------
function saveState() {
  let state = {};

  state["snapingObjectId"] = snapingObjectId;

  refObject.setSavedData(JSON.stringify(state));
}

function loadState() {
  if (refObject.getSavedData() === "") {
    saveState();
    return;
  }

  let state = JSON.parse(refObject.getSavedData());

  snapingObjectId = state["snapingObjectId"];
}