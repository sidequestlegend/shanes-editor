export class AvatarCategoriesModal{
    constructor(context) {
        this.context = context;
        this.types = [
            {name:'Food',friendly_name:'Food'},
            {name:'Hair',friendly_name:'Hair'},
            {name:'Hats',friendly_name:'Hats'},
            {name:'Masks-Mask1',friendly_name:'Masks-Mask1'},
            {name:'Masks-Mask2',friendly_name:'Masks-Mask2'},
            {name:'Masks-Mask3',friendly_name:'Masks-Mask3'},
            {name:'Masks-Mask4',friendly_name:'Masks-Mask4'},
            {name:'Masks-Mask5',friendly_name:'Masks-Mask5'},
            {name:'Masks-Mask6',friendly_name:'Masks-Mask6'},
            {name:'Masks-Mask7',friendly_name:'Masks-Mask7'},
            {name:'Masks-Mask8',friendly_name:'Masks-Mask8'},
            {name:'Weapons-pack1',friendly_name:'Weapons-pack1'},
            {name:'Weapons-pack2',friendly_name:'Weapons-pack2'},
            {name:'Weapons-pack3',friendly_name:'Weapons-pack3'},
            {name:'Weapons-pack4',friendly_name:'Weapons-pack4'},
            {name:'Weapons-pack5',friendly_name:'Weapons-pack5'},
        ];
    }
    open() {
        this.context.content.compileTemplates('add-items',[{items:this.types}],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                let buttons = this.context.content.popup.querySelectorAll('.type-select');
                for(let i = 0 ; i <  buttons.length; i++){
                    let button = buttons[i];
                    button.addEventListener('mousedown',()=>{
                        this.context.popupBackStack.push(()=>this.open());
                        document.getElementById('backButton').setAttribute('scale','1 1 1');
                        this.context.avatarModelsModal.open(button.dataset.key);
                    });
                }
            });
    }
}