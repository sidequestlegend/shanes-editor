export class DeleteSceneModal{
    constructor(context) {
        this.context = context;
    }
    open(ele,type) {
        let scenes_id = ele.dataset.scene;
        this.context.content.loadTemplates(['confirm-message'])
            .then(()=>this.context.content.compileTemplates('confirm-message',[{
                title:'Delete '+UI.utils.ucFirst(type),
                message:'Are you sure you want to delete this '+type+'? - this cannot be undone!',
                leftButtonText:'CANCEL',
                leftButtonFontColor:'#fff',
                leftButtonColor:'#009688',
                leftButtonRippleColor:'#fff',
                rightButtonText:'DELETE '+type.toUpperCase(),
                rightButtonFontColor:'#fff',
                rightButtonColor:'#e57373',
                rightButtonRippleColor:'#fff'
            }],true))
            .then(contents=>this.context.content.popup.setContent(contents[0]))
            .then(()=> {
                 document.querySelector('.left-button').addEventListener('mousedown', () => ele.close());
                 document.querySelector('.right-button').addEventListener('mousedown', () => {
                     this.context.sceneEl.emit('delete-'+(type||'scene'),scenes_id);
                     ele.close()
                 });
            });
    }
}