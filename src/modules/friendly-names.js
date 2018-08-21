export class FriendlyNames{
    constructor(){
        this.names = {
            "Primitive":"Simple",
            "Parametric":"Fancy",
            "Custom":"3D Model",
            "map":"image"
        }
    }
    show(item){
        return this.names[item]||item;
    }
}