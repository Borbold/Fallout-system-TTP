const { refObject } = require('@tabletop-playground/api');

let snapingObject;
refObject.onSnapped.add((o, _2, snapPoint) => {
  snapingObject = snapPoint.getParentObject();
  snapingObject.ChangeValues(o.getDescription().toLowerCase());
})

refObject.onGrab.add((o) => {
  if (snapingObject) {
    snapingObject.ChangeValues(o.getDescription().toLowerCase(), true);
    snapingObject = null;
  }
})