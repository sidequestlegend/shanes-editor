export class PreloadTemplates{
    constructor(context){
        this.context = context;
    }
    preload(){
        let loadingText = document.getElementById('loadingText');
        let loadingTextBack = document.getElementById('loadingTextBack');
        let templates = [
            'scene-item',
            'add-items',
            'title-section',
            'three-number-inputs',
            'object-stats',
            'mobile-response',
            'single-item-button',
            'double-item-button',
            'side-item-add',
            'radios',
            'switches',
            'color',
            'aframe',
            'color-intensity',
            'number',
            'map-settings',
            'confirm-message',
            'double-item-button',
            'mobile-response',
            'object-stats',
            'object-type',
            'side-item-add',
            'single-item-button',
            'three-number-inputs',
            'title-section',
            'material-options'
        ];
        let start = new Date().getTime();
        let promises = templates.map(t=>this.context.content.loadTemplates([t]));
        let completeCount = 0;
        let total = promises.length;
        loadingTextBack.setAttribute('scale','1 1 1');
        for(let i = 0; i < total; i++){
            let promise = promises[i];
            promise.then(()=>{
                completeCount++;
                let percent = completeCount/total;
                loadingText.setAttribute('value',Math.round(percent*100)+'%');
                if(percent===1){
                    console.log('Templates loaded in: '+((new Date().getTime()-start)/1000)+"s");
                    setTimeout(()=>{
                        loadingText.setAttribute('value','');
                        loadingTextBack.setAttribute('scale','0 0 0');
                    },500);
                }
            });
        }
        return Promise.all(promises);
    }
}