import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Accordion, ButtonModule, AccordionModule, GalleriaModule, ChartModule, DataTableModule, MultiSelectModule, MenuModule, ContextMenuModule, SplitButtonModule, SelectButtonModule, CalendarModule, SlideMenuModule, AutoCompleteModule, BlockUIModule, CheckboxModule, ConfirmDialogModule, DataListModule, DialogModule, DropdownModule, GrowlModule, InputTextModule, MessagesModule, PaginatorModule, PanelModule, ProgressSpinnerModule, RadioButtonModule, TooltipModule, TabViewModule, ListboxModule, MenuItem, SelectItem } from 'primeng/primeng';
import { LocaleTemplate, LoggerService, LocaleService, Language, AutoCompleteComponent } from '@pc/pc-sui';
import { environment } from 'environments/environment';
import { PcAuthorizationService } from '@pc/pc-security';
import { ZhCN } from 'locale/zh-CN';
import { EnUS } from 'locale/en-US';
import { StoringOrderService } from '../service/storing-order.service';
import { Subscription } from 'rxjs';
import { StringValidateRevealed } from '../util/string-validate-revealed';
import { StoringOrderData } from '../domain/so.data';

@Component({
  selector: 'app-so-search',
  templateUrl: './so-search.component.html',
  styleUrls: ['./so-search.component.css']
})
export class SOSearchComponent implements OnInit {

  soSearchForm: FormGroup;
  storingOrderSurveyDialogForm: FormGroup;

  timer : any;
  @ViewChild("pAccordion") pAccordion: Accordion;

  @ViewChild("cntrOperatorAcComp") cntrOperatorAcComp: AutoCompleteComponent;
  @ViewChild("vslVoyAcComp") vslVoyAcComp: AutoCompleteComponent;

  //selectedVsl: any = { baId: ""};
  selectedVslVoyItem:any  = null;
  baId :string;

  private messages: any[] = [];

  private subscriptions = new Subscription();

  private hintVslVoy: String;
  
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private logger: LoggerService,
    private localeService: LocaleService,
    private lang: Language,
    private route: ActivatedRoute,
    private storingOrderService: StoringOrderService,
    private stringValidator: StringValidateRevealed,
    private activatedRoute: ActivatedRoute,
  ) { }

  private localeMessages: LocaleTemplate;
  private locale: string;
  private calendarDateFormat: any;
  private calendarLocale: any;
  private errorTitle: string;
  private domain: string;
  private domainVSL: string;
  private domainOrg: string;
  
  private DATE_RANGE;
  
  private privatesuccessMessages: any[] = [];
  private blocked: boolean = false;
  soSearchData: any;

  soDataList: any[];
  
  accessControl = {'surveyAllowed': false, 'createAllowed': false, 'updateAllowed': false, 'deleteAllowed': false };

  ngOnInit() {
    //this.domainOrg = "http://10.115.40.13:8023"
    //this.domainVSL = "http://10.115.40.13:8026"

    if(this.route.snapshot.data.access){
      this.accessControl.createAllowed=this.route.snapshot.data.access.createAllowed;
      this.accessControl.updateAllowed=this.route.snapshot.data.access.updateAllowed;
      this.accessControl.deleteAllowed=this.route.snapshot.data.access.deleteAllowed;
      this.accessControl.surveyAllowed=this.route.snapshot.data.access.surveyAllowed;
    }
    this.domain = environment.SO_REQUEST_URI;
    this.locale = this.lang.locale;
    this.localeMessages = this.localeService.getLocaleMessages(ZhCN.getInstance(), EnUS.getInstance());
    this.calendarDateFormat = this.localeService.getComponentLocaleMessages()._messages['PRIME_NG_CALENDAR_DATE_FORMAT'];
    this.calendarLocale = this.localeService.getComponentLocaleMessages()._messages['PRIME_NG_CALENDAR_LOCALE'];
    this.errorTitle = this.localeMessages._messages['ERROR_MESSAGE_TITLE'];
    this.DATE_RANGE= environment.DATE_RANGE;
    this.hintVslVoy = this.localeMessages._messages['HINT_VSL_VOY'];


  this.soSearchForm = this.fb.group({
      'discBaId': new FormControl('', []),
      'depotC': new FormControl('', []), 
      'authorisationSlipX': new FormControl('',[]),
      'cntrN': new FormControl('', []),
      'cntrOprC': new FormControl('', [])
  });
 
  this.addValidation();

  this.activatedRoute.queryParams.subscribe(params  =>  {
    this.soSearchData = params['criteria'] ? JSON.parse(params['criteria']) : "";
  });

  debugger
  if (this.soSearchData) {
    debugger
    this.soSearchForm.get('discBaId').setValue(this.soSearchData.vessel+"");
    this.soSearchForm.get('depotC').setValue(this.soSearchData.depotC+"");
    this.soSearchForm.get('authorisationSlipX').setValue(this.soSearchData.authSlipN== undefined ? "" : this.soSearchData.authSlipN+"");
    this.soSearchForm.get('cntrN').setValue(this.soSearchData.cntrN+"");
    this.soSearchForm.get('cntrOprC').setValue(this.soSearchData.cntrOprC+"");

    
    console.log("soSearchData >>>>>>>>>>>>> Search vessel "+this.soSearchData.vessel);
    console.log("soSearchData >>>>>>>>>>>>> Search discBaId "+this.soSearchData.discBaId);
    console.log("soSearchData >>>>>>>>>>>>> Search depotC "+this.soSearchData.depotC);
    console.log("soSearchData >>>>>>>>>>>>> Search authN "+this.soSearchData.authN);
    console.log("soSearchData >>>>>>>>>>>>> Search cntrN "+this.soSearchData.cntrN);
    console.log("soSearchData >>>>>>>>>>>>> Search cntrOprC "+this.soSearchData.cntrOprC);

    this.baId =  this.soSearchData.discBaId+"";

    if (!this.soSearchData.discBaId) {
      this.vslVoyAcComp.keepValue(this.soSearchData.vessel, 'vslM,localVslM,inVoyN,outVoyN', '', true);
    } else {
      this.vslVoyAcComp.keepValue({}, 'vslM,localVslM,inVoyN,outVoyN', this.soSearchData.vessel, true);
    }

    if (!this.soSearchData.cntrOprC) {
      this.cntrOperatorAcComp.keepValue(this.soSearchData.cntrOprC, 'operatorC', '', true);
    } else {
      this.cntrOperatorAcComp.keepValue({}, 'operatorC', this.soSearchData.cntrOprC, true);
    }

    if (this.baId || this.soSearchData.depotC || this.soSearchData.authSlipN || this.soSearchData.cntrN.length>0 || this.soSearchData.cntrOprC) {
        this.doSearchAction();
    }
  }

}

