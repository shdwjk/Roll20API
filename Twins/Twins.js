// Github:   https://github.com/shdwjk/Roll20API/blob/master/Twins/Twins.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var Twins = Twins || (function() {
    'use strict';

    var version = '0.2.1',
        lastUpdate = 1427604278,
        schemaVersion = 0.1,

        props = [
            'left', // X Position
            'top', // Y Position
            'width', // Token Width
            'height', // Token Height 
            'rotation', // Token Rotation
            'layer', // What layer the token is on
            'isdrawing', // If the token is a drawing
            'flipv', // Vertical mirroring
            'fliph', // Horizontal Mirroring
            'bar1_value', // Current value of Bar 1
            'bar1_max', // Max value of Bar 1
            'bar1_link', // What stat Bar 1 is linked to.
            'showplayers_bar1', // Should players see Bar 1
            'playersedit_bar1', // Can players edit Bar 1?
            'bar2_value', 'bar2_max', 'bar2_link',
            'showplayers_bar2','playersedit_bar2', // Same for Bar 2
            'bar3_value', 'bar3_max', 'bar3_link',
            'showplayers_bar3', 'playersedit_bar3', // And Bar 3
            'aura1_radius', // Aura 1 Radius
            'aura1_color', // Aura 1 Color
            'aura1_square', // Is Aura 1 a square?
            'showplayers_aura1', // Should players see Aura 1
            'playersedit_aura1', // Can players edit Aura 1
            'aura2_radius', 'aura2_color', 'aura2_square',
            'showplayers_aura2', 'playersedit_aura2',//Same for Aura 2
            'tint_color', // The token's tint
            'statusmarkers', // What status markers the token has
            'showplayers_name', // Can players see the name?
            'playersedit_name', // Can players edit the name?
            'lastmove', // The token's last move (I think)
            // Old Dynamic Lighting
            'light_radius', // Emits light to this distance
            'light_dimradius', // Emits dim light to this distance
            'light_otherplayers', // Can other players see the light
            'light_hassight', // Does the token have light?
            'light_angle', // What angle is the light projected to?
            'light_losangle', // What angle can the token see?
            // New Dynamic Lighting
            'has_bright_light_vision', // Toggles Vision (Bool)
            'has_night_vision', // Toggles night vision (bool)
            'night_vision_distance', // How far night vision works. (Int)
            'emits_bright_light', // Toggles light emission (bool)
            'bright_light_distance', // How far the bright light emits (int)
            'emits_low_light', //  Toggles dim light emission (bool)
            'low_light_distance', // How far the dim light emits (int)
            // New Dynamic Lighting: Directional stuff.
            'has_limit_field_of_vision', // Limited FOV (bool)
            'limit_field_of_vision_center', // Center of FOV (int)
            'limit_field_of_vision_total', // FOV Size (int)
            'has_limit_field_of_night_vision', // Limited night vision FOV (bool)
            'limit_field_of_night_vision_center', // Center of night FOV (int)
            'limit_field_of_night_vision_total', // Night FOV size (int)
            'has_directional_bright_light', // What it says (bool)
            'directional_bright_light_center', // Center of bright light (int)
            'directional_bright_light_total', // Total bright light size (int)
            'has_directional_dim_light', // Again, what it says. (bool)
            'directional_dim_light_center', // Center of dim light (int)
            'directional_dim_light_total' // Total dim light size (int)
        ],



    checkInstall = function() {
        log('-=> Twins v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'Twins') || state.Twins.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.Twins = {
                version: schemaVersion,
                twins: {}
            };
        }
    },

    removeTwins = function(id) {
        _.chain(state.Twins.twins)
            .map(function(v,k){
                if(id === k || id === v) {
                    return k;
                }
                return undefined;
            })
            .reject(_.isUndefined)
            .each(function(v){
                sendChat('Twins', '/w gm Removing twins for: '+v);
                delete state.Twins.twins[v];
            });
    },

    handleInput = function(msg) {
        var args,t1,t2;

        if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
            return;
        }

        args = msg.content.split(/\s+/);
        switch(args.shift()) {
            case '!twins':
                if(args.length !== 2) {
                   sendChat('Twins', '/w gm Please specify two token IDs as arugment to !twins');
                   return;
                }

                t1 = getObj('graphic', args[0]);
                t2 = getObj('graphic', args[1]);

                if(t1 && t2){
                    removeTwins(args[0]);
                    removeTwins(args[1]);
                    sendChat('Twins', '/w gm Added Twins.');
                    state.Twins.twins[args[0]]=args[1];
                } else {
                    if(!t1) {
                       sendChat('Twins', '/w gm Could not find a token for: '+args[0]);
                    }
                    if(!t2) {
                       sendChat('Twins', '/w gm Could not find a token for: '+args[1]);
                    }
                }

                break;

            case '!not-twins':
                if(args.length !== 1) {
                   sendChat('Twins', '/w gm Please specify one token ID to remove.');
                   return;
                }
                removeTwins(args[0]);
                break;
        }
    },

    handleRemoveToken = function(obj) {
        removeTwins(obj.id);
    },

    handleTwinChange = function(obj) {
        _.find(state.Twins.twins,function(lhs,rhs){
            var twin;
            if(obj.id === lhs){
                twin = getObj('graphic',rhs);
            } else if(obj.id === rhs) {
                twin = getObj('graphic',lhs);
            }
            if(twin) {
                twin.set(_.reduce(props,function(m,p){
                    m[p]=obj.get(p);
                    return m;
                },{}));
                
                return true;
            }
            return false;
        });
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
        on('change:graphic', handleTwinChange);
        on('destroy:graphic', handleRemoveToken);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on("ready",function(){
	'use strict';

    Twins.CheckInstall();
    Twins.RegisterEventHandlers();
});
