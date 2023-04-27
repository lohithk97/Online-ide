import { Component, OnInit, ViewChild, AfterViewInit,Output, EventEmitter, ChangeDetectorRef, ElementRef, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { NgTerminal, NgTerminalComponent } from 'ng-terminal';
import { FormControl } from '@angular/forms';
import { DisplayOption } from 'ng-terminal';
import { Terminal } from 'xterm';
import { FunctionsUsingCSI } from 'ng-terminal';
import { TerminalService } from '../terminal.service';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrls: ['./terminal.component.css']
})
export class TerminalComponent implements OnInit {
  

  @Input() data:string;
  @Input() stop:any;
  @Output() progressMessage = new EventEmitter();
  @Output() netConnectivity = new EventEmitter();
  title = 'NgTerminal Live Example';
  color = 'accent';

  public resizable: boolean;
  public fixed = false;

  disabled = false;
  rowsControl = new FormControl();
  colsControl = new FormControl();
  inputControl = new FormControl();
  text = "";

  displayOption: DisplayOption = {};
  displayOptionBounded: DisplayOption = {};//now it's not used
  underlying: Terminal;
  public term: Terminal;
  socket: any;
  @ViewChild('terminal', { static: false }) child: NgTerminal;



  constructor(public cd: ChangeDetectorRef,
    public el: ElementRef,
    private socketService: TerminalService) {

  }
  ngOnInit() {
    this.socket = this.socketService.setupSocketConnection();
    //this.sendData();
  }


  ngAfterViewInit() {
    this.startListening();

    console.log(this.child)
    this.underlying = this.child.underlying;
    this.underlying.setOption("fontSize", 20);
    this.invalidate();
    // this.child.write('welcome to mininet \n' + FunctionsUsingCSI.cursorColumn(1) + '\n' + FunctionsUsingCSI.cursorColumn(1) + 'mininet>');
    this.child.keyInput.subscribe((input) => {

      //do nothing because it will be replaced keyEventInput
    })

    this.child.keyEventInput.subscribe(e => {
      console.log('keyboard event:' + e.domEvent.keyCode + ', ' + e.key);

      const ev = e.domEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

      if (ev.keyCode === 13) {
        this.text += "\n";
        this.child.write('\n' + FunctionsUsingCSI.cursorColumn(1)+'$'); // \r\n
        this.sendData();
      }
      else if (ev.keyCode === 67 && ev.ctrlKey) {
        this.text = "\x03\r";
        this.sendData();
      }
      else if (ev.keyCode === 8) {
        // Do not delete the prompt
        if (this.child.underlying.buffer.active.cursorX > 1) {
          this.text = this.text.slice(0, this.text.length - 1);
          this.child.write('\b \b');
        }
      }

      else if (printable) {
        this.child.write(e.key);
        this.text += e.key;
      }
    })
    this.rowsControl.valueChanges.subscribe(() => { this.invalidate() });
    this.colsControl.valueChanges.subscribe(() => { this.invalidate() });
  }

  invalidate() {
    this.displayOption.fixedGrid = { rows: 200, cols: 700 };
    if (this.resizable)
      this.displayOption.activateDraggableOnEdge = { minWidth: 400, minHeight: 200 };
    else
      this.displayOption.activateDraggableOnEdge = undefined;
    if (this.fixed)
      this.displayOption.fixedGrid = { rows: this.rowsControl.value, cols: this.colsControl.value };
    else
      this.displayOption.fixedGrid = undefined;
    this.child.setDisplayOption(this.displayOption);
  }


  writeSubject = new Subject<string>();
  write() {
    console.log(this.inputControl.value)
    // this.writeSubject.next(eval(`'${this.inputControl.value}'`));
  }

  keyInput: string;

  onKeyInput(event: string) {
    this.keyInput = event;
  }

  get displayOptionForLiveUpdate() {
    return JSON.parse(JSON.stringify(this.displayOption));
  }


  startListening() {
    this.socketService.getMessages()
      .subscribe((data: any) => {
        data = JSON.parse(data)
        let output =data.output;
       
        if (data.type === 'start') {
          console.log(output+'end')
          output = output.replace(/\n/g, '\n' + FunctionsUsingCSI.cursorColumn(1));
          this.writeSubject.next(output)
          this.child.write('\n' + FunctionsUsingCSI.cursorColumn(1)+'mininet>' ); 
        }
        else if (data.type === 'command') {
          if (output === 'end')
            this.child.write('\n' + FunctionsUsingCSI.cursorColumn(1) + 'mininet>');
          else if (this.text !== output) {
            output = output.replace(/\n/g, '\n' + FunctionsUsingCSI.cursorColumn(1));
            this.writeSubject.next(output)

          }
        }
        else if (data.type === 'upload') {
          this.progressMessage.emit(data.output)
        }
        else if (data.type === 'upload-success') {
          this.progressMessage.emit("success")
        }
        else if(data.type === 'stop') {
          this.child.underlying.clear()
          
          // this.writeSubject.next('No mininet simulation is running')
        }
        else if(data.type === 'net-connectivity') {
          console.log(data);
          this.netConnectivity.emit(data)
            
        } 
        this.text = "";

      });
  }


  sendData() {

    if(this.text === 'clear\n') {
      this.child.underlying.clear();
      this.child.write('\n' + FunctionsUsingCSI.cursorColumn(1)+'mininet>' ); 
    }
    else {
      this.socketService.sendMessage(this.text);
    }
    this.text = "";
  }



}
