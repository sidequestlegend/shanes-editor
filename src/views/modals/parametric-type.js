export class ParametricTypeModal{
    constructor(context) {
        this.context = context;
        let icon_path = 'https://cdn.theexpanse.app/images/icons/objects/geometries/parametric/';
        this.types = [
            {name:'My Parametrics',friendly_name:'My Fancys',image_url:'https://cdn.theexpanse.app/images/icons/objects/parametric.jpg'},
            {name:'Parametric Market',friendly_name:'Fancy Market',image_url:'https://cdn.theexpanse.app/images/icons/objects/market.jpg'},
            {name:'Create',friendly_name:'Create',image_url:'https://cdn.theexpanse.app/images/icons/objects/custom.jpg'},
            {name:'Apple',friendly_name:'Apple',image_url:icon_path+'Apple.jpg'},
            {name:'AppleInverted',friendly_name:'Apple Inverted',image_url:icon_path+'Apple.jpg'},
            {name:'Catenoid',friendly_name:'Catenoid',image_url:icon_path+'Catenoid.jpg'},
            {name:'Fermat',friendly_name:'Fermat',image_url:icon_path+'Fermat.jpg'},
            {name:'Helicoid',friendly_name:'Helicoid',image_url:icon_path+'Helicoid.jpg'},
            {name:'Horn',friendly_name:'Horn',image_url:icon_path+'Horn.jpg'},
            {name:'HornInverted',friendly_name:'Horn Inverted',image_url:icon_path+'Horn.jpg'},
            {name:'Klein',friendly_name:'Klein',image_url:icon_path+'Klein.jpg'},
            {name:'KleinInverted',friendly_name:'Klein Inverted',image_url:icon_path+'Klein.jpg'},
            {name:'Mobius',friendly_name:'Mobius',image_url:icon_path+'Mobius.jpg'},
            {name:'Mobius3D',friendly_name:'Mobius3D',image_url:icon_path+'Mobius3D.jpg'},
            {name:'Mobius3DInverted',friendly_name:'Mobius3D Inverted',image_url:icon_path+'Mobius3D.jpg'},
            {name:'Pillow',friendly_name:'Pillow',image_url:icon_path+'Pillow.jpg'},
            {name:'PillowInverted',friendly_name:'Pillow Inverted',image_url:icon_path+'Pillow.jpg'},
            {name:'NaticaStellata',friendly_name:'Natica',image_url:icon_path+'NaticaStellata.jpg'},
            {name:'NaticaStellataInverted',friendly_name:'Natica Inverted',image_url:icon_path+'NaticaStellata.jpg'},
            {name:'Scherk',friendly_name:'Scherk',image_url:icon_path+'Scherk.jpg'},
            {name:'Snail',friendly_name:'Snail',image_url:icon_path+'Snail.jpg'},
            {name:'SnailInverted',friendly_name:'Snail Inverted',image_url:icon_path+'Snail.jpg'},
            {name:'Spiral',friendly_name:'Spiral',image_url:icon_path+'Spiral.jpg'},
            {name:'SpiralInverted',friendly_name:'Spiral Inverted',image_url:icon_path+'Spiral.jpg'},
            {name:'Spring',friendly_name:'Spring',image_url:icon_path+'Spring.jpg'},
            {name:'SpringInverted',friendly_name:'Spring Inverted',image_url:icon_path+'Spring.jpg'}
        ]

    }
    open() {
        //this.uiRenderer = document.getElementById('mainRenderer');
        this.context.content.compileTemplates('add-items',[{items:this.types}],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                let buttons = this.context.content.popup.querySelectorAll('.type-select');
                for(let i = 0 ; i <  buttons.length; i++){
                    let button = buttons[i];
                    button.addEventListener('mousedown',()=>{
                        this.context.objectMaterial.open({
                            type:'Parametric',
                            sub_type:button.dataset.key,
                            geo_settings:{
                                sub_type:button.dataset.key+"Geometry"
                            }
                        });
                    });
                }
            });


        ;
    }
}