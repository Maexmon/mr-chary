const { MessageEmbed } = require("discord.js");
require('better-logging')(console);

var primaryWeapon;
var secondaryWeapon;
var tools;
var consumables;

const DUALIES_PROBABILITY = 0.33;

module.exports = {
    name: 'random',
    description: "Generates a random loadout!",
    execute(message, args) {
        var usedArguments = "Arguments: ";

        // Implement arguments
        var argumentForceMelee = false;
        var argumentForceKit = false;
        var argumentFillSlots = false;
        var argumentBloodlineLevel = 0;

        // read arguments
        for(var a = 0; a < args.length; a++) {
            var argSingleName = args[a];

            var argName = args[a].substr(0, args[a].indexOf('='));
            var argValue = args[a].split('=')[1];

            switch (argName) {
                case "-bl":
                case "--bloodline-level":
                    argumentBloodlineLevel = argValue;
                    usedArguments = usedArguments + "+bloodlineLevel=" + argValue + " 🩸 ";
                    break;
                default:
                    break;
            }

            switch (argSingleName) {
                case "-fm":
                case "--force-melee":
                    argumentForceMelee = true;
                    usedArguments = usedArguments + "+forceMelee 🔪 ";
                    break;
                case "-fk":
                case "--force-kit":
                    argumentForceKit = true;
                    usedArguments = usedArguments + "+forceKit 💉 ";
                    break;
                case "-fs":
                case "--fill-slots":
                    argumentFillSlots = true;
                    usedArguments = usedArguments + "+fillSlots 🎰 ";
                    break;
                default:
                    break;
            }
        }

        var maxCount = getItemCount("Weapons");

        // get primary weapon
        var randomId = 0;
        var primarySlots = 0;
        while (true) {
            randomId = Math.floor(Math.random() * maxCount + 1);
            primaryWeapon = getItem(randomId, "Weapons");

            // +bloodlineLevel (primary has to be equal or lower)
            if (argumentBloodlineLevel > 0 && argumentBloodlineLevel < 100 &&
                primaryWeapon[1].bloodlineLevel > argumentBloodlineLevel) {
                console.info("random.js: +bloodlineLevel: Bloodline level too high, re-roll primary (" + primaryWeapon[1].name, primaryWeapon[2].name + " - " + primaryWeapon[1].bloodlineLevel + ")");
                continue;
            }
    
            // roll for dualies
            if (primaryWeapon[4]) {
                primarySlots = primaryWeapon[2].slots * 2;
                console.info("random.js: Primary are dualies (" + primaryWeapon[1].name, primaryWeapon[2].name, primarySlots + ")");
            } else {
                primarySlots = primaryWeapon[2].slots;
            }

            break;
        }

        // get secondary weapon
        var secondarySlots = 0;
        while (true) {
            randomId = Math.floor(Math.random() * maxCount + 1);
            secondaryWeapon = getItem(randomId, "Weapons");

            // +bloodlineLevel (secondary has to be equal or lower)
            if (argumentBloodlineLevel > 0 && argumentBloodlineLevel < 100 &&
                secondaryWeapon[1].bloodlineLevel > argumentBloodlineLevel) {
                console.info("random.js: +bloodlineLevel: Bloodline level too high, re-roll secondary (" + secondaryWeapon[1].name, secondaryWeapon[2].name + " - " + secondaryWeapon[1].bloodlineLevel + ")");
                continue;
            }

            // roll for dualies
            secondarySlots = 0;
            if (secondaryWeapon[4]) {
                secondarySlots = secondaryWeapon[2].slots * 2;
                console.info("random.js: Secondary are dualies (" + secondaryWeapon[1].name, secondaryWeapon[2].name, secondarySlots + ")");
            } else {
                secondarySlots = secondaryWeapon[2].slots;
            }

            // check for too many slots
            var overallSlots = primarySlots + secondarySlots;
            if (overallSlots > 4) {
                console.info("random.js: Too many slots, re-roll secondary (" + secondaryWeapon[1].name, secondaryWeapon[2].name + " - " + secondarySlots + " Slots)");
                continue;
            }

            // +fillSlots (all 4 slots need to be filled)
            if (argumentFillSlots && overallSlots < 4) {
                console.info("random.js: +fillSlots: Slots not filled, re-roll secondary (" + secondaryWeapon[1].name, secondaryWeapon[2].name + " - " + secondarySlots + " Slots)");
                continue;
            }

            // no double melee weapons
            if (primaryWeapon[0].name === "Melee" && secondaryWeapon[0].name === "Melee") {
                console.info("random.js: Double melee weapon, re-roll secondary (" + primaryWeapon[1].name, primaryWeapon[2].name + ", " + secondaryWeapon[1].name, secondaryWeapon[2].name + ")");
                continue;
            }

            break;
        }

        // switch weapons if primary occupies less slots
        if (secondarySlots > primarySlots) {
            console.info("random.js: Switched weapon slots, because " + primaryWeapon[1].name, primaryWeapon[2].name + " < " + secondaryWeapon[1].name, secondaryWeapon[2].name);
            var tempWeapon = primaryWeapon;
            primaryWeapon = secondaryWeapon;
            secondaryWeapon = tempWeapon;
        }

        var hasMeleeWeapon = false;
        var meleeCountWeapon = 0;
        // check for melee
        if (primaryWeapon[0].name === "Melee" || secondaryWeapon[0].name === "Melee") {
            hasMeleeWeapon = true;
            meleeCountWeapon++;
        }

        // get tools
        while (true) {
            maxCount = getItemCount("Tools");
            tools = [];
            for (var i = 0; i < 4; i++) {
                randomId = Math.floor(Math.random() * maxCount + 1);
                tools[i] = getItem(randomId, "Tools");
            }

            // check for duplicates
            var hasDuplicates = false;
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 4; j++) {
                    if (i !== j &&
                        tools[i][2].name === tools[j][2].name) {
                            hasDuplicates = true;
                    }
                }
            }

            if (hasDuplicates) {
                console.info("random.js: Tools have duplicates, re-roll tools (" +
                    tools[0][2].name + ", " +
                    tools[1][2].name + ", " +
                    tools[2][2].name + ", " +
                    tools[3][2].name + ")");
                continue;
            }

            // check for too many melee tools
            var meleeCount = 0;
            if (meleeCountWeapon > 0) {
                meleeCount++;
            }
            for (var i = 0; i < 4; i++) {
                if (tools[i][1].name === "Combat Axe" ||
                    tools[i][1].name === "Knife" ||
                    tools[i][1].name === "Dusters") {
                        meleeCount++;
                }
            }

            if (meleeCount > 2) {
                console.info("random.js: Too many melee weapons, re-roll tools (" +
                primaryWeapon[1].name, primaryWeapon[2].name + ", " +
                secondaryWeapon[1].name, secondaryWeapon[2].name + ", " +
                tools[0][2].name + ", " +
                tools[1][2].name + ", " +
                tools[2][2].name + ", " +
                tools[3][2].name + ")");
                continue;
            }

            // +forceMelee (tools need to have a melee weapon)
            var hasMelee = false;
            if (hasMeleeWeapon === true) {
                hasMelee = true;
            }
            if (argumentForceMelee && !hasMeleeWeapon) {
                for (var j = 0; j < 4; j++) {
                    if (tools[j][1].name === "Combat Axe" ||
                        tools[j][1].name === "Knife" ||
                        tools[j][1].name === "Dusters") {
                        hasMelee = true;
                    }
                }
            }

            var hasKit = false;
            // +forceKit (tools need to have a first aid kit)
            if (argumentForceKit) {
                for (var j = 0; j < 4; j++) {
                    if (tools[j][1].name === "First Aid Kit") {
                        hasKit = true;
                    }
                }
            }

            // +bloodlineLevel (tools need to be in bloodline level bounds)
            var hasBloodlineLevel = true;
            if (argumentBloodlineLevel > 0 && argumentBloodlineLevel < 100) {
                for (var j = 0; j < 4; j++) {
                    if (tools[j][1].bloodlineLevel > argumentBloodlineLevel) {
                        hasBloodlineLevel = false;
                    }
                }
            }
            
            // check all arguments
            if (argumentForceMelee && !hasMelee) {
                console.info("random.js: +forceMelee: No melee weapon found, re-roll tools (" +
                    tools[0][2].name + ", " +
                    tools[1][2].name + ", " +
                    tools[2][2].name + ", " +
                    tools[3][2].name + ")");
                continue;
            }

            if (argumentForceKit && !hasKit) {
                console.info("random.js: +forceKit: No first aid kit found, re-roll tools (" +
                    tools[0][2].name + ", " +
                    tools[1][2].name + ", " +
                    tools[2][2].name + ", " +
                    tools[3][2].name + ")");
                continue;
            }

            if (argumentBloodlineLevel && !hasBloodlineLevel) {
                console.info("random.js: +bloodlineLevel: Bloodline level too high, re-roll tools (" +
                    tools[0][2].name, tools[0][1].bloodlineLevel + ", " +
                    tools[1][2].name, tools[1][1].bloodlineLevel + ", " +
                    tools[2][2].name, tools[2][1].bloodlineLevel + ", " +
                    tools[3][2].name, tools[3][1].bloodlineLevel + ")");
                continue;
            }

            break;
        }

        // get consumables
        while (true) {
            maxCount = getItemCount("Consumables");
            consumables = [];
            for (var i = 0; i < 4; i++) {
                randomId = Math.floor(Math.random() * maxCount + 1);
                consumables[i] = getItem(randomId, "Consumables");
            }

            // +bloodlineLevel (consumables need to be in bloodline level bounds)
            var hasBloodlineLevel = true;
            if (argumentBloodlineLevel > 0 && argumentBloodlineLevel < 100) {
                for (var j = 0; j < 4; j++) {
                    if (consumables[j][1].bloodlineLevel > argumentBloodlineLevel) {
                        hasBloodlineLevel = false;
                    }
                }
            }

            if (argumentBloodlineLevel && !hasBloodlineLevel) {
                console.info("random.js: +bloodlineLevel: Bloodline level too high, re-roll consumables (" +
                    consumables[0][2].name, consumables[0][1].bloodlineLevel + ", " +
                    consumables[1][2].name, consumables[0][1].bloodlineLevel + ", " +
                    consumables[2][2].name, consumables[0][1].bloodlineLevel + ", " +
                    consumables[3][2].name, consumables[0][1].bloodlineLevel + ")");
                continue;
            }

            break;
        }

        // show embed
        const embed = new MessageEmbed()
        .setTitle("🎲 Random Loadout")
        .setDescription('`' + usedArguments + '`')
        .setColor("#eb4034")
        .setTimestamp();
        
        // add primary weapon as dualies or solo
        if (primaryWeapon[4]) {
            embed.addFields({
                name: "🥇 Primary Weapon",
                value: "`2x " + primaryWeapon[1].name + " (" + primaryWeapon[2].name + ")`",
                inline: true
            });
        } else {
            embed.addFields({
                name: "🥇 Primary Weapon",
                value: "`" + primaryWeapon[1].name + " (" + primaryWeapon[2].name + ")`",
                inline: true
            });
        }

        // add field for ammo for shootable weapons
        if (primaryWeapon[0].name !== 'Melee') {
            if (primaryWeapon[1].ammoSlots === 1) {
                embed.addFields({
                    name: "🔫 Ammunition",
                    value: "`" + primaryWeapon[3][0].name + " " + primaryWeapon[3][0].type + "`",
                    inline: true
                });
                embed.addFields({
                    name: '\u200B',
                    value: '\u200B',
                    inline: true
                });
            }

            if (primaryWeapon[1].ammoSlots === 2) {
                embed.addFields({
                    name: "🔫 Ammunition",
                    value: "`" + primaryWeapon[3][0].name + " " + primaryWeapon[3][0].type + "` `" + primaryWeapon[3][1].name + " " + primaryWeapon[3][1].type + "`",
                    inline: true
                });
                embed.addFields({
                    name: '\u200B',
                    value: '\u200B',
                    inline: true
                });
            }
        } else {
            embed.addFields({
                name: '\u200B',
                value: '\u200B',
                inline: true
            });
            embed.addFields({
                name: '\u200B',
                value: '\u200B',
                inline: true
            });
        }

        // add secondary weapon as dualies or solo
        if (secondaryWeapon[4]) {
            embed.addFields({
                name: "🥈 Secondary Weapon",
                value: "`2x " + secondaryWeapon[1].name + " (" + secondaryWeapon[2].name + ")`",
                inline: true
            });
        } else {
            embed.addFields({
                name: "🥈 Secondary Weapon",
                value: "`" + secondaryWeapon[1].name + " (" + secondaryWeapon[2].name + ")`",
                inline: true
            });
        }

        // add field for ammo for shootable weapons
        if (secondaryWeapon[0].name !== 'Melee') {
            if (secondaryWeapon[1].ammoSlots === 1) {
                embed.addFields({
                    name: "🔫 Ammunition",
                    value: "`" + secondaryWeapon[3][0].name + " " + secondaryWeapon[3][0].type + "`",
                    inline: true
                });
                embed.addFields({
                    name: '\u200B',
                    value: '\u200B',
                    inline: true
                });
            }

            if (secondaryWeapon[1].ammoSlots === 2) {
                embed.addFields({
                    name: "🔫 Ammunition",
                    value: "`" + secondaryWeapon[3][0].name + " " + secondaryWeapon[3][0].type + "` `" + secondaryWeapon[3][1].name + " " + secondaryWeapon[3][1].type + "`",
                    inline: true
                });
                embed.addFields({
                    name: '\u200B',
                    value: '\u200B',
                    inline: true
                });
            }
        } else {
            embed.addFields({
                name: '\u200B',
                value: '\u200B',
                inline: true
            });
            embed.addFields({
                name: '\u200B',
                value: '\u200B',
                inline: true
            });
        }

        embed.addFields({
            name: "🛠️ Tools",
            value: "`" + tools[0][2].name + "`, `" + tools[1][2].name + "`, `" + tools[2][2].name + "`, `" + tools[3][2].name + "`",
            inline: false
        });
        
        embed.addFields({
            name: "🍔 Consumables",
            value: "`" + consumables[0][2].name + "`, `" + consumables[1][2].name + "`, `" + consumables[2][2].name + "`, `" + consumables[3][2].name + "`",
            inline: false
        });

        message.channel.send({ embeds: [embed] });
    }
}

