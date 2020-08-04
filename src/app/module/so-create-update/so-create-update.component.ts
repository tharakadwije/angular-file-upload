import { Component, OnInit, ViewChildren, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormControl, FormBuilder, FormArray, AbstractControl, ValidatorFn } from '@angular/forms';
import { LocaleService, Language, LocaleTemplate, LoggerService, AutoCompleteComponent, DateUtilService } from '@pc/pc-sui';
import { MenuItem, Accordion, SelectItem, SlideMenu, ConfirmDialogModule, InputTextareaModule, MultiSelectModule, RadioButtonModule, Dialog, DataTable } from 'primeng/primeng';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ZhCN } from 'locale/zh-CN';
import { EnUS } from 'locale/en-US';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { debug } from 'util';
import * as moment from 'moment';
import { StoringOrderData } from '../domain/so.data';
import { StoringOrderService } from '../service/storing-order.service';
import { DatePipe } from '@angular/common';
import { StringValidateRevealed } from '../util/string-validate-revealed';

@Component({
  selector: 'app-so-create-update',
  templateUrl: './so-create-update.component.html',
  styleUrls: ['./so-create-update.component.css']
})
export class SOCreateUpdateComponent implements OnInit {

  cntrNOEdit: string;
  private subscriptions = new Subscription();

  storingOrderMainForm: FormGroup;
  storingOrderDialogForm: FormGroup;

  hasInitError: boolean = false;
  cgoBookingMainForm: FormGroup;

  // controls to decide create or update function
  cntrN: string;
  authN: string;
  vsIM:string;
  cntOrg:string
  
  isVslInd: boolean;
  isCreate: boolean= true;
  isSingleRecord: boolean= false;
  timer: any;

  selectionMode:string ="multiple"

  //used to display Menu items
  addItems: MenuItem[] = [];
  editItems: MenuItem[] = [];
  
  headerSurveyMenuItems: MenuItem[] = [];
  bodySurveyMenuItems: MenuItem[] = [];

  //Used to indicate dialog popup - add or edit
  addSOInd: boolean;
  editSOInd: boolean;
  private isMultiDeleteInd: boolean = false;

  soIndex: number;

  //storingOrderData: StoringOrderData; // formData pass to server side
  storingOrderDataList: StoringOrderData[] = [];
  selectedSOArray: StoringOrderData[];
  private selectedCntrNArray: string[] = [];


  private localeMessages: LocaleTemplate;
  private calendarDateFormat: any;
  private calendarLocale: any;

  //Used to display/ prompt messages
  private commonMessageSuccess: string;
  private messages: any[] = [];
  private successMessages: any[] = [];
  private dialogMessages: Message[] = [];
  private errorTitle: string;
  private errorTitleCreate: string;
  private storingOrderCreateSuccessful: string;
  private storingOrderUpdateSuccessful: string;
  private storingOrderDeleteSuccessful: string;
  private blocked: boolean = false;

  blockFields: boolean = false;
  //For depot deletion dialog
  private soDeletionDialog_isDisplay: boolean;
  private soDeletionDialog_title: string;
  private soDeletionDialog_suggestion: string;
  private soDeletionDialog_isDisplayItems: boolean;
  private soDeletionDialog_items: string;

  //drop down values to be implemented
  //private depotCodeArray: any[];
  private cntrOprCodeArray: any[];
  private cntrSizeCodeArray: any[];
  private cntrTyCodeArray: any[];
  private cntrHtCodeArray: any[];

  selectedHaulierItem: any = null;

  domain:any;
  soSearchData: StoringOrderData

  constructor(private fb: FormBuilder,
    private localeService: LocaleService,
    private router: Router,
    private logger: LoggerService,
    private activatedRoute: ActivatedRoute,
    private lang: Language,
    private datePipe:DatePipe,
    private dateUtil: DateUtilService,
    private storingOrderService: StoringOrderService,
    private stringValidator: StringValidateRevealed,
    private route: ActivatedRoute,) { }

    @ViewChildren("hualierAc") hualierAcComp: AutoCompleteComponent[];

    accessControl = {'surveyAllowed': false, 'createAllowed': false, 'updateAllowed': true, 'deleteAllowed': true };


