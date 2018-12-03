export class AvatarCategoriesModal{
    constructor(context) {
        this.context = context;
        this.types = [
            {name:'Food',friendly_name:'Food',image_url:'#avatar_food_cake'},
            {name:'Hair',friendly_name:'Hair',image_url:'#avatar_hair_hair1'},
            {name:'Hats',friendly_name:'Hats',image_url:'#avatar_hats_drinkinghat'},
            {name:'Masks-Mask1',friendly_name:'Masks-Mask1',image_url:'#avatar_masks_mask1_black_white'},
            {name:'Masks-Mask2',friendly_name:'Masks-Mask2',image_url:'#avatar_masks_mask2_blood_moon'},
            {name:'Masks-Mask3',friendly_name:'Masks-Mask3',image_url:'#avatar_masks_mask3_blue_blush'},
            {name:'Masks-Mask4',friendly_name:'Masks-Mask4',image_url:'#avatar_masks_mask4_blue_white'},
            {name:'Masks-Mask5',friendly_name:'Masks-Mask5',image_url:'#avatar_masks_mask5_copper'},
            {name:'Masks-Mask6',friendly_name:'Masks-Mask6',image_url:'#avatar_masks_mask6_forest'},
            {name:'Masks-Mask7',friendly_name:'Masks-Mask7',image_url:'#avatar_masks_mask7_white_orange'},
            {name:'Masks-Mask8',friendly_name:'Masks-Mask8',image_url:'#avatar_masks_mask8_black_white'},
            {name:'Weapons-pack1',friendly_name:'Weapons-pack1',image_url:'#avatar_weapons_pack1_bomb'},
            {name:'Weapons-pack2',friendly_name:'Weapons-pack2',image_url:'#avatar_weapons_pack2_axe1'},
            {name:'Weapons-pack3',friendly_name:'Weapons-pack3',image_url:'#avatar_weapons_pack3_moonandstarblade'},
            {name:'Weapons-pack4',friendly_name:'Weapons-pack4',image_url:'#avatar_weapons_pack4_naturestaff'},
            {name:'Weapons-pack5',friendly_name:'Weapons-pack5',image_url:'#avatar_weapons_pack5_gatling'},
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