function getItemCount(mode) {
    var itemCount = 0;

    // load items.json
    const fs = require('fs');
    var itemFile = fs.readFileSync('res/items.json', 'utf-8');
    try {
        const itemData = JSON.parse(itemFile);

        // read all groups
        for (var i = 0; i < itemData.groups.length; i++) {
            var itemGroup = itemData.groups[i];

            // only use items in mode
            switch (mode) {
                case "Weapons":
                    if (itemGroup.name !== "Rifles" &&
                        itemGroup.name !== "Pistols" &&
                        itemGroup.name !== "Shotguns" &&
                        itemGroup.name !== "Melee" &&
                        itemGroup.name !== "Bows")
                        continue;
                    break;
                case "Tools":
                    if (itemGroup.name !== "Tools")
                        continue;
                    break;
                case "Consumables":
                    if (itemGroup.name !== "Consumables")
                        continue;
                    break;
                default:
                    break;
            }

            // read all items
            for (var j = 0; j < itemGroup.items.length; j++) {
                var item = itemGroup.items[j];

                // read all variants
                for (var k = 0; k < item.variants.length; k++) {
                    itemCount++;
                }
            }
        }
    } catch (err) {
        console.error(err);
    }
    return itemCount;
}

/**
 * 
 * Searches for item with specified itemId in modes {"Weapons", "Tools, "Consumables"}
 * 
 * @param {*} itemId 
 * @param {*} mode 
 * @returns [itemGroup, item, variant, ammoTypes]
 */
