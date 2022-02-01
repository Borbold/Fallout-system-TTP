const { refObject, world } = require('@tabletop-playground/api');
const { UI, CheckPlayerColor } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
let cage = world.importSound("Weapon/cage.mp3");
//-----------------------------------------------------------------
const zPosition = refObject.getExtent().z * 1.1;
const widgetWidth = refObject.getExtent().y * 200;
const widgetHeight = refObject.getExtent().x * 200;
const nameFont = UI.GetTextFont();
const textColor = UI.GetTextColor();
//-----------------------------------------------------------------
let currentAmmo = 0, maxAmmo = 10;
let textAmmo = "Ammo: " + currentAmmo + "/" + maxAmmo;
let ammunitionsName = [];
//-----------------------------------------------------------------
refObject.onCreated.add(() => {
  UI.SetHideShowPosition(0, zPosition);
  loadState();
})

refObject.onSnapped.add((obj, _2, snapPoint) => {
  let weapon = snapPoint.getParentObject();
  if (weapon.type && weapon.type == "Weapon" && weapon.idClip == null) {
    cage.playAttached(refObject);
    //-------------------------
    weapon.idClip = obj.getId();
    weapon.onSpendAmmo = SpendAmmo;
    obj.setScale(new Vector(0.01, 0.01, 0.01));
    ClipIn(weapon.getId());
  }
})
//-----------------------------------------------------------------
class SettingsButton {
  constructor(parent, position) {
    let t = this;
    this.parent = parent;
    //-------------------------
    this.nC = new Canvas();
    this.nCUI = UI.CreateCanvasElement(this.nC, position, widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(0, 0, 0);
    parent.attachUI(this.nCUI);
    //-------------------------
    let settings = new ImageButton().setImage("Icons/gear-icon.png");
    this.nC.addChild(settings, widgetWidth - 30, 0, 30, 30);
    settings.onClicked.add((_1, player) => {
      if (CheckPlayerColor(player.getPlayerColor(), new Color(0, 0, 0))) {
        UI.HideUI(t, parent);
        UI.ShowUI(settingsClip, parent);
      }
    })
  }
}
let settingsButton = new SettingsButton(refObject, new Vector(0, 0, zPosition));

class SettingsClip {
  constructor(parent, position) {
    let t = this;
    this.parent = parent;
    //-------------------------
    this.nC = new Canvas();
    this.nCUI = UI.CreateCanvasElement(this.nC, position, widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(0, 0, 0);
    parent.attachUI(this.nCUI);
    //-------------------------
    this.maxAmmoTB = new TextBox().setText(maxAmmo).setFontSize(20).setTextColor(textColor).setFont(nameFont).setInputType(4).setSelectTextOnFocus(true);
    this.nC.addChild(this.maxAmmoTB, 0, 0, widgetWidth, widgetHeight);
    this.maxAmmoTB.onTextCommitted.add((_1, _2, nText) => {
      maxAmmo = parseInt(nText);
      ChangeAmmunitionText();
    })
    //-------------------------
    this.maxText = new Text().setText("Max").setFontSize(20).setTextColor(textColor).setFont(nameFont);
    this.nC.addChild(this.maxText, 0, 0, widgetWidth, 25);
    //-------------------------
    let cross = new ImageButton().setImage("Icons/cross-icon.png");
    this.nC.addChild(cross, widgetWidth - 30, 0, 30, 30);
    cross.onClicked.add(() => {
      UI.HideUI(t, parent);
      UI.ShowUI(settingsButton, parent);
    })
  }
}
let settingsClip = new SettingsClip(refObject, new Vector(0, 0, 0));
//-----------------------------------------------------------------
function SpendAmmo() {
  if (currentAmmo > 0) {
    currentAmmo--;
    ChangeAmmunitionText();
    return true;
  }
}

function ChangeAmmunition(value, name) {
  value = parseInt(value);
  if (currentAmmo + value > maxAmmo) {
    currentAmmo = maxAmmo;
  } else if (currentAmmo + value < 0) {
    currentAmmo = 0;
  } else {
    if (value > 0)
      for (let i = 0; i < value; i++)
        ammunitionsName.push(name);
    else
      for (let i = 0; i < -value; i++)
        ammunitionsName.pop();

    currentAmmo += value;
  }
  ChangeAmmunitionText();
}
function ChangeAmmunitionText() {
  textAmmo = "Ammo: " + currentAmmo + "/" + maxAmmo;  
  refObject.setDescription(textAmmo);
  saveState();
}

function ClipIn(idWeapon) {
  saveState(idWeapon);
}
//-----------------------------------------------------------------
refObject.type = "Clip";
refObject.onChangeAmmunition = ChangeAmmunition;
refObject.CheckMaxAmmo = () => { return currentAmmo != maxAmmo; }
refObject.GetAmmunitions = () => { return ammunitionsName; }
refObject.ClipOut = () => { ClipIn("0"); }
//-----------------------------------------------------------------
function saveState(idWeapon) {
  let state = {};
  
  state["currentAmmo"] = currentAmmo;
  state["maxAmmo"] = maxAmmo;
  state["ammunitionsName"] = ammunitionsName;
  if (idWeapon)
    state["idWeapon"] = idWeapon;

  refObject.setSavedData(JSON.stringify(state));
}

function loadState() {
  if (refObject.getSavedData() === "") {
    saveState();
    return;
  }

  let state = JSON.parse(refObject.getSavedData());

  setTimeout(() => {
    currentAmmo = state["currentAmmo"];
    maxAmmo = state["maxAmmo"];
    settingsClip.maxAmmoTB.setText(maxAmmo);
    ammunitionsName = state["ammunitionsName"];
    if (state["idWeapon"] && state["idWeapon"] != "0") {
      let weapon = world.getObjectById(state["idWeapon"]);
      weapon.idClip = refObject.getId();
      weapon.onSpendAmmo = SpendAmmo;
    }
    ChangeAmmunitionText();
  }, 50);
}