export class SceneListView{
    constructor(context){
        this.context = context;
    }
    open(scenes,page,search,type){
        this.scenes = scenes;
        this.page = page||0;
        this.search = search||'';
        this.type = type||'scene';
        this.context.hideLoader();
        this.context.breadCrumbs.make([
            {name:'My Stuff',callback:()=>this.open(scenes),isTop:true}
        ]);
        this.uiRenderer = document.getElementById('mainRenderer');
        this.uiRenderer.components['ui-renderer'].pause();
        this.context.content.loadScreen('scene-list-view',[this.type+'-item','scene-list-pagination'],true)
            .then(()=>this.context.content.compileTemplates(this.type+'-item',[{scenes}]))
            .then(contents=>{
                for(let i = 0; i < contents.length;i++){
                    this.context.content.addTemplateItem('#sceneList',contents[i]);
                }
            })
            .then(()=>this.context.content.compileTemplates('scene-list-pagination',[{scenes_length:this.scenes.length,page:this.page}]))
            .then(contents=>{
                for(let i = 0; i < contents.length;i++){
                    this.context.content.addTemplateItem('#sceneListPagination',contents[i]);
                }
            })
            .then(()=>this.context.content.reloadContent())
            .then(()=>this.setupCreate())
            .then(()=>this.setupLoadButtons())
            .then(()=>this.setupPagination())
            .then(()=>this.setupSearch())
            .then(()=>this.setupDeleteButtons())
            .then(()=>this.setupSceneMenu())
            .then(()=>this.setTitle())
            .then(()=>this.setUnderline())
            .then(()=>this.setupEditPrefabButtons())
            .then(()=>this.setupEditBehaviourButtons())
            .then(()=>this.uiRenderer.components['ui-renderer'].play());
    }
    setupSceneMenu(){
        let sceneMenuButtons = document.querySelectorAll('.scene-menu-button');
        let sceneMenuUnderline = document.querySelector('.scene-under-line');
        let _this = this;
        for(let i = 0; i < sceneMenuButtons.length; i++){
            let sceneMenuButton = sceneMenuButtons[i];
            sceneMenuButton.addEventListener('click',function(){
                _this.context.showLoader();
                let position = this.dataset.position_x;
                let type = this.dataset.type;
                sceneMenuUnderline.setAttribute('width',this.dataset.line_width);
                new TWEEN.Tween(sceneMenuUnderline.getAttribute('position'))
                    .to(new THREE.Vector3(position,-0.18,0.001), 350)
                    .onComplete(()=>{
                        _this.context.sceneEl.emit('scene-list-type',type);
                    })
                    .easing(TWEEN.Easing.Exponential.Out).start();
            })
        }
    }
    setUnderline(){
        let position = '2.3 -0.18 0.001';
        let width = '0.35';
        switch(this.type) {
            case "prefab":
                position = '2.8 -0.18 0.001';
                width = '0.38';
                break;
            case "behaviour":
                position = '3.4 -0.18 0.001';
                width = '0.55';
                break;
        }
        let underline = document.querySelector('.scene-under-line');
        underline.setAttribute('position',position);
        underline.setAttribute('width',width);
    }
    setTitle(){
        let title = document.getElementById('sceneListTitle');
        let value = 'My '+this.type.charAt(0).toUpperCase() + this.type.substr(1)+'s';
        title.setAttribute('value',value);
    }
    setupCreate(){
        let createScene = document.querySelector('.createScene');
        switch(this.type){
            case "scene":
                createScene.setAttribute('text-value','CREATE SCENE');
                createScene.setAttribute('ui-modal','modal:#modalRenderer;main:#mainRenderer');
                createScene.addEventListener('mousedown',()=>this.context.createSceneModal.open());
                break;
            case "behaviour":
                createScene.setAttribute('text-value','CREATE BEHAVIOUR');
                createScene.removeAttribute('ui-modal');
                createScene.addEventListener('mousedown',()=>this.context.behaviourView.open());
                break;
            default:
                createScene.setAttribute('scale','0.00001 0.00001 0.00001');
                break;
        }
    }
    setupPagination(){
        let sceneNext = document.querySelector('.scene-next-button');
        let scenePrev = document.querySelector('.scene-prev-button');
        if(sceneNext){
            sceneNext.addEventListener('click',()=>{
                this.context.showLoader();
                this.context.sceneEl.emit('scene-list',{page:++this.page,search:this.search,type:this.type})
            });
        }
        if(scenePrev){
            scenePrev.addEventListener('click',()=>{
                this.context.showLoader();
                this.context.sceneEl.emit('scene-list',{page:--this.page,search:this.search,type:this.type})
            });
        }
    }
    setupSearch(){
        let search = document.querySelector('.search-scenes');
        search.value(this.search);
        let timeout;
        search.addEventListener('ui-keypress',()=>{
            clearTimeout(timeout);
            timeout = setTimeout(()=>{
                this.context.showLoader();
                this.context.sceneEl.emit('scene-list-search',{search:search.value(),type:this.type});
            },500);
        })
    }
    openScene(scene){
        this.context.sceneGraph.load(scene,true)
            .then(() => this.context.itemView.open())
            .then(()=>{
                if(!scene.view_only){
                    return this.context.sceneGraph.open()
                }
            });
    }
    setupDeleteButtons(){
        let deleteButtons = document.querySelector('#sceneList').querySelectorAll('.deleteScene');
        for(let i = 0; i < deleteButtons.length; i++){
            let deleteButton = deleteButtons[i];
            deleteButton.addEventListener('mousedown',()=>{
                this.context.deleteSceneModal.open(deleteButton,this.type);
            })
        }
    }
    setupEditBehaviourButtons(){
        let loadButtons = document.querySelector('#sceneList').querySelectorAll('.loadBehaviour');
        for(let i = 0; i < loadButtons.length; i++) {
            let loadButton = loadButtons[i];
            loadButton.addEventListener('mousedown', e => {
                this.scenes.forEach(behaviour=>{
                    if(behaviour.behaviours_id === Number(loadButton.dataset.behaviour)){
                        this.context.behaviourView.open(null,behaviour);
                    }
                });
            });
        }
    }
    setupEditPrefabButtons(){
        let loadButtons = document.querySelector('#sceneList').querySelectorAll('.loadPrefab');
        for(let i = 0; i < loadButtons.length; i++) {
            let loadButton = loadButtons[i];
            loadButton.addEventListener('mousedown', e => {
                this.scenes.forEach(prefab=>{
                    if(prefab.prefabs_id === Number(loadButton.dataset.prefab)){
                        this.context.savePrefabModal.open(prefab,loadButton);
                    }
                });
            });
        }
    }
    setupLoadButtons(){
        let loadButtons = document.querySelector('#sceneList').querySelectorAll('.loadScene');
        let _this = this;
        for(let i = 0; i < loadButtons.length; i++){
            let loadButton = loadButtons[i];
            loadButton.addEventListener('mousedown',function(){
                let scene;
                for(let j = 0; j < _this.scenes.length; j++) {
                    let _scene = _this.scenes[j];
                    if(_scene.scenes_id === Number(this.dataset.scene)){
                        scene = _scene;
                        break;
                    }
                }
                if(scene){
                    scene.view_only = this.dataset.view_only==="true";
                    _this.openScene(scene);
                }
            })
        }
    }
}