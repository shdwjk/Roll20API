// Github:   https://github.com/shdwjk/Roll20API/blob/master/DiceTests/DiceTests.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var DiceTests = DiceTests || (function() {
    'use strict';

    var version = '0.1.3',
        lastUpdate = 1441461842,
        schemaVersion = 0.1,
    	tests = [
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
    		{ expr: '[[@{Rook|charisma} ]]', worksInChat: true },
    		{ expr: '[[ @{Rook|charisma} ]]', worksInChat: true }
		],

    checkInstall = function() {
		log('-=> DiceTests v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'DiceTests') || state.DiceTests.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.DiceTests = {
                version: schemaVersion
            };
        }
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
                        nText = (r.worksInChat ? 'Works in Chat.' : 'Fails in Chat.');

                    o+='<div style="'+
                        'font-weight: bold;'+
                        '">'+
                            '<span style="display: inline-block;width: 18em;">'+
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
                        '</div>';
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

