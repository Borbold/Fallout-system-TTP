const { refObject, world } = require('@tabletop-playground/api');
const { UI } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
let soundReloading = world.importSound("perezariadka-avtomata-y8578uy.mp3");
const zPosition = refObject.getExtent().z * 1.1;
const widgetWidth = refObject.getExtent().y * 200;
const widgetHeight = refObject.getExtent().x * 200;
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
      if (parent.idClip) {
        refObject.onSpendAmmo();
      } else {
        console.log("Ammunition clip is out");
      }
    })
    //-------------------------
    this.ammunitionClip = new ImageButton().setImage("Icons/ammunition-clip-icon.png");
    this.nC.addChild(this.ammunitionClip, 0, 0, 30, 30);
    this.ammunitionClip.onClicked.add(() => {
      if (parent.idClip) {
        soundReloading.play();

        let clip = world.getObjectById(parent.idClip);
        clip.setPosition(parent.getPosition().add(new Vector(3, 0, 0)));
        clip.setRotation(new Rotator(0, 0, 0));
        clip.setScale(new Vector(1, 1, 1));
        parent.idClip = null;
      }
    })
  }
}
let weaponShoot = new WeaponShoot(refObject, new Vector(0, 0, zPosition));
//-----------------------------------------------------------------
refObject.type = "Weapon";