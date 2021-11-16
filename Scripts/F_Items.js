const { refObject, world } = require('@tabletop-playground/api');
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