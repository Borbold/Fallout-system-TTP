const { refObject, world, refPackageId } = require('@tabletop-playground/api');
const { CreateCanvasElement, GetTextFont, GetTextColor } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
const zPosition = refObject.getExtent().z + 0.01;
const widgetWidth = refObject.getExtent().x * 200;
const widgetHeight = refObject.getExtent().y * 200;
const nameFont = GetTextFont();
const textColor = GetTextColor();
//-----------------------------------------------------------------
refObject.onCreated.add(() => {
  loadState();
})

refObject.onHit.add(() => {
  
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
      buyItem.ShowUI();
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
    let nC = new Canvas();
    this.nCUI = CreateCanvasElement(nC, position, widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(0, 0, 0);
    parent.attachUI(this.nCUI);
    //-------------------------
    let buyItemIcon = new ImageButton().setImage("buy-icon.png");
    nC.addChild(buyItemIcon, widgetWidth - 30, 0, 30, 30);
    buyItemIcon.onClicked.add(() => {
      //-1 ��� ��� � ������ ����� ��� ������
      if (t.snapingObject.ChangeCountCap(price - 1)) {
        let allSnap = t.snapingObject.getAllSnapPoints();
        let newObject = world.createObjectFromTemplate(refObject.getTemplateId(),
          t.snapingObject.getSnapPoint(allSnap.length - 1).getGlobalPosition());
        newObject.setName(refObject.getName()); newObject.setDescription(refObject.getDescription());
        itemsPurchased.push(newObject);
      }
    })
    //-------------------------
    let crossIcon = new ImageButton().setImage("cross-icon-2.png");
    nC.addChild(crossIcon, 0, 0, 30, 30);
    crossIcon.onClicked.add(() => {
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