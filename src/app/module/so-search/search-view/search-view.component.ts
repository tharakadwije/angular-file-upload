import { Component, OnInit, Input, Output } from '@angular/core';
import { MenuItem } from 'primeng/primeng';
import { LocaleService, Language, LocaleTemplate, LoggerService } from '@pc/pc-sui';
import { Subscription } from 'rxjs';
import { ZhCN } from 'locale/zh-CN';
import { EnUS } from 'locale/en-US';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

import { StoringOrderData } from '../../domain/so.data';
import { StoringOrderService } from '../../service/storing-order.service';
import { EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-search-view',
  templateUrl: './search-view.component.html',
  styleUrls: ['./search-view.component.css']
})
export class SearchViewComponent implements OnInit {

  @Input() soDataList: StoringOrderData[];

  @Input() soSearchData: StoringOrderData;

  @Output() private passErrorSearchComp = new EventEmitter();

  headerMenuItems: MenuItem[] = [];
  bodyMenuItems: MenuItem[] = [];

  headerSurveyMenuItems: MenuItem[] = [];
  bodySurveyMenuItems: MenuItem[] = [];

  //Used to display/ prompt messages
  private commonMessageSuccess: string;
  private messages: any[] = [];
  private successMessages: any[] = [];
  private errorTitle: string;
  private blocked: boolean = false;

  private localeMessages: LocaleTemplate;
  private calendarDateFormat: any;
  private calendarLocale: any;

  //let for so deletion dialog
  private soDeletionDialog_isDisplay: boolean;
  private soDeletionDialog_title: string;
  private soDeletionDialog_suggestion: string;
  private soDeletionDialog_isDisplayItems: boolean;
  private soDeletionDialog_items: string;
  private storingOrderDeleteSuccessful: string;
  private storingOrderSurveySuccessful: string;

  private subscriptions = new Subscription();

  private selectedSOIndex: number;
  private selectedIndex: number;
  private deleteSOId: string;
  private surveySOId: string;
  private surveySOCntrId: string;
  private isMultiDeleteInd: boolean = false;
  private selectedSOArray: StoringOrderData[] = [];
  addSOSurveyInd: boolean=false;
  storingOrderSurveyDialogForm: FormGroup;

  timer: any
  private selectedCntrNArray: string[] = [];

  showNoRecords:boolean=false;

  private expandedItems: Array<any> = []; //This has used to auto expand on load  

  @Input() accessControl = {'surveyAllowed': false, 'createAllowed': false, 'updateAllowed': true, 'deleteAllowed': true };

  constructor(
    private localeService: LocaleService,
    private logger: LoggerService,
    private lang: Language,
    private storingOrderService: StoringOrderService,
    private route: ActivatedRoute,
    private router: Router,) { }

  ngOnInit() {
    debugger
    this.localeMessages = this.localeService.getLocaleMessages(ZhCN.getInstance(), EnUS.getInstance());

    this.errorTitle = this.localeMessages._messages['ERROR_MESSAGE_TITLE'];
    this.commonMessageSuccess = this.localeMessages._messages['COMMON_MESSAGE_SUCCESS'];
    this.storingOrderDeleteSuccessful = this.localeMessages._messages['STORING_ORDER_DELETE_SUCCESSFUL'];
    this.soDeletionDialog_suggestion = this.localeMessages._messages['DELETE_DIALOG_SUGGESTION'];
    this.soDeletionDialog_title = this.localeMessages._messages['STORING_ORDER_DELETE_DIALOG_TITLE'];
    this.storingOrderSurveySuccessful = this.localeMessages._messages['STORING_ORDER_SURVEY_SUCCESSFUL'];

    // if(this.soDataList.length==1){
    //   this.showNoRecords = this.soDataList[0].cntrN == null ? true :false;
    //   //this.soDataList=this.soDataList[0].cntrN == null ? null : this.soDataList;
    // }else{
    //   //this.soDataList=null;
    //   this.showNoRecords = true;
    // }

     if(this.soDataList.length==0){
      this.showNoRecords = true;
     }else{
      this.showNoRecords = false;
     }

    this.storingOrderSurveyDialogForm = new FormGroup({
      'depotRemarkX': new FormControl('', [Validators.required]),
    
    });
    
    this.headerMenuItems = [
      {
        label: this.localeMessages._messages['COMMON_MENU_DELETE'],
        icon: 'ui-icon-delete',
        command: (event) => {
          this._preSOMultiDelete();
        }
      }
    ];
    this.bodyMenuItems = [
      {
        label: this.localeMessages._messages['COMMON_MENU_DELETE'],
        icon: 'ui-icon-delete',
        command: (event) => {
          this._preSODelete();
        }
      }
    ];

    this.headerSurveyMenuItems = [
      {
        label: this.localeMessages._messages['COMMON_MENU_SURVEY'],
        icon: 'ui-icon-playlist-add-check',
        command: (event) => {
          this._preSOMultiSurvey();
        }
      }
    ];
    this.bodySurveyMenuItems = [
      {
        label: this.localeMessages._messages['COMMON_MENU_SURVEY'],
        icon: 'ui-icon-playlist-add-check',
        command: (event) => {
          this._preSOSurvey();
        }
      }
    ];

  }

