const { refObject } = require('@tabletop-playground/api');
const { AddValueMain } = require('./general/General_Functions.js');
//-----------------------------------------------------------------
refObject.onCreated.add(() => {
  loadState();
})
//-----------------------------------------------------------------
refObject.ChangeValues = (description, itemGrab) => {
  let brokenDescription = description.split(/\s?\n/);
  for (let j = 0; j < arrayCharacteristic.length; j++) {
    for (let i = 0; i < brokenDescription.length; i++) {
      if (brokenDescription[i].toLowerCase().includes(arrayCharacteristic[j])) {
        let value = parseInt(brokenDescription[i].slice(arrayCharacteristic[j].length + 1)) * (!itemGrab && 1);
        AddValueMain(refObject.getName(), j, value, "characteristic");
      }
    }
  }
  for (let j = 0; j < arraySkills.length; j++) {
    for (let i = 0; i < brokenDescription.length; i++) {
      if (brokenDescription[i].toLowerCase().includes(arraySkills[j])) {
        let value = parseInt(brokenDescription[i].slice(arraySkills[j].length + 1)) * (!itemGrab && 1);
        AddValueMain(refObject.getName(), j, value, "skills");
      }
    }
  }
  for (let j = 0; j < arrayStatus.length; j++) {
    for (let i = 0; i < brokenDescription.length; i++) {
      if (brokenDescription[i].toLowerCase().includes(arrayStatus[j])) {
        console.clear();
        console.log(brokenDescription[i].slice(arrayStatus[j].length + 1));
        let value = parseInt(brokenDescription[i].slice(arrayStatus[j].length + 1)) * (!itemGrab && 1);
        AddValueMain(refObject.getName(), j, value, "status");
      }
    }
  }
}
//-----------------------------------------------------------------
refObject.ResetValue = function () { }

let arrayCharacteristic = [];
let arraySkills = [];
let arrayStatus = [];
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
}