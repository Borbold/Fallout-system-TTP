const { refObject } = require('@tabletop-playground/api');
const { AddValueMain, AddConditionMain, ConditionCheck } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
let figurePlate;
refObject.onCreated.add(() => {
  loadState();
  setTimeout(() => {
    let allObject = world.getAllObjects();
    for (let i = 0; i < allObject.length; i++) {
      if (refObject != allObject[i] && refObject.getName() == allObject[i].getName()) {
        if (allObject[i].getTemplateMetadata() == "firgureCharacter") {
          figurePlate = allObject[i];
          break;
        }
      }
    }
  }, 200);
})
//-----------------------------------------------------------------
refObject.ChangeValues = (name, description, grab) => {
  figurePlate.ChangeNameBonus(name, grab);

  itemGrab = grab;
  let brokenDescription = description.split(/\s?\n/);
  for (let j = 0; j < arrayCharacteristic.length; j++) {
    for (let i = 0; i < brokenDescription.length; i++) {
      AddValues(brokenDescription[i].toLowerCase(), j, "characteristic", arrayCharacteristic[j]);
    }
  }
  for (let j = 0; j < arraySkills.length; j++) {
    for (let i = 0; i < brokenDescription.length; i++) {
      AddValues(brokenDescription[i].toLowerCase(), j, "skills", arraySkills[j]);
    }
  }
  for (let j = 0; j < arrayStatus.length; j++) {
    for (let i = 0; i < brokenDescription.length; i++) {
      AddValues(brokenDescription[i].toLowerCase(), j, "status", arrayStatus[j]);
    }
  }
}

let itemGrab = true;
function AddValues(iLooking, j, type, wLooking) {
  if (iLooking.includes(wLooking)) {
    let condition = ConditionCheck(iLooking);
    if (condition) {
      for (let i = 0; i < arrayXvalue.length; i++) {
        if (iLooking.includes(arrayXvalue[i])) {
          let textCondition = !itemGrab && iLooking.slice(wLooking.length + 1) || "";
          AddConditionMain(refObject.getName(), j, textCondition, type);
        }
      }
    } else {
      let value = parseInt(iLooking.slice(wLooking.length + 1)) * (!itemGrab && 1);
      AddValueMain(refObject.getName(), j, value, type);
    }
  }
}
//-----------------------------------------------------------------
refObject.ResetValue = function () { }

let arrayCharacteristic = [];
let arraySkills = [];
let arrayStatus = [];
let arrayXvalue = [];
function loadState() {
  arrayCharacteristic.push("strength:");
  arrayCharacteristic.push("perception:");
  arrayCharacteristic.push("endurance:");
  arrayCharacteristic.push("charisma:");
  arrayCharacteristic.push("intelligence:");
  arrayCharacteristic.push("dexterity:");
  arrayCharacteristic.push("luck:");
  //-------------------------
  arrayStatus.push("response:");
  arrayStatus.push("armor class:");
  arrayStatus.push("damage limit:");
  arrayStatus.push("damage resistance:");
  arrayStatus.push("energy damage resistance:");
  arrayStatus.push("radiation resistance:");
  arrayStatus.push("poison resistance:");
  arrayStatus.push("hit chance:");
  //-------------------------
  arraySkills.push("light weapons:");
  arraySkills.push("heavy weapons:");
  arraySkills.push("energy weapon:");
  arraySkills.push("unarmed:");
  arraySkills.push("edged weapons:");
  arraySkills.push("throwing arm:");
  arraySkills.push("first aid:");
  arraySkills.push("doctor:");
  arraySkills.push("naturalist:");
  arraySkills.push("pilot:");
  arraySkills.push("stealth:");
  arraySkills.push("hacking:");
  arraySkills.push("theft:");
  arraySkills.push("traps:");
  arraySkills.push("science:");
  arraySkills.push("repair:");
  arraySkills.push("eloquence:");
  arraySkills.push("barter:");
  arraySkills.push("gambling:");
  //-------------------------
  arrayXvalue.push("health");
  arrayXvalue.push("action");
}