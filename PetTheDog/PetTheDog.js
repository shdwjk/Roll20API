// Github:   https://github.com/shdwjk/Roll20API/blob/master/PetTheDog/PetTheDog.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

const PetTheDog = (() => { // eslint-disable-line no-unused-vars

    const version = '0.1.0';
    const lastUpdate = 1578617748;
    const schemaVersion = 0.1;

    const petResponse = (token) => {
        const actions = [
            'rolls over and shows you their belly.',
            'wags their tail excitedly',
            'chuffs happily',
            'rubs against your leg.',
            'looks up at you with wide eyes.',
            'licks your hand affectionately'
        ];

        return `${token.get('name')} ${actions[randomInteger(actions.length)-1]}`;
    };

    const checkInstall = () =>  {
        log('-=> PetTheDog v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! state.hasOwnProperty('PetTheDog') || state.PetTheDog.version !== schemaVersion) {
            log(`  > Updating Schema to v${schemaVersion} <`);
            switch(state.PetTheDog && state.PetTheDog.version) {

                case 0.1:
                    /* break; // intentional dropthrough */ /* falls through */

                case 'UpdateSchemaVersion':
                    state.PetTheDog.version = schemaVersion;
                    break;

                default:
                    state.PetTheDog = {
                        version: schemaVersion
                    };
                    break;
            }
        }
    };

    const handleInput = (msg) => {
        if (msg.type === "api" && /^!pet(\b|$)/i.test(msg.content)) {

            let args = msg.content.split(/\s+--/).slice(1);
            let ids = (msg.selected || []).map(o=>o._id);

            args.forEach(a=>{
                let cmds = a.split(/\s+/);
                switch(cmds[0].toLowerCase()){
                    case 'ids':
                        ids = [...ids,...cmds.slice(1)];
                        break;
                }
            });
            
            ids.map( id => getObj('graphic',id))
                .filter(g=>undefined !== g)
                .forEach( g => sendChat('',`/em ${petResponse(g)}`))
				;
        }

    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
    };

    on('ready', () => {
        checkInstall();
        registerEventHandlers();
    });

    return {
        // Public interface here
    };

})();