  ngOnInit() {

    //this.domain = "http://localhost:8023"

    if(this.route.snapshot.data.access){
      this.accessControl.createAllowed=this.route.snapshot.data.access.createAllowed;
      this.accessControl.updateAllowed=this.route.snapshot.data.access.updateAllowed;
      this.accessControl.deleteAllowed=this.route.snapshot.data.access.deleteAllowed;
      this.accessControl.surveyAllowed=this.route.snapshot.data.access.surveyAllowed;
  }

    this.localeMessages = this.localeService.getLocaleMessages(ZhCN.getInstance(), EnUS.getInstance());
    this.calendarDateFormat = this.localeService.getComponentLocaleMessages()._messages['PRIME_NG_CALENDAR_DATE_FORMAT'];
    this.calendarLocale = this.localeService.getComponentLocaleMessages()._messages['PRIME_NG_CALENDAR_LOCALE'];

    this.commonMessageSuccess = this.localeMessages._messages['COMMON_MESSAGE_SUCCESS'];
    this.storingOrderCreateSuccessful = this.localeMessages._messages['STORING_ORDER_CREATE_SUCCESSFUL'];
    this.storingOrderUpdateSuccessful = this.localeMessages._messages['STORING_ORDER_UPDATE_SUCCESSFUL'];
    this.storingOrderDeleteSuccessful = this.localeMessages._messages['STORING_ORDER_DELETE_SUCCESSFUL'];
    this.errorTitle = this.localeMessages._messages['ERROR_MESSAGE_TITLE'];
    this.errorTitleCreate = this.localeMessages._messages['ERROR_CREATE_TITLE'];
    this.soDeletionDialog_suggestion = this.localeMessages._messages['DELETE_DIALOG_SUGGESTION'];
    this.soDeletionDialog_title = this.localeMessages._messages['STORING_ORDER_DELETE_DIALOG_TITLE'];

    this.storingOrderMainForm = this.fb.group({
      'discBaId': new FormControl('', []),
      'authN': new FormControl('', []),
      'berthTime': new FormControl('', []),
      'cmplOfDisChrg': new FormControl('', []),
      'portC': new FormControl('', []),
      'terminal': new FormControl('', []),
      'cntrOprC': new FormControl('', [Validators.required]),
      'statusC': new FormControl('EMPTY', []),

      'ucr': new FormControl('', [])
    });

    this.cgoBookingMainForm = new FormGroup({
      'loader': new FormControl('', []),
      'berthTime': new FormControl('', []),
      'berthNo': new FormControl('', []),
      'unberthTime': new FormControl('', []),
      'terminal': new FormControl('', []),
      'port': new FormControl('', []),
      
      'ucr': new FormControl('', [Validators.required]),

      'cgoStatus': new FormControl('', []),
      'cgoType': new FormControl('', [Validators.required]),
      'trade': new FormControl('', [Validators.required]),
      'dcl_company': new FormControl('', []),

      'quantity': new FormControl('', [Validators.required]),
      'quantity_variance': new FormControl('', [Validators.required]),
      'weight': new FormControl('', [Validators.required]),
      'weight_variance': new FormControl('', [Validators.required]),
      'measurement': new FormControl('', [Validators.required]),
      'measurement_variance': new FormControl('', [Validators.required]),

      'port_of_discharge': new FormControl('', []),
      'port_of_destination': new FormControl('', []),
      'cgo_opr': new FormControl('', []),
      'cntr_opr': new FormControl('', []),

      'shipper_company': new FormControl('', []),
      'shipper_company_name': new FormControl('', []),
      'shipper_company_address': new FormControl('', []),

    });
    

      this.activatedRoute.queryParams.subscribe(params => {
      debugger
      this.cntrN = params['cntrN'];
      this.authN = params['authN'];
      this.vsIM = params['vsIM'];
      this.cntOrg = params['orgCode'];

      this.soSearchData = params['criteria'];

      debugger

      if (this.cntrN){
        this.selectionMode="";
      }

      if (this.cntrN || this.authN) {

        this.isCreate = false;
        if (this.authN) {
          this.isVslInd = true;
        }
        this.loadStoringOrderForUpdate();
  
      } else {
        this.isCreate = true;
      }
      
    });

    this.addItems = [
      {
        label: this.localeMessages._messages['COMMON_MENU_ADD'],
        icon: 'ui-icon-add',
        disabled:!this.isCreate,
        command: (event) => {
          this.dialogMessages = [];
          this.addSOInd = true;
          window.location.hash = "#topTitle";
          window.scrollTo(0, 0);
          this.ngAfterView();
        }
      },
      {
        label: this.localeMessages._messages['COMMON_MENU_DELETE'],
        icon: 'ui-icon-delete',
        disabled:this.isVslInd,
        command: (event) => {
          this._preSOMultiDelete();
        }
      }
    ];
    this.editItems = [
      {
        label: this.localeMessages._messages['COMMON_MENU_QUICK_EDIT'],
        icon: 'ui-icon-edit',
        command: (event) => {
          this._loadSO();
        }
      }
      , {
        label: this.localeMessages._messages['COMMON_MENU_DELETE'],
        icon: 'ui-icon-delete',
        disabled:this.isVslInd,
        command: (event) => {
          this._preSODelete();
        }
      }
    ];

    this._initSOForm();

    this.getUtilList();
  }

