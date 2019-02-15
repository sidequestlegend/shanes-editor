export class PortalModal{
    constructor(context) {
        this.context = context;
    }
    open(settings,isEditing,name){
        settings = {
            image: settings?settings.image : 'https://cdn.theexpanse.app/images/portal-default.jpg',
            spaces_id: settings?settings.spaces_id : 1,
            name: name || ''
        };
        document.getElementById('backButton').setAttribute('scale','0.00001 0.00001 0.00001');
        this.uiRenderer = document.getElementById('mainRenderer');
        this.uiRenderer.components['ui-renderer'].pause();
        this.context.content.loadTemplates(['portal-settings'])
            .then(()=>this.context.content.compileTemplates('portal-settings',[settings],true))
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>this.uiRenderer.components['ui-renderer'].play())
            .then(()=>{
                document.querySelector('.cancelAddScene').addEventListener('mousedown',()=>this.uiRenderer.modal.close());
                document.querySelector('.createSceneConfirm').addEventListener('mousedown',()=>{
                    let name = document.querySelector('.portalName').getValue();
                    let image = document.querySelector('.portalImage').getValue();
                    let spaces_id = document.querySelector('.portalSpaceID').getValue();
                    if(isEditing){
                        this.context.currentObject.settings.name = name;
                        this.context.currentObject.settings.portal.image = image;
                        this.context.currentObject.settings.portal.spaces_id = spaces_id;
                        this.context.sceneGraph.objectFactory.makePortal(this.context.currentObject.settings);
                        this.context.sceneGraph.objectFactory.resetAframeContainerItem(
                            this.context.currentObject.settings.uuid,
                            this.context.currentObject.settings.aframeCode
                        );
                        this.uiRenderer.modal.close();
                    }else{
                        this.context.sceneGraph.add(this.context.currentObject,{
                            type:"Portal",
                            sub_type:'',
                            portal:{image,spaces_id},
                            name: name
                        })
                            .then(child=>{
                                setTimeout(()=>{
                                    this.context.itemView.open(child);
                                    this.context.sceneGraph.sync();
                                },250);
                                this.uiRenderer.modal.close();
                            });
                    }
                });

            });
    }
}