  _preSODelete() {
    debugger
    this.logger.debug("this.selectedIndex > ", this.selectedIndex);
    this.logger.debug("this.selectedSOIndex > ", this.selectedSOIndex);

    let soData = this.soDataList[this.selectedSOIndex];
    let cntrN = soData.cntrN;
    this.deleteSOId = soData.soId;

    if (cntrN !== '' && cntrN !== undefined) {
      this.soDeletionDialog_isDisplayItems = true;
      this.soDeletionDialog_isDisplay = true;
      this.soDeletionDialog_items = cntrN.trim().toUpperCase();
    } else {
      this.soDeletionDialog_isDisplayItems = false;
    }
    
    this.isMultiDeleteInd = false;
  }

  _preSOMultiDelete() {
    debugger
    this.logger.debug("this.selectedIndex > ", this.selectedIndex);
    this.logger.debug("this.selectedSOArray > ", this.selectedSOArray);
    let cntrN = '';
    let soId = '';
    this.isMultiDeleteInd = true;

    if (this.selectedSOArray !== undefined && this.selectedSOArray && this.selectedSOArray.length>0) {
      this.selectedSOArray.forEach(function (so) {
        //console.debug("so > ", so);
        cntrN = cntrN.concat(',').concat(so.cntrN.trim().toUpperCase());
        soId = soId.concat(',').concat(so.soId);
      });
      this.soDeletionDialog_isDisplayItems = true;
      this.soDeletionDialog_isDisplay = true;
      this.soDeletionDialog_items = cntrN.substring(1, cntrN.length);
      this.deleteSOId = soId.substring(1, soId.length)
    } else {
      this.soDeletionDialog_isDisplayItems = false;
    }

  }

  _preSOSurvey() {
    debugger
    this.logger.debug("this.selectedIndex > ", this.selectedIndex);
    this.logger.debug("this.selectedSOIndex > ", this.selectedSOIndex);

    let soData = this.soDataList[this.selectedSOIndex];
    this.addSOSurveyInd =true;
    this.surveySOCntrId = soData.cntrN;
    this.surveySOId = soData.soId+"";
    
    
  }


  _preSOMultiSurvey() {
    debugger
    this.logger.debug("this.selectedIndex > ", this.selectedIndex);
    this.logger.debug("this.selectedSOArray > ", this.selectedSOArray);
    let cntrN = [];
    let soId = [];

    if (this.selectedSOArray && this.selectedSOArray.length>0) {
      this.selectedSOArray.forEach(function (so) {
        cntrN.push(so.cntrN.trim().toUpperCase());
        soId.push(so.soId);
      });
      this.surveySOCntrId = cntrN.join();
      this.surveySOId = soId.join();
      this.addSOSurveyInd =true;
    } else{
      this.addSOSurveyInd =false;
    }

  }

  doCancelSOSurveyAction(){
    this.addSOSurveyInd=false;
    this.storingOrderSurveyDialogForm.reset();
    //this.storingOrderSurveyDialogForm.get("depotRemarkX").setValue("");
  }

  _doCloseDialog() {
    this.soDeletionDialog_isDisplay = false;
    this.soDeletionDialog_items = '';
    this.deleteSOId = '';
   
  }
  
  _doDelete() {
    this.soDeletionDialog_isDisplay = false;
    this.doDeleteSOAction();
    this.deleteSOId = '';
  
  }