  private _initSOForm() {
    this.storingOrderDialogForm = new FormGroup({
      'cntrN': new FormControl('', [Validators.required,  this.stringValidator.noWhitespaceValidator, this.stringValidator.isSpecialCharacters, this.stringValidator.isEmoji]),
      'lengthQ': new FormControl('', [Validators.required, this.stringValidator.isSpecialCharacters, this.stringValidator.isEmoji]),
      'typeC': new FormControl('', [Validators.required, this.stringValidator.isSpecialCharacters, this.stringValidator.isEmoji]),
      'heightQ': new FormControl('', [this.stringValidator.isSpecialCharacters, this.stringValidator.isEmoji]),
      'consigneeM': new FormControl('', [this.stringValidator.isSpecialCharacters, this.stringValidator.isEmoji]),
      'haulierOrgC': new FormControl('', [Validators.required,this.stringValidator.isSpecialCharacters, this.stringValidator.isEmojiForAutoComp]),
      'instructionToHaulierX': new FormControl('',[this.stringValidator.isSpecialCharacters, this.stringValidator.isEmoji]),
      'depotC': new FormControl('', [Validators.required, this.stringValidator.isSpecialCharacters, this.stringValidator.isEmoji]),
      'freePeriodN': new FormControl('', [Validators.pattern('[0-9]*')]),
      'expiryDt': new FormControl('',[this.stringValidator.dateRangeValidator]),
      'remarkX': new FormControl('',[this.stringValidator.isSpecialCharacters, this.stringValidator.isEmoji]),
    });
  }


  private getUtilList(){
    this.blocked = true;
    this.subscriptions.add(this.storingOrderService.getUtilList()
      .do(console.log)
      .subscribe(res => {
        if (res['results']) {

          this.cntrHtCodeArray = [];
          this.cntrSizeCodeArray = [];
          this.cntrTyCodeArray = [];
          this.cntrOprCodeArray = [];

          let response = res['results'];
          let soHeightList = response['so-height'];
          let soTypeList = response['so-type'];
          let soSizeList = response['so-size'];
          let soOprCodeList = response['so-orgC'];

          this.cntrHtCodeArray.push({ label: "", value: "" });
          soHeightList.forEach(p =>{
              this.cntrHtCodeArray.push({ label: p, value: p });
            });

          soTypeList.forEach(p =>{
              this.cntrTyCodeArray.push({ label: p, value: p });
            });

          soSizeList.forEach(p =>{

            switch (p) {
              case '20': {
                this.cntrSizeCodeArray.push({ label: '20FT', value: p });
                break;
              }
              case '40': {
                this.cntrSizeCodeArray.push({ label: '40FT', value: p });
                break;
              }
              case '45': {
                this.cntrSizeCodeArray.push({ label: '45FT', value: p });
                break;
              }
              case '48': {
                this.cntrSizeCodeArray.push({ label: '48FT', value: p });
                break;
              }
              case '00': {
                this.cntrSizeCodeArray.push({ label: 'UC', value: p });
                break;
              }
              case '99': {
                this.cntrSizeCodeArray.push({ label: 'TEU', value: p });
                break;
              }
              default: {
                break;
              }
            }
            });

          soOprCodeList.forEach(p =>{
              this.cntrOprCodeArray.push({ label: p, value: p });
          });

          this.blocked = false;
        }
      },
        err => {
          this.messages = [];
        
          let resErrors = err;

          if (resErrors.errors) {
            this.messages.push({ severity: 'error', summary: "", detail: this.errorTitle });
            resErrors.errors.forEach((resErr) => {
              let code = resErr.errorCode;
              let message = resErr.errorMessage;
              this.messages.push({ severity: 'error', summary: code, detail: message });
             
            });
          } else if (resErrors.error) {
            let code = resErrors.errorCode;
            let message = resErrors.errorMessage;
            this.messages.push({ severity: 'error', summary: "", detail: this.errorTitle });
            this.messages.push({ severity: 'error', summary: code, detail: message });
          }

          this.blocked = false;
        }
      )
    );
    
  }

  private _toUpperCase(value: string): string {
    return value ? value.toUpperCase().trim() : value;
  }

  private doSaveSOAction() {
    debugger
    if (this._doValidateSO(null)) {
      let storingOrderData = new StoringOrderData();
      storingOrderData.cntrN = this._toUpperCase(this.storingOrderDialogForm.get("cntrN").value);
      storingOrderData.lengthQ = this.storingOrderDialogForm.get("lengthQ").value;
      storingOrderData.typeC = this.storingOrderDialogForm.get("typeC").value;
      storingOrderData.heightQ =this.storingOrderDialogForm.get("heightQ").value;
      storingOrderData.consigneeM = this._toUpperCase(this.storingOrderDialogForm.get("consigneeM").value);
      storingOrderData.haulierOrgC = this._toUpperCase(this.storingOrderDialogForm.get("haulierOrgC").value);
      storingOrderData.instructionToHaulierX = this._toUpperCase(this.storingOrderDialogForm.get("instructionToHaulierX").value);
      storingOrderData.depotC = this._toUpperCase(this.storingOrderDialogForm.get("depotC").value);
      storingOrderData.freePeriodN = this.storingOrderDialogForm.get("freePeriodN").value;
      storingOrderData.expiryDt = this.storingOrderDialogForm.get("expiryDt").value;
      storingOrderData.remarkX = this._toUpperCase(this.storingOrderDialogForm.get("remarkX").value);

      this.storingOrderDataList.push(storingOrderData);
      this.storingOrderDataList = [...this.storingOrderDataList];
      this.addSOInd = false;
      this.editSOInd = false;
      this._initSOForm();
    } else
      return false;
  }

