import ContentWorker from 'worker-loader!./content-worker.js';

export class Content{
    constructor(context){
        this.context = context;
        this.content_worker = new ContentWorker();
        this.popup = document.getElementById('popupContent');
        this.container = document.getElementById('mainContent');
        this.contentContainer = this.container.querySelector('.container');
        this.templateContainer = document.getElementById('templateContainer');
        this.templateCache = {};
        this.resolveCache = {};
        this.content_worker.onmessage = e=>this.workerMessage(e);
    }
    workerMessage(event){
        // Recieve a compiled handlebars template from the content worker.
        if(this.resolveCache[event.data.reqId]){
            this.resolveCache[event.data.reqId](event.data.data);
            delete this.resolveCache[event.data.reqId];
        }
    }
    reloadContent(){
        // Trigger the ui scroll pane to update its layout.
        this.container.updateContent();
    }
    reloadPopup(){
        // Trigger the popup ui scroll pane to update its layout.
        this.popup.updateContent();
    }
    async addTemplateItem(parentSelector,item,shouldWait){
        // Add a html block to the content container and optionally resolve when it is loaded.
        return new Promise(resolve=>{
            document.querySelector(parentSelector).insertAdjacentHTML('beforeend',item);
            if(shouldWait){
                document.querySelector(parentSelector).lastChild.addEventListener('loaded',resolve);
            }else{
                resolve();
            }
        });
    }
    async compileTemplates(name,objects){
        // Compile a template or many tempaltes if  that tempalte has been loaded into cache already
        if(this.templateCache[name]){
            return this.templateCache[name].then(text=>{
                let reqId = THREE.Math.generateUUID();
                // Post to the worker with the tempalte and data to be populated.
                this.content_worker.postMessage({ type: 'compile', elements: objects.map(o=>({text:text,data:o})), reqId: reqId});
                return new Promise(resolve=>{
                    // Store the callback to fire when we get a response from the worker.
                    this.resolveCache[reqId] = resolve;
                });
            });
        }
    }
    async loadScreen(name,templates,noAutoReload){
        // Get a container view and load into the content container optionally preventing reload of the
        // content -  incase there is more to be added and we want to manually reload content later.
        await this.loadTemplates(templates)
            .then(()=>fetch('/html/views/'+name+'.html'))
            .then(page=>page.text())
            .then(body=>this.container.setContent(body,noAutoReload));
    }
    async loadTemplates(templates){
        // Preload a template or list of templates into the cache.
        return Promise.all(
            (templates||[])
                .map(name=>{
                    let promise = Promise.resolve();
                    if(!this.templateCache[name]){
                        promise = fetch('/html/templates/'+name+'.html')
                            .then(page=>{
                                this.templateCache[name] = page.text();
                            });
                    }
                    return promise
                })
        )
    }
}