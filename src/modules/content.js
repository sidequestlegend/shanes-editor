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
        if(this.resolveCache[event.data.reqId]){
            this.resolveCache[event.data.reqId](event.data.data);
            delete this.resolveCache[event.data.reqId];
        }
    }
    reloadContent(){
        this.container.updateContent();
    }
    reloadPopup(){
        this.popup.updateContent();
    }
    async addTemplateItem(parentSelector,item,shouldWait){
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
        if(this.templateCache[name]){
            return this.templateCache[name].then(text=>{
                let reqId = THREE.Math.generateUUID();
                this.content_worker.postMessage({ type: 'compile', elements: objects.map(o=>({text:text,data:o})), reqId: reqId});
                return new Promise(resolve=>{
                    this.resolveCache[reqId] = resolve;
                });
            });
        }
    }
    async loadScreen(name,templates,noAutoReload){
        // if(this.contentContainer.yoga_node&&this.contentContainer.firstChild&&this.contentContainer.firstChild.yoga_node){
        //     this.contentContainer.yoga_node.removeChild(this.contentContainer.firstChild.yoga_node);
        // }
        // if(this.contentContainer.firstChild)this.contentContainer.removeChild(this.contentContainer.firstChild);
        await this.loadTemplates(templates)
            .then(()=>fetch('/html/views/'+name+'.html'))
            .then(page=>page.text())
            .then(body=>this.container.setContent(body,noAutoReload));
    }
    async loadTemplates(templates){
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