export class PrimitiveTypeModal{
    constructor(context) {
        this.context = context;
    }
    open(){
        this.context.content.compileTemplates('add-items',[{items:this.context.viewUtils.primitive_types}],true)
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                let buttons = this.context.content.popup.querySelectorAll('.type-select');
                for(let i = 0 ; i <  buttons.length; i++){
                    let button = buttons[i];
                    button.addEventListener('mousedown',()=>{
                        this.context.objectMaterial.open({type:'Primitive',sub_type:button.dataset.key+"Geometry"});
                    });
                }
            });
    }
}