addValidation() {
  this.soSearchForm.get('discBaId').setValidators([this.stringValidator.isSpecialCharacters, this.stringValidator.isEmojiForAutoComp]);
  this.soSearchForm.get('depotC').setValidators([this.stringValidator.noWhitespaceValidator,this.stringValidator.isSpecialCharacters, this.stringValidator.isEmojiRemoveValule]);
  this.soSearchForm.get('authorisationSlipX').setValidators([this.stringValidator.noWhitespaceValidator,this.stringValidator.isSpecialCharacters, this.stringValidator.isEmojiRemoveValule]);
  this.soSearchForm.get('cntrN').setValidators([this.stringValidator.noWhitespaceValidator,this.stringValidator.isSpecialCharacters, this.stringValidator.isEmojiRemoveValule]);
  this.soSearchForm.get('cntrOprC').setValidators([this.stringValidator.isSpecialCharacters, this.stringValidator.isEmojiForAutoComp]);
}


  doSearchAction() {

    console.log("soSearchForm.invalid >>>" + this.soSearchForm.invalid);
    if (this.soSearchForm.invalid) {
      return
    }

    //Reset data object
    this.soDataList = null;
    this.messages = [];
    console.log("data object was cleaned");

    this.blocked = true;

    let cntr = this.soSearchForm.get("cntrN").value.trim();
    let cntrArr = cntr == "" ? [] : cntr.split(",");

    //this.blocked = false;
    
    if(!this.soSearchForm.get("discBaId").value){
      this.baId="";
    }
  
    let searchSo = {
      discBaId: this.baId,
      depotC: this.soSearchForm.get("depotC").value.trim(),
      authSlipN: this.soSearchForm.get("authorisationSlipX").value.trim(),
      cntrN: cntrArr,
      cntrOprC: this.soSearchForm.get("cntrOprC").value.trim(),
    }

    this.subscriptions.add(this.storingOrderService.searchStoringOrderDetails(JSON.stringify(searchSo))
      .subscribe(res => {
        let response = res['results'];
        this.soDataList = response['so-result'];
        this.blocked = false;
       
      },
        err => {
          debugger
          let resErrors = err;
          this.blocked = false;
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

        },
        () => {
          this.selectedVslVoyItem = null;
          //this.selectedVsl = { baId: "" }
          window.location.hash = "#topTitle";
          window.scrollTo(0, 0);
         
        }
      ));


    //Clean up search criteria
    //this.selectedVsl = { baId: "" };
   

  }


doCreateAction() {
  this.pAccordion.tabs.forEach(p => {
    p.disabled = true;
  });
 
  this.timer = setInterval(() => {
    this.router.navigate(['/so/create']);
    clearInterval(this.timer);
    }, 50);
} 

 

ngOnDestroy() {
  this.subscriptions.unsubscribe();
}

private passErrorSearchComp(err){
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

_getSOSearchData(){
  debugger
    let cntr = this.soSearchForm.get("cntrN").value.trim();
    let cntrArr = cntr == "" ? [] : cntr.split(",");

    if(!this.soSearchForm.get("discBaId").value){
      this.baId="";
    }
    let searchSo = { 
    discBaId :this.baId ,
    vessel :this.soSearchForm.get("discBaId").value.trim() ,
    depotC:this.soSearchForm.get("depotC").value.trim() ,
    authSlipN:this.soSearchForm.get("authorisationSlipX").value.trim(), 
    cntrN : cntrArr,
    cntrOprC : this.soSearchForm.get("cntrOprC").value.trim() , }

    return searchSo
}

vesselSelected(selectedItem: any): void {
  debugger
  if (selectedItem != null && Object.keys(selectedItem).length > 1) {
      this.selectedVslVoyItem = selectedItem;

      this.baId = this.selectedVslVoyItem.baId;
  } else {
      this.selectedVslVoyItem = null;
      //this.baId = "";
  }
}

get _getDiscBaId(){ return this.soSearchForm.controls['discBaId'];}

get _getDepotC(){  return this.soSearchForm.controls['depotC'];}

get _getAuthSlipX(){  return this.soSearchForm.controls['authorisationSlipX'];}

get _getCntrN(){  return this.soSearchForm.controls['cntrN'];}

get _getCntrOprC(){  return this.soSearchForm.controls['cntrOprC'];}

}
