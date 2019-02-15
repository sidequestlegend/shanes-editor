export class AvatarCategoriesModal{
    constructor(context) {
        this.context = context;
        this.types = [
            {name:'Food',friendly_name:'Food',image_url:'#avatar_icons_01',image_coords:'0 0 128 128'},
            {name:'Hair',friendly_name:'Hair',image_url:'#avatar_icons_05',image_coords:'0 128 128 128',sprite_height:512},
            {name:'Hats',friendly_name:'Hats',image_url:'#avatar_icons_01',image_coords:'256 384 128 128'},
            {name:'Masks-Mask1',friendly_name:'Masks-Mask1',image_url:'#avatar_icons_02',image_coords:'0 0 128 128'},
            {name:'Masks-Mask2',friendly_name:'Masks-Mask2',image_url:'#avatar_icons_02',image_coords:'0 256 128 128'},
            {name:'Masks-Mask3',friendly_name:'Masks-Mask3',image_url:'#avatar_icons_02',image_coords:'384 384 128 128'},
            {name:'Masks-Mask4',friendly_name:'Masks-Mask4',image_url:'#avatar_icons_02',image_coords:'512 384 128 128'},
            {name:'Masks-Mask5',friendly_name:'Masks-Mask5',image_url:'#avatar_icons_02',image_coords:'0 512 128 128'},
            {name:'Masks-Mask6',friendly_name:'Masks-Mask6',image_url:'#avatar_icons_02',image_coords:'128 640 128 128'},
            {name:'Masks-Mask7',friendly_name:'Masks-Mask7',image_url:'#avatar_icons_02',image_coords:'384 640 128 128'},
            {name:'Masks-Mask8',friendly_name:'Masks-Mask8',image_url:'#avatar_icons_04',image_coords:'384 0 128 128',sprite_height:256,sprite_width:512},
            {name:'Weapons-pack1',friendly_name:'Weapons-pack1',image_url:'#avatar_icons_01',image_coords:'640 512 128 128'},
            {name:'Weapons-pack2',friendly_name:'Weapons-pack2',image_url:'#avatar_icons_01',image_coords:'768 640 128 128'},
            {name:'Weapons-pack3',friendly_name:'Weapons-pack3',image_url:'#avatar_icons_01',image_coords:'896 640 128 128'},
            {name:'Weapons-pack4',friendly_name:'Weapons-pack4',image_url:'#avatar_icons_01',image_coords:'640 640 128 128'},
            {name:'Weapons-pack5',friendly_name:'Weapons-pack5',image_url:'#avatar_icons_01',image_coords:'640 896 128 128'},
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