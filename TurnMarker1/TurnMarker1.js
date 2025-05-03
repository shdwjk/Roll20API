// Github:   https://github.com/shdwjk/Roll20API/blob/master/TurnMarker1/TurnMarker1.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

/* global GroupInitiative:false Mark:false */
/*  ############################################################### */
/*  TurnMarker */
/*  ############################################################### */

var TurnMarker = TurnMarker || (function(){
    "use strict";

    var version = '1.3.12a',
        lastUpdate = 1643855734,
        schemaVersion = 1.18,
        active = false,
        threadSync = 1,
        autoPullOptions = {
            'none' : 'None',
            'npcs' : 'NPCs',
            'all'  : 'All'
        },

    sendPlayerPing = (left, top, pageid, playerid) => {
        sendPing(left,top,pageid,null,true,[playerid]);
    },

    getGMPlayers = (pageid) => findObjs({type:'player'})
        .filter((p)=>playerIsGM(p.id))
        .filter((p)=>undefined === pageid || p.get('lastpage') === pageid)
        .map(p=>p.id)
    ,

    sendGMPing = (left, top, pageid, playerid=null, moveAll=false) => {
        let players = getGMPlayers(pageid);
        if(players.length){
            sendPing(left,top,pageid,playerid,moveAll,players);
        }
    },

    checkInstall = function() {
        log('-=> TurnMarker v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! state.hasOwnProperty('TurnMarker') || state.TurnMarker.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.TurnMarker && state.TurnMarker.version) {
                case 1.16:
                    state.TurnMarker.autoPull = 'none';
                    /* falls through */

                case 'UpdateSchemaVersion':
                    state.TurnMarker.version = schemaVersion;
                    break;

                default:
                    state.TurnMarker = {
                        version: schemaVersion,
                        announceRounds: true,
                        announceTurnChange: true,
                        announcePlayerInTurnAnnounce: true,
                        announcePlayerInTurnAnnounceSize: '100%',
                        autoPull: 'none',
                        autoskipHidden: true,
                        tokenName: 'Round',
                        tokenURL: 'https://s3.amazonaws.com/files.d20.io/images/4095816/086YSl3v0Kz3SlDAu245Vg/thumb.png?1400535580',
                        playAnimations: false,
                        rotation: false,
                        animationSpeed: 5,
                        scale: 1.7,
                        aura1: {
                            pulse: false,
                            size: 5,
                            color: '#ff00ff'
                        },
                        aura2: {
                            pulse: false,
                            size: 5,
                            color: '#00ff00'
                        }
                    };
                    break;
            }
        }
        if(Campaign().get('turnorder') ==='') {
            Campaign().set('turnorder','[]');
        }
        if('undefined' !== typeof GroupInitiative && GroupInitiative.ObserveTurnOrderChange){
            GroupInitiative.ObserveTurnOrderChange(handleExternalTurnOrderChange);
        }
    },

    showHelp = function(who) {
        var marker = getMarker();
        var rounds =parseInt(marker.get('bar2_value'),10);
        sendChat('',
            '/w "'+who+'" '+
'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
    '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
        'TurnMarker v'+version+
    '</div>'+
    '<b>Commands</b>'+
    '<div style="padding-left:10px;"><b><span style="font-family: serif;">!tm</span></b>'+
        '<div style="padding-left: 10px;padding-right:20px">'+
            'The following arguments may be supplied in order to change the configuration.  All changes are persisted between script restarts.'+
            '<ul>'+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;"><span style="color: blue; font-weight:bold; padding: 0px 4px;">'+rounds+'</span></div>'+
                '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">reset &lbrack;#&rbrack;</span></b> -- Sets the round counter back to 0 or the supplied #.</li> '+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;"><span style="color: blue; font-weight:bold; padding: 0px 4px;">'+autoPullOptions[state.TurnMarker.autoPull]+'</span></div>'+
                '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">autopull &lt;mode&gt;</span></b> -- Sets auto pulling to the token whose turn it is.  Modes: '+_.keys(autoPullOptions)+'</li> '+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.TurnMarker.announceRounds ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'+
                '<li style="border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">toggle-announce</span></b> -- When on, each round will be announced to chat.</li>'+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.TurnMarker.announceTurnChange ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'+
                '<li style="border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">toggle-announce-turn</span></b> -- When on, the transition between visible turns will be announced.</li> '+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.TurnMarker.announcePlayerInTurnAnnounce ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'+
                '<li style="border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">toggle-announce-player</span></b> -- When on, the player(s) controlling the current turn are included in the turn announcement.</li> '+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.TurnMarker.autoskipHidden ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'+
                '<li style="border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">toggle-skip-hidden</span></b> -- When on, turn order will automatically be advanced past any hidden turns.</li> '+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.TurnMarker.playAnimations ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'+
                '<li style="border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">toggle-animations</span></b> -- Turns on turn marker animations. [Experimental!]</li> '+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.TurnMarker.rotation ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'+
                '<li style="border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">toggle-rotate</span></b> -- When on, the turn marker will rotate slowly clockwise. [Animation]</li> '+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.TurnMarker.aura1.pulse ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'+
                '<li style="border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">toggle-aura-1</span></b> -- When on, aura 1 will pulse in and out. [Animation]</li> '+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.TurnMarker.aura2.pulse ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'+
                '<li style="border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">toggle-aura-2</span></b> -- When on, aura 2 will pulse in and out. [Animation]</li> '+
            '</ul>'+
        '</div>'+
    '</div>'+
    '<div style="padding-left:10px;"><b><span style="font-family: serif;">!eot</span></b>'+
        '<div style="padding-left: 10px;padding-right:20px;">'+
            'Players may execute this command to advance the initiative to the next turn.  This only succeeds if the current token is one that the caller controls or if it is executed by a GM.'+
        '</div>'+
    '</div>'+
    '<div style="padding-left:10px;"><b><span style="font-family: serif;">!pot</span></b>'+
        '<div style="padding-left: 10px;padding-right:20px;">'+
            'Players may execute this command to back up the initiative to the previous turn.  This only succeeds if the current token is one that the caller controls or if it is executed by a GM.'+
        '</div>'+
    '</div>'+
'</div>'
            );
    },

    handleInput = function(msg){
        var who, tokenized, command;

        if (msg.type !== "api") {
            return;
        }

        who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
        tokenized = msg.content.split(/\s+/);
        command = tokenized[0];

        switch(command) {
            case "!tm":
            case "!turnmarker": {
                    let tokens=_.rest(tokenized),marker,value;
                    switch (tokens[0]) {
                        case 'reset':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            marker = getMarker();
                            value = parseInt(tokens[1],10)||0;
                            marker.set({
                                name: state.TurnMarker.tokenName+' '+value,
                                bar2_value: value
                            });
                            sendChat('','/w "'+who+'" <b>Round</b> count is reset to <b>'+value+'</b>.');
                            break;

                        case 'ping-target':
                            var obj=getObj('graphic',tokens[1]);
                            if(obj){
    const playerCanControl = (obj, playerid='any') => {
        const playerInControlledByList = (list, playerid) => list.includes('all') || list.includes(playerid) || ('any'===playerid && list.length);
        let players = obj.get('controlledby')
            .split(/,/)
            .filter(s=>s.length);

        if(playerInControlledByList(players,playerid)){
            return true;
        }

        if('' !== obj.get('represents') ) {
            players = (getObj('character',obj.get('represents')) || {get: function(){return '';} } )
                .get('controlledby').split(/,/)
                .filter(s=>s.length);
            return  playerInControlledByList(players,playerid);
        }
        return false;
    };

                              if(playerIsGM(msg.playerid)){
                                sendGMPing(obj.get('left'),obj.get('top'),obj.get('pageid'),null,true);
                              } else if(playerCanControl(obj)){
                                sendPlayerPing(obj.get('left'),obj.get('top'),obj.get('pageid'),msg.playerid);
                              }
                            }
                            break;

                        case 'autopull':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            if(_.contains(_.keys(autoPullOptions), tokens[1])){
                                state.TurnMarker.autoPull=tokens[1];
                                sendChat('','/w "'+who+'" <b>AutoPull</b> is now <b>'+(autoPullOptions[state.TurnMarker.autoPull])+'</b>.');
                            } else {
                                sendChat('','/w "'+who+'" "'+tokens[1]+'" is not a valid <b>AutoPull</b> options.  Please specify one of: '+_.keys(autoPullOptions).join(', ')+'</b>.');
                            }
                            break;

                        case 'toggle-announce':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            state.TurnMarker.announceRounds=!state.TurnMarker.announceRounds;
                            sendChat('','/w "'+who+'" <b>Announce Rounds</b> is now <b>'+(state.TurnMarker.announceRounds ? 'ON':'OFF' )+'</b>.');
                            break;

                        case 'toggle-announce-turn':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            state.TurnMarker.announceTurnChange=!state.TurnMarker.announceTurnChange;
                            sendChat('','/w "'+who+'" <b>Announce Turn Changes</b> is now <b>'+(state.TurnMarker.announceTurnChange ? 'ON':'OFF' )+'</b>.');
                            break;

                        case 'toggle-announce-player':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            state.TurnMarker.announcePlayerInTurnAnnounce=!state.TurnMarker.announcePlayerInTurnAnnounce;
                            sendChat('','/w "'+who+'" <b>Player Name in Announce</b> is now <b>'+(state.TurnMarker.announcePlayerInTurnAnnounce ? 'ON':'OFF' )+'</b>.');
                            break;

                        case 'toggle-skip-hidden':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            state.TurnMarker.autoskipHidden=!state.TurnMarker.autoskipHidden;
                            sendChat('','/w "'+who+'" <b>Auto-skip Hidden</b> is now <b>'+(state.TurnMarker.autoskipHidden ? 'ON':'OFF' )+'</b>.');
                            break;

                        case 'toggle-animations':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            state.TurnMarker.playAnimations=!state.TurnMarker.playAnimations;
                            if(state.TurnMarker.playAnimations) {
                                stepAnimation(threadSync);
                            } else {
                                marker = getMarker();
                                marker.set({
                                    aura1_radius: '',
                                    aura2_radius: ''
                                });
                            }

                            sendChat('','/w "'+who+'" <b>Animations</b> are now <b>'+(state.TurnMarker.playAnimations ? 'ON':'OFF' )+'</b>.');
                            break;

                        case 'toggle-rotate':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            state.TurnMarker.rotation=!state.TurnMarker.rotation;
                            sendChat('','/w "'+who+'" <b>Rotation</b> is now <b>'+(state.TurnMarker.rotation ? 'ON':'OFF' )+'</b>.');
                            break;

                        case 'toggle-aura-1':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            state.TurnMarker.aura1.pulse=!state.TurnMarker.aura1.pulse;
                            sendChat('','/w "'+who+'" <b>Aura 1</b> is now <b>'+(state.TurnMarker.aura1.pulse ? 'ON':'OFF' )+'</b>.');
                            break;

                        case 'toggle-aura-2':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            state.TurnMarker.aura2.pulse=!state.TurnMarker.aura2.pulse;
                            sendChat('','/w "'+who+'" <b>Aura 2</b> is now <b>'+(state.TurnMarker.aura2.pulse ? 'ON':'OFF' )+'</b>.');
                            break;

                        default:
                        case 'help':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            showHelp(who);
                            break;

                    }
                }
                break;

            case "!eot":
                requestTurnAdvancement(msg.playerid);
                break;
            case "!pot":
                requestTurnRetreat(msg.playerid);
                break;
        }
    },

    getMarker = function(){
        var marker = findObjs({
            imgsrc: state.TurnMarker.tokenURL,
            pageid: Campaign().get("playerpageid")
        })[0];

        if (marker === undefined) {
            marker = createObj('graphic', {
                name: state.TurnMarker.tokenName+' 0',
                pageid: Campaign().get("playerpageid"),
                layer: 'gmlayer',
                imgsrc: state.TurnMarker.tokenURL,
                left: 0,
                top: 0,
                lastmove:'0,0',
                height: 70,
                width: 70,
                bar2_value: 0,
                showplayers_name: true,
                showplayers_aura1: true,
                showplayers_aura2: true
            });
        }
        if(!TurnOrder.HasTurn(marker.id)) {
            TurnOrder.AddTurn({
                id: marker.id,
                pr: -1,
                custom: "",
                _pageid: marker.get('pageid')
            });
        }
        return marker;
    },

    stepAnimation = function( sync ){
        if (!state.TurnMarker.playAnimations || sync !== threadSync) {
            return;
        }
        var marker=getMarker();
        if(active === true) {
            var rotation=(marker.get('bar1_value')+state.TurnMarker.animationSpeed)%360;
            marker.set('bar1_value', rotation );
            if(state.TurnMarker.rotation) {
                marker.set( 'rotation', rotation );
            }
            if( state.TurnMarker.aura1.pulse ) {
                marker.set('aura1_radius', Math.abs(Math.sin(rotation * (Math.PI/180))) * state.TurnMarker.aura1.size );
            } else {
                marker.set('aura1_radius','');
            }
            if( state.TurnMarker.aura2.pulse  ) {
                marker.set('aura2_radius', Math.abs(Math.cos(rotation * (Math.PI/180))) * state.TurnMarker.aura2.size );
            } else {
                marker.set('aura2_radius','');
            }
            setTimeout(_.bind(stepAnimation,this,sync), 100);
        }
    },
    checkForTokenMove = function(obj){
        var turnOrder, current, marker;
        if(active) {
            turnOrder = TurnOrder.Get();
            current = _.first(turnOrder);
            if( obj && current && current.id === obj.id) {
               threadSync++;

                marker = getMarker();
                marker.set({
                    lastmove: obj.get('lastmove'),
                    layer: obj.get("layer"),
                    top: obj.get("top"),
                    left: obj.get("left")
                });

               setTimeout(_.bind(stepAnimation,this,threadSync), 300);
            }
        }
    },
    requestTurnRetreat = function(playerid){
        if(active) {
            let turnOrder = TurnOrder.Get();
            let previous = getObj('graphic', (((turnOrder||[]).pop())||{}).id );
            let character = getObj('character',(previous && previous.get('represents')));
            if(playerIsGM(playerid) ||
                ( previous &&
                       ( _.contains(previous.get('controlledby').split(','),playerid) ||
                       _.contains(previous.get('controlledby').split(','),'all') )
                    ) ||
                ( character &&
                       ( _.contains(character.get('controlledby').split(','),playerid) ||
                       _.contains(character.get('controlledby').split(','),'all') )
                    )
                )
            {
                TurnOrder.Prev();
                turnOrderChange(true,true);
            }
        }
    },
    requestTurnAdvancement = function(playerid){
        if(active) {
            let turnOrder = TurnOrder.Get();
            let current = getObj('graphic', (((turnOrder||[]).shift())||{}).id );
            let character = getObj('character',(current && current.get('represents')));
            if(playerIsGM(playerid) ||
                ( current &&
                       ( _.contains(current.get('controlledby').split(','),playerid) ||
                       _.contains(current.get('controlledby').split(','),'all') )
                    ) ||
                ( character &&
                       ( _.contains(character.get('controlledby').split(','),playerid) ||
                       _.contains(character.get('controlledby').split(','),'all') )
                    )
                )
            {
                TurnOrder.Next();
                turnOrderChange(true);
            }
        }
    },
    announceRound = function(round){
        if(state.TurnMarker.announceRounds) {
            sendChat(
                '',
                "/direct "+
                "<div style='"+
                    'background-color: #3d3d3d;'+
                    'border-radius: 3px;'+
                    'font-size: 20px;'+
                    'text-align:center;'+
                    'vertical-align: top;'+
                    'color: white;'+
                    'font-weight:bold;'+
                    'padding: 5px 5px;'+
                "'>"+
                    "<img src='"+state.TurnMarker.tokenURL+"' style='width:20px; height:20px; padding: 0px 5px;' />"+
                    "Round "+ round +
                    "<img src='"+state.TurnMarker.tokenURL+"' style='width:20px; height:20px; padding: 0px 5px;' />"+
                "</div>"+
                '<a style="position:relative;z-index:10000; top:-3.1em; float: right;font-size: .6em; color: white; border: 0px; border-radius: 3px; margin: 0 .1em; font-weight: bold; padding: .1em .4em;background-color:#616161;right:5px;" href="!tm reset ?{Round number|0}">Reset &'+'#x21ba;</a>'
            );
        }
    },

    turnOrderChange = function(FirstTurnChanged,backwards=false){
        var marker = getMarker();

        if( !Campaign().get('initiativepage') ) {
            return;
        }

        var turnOrder = TurnOrder.Get();

        if (!turnOrder.length) {
            return;
        }

        var current = _.first(turnOrder);

        if(state.TurnMarker.playAnimations) {
            threadSync++;
            setTimeout(_.bind(stepAnimation,this,threadSync), 300);
        }

        if (current.id === "-1") {
            return;
        }

        handleMarkerTurn(backwards);

        if(state.TurnMarker.autoskipHidden) {
            TurnOrder.NextVisible();
            handleMarkerTurn(backwards);
        }

        turnOrder=TurnOrder.Get();

        if(turnOrder[0].id === marker.id) {
            return;
        }

        current = _.first(TurnOrder.Get());

        var currentToken = getObj("graphic", turnOrder[0].id),
            currentChar = getObj('character', (currentToken||{get:_.noop}).get('represents'));
        if(currentToken) {

            if(FirstTurnChanged) {
                handleAnnounceTurnChange();
            }

            var size = Math.max(currentToken.get("height"),currentToken.get("width")) * state.TurnMarker.scale;

            if (marker.get("layer") === "gmlayer" && currentToken.get("layer") !== "gmlayer") {
                marker.set({
                    lastmove:`${marker.get('left')},${marker.get('top')}`,
                    top: currentToken.get("top"),
                    left: currentToken.get("left"),
                    height: size,
                    width: size
                });
                setTimeout(function() {
                    marker.set({
                        "layer": currentToken.get("layer")
                    });
                }, 500);
            } else {
                marker.set({
                    lastmove:`${marker.get('left')},${marker.get('top')}`,
                    layer: currentToken.get("layer"),
                    top: currentToken.get("top"),
                    left: currentToken.get("left"),
                    height: size,
                    width: size
                });
            }
            toFront(currentToken);

            if( 'all' === state.TurnMarker.autoPull ||
                ('npcs' === state.TurnMarker.autoPull && (
                    '' === currentToken.get('controlledby') &&
                    ( !currentChar || '' === currentChar.get('controlledby'))
                ))
            ){
                sendGMPing(currentToken.get('left'),currentToken.get('top'),currentToken.get('pageid'),null,true);
            }
        }
    },

    handleDestroyGraphic = function(obj){
        if(TurnOrder.HasTurn(obj.id)){
            let prev=JSON.parse(JSON.stringify(Campaign()));
            TurnOrder.RemoveTurn(obj.id);
            handleTurnOrderChange(Campaign(),prev);
        }
    },

    handleTurnOrderChange = function(obj, prev) {
        var prevOrder=JSON.parse(prev.turnorder||'[]');
        var objOrder=JSON.parse(obj.get('turnorder')||'[]');

        if( _.isArray(prevOrder) &&
            _.isArray(objOrder) &&
            prevOrder.length &&
            objOrder.length &&
            objOrder[0].id !== prevOrder[0].id
          ) {
            turnOrderChange(true);
        }
    },

    handleExternalTurnOrderChange = function() {
        var marker = getMarker(),
            turnorder = Campaign().get('turnorder'),
            markerTurn;

        turnorder = ('' === turnorder) ? [] : JSON.parse(turnorder);
        markerTurn = _.filter(turnorder, function(i){
            return marker.id === i.id;
        })[0];

        if(markerTurn.pr !== -1){
            markerTurn.pr = -1;
            turnorder =_.union([markerTurn], _.reject(turnorder, function(i){
                return marker.id === i.id || (getObj('graphic',i.id)||{get:_.noop}).get('imgsrc')===state.TurnMarker.tokenURL;
            }));
            Campaign().set('turnorder',JSON.stringify(turnorder));
        }
        _.defer(dispatchInitiativePage);
    },

    handleMarkerTurn = function(backwards = false){
        var marker = getMarker(),
            turnOrder = TurnOrder.Get(),
            round;

        if(turnOrder[0].id === marker.id) {
            round=(parseInt(marker.get('bar2_value'))||0)+ (backwards ? -1 : 1);
            marker.set({
                name: state.TurnMarker.tokenName+' '+round,
                bar2_value: round
            });
            announceRound(round);
            if(backwards) {
                TurnOrder.Prev();
            } else {
                TurnOrder.Next();
            }
        }
    },
    handleAnnounceTurnChange = function(){

        if(state.TurnMarker.announceTurnChange ) {
            var marker = getMarker();
            var turnOrder = TurnOrder.Get();
            var currentToken = getObj("graphic", turnOrder[0].id);
            if('gmlayer' === currentToken.get('layer')) {
                return;
            }
            var previousTurn=_.last(_.filter(turnOrder,function(element){
                var token=getObj("graphic", element.id);
                return token &&
                    token.get('layer') !== 'gmlayer' &&
                    element.id !== marker.id;
            }));

            /* find previous token. */
            var previousToken = getObj("graphic", previousTurn.id);
            var pImage=previousToken.get('imgsrc');
            var cImage=currentToken.get('imgsrc');
            var pRatio=previousToken.get('width')/previousToken.get('height');
            var cRatio=currentToken.get('width')/currentToken.get('height');

            var pNameString='<span style=\''+
                    'font-weight: bold;'+
                '\'>'+
                    previousToken.get('name')+
                '</span>\'s turn is done.';
            if(previousToken && previousToken.get('showplayers_name')) {
                pNameString='<span style=\''+
                        'font-weight: bold;'+
                    '\'>'+
                        previousToken.get('name')+
                    '</span>\'s turn is done.';
            }

            var cNameString='<span style=\''+
                'font-weight: bold;'+
            '\'>'+
                currentToken.get('name')+
            '</span> it\'s now your turn!';
            if(currentToken && currentToken.get('showplayers_name')) {
                cNameString='<span style=\''+
                    'font-weight: bold;'+
                '\'>'+
                    currentToken.get('name')+
                '</span> it\'s now your turn!';
            }


            var PlayerAnnounceExtra='<a style="float: left;font-size: 1em;color: #b6b6b6;border: 0px;border-radius: 3em;margin: 0 0.1em;font-weight: bold;padding: 0.25em 1em;background-color: transparent;text-decoration: none;position: absolute;top: 65px;" href="!pot">&'+'#x276E; Prev</a><a style="font-size: 1em;color: #f1672c;border: 0px;border-radius: 3em;margin: 0 0.1em;font-weight: bold;padding: 0.25em 1em;background-color: transparent;text-decoration: none;position: absolute;top: 65px;right: 0px;" href="!eot">Next &'+'#x276F;</a>';
            if(state.TurnMarker.announcePlayerInTurnAnnounce) {
                var Char=currentToken.get('represents');
                if(Char) {
                    Char=getObj('character',Char);
                    if(Char && _.isFunction(Char.get)) {
                        var Controllers=Char.get('controlledby').split(',');
                        _.each(Controllers,function(c){
                            switch(c) {
                                case 'all':
                                    PlayerAnnounceExtra+='<div style="'+
                                            'padding: 0px 5px;'+
                                            'font-weight: bold;'+
                                            'text-align: center;'+
                                            'font-size: '+state.TurnMarker.announcePlayerInTurnAnnounceSize+';'+
                                            'border: 5px solid black;'+
                                            'background-color: white;'+
                                            'color: black;'+
                                            'letter-spacing: 3px;'+
                                            'line-height: 130%;'+
                                            'display:none;'+
                                        '">'+
                                            'All'+
                                        '</div>';
                                    break;

                                default:
                                    var player=getObj('player',c);
                                    if(player) {
                                        var PlayerColor=player.get('color');
                                        var PlayerName=player.get('displayname');
                                        PlayerAnnounceExtra+='<div style="'+
                                                'padding: 5px;'+
                                                'text-align: center;'+
                                                'font-size: '+state.TurnMarker.announcePlayerInTurnAnnounceSize+';'+
                                                'background-color: '+PlayerColor+';'+
                                                'text-shadow: '+
                                                    '-1px -1px 1px #000,'+
                                                    ' 1px -1px 1px #000,'+
                                                    '-1px  1px 1px #000,'+
                                                    ' 1px  1px 1px #000;'+
                                                'letter-spacing: 3px;'+
                                                'line-height: 130%;'+
                                                'display:none;'+
                                            '">'+
                                                PlayerName+
                                            '</div>';
                                    }
                                    break;
                            }
                        });
                    }
                }
            }

            var tokenSize=70;
            sendChat(
                '',
                "/direct "+
                "<div style='border: 1px solid #808080; border-radius: 3px; color: #3d3d3d; padding: 1px 1px; box-sizing: border-box; position:relative;'>"+
                    '<div style="font-size: 80%;background: #ccc;color: #8c8c8c;width: 100%;">'+
                        '<a style="background-color: transparent;border: 0;padding: 0;margin: 0;display: inline-block;vertical-align: middle;" href="!tm ping-target '+previousToken.id+'">'+
                            "<img src='"+pImage+"' style='width:25px; height:25px; padding: 2px 5px;;' />"+
                        '</a>'+
                         pNameString+
                    '</div>'+
                    '<div style="text-align: center;padding:1rem 0;">'+
                        '<a style="display: block;background: none;border: 0px;" href="!tm ping-target '+currentToken.id+'">'+
                            "<img src='"+cImage+"' style='width:"+Math.round(tokenSize*cRatio)+"px; height:"+tokenSize+"px; padding: 0px 2px;' />"+
                        '</a>'+
                         '<span style="">'+
                            cNameString+
                         '</span>'+
                        '<div style="clear:both;"></div>'+
                    '</div>'+
                     PlayerAnnounceExtra+
                    '<div style="clear:both;"></div>'+
                "</div>"
            );
        }
    },
    resetMarker = function() {
        active=false;
        threadSync++;

        var marker = getMarker();

        marker.set({
            layer: "gmlayer",
            aura1_radius: '',
            aura2_radius: '',
            left: 35,
            top: 35,
            height: 70,
            width: 70,
            rotation: 0,
            bar1_value: 0
        });
    },
    startMarker = function() {
        var marker = getMarker();

        if(state.TurnMarker.playAnimations && state.TurnMarker.aura1.pulse) {
            marker.set({
                aura1_radius: state.TurnMarker.aura1.size,
                aura1_color: state.TurnMarker.aura1.color
            });
        }
        if(state.TurnMarker.playAnimations && state.TurnMarker.aura2.pulse) {
            marker.set({
                aura2_radius: state.TurnMarker.aura2.size,
                aura2_color: state.TurnMarker.aura2.color
            });
        }
        active=true;
        stepAnimation(threadSync);
        turnOrderChange(true);
    },
    dispatchInitiativePage = function(){
        if( !Campaign().get('initiativepage') ) {
            resetMarker();
        } else {
            startMarker();
        }
    },
    registerEventHandlers = function(){
        on("change:campaign:initiativepage", dispatchInitiativePage );
        on("change:campaign:turnorder", handleTurnOrderChange );
        on("change:graphic:lastmove", checkForTokenMove );
        on("destroy:graphic", handleDestroyGraphic );
        on("chat:message", handleInput );

        dispatchInitiativePage();
    }
    ;

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers,
		TurnOrderChange: handleExternalTurnOrderChange
    };

}());