  private doUpdateSOAction() {

    if (this._doValidateSO(this.cntrNOEdit)) {
      let storingOrderData = this.storingOrderDataList[this.soIndex];

      storingOrderData.cntrN = this._toUpperCase(this.storingOrderDialogForm.get("cntrN").value);
      storingOrderData.lengthQ = this.storingOrderDialogForm.get("lengthQ").value;
      storingOrderData.typeC = this.storingOrderDialogForm.get("typeC").value;
      storingOrderData.heightQ = this.storingOrderDialogForm.get("heightQ").value;
      storingOrderData.consigneeM = this._toUpperCase(this.storingOrderDialogForm.get("consigneeM").value);
      storingOrderData.haulierOrgC = this._toUpperCase(this.storingOrderDialogForm.get("haulierOrgC").value);
      storingOrderData.instructionToHaulierX = this._toUpperCase(this.storingOrderDialogForm.get("instructionToHaulierX").value);
      storingOrderData.depotC = this._toUpperCase(this.storingOrderDialogForm.get("depotC").value);
      storingOrderData.freePeriodN = this.storingOrderDialogForm.get("freePeriodN").value;
      storingOrderData.expiryDt = this.storingOrderDialogForm.get("expiryDt").value;
      storingOrderData.remarkX = this._toUpperCase(this.storingOrderDialogForm.get("remarkX").value);

      this.storingOrderDataList = [...this.storingOrderDataList];
      this.addSOInd = false;
      this.editSOInd = false;
      this._initSOForm();
    } else {
      return false;
    }

  }

  private _doValidateSO(cntrNo:string): boolean {
    let isValidInd = true;
    for (const i in this.storingOrderDialogForm.controls) {
      if (this.storingOrderDialogForm.controls[i]) {
        this.storingOrderDialogForm.controls[i].markAsDirty();
      }
    }

    if (this.storingOrderDialogForm.controls['cntrN'].invalid || this.storingOrderDialogForm.controls['lengthQ'].invalid ||
      this.storingOrderDialogForm.controls['typeC'].invalid || this.storingOrderDialogForm.controls['haulierOrgC'].invalid ||
      this.storingOrderDialogForm.controls['depotC'].invalid || 
      this.storingOrderDialogForm.controls['heightQ'].invalid || this.storingOrderDialogForm.controls['consigneeM'].invalid ||
      this.storingOrderDialogForm.controls['instructionToHaulierX'].invalid || this.storingOrderDialogForm.controls['freePeriodN'].invalid ||
      this.storingOrderDialogForm.controls['expiryDt'].invalid || this.storingOrderDialogForm.controls['remarkX'].invalid) {
      isValidInd = false;
    }


    
     if (this.storingOrderDialogForm.controls['cntrN'].value !== undefined && isValidInd) {
      if(this.storingOrderDataList !== undefined ){
        if(!cntrNo && cntrNo!=this.storingOrderDialogForm.controls['cntrN'].value){
          this.storingOrderDataList.forEach(p => {
            if (p.cntrN == this.storingOrderDialogForm.controls['cntrN'].value) {
              this.storingOrderDialogForm.get("cntrN").setErrors({ 'duplicated': true });
              this.storingOrderDialogForm.get("cntrN").markAsDirty();
              isValidInd = false;
            } 
          });
       }
      }
    }

    return isValidInd;
  }


  private _loadSO() {
    debugger
    this.editSOInd = true;
    window.location.hash = "#topTitle";
    window.scrollTo(0, 0);
    
    debugger
    let storingOrderData = new StoringOrderData();
    storingOrderData = this.storingOrderDataList[this.soIndex];
    this.storingOrderDialogForm.get("cntrN").setValue(storingOrderData.cntrN);
    this.storingOrderDialogForm.get("lengthQ").setValue(this._setEmpty(storingOrderData.lengthQ));
    this.storingOrderDialogForm.get("typeC").setValue(this._setEmpty(storingOrderData.typeC));
    this.storingOrderDialogForm.get("heightQ").setValue(this._setEmpty(storingOrderData.heightQ));
    this.storingOrderDialogForm.get("consigneeM").setValue(this._setEmpty(storingOrderData.consigneeM));
    this.storingOrderDialogForm.get("haulierOrgC").setValue(this._setEmpty(storingOrderData.haulierOrgC));
    this.storingOrderDialogForm.get("instructionToHaulierX").setValue(this._setEmpty(storingOrderData.instructionToHaulierX));
    this.storingOrderDialogForm.get("depotC").setValue(this._setEmpty(storingOrderData.depotC));
    this.storingOrderDialogForm.get("freePeriodN").setValue(this._checkZero(storingOrderData.freePeriodN+""));
  
    if(this.isCreate)this.storingOrderDialogForm.get("expiryDt").setValue(storingOrderData.expiryDt);
    else {
      this.storingOrderDialogForm.get("expiryDt").setValue(storingOrderData.expiryDt? new Date(storingOrderData.expiryDt) : "");
      this.storingOrderDialogForm.get("lengthQ").clearValidators();
      this.storingOrderDialogForm.get("lengthQ").updateValueAndValidity();
      this.storingOrderDialogForm.get("typeC").clearValidators();
      this.storingOrderDialogForm.get("typeC").updateValueAndValidity();
    }

    this.storingOrderDialogForm.get("remarkX").setValue(this._setEmpty(storingOrderData.remarkX));
    this.cntrNOEdit =  storingOrderData.cntrN;
    this.ngAfterView();

   
  }

