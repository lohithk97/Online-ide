
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import * as ace from 'ace-builds';


const THEME = 'ace/theme/github';
const LANG = 'ace/mode/javascript';


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  @Input() readOnly:boolean;
    @Input() data: any;
    @Output() updatedData: EventEmitter<any>  = new EventEmitter();
    
    @ViewChild('codeEditor', { static: true }) codeEditorElmRef: ElementRef;
    private codeEditor: ace.Ace.Editor;
    genCode = "";


    constructor(public cd: ChangeDetectorRef,
        public el: ElementRef) {
        this.cd.detach();
    }

    ngOnInit() {
        setTimeout(() => {
            
            ace.require('ace/ext/language_tools');
            const element = this.codeEditorElmRef.nativeElement;
            let editorOptions = this.getEditorOptions();
            this.codeEditor = ace.edit(element, editorOptions);
            this.codeEditor.renderer.setShowGutter(true);
            this.codeEditor.setTheme(THEME);
            this.codeEditor.setShowPrintMargin(false);
            this.codeEditor.getSession().setMode(LANG);
            this.codeEditor.setShowFoldWidgets(true);
            this.codeEditor.setFontSize('13.5px');
            this.codeEditor.setOptions({ readOnly: this.readOnly });
            this.codeEditor.getSession().setValue("");
        })

    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.codeEditor.getSession().setValue(this.data||"");

        });


    }

    ngOnChanges(values) {
        this.cd.reattach();

   


        setTimeout(() => {

            if (this.data !== undefined)
                this.codeEditor.getSession().setValue(this.data);
            if ( this.readOnly !==undefined) 
                this.codeEditor.setOptions({readOnly:this.readOnly})


            
           
            this.cd.detach();
        });
    }


    private getEditorOptions(): Partial<ace.Ace.EditorOptions> & { enableBasicAutocompletion?: boolean; } {
        const basicEditorOptions: Partial<ace.Ace.EditorOptions> = {
            highlightActiveLine: true,
            highlightSelectedWord: true,
            useWorker: false,
            minLines: 37
        };
        const margedOptions = Object.assign(basicEditorOptions);
        return margedOptions;
    }
    
    updateChanges(){ 
        this.cd.reattach();
        setTimeout(() => {        
            let myCode = ""+this.codeEditor.getSession().getValue();
            this.updatedData.emit(myCode);
            console.log(myCode)
            
           
            this.cd.detach();
        });
       
        
    }
}