  private doSaveSOSurveyAction(){

    debugger
    this.messages = [];
    this.blocked = true;

    let storingOrderDataList :StoringOrderData [] = []; 
   
       debugger

       var surveySOIdArr = this.surveySOId.split(',');

       surveySOIdArr.forEach((soid, index) => {
        let soData : StoringOrderData = new StoringOrderData();
        debugger
        soData.soId=soid;
        soData.depotRemarkX=this.storingOrderSurveyDialogForm.get("depotRemarkX").value.trim().toUpperCase();
        storingOrderDataList[index]=soData;
       });

      
       let storingOrderRequestObj: any = { "so_list": storingOrderDataList };
      console.log("delete >> storingOrderDataList >> ", storingOrderDataList);
        
  debugger
    this.subscriptions.add(this.storingOrderService.updateSurveyStoringOrder(JSON.stringify(storingOrderRequestObj))
      .do(console.debug)
      .subscribe(res => {
        this.messages = [];
        debugger
        window.location.hash = "#topTitle";
        this.successMessages.push({ severity: 'success', summary: this.commonMessageSuccess, detail: this.storingOrderSurveySuccessful });
        window.scrollTo(0, 0);
        this.blocked = false;
        this.surveySOCntrId = "";
        this.surveySOId = "";
      },
      err => {
        debugger
        this.passErrorSearchComp.emit(err);
        this.blocked = false;
      })
    );

   this.doCancelSOSurveyAction();
  }

  private doDeleteSOAction() {

    debugger
    this.messages = [];
    this.blocked = true;

    let storingOrderDataList :StoringOrderData [] = []; 
    if (this.isMultiDeleteInd){
      storingOrderDataList = [...this.selectedSOArray];
    }else{
          let soData = this.soDataList[this.selectedSOIndex];
          let cntrN = soData.cntrN;
          this.deleteSOId = soData.soId;
          storingOrderDataList[0]=soData;
    }
       debugger
        let storingOrderRequestObj: any = { "so_list": storingOrderDataList };
    
        console.log("delete >> storingOrderDataList >> ", storingOrderDataList);
        
  debugger
    this.subscriptions.add(this.storingOrderService.deleteStoringOrderDetails(JSON.stringify(storingOrderRequestObj))
      .do(console.debug)
      .subscribe(res => {
        this.messages = [];
        debugger
        window.location.hash = "#topTitle";
        this.successMessages.push({ severity: 'success', summary: this.commonMessageSuccess, detail: this.storingOrderDeleteSuccessful });
        window.scrollTo(0, 0);
        this.blocked = false;
        //delete item from table
        if (this.isMultiDeleteInd){
          //53611 issue number
         // this.soDataList=null;
         this.isMultiDeleteInd=false;
         if (this.selectedSOArray !== null && this.selectedSOArray !== undefined) {
          let storingOrderData = this.soDataList;
          this.selectedSOArray.forEach(function (so) {
            for (let idx = 0; idx <= storingOrderData.length; idx++) {
              if (storingOrderData[idx].cntrN === so.cntrN) {
                storingOrderData.splice(idx, 1);
                break;
              }
            }
          });
          this.soDataList = storingOrderData;
        }

        }else{
          this.soDataList.splice(this.selectedSOIndex, 1);
        }

        this.soDeletionDialog_items = "";
        this.deleteSOId = "";

        this.soDataList = [...this.soDataList];
        this.selectedSOArray = [];
        this.selectedCntrNArray= [];
      },
      err => {
        debugger
        this.passErrorSearchComp.emit(err);
        this.blocked = false;
      })
    );


  }

  // _refreshDataTable() {
  //   this.logger.debug("this.selectedIndex > ", this.selectedIndex);
  //   this.logger.debug("this.selectedSOIndex > ", this.selectedSOIndex);
  //   this.logger.debug("this.selectedSOArray > ", this.selectedSOArray);
  //   if (this.isMultiDeleteInd) {
  //     if (this.selectedSOArray !== undefined && this.selectedSOArray[this.selectedIndex]) {
  //       let soDetailsDataList = this.soDetailsDataList;
  //       this.selectedSOArray[this.selectedIndex].forEach(function (so) {
  //         console.debug("so > ", so);
  //         for (let idx = 0; idx <= soDetailsDataList.length; idx++) {
  //           if (soDetailsDataList[idx].cntrN === so.cntrN) {
  //             soDetailsDataList.splice(idx, 1);
  //             break;
  //           }
  //         }
  //       });
  //       this.soDataList[this.selectedIndex].soDetailsDataList = soDetailsDataList;
  //       this.soDataList[this.selectedIndex].soDetailsDataList = [...this.soDataList[this.selectedIndex].soDetailsDataList];
  //       this.selectedSOArray[this.selectedIndex] = [];
  //     }
  //   } else {
  //     this.soDataList[this.selectedIndex].soDetailsDataList.splice(this.selectedSOIndex, 1);
  //     this.soDataList[this.selectedIndex].soDetailsDataList = [...this.soDataList[this.selectedIndex].soDetailsDataList];
  //   }
  // }