  ngAfterView() {
    debugger
    this.timer = setInterval(() => {
      this.hualierAcComp.forEach(obj => {
              const hualierM: string =  this.storingOrderDialogForm.get("haulierOrgC").value;
              const hualier = {
                'haulierOrgC': hualierM,
              };
              if(this.addSOInd) obj.keepValue(hualier, 'haulierOrgC', "", true);
              else obj.keepValue(hualier, 'haulierOrgC', hualierM, true);
         
      });
      clearInterval(this.timer);
  }, 10);

}

  private _removeSO() {
    
    this.storingOrderDataList.splice(this.soIndex, 1);
    this.storingOrderDataList = [...this.storingOrderDataList];
    this.selectedSOArray = [];
    this.selectedCntrNArray = [];
  }

  private _removeMultiSO() {
    if (this.selectedSOArray !== null && this.selectedSOArray !== undefined) {
      let storingOrderData = this.storingOrderDataList;
      this.selectedSOArray.forEach(function (so) {
        for (let idx = 0; idx <= storingOrderData.length; idx++) {
          if (storingOrderData[idx].cntrN === so.cntrN) {
            storingOrderData.splice(idx, 1);
            break;
          }
        }
      });
      this.storingOrderDataList = storingOrderData;
      this.storingOrderDataList = [...this.storingOrderDataList];
      this.selectedSOArray = [];
      this.selectedCntrNArray = [];
    }
  }

  // private _removeSOTable() {
  //   debugger
  //     let storingOrderData = this.storingOrderDataList;
  //     this.selectedSOArray.forEach(function (so) {
  //       for (let idx = 0; idx <= storingOrderData.length; idx++) {
  //         if (storingOrderData[idx].cntrN === so.cntrN) {
  //           storingOrderData.splice(idx, 1);
  //           break;
  //         }
  //       }
  //     });
  //     this.storingOrderDataList = storingOrderData;
  //     this.storingOrderDataList = [...this.storingOrderDataList];
  //     this.selectedSOArray = [];
  //     this.selectedCntrNArray = [];
  // }

  private doCancelSOAction() {
    this._initSOForm();
    this.addSOInd = false;
    this.editSOInd = false;
  }

 

  _preSODelete() {

    this.logger.debug("this.soIndex > ", this.soIndex);

    let soData = this.storingOrderDataList[this.soIndex];
    let cntrN = soData.cntrN;

    if (cntrN !== '' && cntrN !== undefined) {
      this.soDeletionDialog_isDisplayItems = true;
      this.soDeletionDialog_isDisplay = true;
      this.soDeletionDialog_items = cntrN.trim().toUpperCase();
    } else {
      this.soDeletionDialog_isDisplayItems = false;
    }
    
  }

  _preSOMultiDelete() {

    this.logger.debug("this.selectedSOArray > ", this.selectedSOArray);
    let cntrN = '';

    if (this.selectedSOArray !== undefined && this.selectedSOArray && this.selectedSOArray.length>0) {
      this.isMultiDeleteInd = true;
      this.selectedSOArray.forEach(function (so) {
        cntrN = cntrN.concat(',').concat(so.cntrN.trim().toUpperCase());
      });
      this.soDeletionDialog_isDisplayItems = true;
      this.soDeletionDialog_isDisplay = true;
      this.soDeletionDialog_items = cntrN.substring(1, cntrN.length);
    } else {
      this.soDeletionDialog_isDisplayItems = false;
    }

  }
  
  _doCloseDialog() {
    this.soDeletionDialog_isDisplay = false;
    this.soDeletionDialog_items = '';
    this.isMultiDeleteInd = false;
  }

  _doDelete() {
    this.soDeletionDialog_isDisplay = false;
    // if (this.isMultiDeleteInd)
    //   this._removeMultiSO();
    // else
    //   this._removeSO();

    this._refreshDataTable();
  }

  _refreshDataTable() {
    this.logger.debug("this.soIndex > ", this.soIndex);
    this.logger.debug("this.selectedSOArray > ", this.selectedSOArray);
    if (this.isMultiDeleteInd) {
      this.isMultiDeleteInd = false;
      if (this.selectedSOArray !== undefined && this.selectedSOArray) {
        let soDetailsDataList = this.storingOrderDataList;
        this.selectedSOArray.forEach(function (so) {
          for (let idx = 0; idx <= soDetailsDataList.length; idx++) {
            if (soDetailsDataList[idx].cntrN === so.cntrN) {
              soDetailsDataList.splice(idx, 1);
              break;
            }
          }
        });
        this.storingOrderDataList = soDetailsDataList;
      }

      this.selectionMode="";
      this.selectionMode="multiple";
    } else {
      this.storingOrderDataList.splice(this.soIndex, 1);
    }
    this.storingOrderDataList = [...this.storingOrderDataList];
    this.selectedSOArray = [];
    this.selectedCntrNArray = [];
}


