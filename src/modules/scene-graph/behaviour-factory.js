export class BehaviourFactory{

    constructor(scene_graph){
        // TODO: This is just a transplant of the old behaviour code. This is not functional and needs to be re-implemented.
        this.scene_graph = scene_graph;
    }
    resetBehaviours(object){
        let _this = this;
        object.removeAllBehaviors();
        let new_behaviours = [];
        object.userData.plusspace.altspace.behaviours.forEach(function(behaviour,behi){
            let settings = behaviour.settings||{};
            settings.trigger = settings.trigger||"auto-trigger";
            if(settings.trigger&&(["toggle-trigger","mod-toggle-trigger","no-mod-toggle-trigger","click-trigger","mod-click-trigger","no-mod-click-trigger"].indexOf(settings.trigger)>-1)){
                if(object.userData.altspace){
                    object.userData.altspace.collider = object.userData.altspace.collider||{};
                    object.userData.altspace.collider.enabled= true;
                }
            }
            let new_behaviour = _this.getBehaviour(behaviour,object);
            let handle_click_sync = function(){
                object = _this.resetObject(object);
                object.addBehavior(new_behaviour);
                if(settings.sync){
                    _this.context.socket.emit('behaviour-sync',{index:behi,uuid:object.userData.plusspace.object.uuid});
                }
            }
            let handle_toggle_sync = function(){
                if(object.userData.has_been_clicked){
                    object = _this.resetObject(object);
                    object.userData.has_been_clicked = false;
                    _this.context.socket.emit('behaviour-sync',{index:behi,uuid:object.userData.plusspace.object.uuid,is_toggle:true,enabled:false});
                }else{
                    object.userData.has_been_clicked = true;
                    object.addBehavior(new_behaviour);
                    console.log(new_behaviour);
                    if(settings.sync){
                        _this.context.socket.emit('behaviour-sync',{index:behi,uuid:object.userData.plusspace.object.uuid,is_toggle:true,enabled:true});
                    }
                }
            }
            if(new_behaviour){
                switch(settings.trigger){
                    case "auto-trigger":
                        new_behaviours.push(new_behaviour);
                        break;
                    case "mod-auto-trigger":
                        if(_this.context.user&&_this.context.user.isModerator){
                            object.addBehavior(new_behaviour);
                        }
                        break;
                    case "no-mod-auto-trigger":
                        if(_this.context.user&&!_this.context.user.isModerator){
                            object.addBehavior(new_behaviour);
                        }
                        break;
                    case "click-trigger":
                        object.addEventListener('cursordown',function(){
                            handle_click_sync();
                        });
                        break;
                    case "mod-click-trigger":
                        object.addEventListener('cursordown',function(){
                            if(_this.context.user&&_this.context.user.isModerator){
                                handle_click_sync();
                            }
                        });
                        break;
                    case "no-mod-click-trigger":
                        object.addEventListener('cursordown',function(){
                            if(_this.context.user&&!_this.context.user.isModerator){
                                handle_click_sync();
                            }
                        });
                        break;
                    case "toggle-trigger":
                        object.addEventListener('cursordown',function(){
                            handle_toggle_sync();
                        });
                        break;
                    case "mod-toggle-trigger":
                        object.addEventListener('cursordown',function(){
                            if(_this.context.user&&_this.context.user.isModerator){
                                handle_toggle_sync();
                            }
                        });
                        break;
                    case "no-mod-toggle-trigger":
                        object.addEventListener('cursordown',function(){
                            if(_this.context.user&&!_this.context.user.isModerator){
                                handle_toggle_sync();
                            }
                        });
                        break;
                    case "enter-trigger":
                        object.addEventListener('triggerenter',function(){
                            handle_click_sync();
                        });
                        break;
                    case "exit-trigger":
                        object.addEventListener('triggerexit',function(){
                            handle_click_sync();
                        });
                        break;
                    case "mod-enter-trigger":
                        object.addEventListener('triggerenter',function(){
                            if (_this.context.user && _this.context.user.isModerator) {
                                handle_click_sync();
                            }
                        });
                        break;
                    case "no-mod-enter-trigger":
                        object.addEventListener('triggerenter',function(){
                            if(_this.context.user&&!_this.context.user.isModerator){
                                handle_click_sync();
                            }
                        });
                        break;
                    case "mod-exit-trigger":
                        object.addEventListener('triggerexit',function(){
                            if(_this.context.user&&_this.context.user.isModerator){
                                handle_click_sync();
                            }
                        });
                        break;
                    case "no-mod-exit-trigger":
                        object.addEventListener('triggerexit',function(){
                            if(_this.context.user&&!_this.context.user.isModerator){
                                handle_click_sync();
                            }
                        });
                        break;
                }

            }
        });
        if(new_behaviours.length){
            object.addBehaviors.apply(object,new_behaviours);
        }

    }
}
