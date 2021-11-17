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
class BuyItem {
  constructor(parent, position) {
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
      let allSnap = t.snapingObject.getAllSnapPoints();
      let newObject = world.createObjectFromTemplate(refObject.getTemplateId(),
        t.snapingObject.getSnapPoint(allSnap.length - 1).getGlobalPosition());
      newObject.setName(refObject.getName()); newObject.setDescription(refObject.getDescription());
    })
    //-------------------------
    let crossIcon = new ImageButton().setImage("cross-icon-2.png");
    nC.addChild(crossIcon, 0, 0, 30, 30);
    crossIcon.onClicked.add(() => {

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