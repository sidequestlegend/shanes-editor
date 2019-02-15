export class LoadAudioModal {
    constructor(context) {
        this.context = context;
        this.setupAudio();

    }
    open(){
        this.uiRenderer = document.getElementById('mainRenderer');
        let items = [];
        for(let key in this.audio){
            items.push({name:key,friendly_name:key,image_url:'#objects_sound'});
        }
        this.context.content.compileTemplates('add-items',[{items:items}],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                let buttons = this.context.content.popup.querySelectorAll('.type-select');
                for(let i = 0 ; i <  buttons.length; i++){
                    let button = buttons[i];
                    button.addEventListener('mousedown',()=>{
                        this.context.popupBackStack.push(()=>this.open());
                        document.getElementById('backButton').setAttribute('scale','1 1 1');
                        this.openFolder(button.dataset.key);
                    });
                }
            });
    }
    openFolder(folder){
        let items = [];
        for(let i = 0;i < this.audio[folder].length; i++){
            let audio = this.audio[folder][i];
            items.push({name:audio.name.toLowerCase(),friendly_name:audio.name,image_url:'#objects_sound'});
        }
        this.context.content.compileTemplates('add-items',[{items:items}],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                let buttons = this.context.content.popup.querySelectorAll('.type-select');
                for(let i = 0 ; i <  buttons.length; i++){
                    let button = buttons[i];
                    button.addEventListener('mousedown',()=>{
                        this.setAudio(folder,button.dataset.key);
                    });
                }
            });
    }
    setAudio(folder,file){
        this.context.currentObject.settings.url = 'https://cdn.theexpanse.app/audio/'+folder+'/'+file+'.mp3';
        this.context.sceneGraph.objectFactory.resetSound(this.context.currentObject.object3D);
        this.context.soundModal.open();
    }
    setupAudio(){
        this.audio = {
            Ambiance:[{
                name:'Sample',
                url:'sample.mp3'
            },{
                name:'Fire',
                url:'fire.mp3'
            }],
            Animal:[{
                name:'Song',
                url:'song.mp3'
            }],
        }
    }
}