  private doBackAction() {
    debugger
    if (this.soSearchData) {
      this.timer = setInterval(() => {
        const parameter = {
          'from': 'search-so',
          'criteria': this.soSearchData
        }
        this.router.navigate(['/so/search'], { queryParams: parameter });
        clearInterval(this.timer);
      }, 50);
    } else {
      this.timer = setInterval(() => {
        this.router.navigate(['/so/search']);
        clearInterval(this.timer);
      }, 50);
    }

   
  }

  doSaveAllAction() {
    let validForm: boolean = true;


    for (const i in this.storingOrderMainForm.controls) {
      if (this.storingOrderMainForm.controls[i]) {
        this.storingOrderMainForm.controls[i].markAsDirty();
      }
    }

    if (!(this.storingOrderMainForm.controls['cntrOprC'].valid)) {
      validForm = false;
      return false;
    }

    if (validForm && this.storingOrderDataList.length <= 0) {
      this.messages = [];
      this.messages.push({ severity: 'error', summary: "", detail: this.errorTitle });
      this.messages.push({ severity: 'error', summary: "DEPOT_SO_CODE_00018", detail: this.errorTitleCreate });
      return false;
    }

    //Save
    const storingOrderDataListClone  = this.storingOrderDataList.map(obj => ({...obj}));;// Object.assign([], this.storingOrderDataList);
    if (storingOrderDataListClone.length > 0) {
      storingOrderDataListClone.forEach(storingOrderData => {
        storingOrderData.expiryDt = this._dateFormart(storingOrderData.expiryDt);
        storingOrderData.cntrOprC = this._toUpperCase(this.storingOrderMainForm.get('cntrOprC').value);
        storingOrderData.statusC = this._toUpperCase(this.storingOrderMainForm.get('statusC').value);
      });
    }
    let storingOrderRequestObj: any = { "so_list": storingOrderDataListClone };

    this.blocked = true;

    this.subscriptions.add(this.storingOrderService.saveStoringOrderDetails(JSON.stringify(storingOrderRequestObj))
      .do(console.log)
      .subscribe(res => {
            this.messages = [];
            debugger
            window.location.hash = "#topTitle";
            this.successMessages.push({ severity: 'success', summary: this.commonMessageSuccess, detail: this.storingOrderCreateSuccessful });
            window.scrollTo(0, 0);
            this.blocked = false;
            this.blockFields = true;
      },
        err => {
          this.messages = [];
          let resErrors = err;

          if (resErrors.errors) {
            this.messages.push({ severity: 'error', summary: "", detail: this.errorTitle });
            resErrors.errors.forEach((resErr) => {
              let code = resErr.errorCode;
              let message = resErr.errorMessage;
              this.messages.push({ severity: 'error', summary: code, detail: message });

            });
          } else if (resErrors.error) {
            let code = resErrors.errorCode;
            let message = resErrors.errorMessage;
            this.messages.push({ severity: 'error', summary: "", detail: this.errorTitle });
            this.messages.push({ severity: 'error', summary: code, detail: message });
          }

          window.location.hash = "#topTitle";
          window.scrollTo(0, 0);
          this.blocked = false;
        }
      )
    );
  }

  doUpdateAllAction() {
    debugger
    let isValidInd = true;
    if (this.storingOrderDataList.length > 0) {
        this.storingOrderDataList.forEach(storingOrderData => {
          if(this._isValidValue(storingOrderData.cntrN) // || this._isValidValue(storingOrderData.lengthQ)  //|| this._isValidValue(storingOrderData.typeC)
            || this._isValidValue(storingOrderData.haulierOrgC) || this._isValidValue(storingOrderData.depotC)){
              isValidInd = false;
              return false;
          }
       });
    }

    if (!isValidInd || this.storingOrderDataList.length <= 0) {
      this.messages = [];
      this.messages.push({ severity: 'error', summary: "", detail: this.errorTitle });
      this.messages.push({ severity: 'error', summary: "DEPOT_SO_CODE_00018", detail: this.errorTitleCreate });
      return false;
    }

    if (this.storingOrderDataList.length > 0 && isValidInd) {
      this.storingOrderDataList.forEach(storingOrderData => {
        if (storingOrderData.soId === '' || storingOrderData.soId === undefined) {
          storingOrderData.expiryDt = this._dateFormart(storingOrderData.expiryDt);
          storingOrderData.cntrOprC = this._toUpperCase(storingOrderData.cntrOprC);
          storingOrderData.statusC = this._toUpperCase(this.storingOrderMainForm.get('statusC').value);
        }
      });
    }

    let storingOrderRequestObj: any = { "so_list": this.storingOrderDataList };

    this.blocked = true;
    
    this.subscriptions.add(this.storingOrderService.updateStoringOrderDetails(JSON.stringify(storingOrderRequestObj))
      .subscribe(res => {
        this.messages = [];
        debugger
        window.location.hash = "#topTitle";
        this.successMessages.push({ severity: 'success', summary: this.commonMessageSuccess, detail: this.storingOrderUpdateSuccessful });
        window.scrollTo(0, 0);
        this.blocked = false;
        this.blockFields = true;
      },
        err => {
          this.messages = [];
          let resErrors = err;

          if (resErrors.errors) {
            this.messages.push({ severity: 'error', summary: "", detail: this.errorTitle });
            resErrors.errors.forEach((resErr) => {
              let code = resErr.errorCode;
              let message = resErr.errorMessage;
              this.messages.push({ severity: 'error', summary: code, detail: message });

            });
          } else if (resErrors.error) {
            let code = resErrors.errorCode;
            let message = resErrors.errorMessage;
            this.messages.push({ severity: 'error', summary: "", detail: this.errorTitle });
            this.messages.push({ severity: 'error', summary: code, detail: message });
          }

          window.location.hash = "#topTitle";
          window.scrollTo(0, 0);
          this.blocked = false;
        }
      )
    );
  }

