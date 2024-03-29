const { MessageEmbed } = require("discord.js");
require('better-logging')(console);

module.exports = {
    name: 'list',
    description: "List all available items!",
    execute(message, args) {

        var argumentGroup = "";

        // read arguments
        for(var a = 0; a < args.length; a++) {
            var argSingleName = args[a];

            var argName = args[a].substr(0, args[a].indexOf('='));
            var argValue = args[a].split('=')[1];

            switch (argName) {
                case "-g":
                case "--group":
                    argumentGroup = argValue;
                    break;
                default:
                    break;
            }

            switch (argSingleName) {
                default:
                    break;
            }
        }

        // load items.json
        const fs = require('fs');
        const itemFile = fs.readFileSync('res/items.json', 'utf-8');
        try {
            const itemData = JSON.parse(itemFile);

            // list all groups
            for (var i = 0; i < itemData.groups.length; i++) {
                var itemGroup = itemData.groups[i];

                // only display group from passed argument
                if (argumentGroup !== "" && argumentGroup !== itemGroup.name) {
                    continue;
                }

                const embed = new MessageEmbed()
                    .setTitle("📘 " + itemGroup.name)
                    .setDescription("List of items in group `" + itemGroup.name + "`")
                    .setColor("#5699c7")
                    .setTimestamp();
                
                // list all items
                for (var j = 0; j < itemGroup.items.length; j++) {
                    var item = itemGroup.items[j];

                    var variantString = "";

                    // list all variants
                    for (var k = 0; k < item.variants.length; k++) {
                        var variant = item.variants[k];

                        variantString = variantString + "• " + variant.name + " `" + variant.price + "$`" + "\n";
                    }
                    
                    embed.addFields({
                        name: item.name,
                        value: variantString,
                        inline: true
                    });
                }
                
                message.channel.send({ embeds: [embed] });
            }
        } catch (err) {
            console.error(err);
        }
    }
}