on("ready",function(){
    'use strict';

	TurnMarker.CheckInstall();
	TurnMarker.RegisterEventHandlers();
});

var TurnOrder = TurnOrder || (function() {
    "use strict";

    return {
        Get: function(){
            var to=Campaign().get("turnorder");
            to=(''===to ? '[]' : to);
            return JSON.parse(to);
        },
        Set: function(turnOrder){
            Campaign().set({turnorder: JSON.stringify(turnOrder)});
        },
        Next: function(){
            this.Set(TurnOrder.Get().rotate(1));
            if("undefined" !== typeof Mark && _.has(Mark,'Reset') && _.isFunction(Mark.Reset)) {
                Mark.Reset();
            }
        },
        Prev: function(){
            this.Set(TurnOrder.Get().rotate(-1));
            if("undefined" !== typeof Mark && _.has(Mark,'Reset') && _.isFunction(Mark.Reset)) {
                Mark.Reset();
            }
        },
        NextVisible: function(){
            var turns=this.Get();
            var context={skip: 0};
            var found=_.find(turns,function(element){
                var token=getObj("graphic", element.id);
                if(
                    (undefined !== token) &&
                    (token.get('layer')!=='gmlayer')
                )
                {
                    return true;
                }
                else
                {
                    this.skip++;
                }
            },context);
            if(undefined !== found && context.skip>0)
            {
                this.Set(turns.rotate(context.skip));
            }
        },
        HasTurn: function(id){
         return (_.filter(this.Get(),function(turn){
                return id === turn.id;
            }).length !== 0);
        },
        AddTurn: function(entry){
            var turnorder = this.Get();
            turnorder.push(entry);
            this.Set(turnorder);
        },
        RemoveTurn: function(id){
            this.Set(_.reject(this.Get(),(o)=>o.id===id));
        }

    };
}());

Object.defineProperty(Array.prototype, 'rotate', {
    enumerable: false,
    writable: true
});

Array.prototype.rotate = (function() {
    "use strict";
    var unshift = Array.prototype.unshift,
        splice = Array.prototype.splice;

    return function(count) {
        var len = this.length >> 0;
            count = count >> 0;

        unshift.apply(this, splice.call(this, count % len, len));
        return this;
    };
}());