  loadStoringOrderForUpdate() {
    this.subscriptions.add(this.storingOrderService.getStoringOrderDetails(this.cntrN, this.authN, this.cntOrg)
      .subscribe((res) => {
        debugger
        this.blocked = false;
        this.messages = [];
        debugger

        if (res['results']) {
          debugger
          let storingOrderDataResult = res['results'];
          let storingOrderList =storingOrderDataResult['so-result'];

          storingOrderList.forEach(storingOrder => {

              let storingOrderData = new StoringOrderData();
              storingOrderData.cntrN = this._toUpperCase(storingOrder.cntrN);
              storingOrderData.lengthQ = storingOrder.mtContainer?storingOrder.mtContainer.lengthQ:"";
              storingOrderData.typeC = storingOrder.mtContainer?storingOrder.mtContainer.typeC:"";
              storingOrderData.heightQ = storingOrder.mtContainer?storingOrder.mtContainer.heightQ:"";
              storingOrderData.consigneeM = storingOrder.consigneeM;
              storingOrderData.haulierOrgC = this._toUpperCase(storingOrder.haulierOrgC);
              storingOrderData.instructionToHaulierX = this._toUpperCase(storingOrder.instructionToHaulierX);
              storingOrderData.depotC = this._toUpperCase(storingOrder.depotC);
              storingOrderData.freePeriodN = +storingOrder.freePeriodN;
              storingOrderData.expiryDt = storingOrder.expiryDt;
              storingOrderData.cntrOprC = this._toUpperCase(storingOrder.cntrOprC);
              storingOrderData.remarkX = this._toUpperCase(storingOrder.mtContainer? storingOrder.mtContainer.remarksX : "");
              storingOrderData.vesselInfo = storingOrder.vesselInfo;
              if(storingOrderData.vesselInfo){
                   this.isVslInd = true;
              }

            this.storingOrderDataList.push(storingOrderData);
          });
         
          this.storingOrderDataList = [...this.storingOrderDataList];
          this.storingOrderMainForm.patchValue({ discBaId: storingOrderList[0].discBaId, authN: storingOrderList[0].authorisationSlipX, berthTime: storingOrderList[0].vesselInfo== null ? "-":storingOrderList[0].vesselInfo.bthgDt, cmplOfDisChrg: storingOrderList[0].vesselInfo == null ? "-":storingOrderList[0].vesselInfo.unbthgDt, portC: storingOrderList[0].vesselInfo == null ? "-":storingOrderList[0].vesselInfo.portC, terminal: storingOrderList[0].vesselInfo== null ? "-":storingOrderList[0].vesselInfo.terminalC, cntrOprC: storingOrderList[0].cntrOprC, statusC: storingOrderList[0].statusC });

          if(this.storingOrderDataList.length<=1){
              this.isSingleRecord =true;
            }
        }
      },
        err => {
          this.messages = [];
          let resErrors = err;

          if (resErrors.errors) {
            this.messages.push({ severity: 'error', summary: "", detail: this.errorTitle });
            resErrors.errors.forEach((resErr) => {
              let code = resErr.errorCode;
              let message = resErr.errorMessage;
              this.messages.push({ severity: 'error', summary: code, detail: message });

            });
          } else if (resErrors.error) {
            let code = resErrors.errorCode;
            let message = resErrors.errorMessage;
            this.messages.push({ severity: 'error', summary: "", detail: this.errorTitle });
            this.messages.push({ severity: 'error', summary: code, detail: message });
          }

          window.location.hash = "#topTitle";
          window.scrollTo(0, 0);
          this.blocked = false;
        }
      )
    );
  }

  private _dateFormart(date:string):string {
   
    debugger
      if(date){
      //let result;
    
      //var momentDate = moment(date).format("YYYY-MM-DD");
      //result = momentDate+"T00:00:00";
      //result = this.datePipe.transform(date, "yyyy-MM-dd'T'HH:mm:ss");
      //:2019-05-15T00:00:00
      
      //return result;

        const tmp = this.dateUtil.parseDate(new Date(date));
        return tmp[0] + '-' + tmp[1] + '-' + tmp[2] + "T" + tmp[3] + ":" + tmp[4]+ ":" + tmp[5];
    }
    //return date;
  }

 
  private _setEmpty(str:string):string {
    if (!str || 0 === str.length || "-" == str.trim()){
      str = "";
     }
     return str;
  }

