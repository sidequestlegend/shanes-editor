export class PrefabOptionModal{
    constructor(context) {
        this.context = context;
        this.types = [
            {name:'My Prefabs',friendly_name:'My Prefabs',image_url:'https://cdn.theexpanse.app/images/icons/objects/prefab.jpg'},
            {name:'Prefab Market',friendly_name:'Prefab Market',image_url:'https://cdn.theexpanse.app/images/icons/objects/market.jpg'}
        ]
    }
    open() {
        this.context.content.compileTemplates('add-items',[{items:this.types}],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                let buttons = this.context.content.popup.querySelectorAll('.type-select');
                for(let i = 0 ; i <  buttons.length; i++){
                    let button = buttons[i];
                    if(button.dataset.key==="Prefab Market"){
                        button.setAttribute('ui-toast','toastEl:#popupToastMessage;message:Coming Soon!')
                    }
                    button.addEventListener('mousedown',()=>{
                        switch(button.dataset.key){
                            case "My Prefabs":
                                this.context.popupBackStack.push(()=>this.open());
                                document.getElementById('backButton').setAttribute('scale','1 1 1');
                                this.context.addPrefabList.open();
                                break;
                            case "Prefab Market":

                                break;
                        }

                    });
                }
            });
    }
}