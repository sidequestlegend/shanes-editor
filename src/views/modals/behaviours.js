export class BehavioursModal{
    constructor(context) {
        this.context = context;
    }
    open(child) {
        this.behaviours = [];
        for(let i = 0; i < child.settings.behaviours.length; i++){
            let behaviour = this.context.sceneGraph.currentScene.behaviours[child.settings.behaviours[i]];
            this.behaviours.push({name:behaviour.name,behaviours_id:behaviour.behaviours_id});
        }
        if(child.settings.behaviours.length){
            this.currentBehaviour = child.settings.behaviours[0];
        }
        this.context.content.loadTemplates(['add-behaviour'])
            .then(()=>this.context.content.compileTemplates('add-behaviour',[{behaviours:this.behaviours}],true))
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                this.closeElement = document.querySelector('#behavioursContainer').querySelector('.singleButton');
                document.querySelector('.cancelAddBehaviour').addEventListener('mousedown',()=>this.closeElement.close());
                let updateBehaviour = selectedBehaviour=>this.currentBehaviour = selectedBehaviour;
                for(let i = 0; i < child.settings.behaviours.length; i++){
                    this.context.viewUtils.setupRadioInput('.radio-'+child.settings.behaviours[i],updateBehaviour);
                }
                document.querySelector('.editBehaviour').addEventListener('mousedown',()=>{
                    if(child.settings.behaviours.length){
                        setTimeout(()=>{
                            this.context.behaviourView.open(child,
                                this.context.sceneGraph.currentScene.behaviours[this.currentBehaviour]);
                        },250);
                        this.closeElement.close();
                    }
                });
                document.querySelector('.addBehaviour').addEventListener('mousedown',()=>this.openAdd(child,'new',0));
            });
    }
    openAdd(child,type,page){
        type = type || 'new';
        this.context.content.loadTemplates(['add-behaviour-location','add-new-behaviour','add-behaviour-list'])
            .then(()=>this.context.content.compileTemplates('add-behaviour-location',[{}],true))
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>this.setUnderline(type))
            .then(()=>this.setupBehaviourMenu(child))
            .then(()=>{
                switch(type){
                    case "new":
                        return this.context.content.compileTemplates('add-new-behaviour',[{}],true)
                            .then(contents=>this.context.content.addTemplateItem('#addNewBehaviourContainer',contents[0]))
                            .then(()=>this.context.content.reloadPopup())
                            .then(()=>{
                                document.querySelector('.addNewBehaviour')
                                    .addEventListener('mousedown',()=>{
                                        this.context.behaviourView.open(child);
                                        this.closeElement.close();
                                    });
                            });
                    case "scene":
                        let behaviours = [];
                        for(let key in this.context.sceneGraph.currentScene.behaviours){
                            if(this.context.sceneGraph.currentScene.behaviours.hasOwnProperty(key)
                                &&this.context.currentObject.settings.behaviours.indexOf(Number(key))===-1
                            ){
                                let behaviour = this.context.sceneGraph.currentScene.behaviours[key];
                                behaviours.push({name:behaviour.name,behaviours_id:key})
                            }
                        }
                        let start = page*10;
                        let end  = start+10;
                        behaviours = behaviours.slice(start,end);
                        return this.context.content.compileTemplates('add-behaviour-list',[{behaviours,page}],true)
                            .then(contents=>this.context.content.addTemplateItem('#addNewBehaviourContainer',contents[0]))
                            .then(()=>this.context.content.reloadPopup())
                            .then(()=>this.setupNextPrev(child,type,page))
                            .then(()=>this.setupAddBehaviour());
                    case "mine":
                        let myBehaviours = [];
                        return new Promise(resolve=>this.context.sceneEl.emit('list-add-behaviour',{page,resolve}))
                            .then(behaviours=>{
                                myBehaviours = behaviours;
                                return behaviours;
                            })
                            .then(behaviours=>this.context.content.compileTemplates('add-behaviour-list',[{behaviours}],true))
                            .then(contents=>this.context.content.addTemplateItem('#addNewBehaviourContainer',contents[0]))
                            .then(()=>this.context.content.reloadPopup())
                            .then(()=>this.setupNextPrev(child,type,page))
                            .then(()=>this.setupAddBehaviour(true,myBehaviours));

                }
            });
    }
    setupAddBehaviour(addToScene,behaviours){
        let loadButtons = document.querySelector('#addNewBehaviourContainer').querySelectorAll('.loadBehaviour');
        let _this = this;
        for(let i = 0; i < loadButtons.length; i++) {
            let loadButton = loadButtons[i];
            loadButton.addEventListener('mousedown', function() {
                _this.closeElement.close();
                let behaviourId = Number(this.dataset.behaviour)
                if(addToScene){
                    for(let i = 0; i < behaviours.length; i++){
                        if(behaviours[i].behaviours_id === behaviourId){
                            _this.context.sceneGraph.currentScene.behaviours[behaviours[i].behaviours_id] = behaviours[i];
                        }
                    }
                }
                _this.context.currentObject.settings.behaviours.push(behaviourId);
                _this.context.sceneGraph.behaviourFactory.addBehaviour(
                    _this.context.sceneGraph.currentScene.behaviours[behaviourId],
                    _this.context.currentObject.object3D
                );
            })
        }
    }
    setupNextPrev(child,type,page){
        let prev = document.querySelector('.prev-behaviour-button');
        if(prev){
            prev.addEventListener('mousedown',()=>{
                this.openAdd(child,type,--page);
            });
        }
        let next = document.querySelector('.next-behaviour-button');
        if(next){
            next.addEventListener('mousedown',()=>{
                this.openAdd(child,type,++page);
            });
        }
    }
    setupBehaviourMenu(child){
        let sceneMenuButtons = document.querySelectorAll('.behaviour-menu-button');
        let sceneMenuUnderline = document.querySelector('.behaviour-under-line');
        let _this = this;
        for(let i = 0; i < sceneMenuButtons.length; i++){
            let sceneMenuButton = sceneMenuButtons[i];
            sceneMenuButton.addEventListener('mousedown',function(){
                let position = this.dataset.position_x;
                let type = this.dataset.type;
                sceneMenuUnderline.setAttribute('width',this.dataset.line_width);
                new TWEEN.Tween(sceneMenuUnderline.getAttribute('position'))
                    .to(new THREE.Vector3(position,-0.18,0.001), 350)
                    .onComplete(()=>_this.openAdd(child,type,'',0))
                    .easing(TWEEN.Easing.Exponential.Out).start();

            })
        }
    }
    setUnderline(type){
        let position = '0.85 -0.18 0.001';
        let width = '0.40';
        switch(type) {
            case "scene":
                position = '1.6 -0.18 0.001';
                width = '0.84';
                break;
            case "mine":
                position = '2.5 -0.18 0.001';
                width = '0.72';
                break;
        }
        let underline = document.querySelector('.behaviour-under-line');
        underline.setAttribute('position',position);
        underline.setAttribute('width',width);
    }
}