  private _checkZero(str:string):string {
    if (!str || "0" == str.trim()){
      str = "";
     }
     return str;
  }

  private _isValidValue(str:string):boolean {
     if (!str || 0 === str.length || "-" == str.trim())
     return true;
     return  false;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  _onKeyUpHaulierEvent(event: any) {
    if (this.selectedHaulierItem) {
        this.selectedHaulierItem = null;
    }
  }

  itemHaulierSelected(selectedItem: any): void {
    this.logger.debug('Selected itemHaulierSelected: %s', JSON.stringify(selectedItem));
    if (selectedItem != null && Object.keys(selectedItem).length > 1) {
        this.selectedHaulierItem = selectedItem;
    } else {
        this.selectedHaulierItem = null;
    }
}

toggleCheckboxAll(event) {
  this.logger.info("toggleCheckboxAll - event: ", event);

  if (event) {
    this.selectedSOArray = this.storingOrderDataList.map(rc => rc);
    this.selectedCntrNArray = this.selectedSOArray.map(rc => rc.cntrN);
    this.selectedCntrNArray.push('all');
  } else {
    this.selectedSOArray = [];
    this.selectedCntrNArray= [];
  }
}

toggleCheckbox(event, rowData) {
  this.logger.info("toggleCheckbox - event: " + event);

  if (event) {
    this.selectedSOArray.push(rowData);
    this.selectedCntrNArray.push(rowData.cntrN);

    if (this.selectedSOArray.length === this.storingOrderDataList.length)
      this.selectedCntrNArray.push('all');
  } else {
    this.selectedSOArray = this.selectedSOArray.filter(rc => rc !== rowData);
    this.selectedCntrNArray = this.selectedSOArray.map(rc => rc.cntrN);
  }
}


get _getLoader(){ return this.cgoBookingMainForm.controls['loader'];}

get _getBerthTime(){ return this.cgoBookingMainForm.controls['berthTime'];}

get _getBerthNo(){ return this.cgoBookingMainForm.controls['berthNo'];}

get _getUnBerthTime(){ return this.cgoBookingMainForm.controls['unberthTime'];}

get _getPort(){ return this.cgoBookingMainForm.controls['port'];}

get _getTerminal(){ return this.cgoBookingMainForm.controls['terminal'];}

get _getUCRREF(){ return this.cgoBookingMainForm.controls['ucr'];}

get _getCgoStatus(){ return this.cgoBookingMainForm.controls['cgoStatus'];}

get _getCgoType(){ return this.cgoBookingMainForm.controls['cgoType'];}

get _getTrade(){ return this.cgoBookingMainForm.controls['trade'];}

get _getDCLCompany(){ return this.cgoBookingMainForm.controls['dcl_company'];}

get _getQuantity(){ return this.cgoBookingMainForm.controls['quantity'];}

get _getQuantityVariance(){ return this.cgoBookingMainForm.controls['quantity_variance'];}

get _getWeight(){ return this.cgoBookingMainForm.controls['weight'];}

get _getWeightVariance(){ return this.cgoBookingMainForm.controls['weight_variance'];}

get _getMeasurement(){ return this.cgoBookingMainForm.controls['measurement'];}

get _getMeasurementVariance(){ return this.cgoBookingMainForm.controls['measurement_variance'];}

get _getPortOfDischarge(){ return this.cgoBookingMainForm.controls['port_of_discharge'];}

get _getPortOfDestination(){ return this.cgoBookingMainForm.controls['port_of_destination'];}

get _getCgoOpr(){ return this.cgoBookingMainForm.controls['cgo_opr'];}

get _getCntrOpr(){ return this.cgoBookingMainForm.controls['cntr_opr'];}

get _getShipperCompany(){ return this.cgoBookingMainForm.controls['shipper_company'];}

get _getShipperName(){ return this.cgoBookingMainForm.controls['shipper_company_name'];}

get _getShipperAddress(){ return this.cgoBookingMainForm.controls['shipper_company_address'];}





get _getCntrN(){ return this.storingOrderDialogForm.controls['cntrN'];}

get _getLengthQ(){ return this.storingOrderDialogForm.controls['lengthQ'];}

get _getTypeC(){ return this.storingOrderDialogForm.controls['typeC'];}

get _getHeightQ(){ return this.storingOrderDialogForm.controls['heightQ'];}

get _getConsigneeM(){ return this.storingOrderDialogForm.controls['consigneeM'];}

get _getHaulierM(){ return this.storingOrderDialogForm.controls['haulierOrgC'];}

get _getInstructionToHaulierX(){ return this.storingOrderDialogForm.controls['instructionToHaulierX'];}

get _getDepotC(){ return this.storingOrderDialogForm.controls['depotC'];}

get _getFreePeriodN(){ return this.storingOrderDialogForm.controls['freePeriodN'];}

get _getExpiryDt(){ return this.storingOrderDialogForm.controls['expiryDt'];}

get _getRemarkX(){ return this.storingOrderDialogForm.controls['remarkX'];}


}