function getItem(itemId, mode) {
    var itemCount = 0;

    // load items.json
    const fs = require('fs');
    var itemFile = fs.readFileSync('res/items.json', 'utf-8');
    try {
        const itemData = JSON.parse(itemFile);

        // read all groups
        for (var i = 0; i < itemData.groups.length; i++) {
            var itemGroup = itemData.groups[i];

            // only use items in mode
            switch (mode) {
                case "Weapons":
                    if (itemGroup.name !== "Rifles" &&
                        itemGroup.name !== "Pistols" &&
                        itemGroup.name !== "Shotguns" &&
                        itemGroup.name !== "Melee" &&
                        itemGroup.name !== "Bows")
                        continue;
                    break;
                case "Tools":
                    if (itemGroup.name !== "Tools")
                        continue;
                    break;
                case "Consumables":
                    if (itemGroup.name !== "Consumables")
                        continue;
                    break;
                default:
                    break;
            }

            // read all items
            for (var j = 0; j < itemGroup.items.length; j++) {
                var item = itemGroup.items[j];

                // read all variants
                for (var k = 0; k < item.variants.length; k++) {
                    itemCount++;
                    if (itemCount === itemId) {
                        var variant = item.variants[k];

                        // read all ammo types for shootable weapons
                        if (mode           === "Weapons" &&
                            itemGroup.name !== "Melee") {
                            
                            // get ammo count of weapon
                            var ammoCount = 0;
                            for (var l = 0; l < item.ammoTypes.length; l++) {
                                ammoCount++;
                            }

                            var ammoTypes = [];
                            var ammoId;
                            // pick ammo types
                            for (var m = 0; m < item.ammoSlots; m++) {

                                // different logic for LeMat
                                if (item.name === "LeMat Mark II") {
                                    while (true) {
                                        ammoId = Math.floor(Math.random() * ammoCount + 1);
                                        ammoCount = 0;

                                        for (var n = 0; n < item.ammoTypes.length; n++) {
                                            ammoCount++;
                                            if (ammoCount === ammoId) {
                                                ammoTypes[m] = item.ammoTypes[n];
                                            }
                                        }

                                        // find compact ammo
                                        if (m === 0 && ammoTypes[m].type === "Compact" ) {
                                            break;
                                        }

                                        // find shotgun ammo
                                        if (m === 1 && ammoTypes[m].type === "Shotgun" ) {
                                            break;
                                        }
                                    }
                                } else {

                                    ammoId = Math.floor(Math.random() * ammoCount + 1);
                                    ammoCount = 0;

                                    for (var n = 0; n < item.ammoTypes.length; n++) {
                                        ammoCount++;
                                        if (ammoCount === ammoId) {
                                            ammoTypes[m] = item.ammoTypes[n];
                                        }
                                    }
                                }
                            }

                            // determine whether weapon comes in dualies
                            var dualies = false;
                            if (itemGroup.name === "Pistols" &&
                                variant.slots  === 1) {
                                if (Math.random() < DUALIES_PROBABILITY) {
                                    dualies = true;
                                }
                            }
                            return [itemGroup, item, variant, ammoTypes, dualies];
                        }
                        
                        // return without ammo type for melee weapons
                        return [itemGroup, item, variant];
                    }
                }
            }
        }
    } catch (err) {
        console.error(err);
    }
}