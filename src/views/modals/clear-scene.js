export class ClearSceneModal{
    constructor(context) {
        this.context = context;
    }
    open() {
        this.context.content.loadTemplates(['confirm-message'])
            .then(()=>this.context.content.compileTemplates('confirm-message',[{
                title:'Clear Scene',
                message:'Are you sure you want to remove all the items from this scene?',
                leftButtonText:'CANCEL',
                leftButtonFontColor:'#fff',
                leftButtonColor:'#009688',
                leftButtonRippleColor:'#fff',
                rightButtonText:'CLEAR SCENE',
                rightButtonFontColor:'#fff',
                rightButtonColor:'#e57373',
                rightButtonRippleColor:'#fff'
            }],true))
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=>{
                let popupEl = document.querySelector('#clearScene').querySelector('.singleButton');
                document.querySelector('.right-button').addEventListener('mousedown',()=>{
                    popupEl.close();
                    this.context.sceneGraph.clearScene();
                    this.context.itemView.open();
                });
                document.querySelector('.left-button').addEventListener('mousedown',()=>{
                    popupEl.close();
                });
            });
    }
}