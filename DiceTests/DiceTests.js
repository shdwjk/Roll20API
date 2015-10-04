// Github:   https://github.com/shdwjk/Roll20API/blob/master/DiceTests/DiceTests.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var DiceTests = DiceTests || (function() {
    'use strict';

    var version = '0.1.4',
        lastUpdate = 1443971819,
        schemaVersion = 0.1,
        testAttributes = [
            { name: 'Number', current: '18' },
            { name: 'ParenFloor', current: '(floor(1/2))' },
            { name: 'ParenCeil', current: '(ceil(1/2))' },
            { name: 'ParenRound', current: '(round(1/2))' },
            { name: 'ParenABS', current: '(abs(-1))' },

            { name: 'SpaceParenFloor', current: ' (floor(1/2))' },
            { name: 'SpaceParenCeil', current: ' (ceil(1/2))' },
            { name: 'SpaceParenRound', current: ' (round(1/2))' },
            { name: 'SpaceParenABS', current: ' (abs(-1))' },

            { name: 'ParenSpaceFloor', current: '( floor(1/2))' },
            { name: 'ParenSpaceCeil', current: '( ceil(1/2))' },
            { name: 'ParenSpaceRound', current: '( round(1/2))' },
            { name: 'ParenSpaceABS', current: '( abs(-1))' },

            { name: 'SpaceParenSpaceFloor', current: ' ( floor(1/2))' },
            { name: 'SpaceParenSpaceCeil', current: ' ( ceil(1/2))' },
            { name: 'SpaceParenSpaceRound', current: ' ( round(1/2))' },
            { name: 'SpaceParenSpaceABS', current: ' ( abs(-1))' }
        ],
        tests = [
            // dice tests
			{ expr: '[[[[1d1]]d1]]', worksInChat: true },
    		{ expr: '[[ [a] 1d1 ]]', worksInChat: true },
			{ expr: '[[[a] 1d1 ]]', worksInChat: false },
			{ expr: '[[1d1 ]]', worksInChat: true },
			{ expr: '[[ 1d1 ]]', worksInChat: true },
			{ expr: '[[d1 ]]', worksInChat: true },
			{ expr: '[[ d1 ]]', worksInChat: true },
			{ expr: '[[(1d1) ]]', worksInChat: true },
			{ expr: '[[ (1d1) ]]', worksInChat: true },
			{ expr: '[[{1d1} ]]', worksInChat: true },
			{ expr: '[[ {1d1} ]]', worksInChat: true },

            // function tests
            { expr: '(floor(1/2))', worksInChat: true },
            { expr: '(ceil(1/2))', worksInChat: true },
            { expr: '(round(1/2))', worksInChat: true },
            { expr: '(abs(-1))', worksInChat: true },
            { expr: '( floor(1/2))', worksInChat: true },
            { expr: '( ceil(1/2))', worksInChat: true },
            { expr: '( round(1/2))', worksInChat: true },
            { expr: '( abs(-1))', worksInChat: true },


            // Attribute tests
    		{ expr: '[[@{DiceTests|Number} ]]', worksInChat: true, attr: 'Number' },
    		{ expr: '[[ @{DiceTests|Number} ]]', worksInChat: true, attr: 'Number' },

    		{ expr: '[[@{DiceTests|ParenFloor} ]]', worksInChat: true, attr: 'ParenFloor' },
    		{ expr: '[[ @{DiceTests|ParenFloor} ]]', worksInChat: true, attr: 'ParenFloor' },
    		{ expr: '[[@{DiceTests|ParenCeil} ]]', worksInChat: true, attr: 'ParenCeil' },
    		{ expr: '[[ @{DiceTests|ParenCeil} ]]', worksInChat: true, attr: 'ParenCeil' },
    		{ expr: '[[@{DiceTests|ParenRound} ]]', worksInChat: true, attr: 'ParenRound' },
    		{ expr: '[[ @{DiceTests|ParenRound} ]]', worksInChat: true, attr: 'ParenRound' },
    		{ expr: '[[@{DiceTests|ParenABS} ]]', worksInChat: true, attr: 'ParenABS' },
    		{ expr: '[[ @{DiceTests|ParenABS} ]]', worksInChat: true, attr: 'ParenABS' },

    		{ expr: '[[@{DiceTests|SpaceParenFloor} ]]', worksInChat: true, attr: 'SpaceParenFloor' },
    		{ expr: '[[ @{DiceTests|SpaceParenFloor} ]]', worksInChat: true, attr: 'SpaceParenFloor' },
    		{ expr: '[[@{DiceTests|SpaceParenCeil} ]]', worksInChat: true, attr: 'SpaceParenCeil' },
    		{ expr: '[[ @{DiceTests|SpaceParenCeil} ]]', worksInChat: true, attr: 'SpaceParenCeil' },
    		{ expr: '[[@{DiceTests|SpaceParenRound} ]]', worksInChat: true, attr: 'SpaceParenRound' },
    		{ expr: '[[ @{DiceTests|SpaceParenRound} ]]', worksInChat: true, attr: 'SpaceParenRound' },
    		{ expr: '[[@{DiceTests|SpaceParenABS} ]]', worksInChat: true, attr: 'SpaceParenABS' },
    		{ expr: '[[ @{DiceTests|SpaceParenABS} ]]', worksInChat: true, attr: 'SpaceParenABS' },

    		{ expr: '[[@{DiceTests|ParenSpaceFloor} ]]', worksInChat: true, attr: 'ParenSpaceFloor' },
    		{ expr: '[[ @{DiceTests|ParenSpaceFloor} ]]', worksInChat: true, attr: 'ParenSpaceFloor' },
    		{ expr: '[[@{DiceTests|ParenSpaceCeil} ]]', worksInChat: true, attr: 'ParenSpaceCeil' },
    		{ expr: '[[ @{DiceTests|ParenSpaceCeil} ]]', worksInChat: true, attr: 'ParenSpaceCeil' },
    		{ expr: '[[@{DiceTests|ParenSpaceRound} ]]', worksInChat: true, attr: 'ParenSpaceRound' },
    		{ expr: '[[ @{DiceTests|ParenSpaceRound} ]]', worksInChat: true, attr: 'ParenSpaceRound' },
    		{ expr: '[[@{DiceTests|ParenSpaceABS} ]]', worksInChat: true, attr: 'ParenSpaceABS' },
    		{ expr: '[[ @{DiceTests|ParenSpaceABS} ]]', worksInChat: true, attr: 'ParenSpaceABS' },

    		{ expr: '[[@{DiceTests|SpaceParenSpaceFloor} ]]', worksInChat: true, attr: 'SpaceParenSpaceFloor' },
    		{ expr: '[[ @{DiceTests|SpaceParenSpaceFloor} ]]', worksInChat: true, attr: 'SpaceParenSpaceFloor' },
    		{ expr: '[[@{DiceTests|SpaceParenSpaceCeil} ]]', worksInChat: true, attr: 'SpaceParenSpaceCeil' },
    		{ expr: '[[ @{DiceTests|SpaceParenSpaceCeil} ]]', worksInChat: true, attr: 'SpaceParenSpaceCeil' },
    		{ expr: '[[@{DiceTests|SpaceParenSpaceRound} ]]', worksInChat: true, attr: 'SpaceParenSpaceRound' },
    		{ expr: '[[ @{DiceTests|SpaceParenSpaceRound} ]]', worksInChat: true, attr: 'SpaceParenSpaceRound' },
    		{ expr: '[[@{DiceTests|SpaceParenSpaceABS} ]]', worksInChat: true, attr: 'SpaceParenSpaceABS' },
    		{ expr: '[[ @{DiceTests|SpaceParenSpaceABS} ]]', worksInChat: true, attr: 'SpaceParenSpaceABS' }
		],

    checkInstall = function() {
		log('-=> DiceTests v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'DiceTests') || state.DiceTests.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.DiceTests = {
                version: schemaVersion
            };
        }

        // find test character or create it.
        var DTChar = findObjs({
            type: "character",
            name: "DiceTests"
            })[0];
        if(!DTChar) {
            DTChar = createObj('character',{
                name: "DiceTests"
            });
            log('DiceTests: Created test Character: DiceTests');
        }
        
        _.each(testAttributes, function(attrData){
            var a=findObjs({
                type: 'attribute',
                characterid: DTChar.id,
                name: attrData.name
            })[0];

            if(!a){
                a=createObj('attribute',_.defaults(attrData,{characterid:DTChar.id}));
                log('DiceTests: Created test Attribute: '+attrData.name);
            }
        });

    },

	esRE = function (s) {
	  var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
	  return s.replace(escapeForRegexp,"\\$1");
	},

	HE = (function(){
	  var entities={
			  //' ' : '&'+'nbsp'+';',
			  '<' : '&'+'lt'+';',
			  '>' : '&'+'gt'+';',
			  "'" : '&'+'#39'+';',
			  '@' : '&'+'#64'+';',
			  '{' : '&'+'#123'+';',
			  '|' : '&'+'#124'+';',
			  '}' : '&'+'#125'+';',
			  '[' : '&'+'#91'+';',
			  ']' : '&'+'#93'+';',
			  '"' : '&'+'quot'+';'
		  },
		  re=new RegExp('('+_.map(_.keys(entities),esRE).join('|')+')','g');
	  return function(s){
		return s.replace(re, function(c){ return entities[c] || c; });
	  };
	}()),

    doTests = function() {
        var results = [],
            done=_.after(tests.length,function(){
                var o='<div style="'+
                    'background-color:#ffffee;'+
                    'padding: 2px;'+
                    'margin-left: -45px;'+
                '">';
                _.each(results,function(r){
                    var color = ( r.success ? '#0ab80a' : '#e60d0d' ),
                        text = ( r.success ? 'PASS' : 'FAIL' ),
                        nColor = (r.worksInChat ? 'black' : '#8f0000'),
                        nText = (r.worksInChat ? 'Works in Chat.' : 'Fails in Chat.'),
                        err = (_.has(r,'error') ? '<div style="font-size:.8em;margin-left: 5em;">'+r.error+'</div>': '');

                    o+='<div style="'+
                        'font-weight: bold;'+
                        '">'+
                            '<span style="display: inline-block;width: 22em;">'+
                                '<code>'+
                                    HE(r.expr)+
                                '</code>'+
                            '</span>'+
                            '<span style="color: '+nColor+';">'+
                                nText+
                            '</span>'+

                            '<div style="'+
                                'float: left;'+
                                'width: 3em;'+
                                'padding: .1em .5em;'+
                                'border: 1px solid black;'+
                                'border-radius: 1em;'+
                                'text-align: center;'+
                                'background-color: '+color+';'+
                                'margin-right: .5em;'+
                                'color: white;">'+
                                    text+
                                '</div>'+
                            '<div style="clear:both;">'+
                        '</div>'+
                        err;
                });
                o+='</div>'+
                    '<div style="font-style: italic;font-weight: normal; margin-top: .5em;">'+
                        'Repeat tests with the <code style="font-style: normal;font-weight: bold;">!dice-tests</code> command.'+
                    '</div>';
                sendChat('DiceTests',o);

            });

        _.each(tests,function(t,i){
            results[i]={
                expr: t.expr,
                worksInChat: t.worksInChat,
                res: {},
                success: true
            };
            try {
                sendChat('DiceTests',t.expr,function(r){
                    results[i].res=r;
                    done();
                });
            } catch (e) {
                results[i].success=false;
                results[i].error='';
                if(_.has(t,'attr')){
                    results[i].error+='<strong>'+t.attr+':</strong> <span style="display:inline-block;border:1px solid #e1e1e8; background-color:#f7f7f9;color: #c25; font-family: monospace;">'+(_.findWhere(testAttributes,{name:t.attr})||{current: 'MISSING'}).current.replace(/ /,'&'+'nbsp;') +'</span><br>';
                }
                results[i].error+='<strong>Error:<strong> '+e.message;
                done();
            }
        });
    },



    handleInput = function(msg) {
        var args;

        if (msg.type !== "api") {
            return;
        }

        args = msg.content.split(/\s+/);
        switch(args[0]) {
            case '!dice-tests':
                doTests();
                break;
        }
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers,
        RunTests: doTests
    };
    
}());

on('ready',function() {
    'use strict';

    DiceTests.CheckInstall();
    DiceTests.RegisterEventHandlers();
    DiceTests.RunTests();
});

