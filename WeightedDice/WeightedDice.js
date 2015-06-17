// Github:   https://github.com/shdwjk/Roll20API/blob/master/WeightedDice/WeightedDice.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var WeightedDice = WeightedDice || (function(){
    "use strict";
    
    var version = '0.3.0',
        lastUpdate = 1434511712,
        schemaVersion = 0.1,

    checkInstall = function() {
        log('-=> WeightedDice v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'WeightedDice') || state.WeightedDice.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
			state.WeightedDice = {
				version: WeightedDice.schemaVersion
			};
		}
	},
    
    handleInput = function(tokens) {
        var sides = parseInt(tokens[0],10),
            minroll = parseInt(tokens[1],10),
            tableName,
            tables,
            newTable,
            weight;

        if(
            tokens.length <2 
            || 2 !== tokens.length 
            || _.isNull(sides) 
            || !_.isNumber(sides) 
            || _.isNull(minroll) 
            || !_.isNumber(minroll) 
            || sides < minroll
        ) {
            sendChat('','/w gm Usage: !weighted-die [number of sides] [minimum roll number]');
            return;
        }
        
        tableName='d'+sides+'min'+minroll;
        // see if it's already defined
        tables=findObjs({type: 'rollabletable', name: tableName});
        if(tables.length) {
            sendChat('','/w gm Table '+tableName+' already exists.');
        } else {
            newTable=createObj('rollabletable',{name: tableName});
            _.each(_.range(minroll,(sides+1)), function(r){
                weight = ( (r === minroll) ? minroll : 1);
                createObj('tableitem',{
                    _rollabletableid: newTable.id,
                    name: r,
                    weight: weight
                });
            });
            sendChat('','/w gm Table '+tableName+' created.');
        }
    },
    
    registerEventHandlers = function() {        
		on("chat:message", function (msg) {
            var tokenized, command;
			/* Exit if not an api command */
			if (msg.type !== "api") {
                return;
            }


			tokenized = msg.content.split(" ");
			command = tokenized[0];

			switch(command) {
				case "!weighted-die":
					if(playerIsGM(msg.playerid)) {
						handleInput(_.rest(tokenized),msg);
					}
					break;
			}
		});
	};

    return {
        RegisterEventHandlers: registerEventHandlers,
        CheckInstall: checkInstall
    };
}());

on("ready",function(){
    "use strict";

    WeightedDice.CheckInstall(); 
    WeightedDice.RegisterEventHandlers();
});
