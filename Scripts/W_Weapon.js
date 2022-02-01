const { refObject, world } = require('@tabletop-playground/api');
const { UI } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
let pistol_shoot = world.importSound("Weapon/pistol_shoot.mp3", "", true);
let clip_off = world.importSound("Weapon/clip_off.mp3");
let shot_without_ammo = world.importSound("Weapon/shot_without_ammo.mp3");
//-----------------------------------------------------------------
const zPosition = refObject.getExtent().z * 1.1;
const widgetWidth = refObject.getExtent().y * 200;
const widgetHeight = refObject.getExtent().x * 200;
//-----------------------------------------------------------------
refObject.onCreated.add((obj) => {
  let templateMetadata = obj.getTemplateMetadata();
  let strings = templateMetadata.split(/\r?\n/);
  for (let i = 0; i < strings.length; i++) {
    if (strings[i].includes("Sound shoot:")) {
      pistol_shoot = world.importSound(strings[i].slice(13), "A19654D34967D1236591BCA0B76CE650", true);
    } else if (strings[i].includes("Sound clip off:")) {
      clip_off = world.importSound(strings[i].slice(16), "A19654D34967D1236591BCA0B76CE650");
    } else if (strings[i].includes("Sound shot without ammo:")) {
      shot_without_ammo = world.importSound(strings[i].slice(25), "A19654D34967D1236591BCA0B76CE650");
    }
  }
})
//-----------------------------------------------------------------
class WeaponShoot {
  constructor(parent, position) {
    this.parent = parent;
    //-------------------------
    this.nC = new Canvas();
    this.nCUI = UI.CreateCanvasElement(this.nC, position, widgetWidth, widgetHeight);
    this.nCUI.rotation = new Rotator(0, 0, 0);
    parent.attachUI(this.nCUI);
    //-------------------------
    this.sight = new ImageButton().setImage("Icons/sight-icon.png");
    this.nC.addChild(this.sight, widgetWidth - 30, 0, 30, 30);
    this.sight.onClicked.add(() => {
      if (parent.idClip && refObject.onSpendAmmo()) {
        pistol_shoot.playAttached(refObject);
        let clip = world.getObjectById(parent.idClip);
        world.broadcastChatMessage(clip.GetAmmunitions().pop());
      } else if (parent.idClip == null) {
        shot_without_ammo.playAttached(refObject);
        //-------------------------
        world.broadcastChatMessage("Ammunition clip is out");
      } else {
        shot_without_ammo.playAttached(refObject);
      }
    })
    //-------------------------
    this.ammunitionClip = new ImageButton().setImage("Icons/ammunition-clip-icon.png");
    this.nC.addChild(this.ammunitionClip, widgetWidth - 30, widgetHeight - 30, 30, 30);
    this.ammunitionClip.onClicked.add(() => {
      if (parent.idClip) {
        clip_off.playAttached(refObject);
        //-------------------------
        let clip = world.getObjectById(parent.idClip);
        clip.setPosition(parent.getPosition().add(new Vector(3, 0, 0)));
        clip.setRotation(new Rotator(0, 0, 0));
        clip.setScale(new Vector(1, 1, 1));
        clip.ClipOut();
        parent.idClip = null;
      }
    })
  }
}
let weaponShoot = new WeaponShoot(refObject, new Vector(0, 0, zPosition));
//-----------------------------------------------------------------
refObject.type = "Weapon";