  _doUpdateSOByAuth(authN: String,vsIM: String) {

    console.log("IF>>>>>>>>>>>>> _doUpdateSOByAuth vsIM "+vsIM);

    let parameter = {};

    // let soSearch = {
    //   'authN': authN
    // }
debugger
    parameter = {
      'from': 'search-so',
      'authN': authN,
      'vsIM': vsIM,
      'criteria': JSON.stringify(this.soSearchData)
    }

    this.timer = setInterval(() => {
      this.router.navigate(['so/update'], {queryParams: parameter});
      clearInterval(this.timer);
    }, 10);
  
  } 

  _doUpdateSOByCntr(cntrN: String , authN: String, vsIM: String, orgCode: String) {
debugger
    console.log("IF>>>>>>>>>>>>> _doUpdateSOByCntr cntrN "+cntrN);
    console.log("IF>>>>>>>>>>>>> _doUpdateSOByCntr authN "+authN);
    console.log("IF>>>>>>>>>>>>> _doUpdateSOByCntr vsIM "+vsIM);
    console.log("IF>>>>>>>>>>>>> _doUpdateSOByCntr orgCode "+orgCode);

    let parameter = {};
    parameter = {
        'from': 'search-so',
        'vsIM': vsIM,
        'cntrN': cntrN,
        'orgCode': orgCode,
        'authN': authN=="" || authN=="-" || authN==null || authN==undefined ? null:authN,
        'criteria': JSON.stringify(this.soSearchData)
    }

    this.timer = setInterval(() => {
      this.router.navigate(['so/update'], {queryParams: parameter});
      clearInterval(this.timer);
    }, 10);
   
  } 

  private _setDefault(str:string):string {
    let result;
     if (!str || 0 === str.length){
      str = "-";
     }else if(str=="-"){
      str ="";
     }
    return str;
  }

  customSort(event) {
    this.expandedItems = [];
    const tmp = this.soDataList.sort((a: any, b: any): number => {
      if (event.field) {
        return a[event.field] > b[event.field] ? 1 : -1;
      }
    });
    if (event.order < 0) {
      tmp.reverse();
    }
    this.soDataList = [];
    tmp.forEach(row => {
      this.soDataList.push(row);
    });
  }

  customSortForDt(event) {
    this.expandedItems = [];
    const emptyRows = this.soDataList.filter(ro => !ro.expiryDt).map(ro => ro);
    let tmp = this.soDataList.filter(ro => ro.expiryDt).sort((a: any, b: any): number => {
      if (event.field) {
        return a[event.field] > b[event.field] ? 1 : -1;
      }
    });

    this.soDataList = [];
    if (event.order < 0) {
      tmp.reverse();
      tmp.forEach(row => {
        this.soDataList.push(row);
      });
      emptyRows.forEach(row => {
        this.soDataList.push(row);
      });

    }else{
      emptyRows.forEach(row => {
        this.soDataList.push(row);
      });
      tmp.forEach(row => {
        this.soDataList.push(row);
      });
    }
  }

  toggleCheckboxAll(event) {
    this.logger.info("toggleCheckboxAll - event: ", event);
  
    if (event) {
      this.selectedSOArray = this.soDataList.map(rc => rc);
      this.selectedCntrNArray = this.selectedSOArray.map(rc => ""+rc.soId);
      this.selectedCntrNArray.push('all');
    } else {
      this.selectedSOArray = [];
      this.selectedCntrNArray= [];
    }
  }
  
  toggleCheckbox(event, rowData) {
    this.logger.info("toggleCheckbox - event: " + event);
  debugger
    if (event) {
      this.selectedSOArray.push(rowData);
      this.selectedCntrNArray.push(rowData.soId);
  
      if (this.selectedSOArray.length === this.soDataList.length)
        this.selectedCntrNArray.push('all');
    } else {
      this.selectedSOArray = this.selectedSOArray.filter(rc => rc !== rowData);
      this.selectedCntrNArray = this.selectedSOArray.map(rc =>  ""+rc.soId);
    }
  }
}
