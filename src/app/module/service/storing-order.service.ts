import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Language } from '@pc/pc-sui';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { debug } from 'util';
import { AuthHttp } from '@ngfw/security';
import { environment } from '../../../environments/environment';

@Injectable()
export class StoringOrderService {




  private STORING_ORDER_SEARCH_URL = environment.SO_REQUEST_URI + '/so/bizfn/storing-order/search/' + environment.SO_VERSION;
  private STORING_ORDER_CREATE_URL = environment.SO_REQUEST_URI + '/so/bizfn/storing-order/' + environment.SO_VERSION;
  private STORING_ORDER_UPDATE_URL = environment.SO_REQUEST_URI + '/so/bizfn/storing-order/' + environment.SO_VERSION;
  private STORING_ORDER_DELETE_URL = environment.SO_REQUEST_URI + '/so/bizfn/storing-order/delete/' + environment.SO_VERSION;
  private STORING_ORDER_UTIL_LIST_URL = environment.SO_REQUEST_URI + '/so/bizfn/storing-order/cntr-opr/' + environment.SO_VERSION;
  private STORING_ORDER_SURVEY_LIST_URL = environment.SO_REQUEST_URI + '/so/bizfn/storing-order/survey-remark/' + environment.SO_VERSION;
  private STORING_ORDER_LOAD_URL = environment.SO_REQUEST_URI + '/so/bizfn/storing-order/search-param/' + environment.SO_VERSION;

  constructor(private authHttp: AuthHttp, private lang: Language) { }

  searchStoringOrderDetails(storingOrderView: string): Observable<any[]> {
    let headers = new Headers({ 'Content-Type': 'application/json', 'site': 'PNX', 'Accept-Language': this.lang.locale });
    let options = new RequestOptions({
      headers: headers,
    });

    return this.authHttp.post(`${this.STORING_ORDER_SEARCH_URL}`, storingOrderView, options)
    .first() //Emit the first value, or the first to pass condition, similar to take(1)   
    .map(
      // this.extractRailData
      res => res.json() || {}
    )
    .publishLast().refCount() // ignore duplicate API calls 
    .catch(this.initSystemError);

  }


  saveStoringOrderDetails(storingOrderView: string): Observable<any[]> {

    let headers = new Headers({ 'Content-Type': 'application/json', 'site': 'PNX', 'Accept-Language': this.lang.locale });
    let options = new RequestOptions({
      headers: headers,
    });

    return this.authHttp.post(`${this.STORING_ORDER_CREATE_URL}`, storingOrderView, options)
      .first() //Emit the first value, or the first to pass condition, similar to take(1)   
      .map(
        // this.extractRailData
        res => res.json() || {}
      )
      .publishLast().refCount() // ignore duplicate API calls 
      .catch(this.initSystemError);
  }

  updateSurveyStoringOrder(storingOrderView: string): Observable<any[]> {

    let headers = new Headers({ 'Content-Type': 'application/json', 'site': 'PNX', 'Accept-Language': this.lang.locale });
    let options = new RequestOptions({
      headers: headers,
    });

    return this.authHttp.post(`${this.STORING_ORDER_SURVEY_LIST_URL}`, storingOrderView, options)
      .first() //Emit the first value, or the first to pass condition, similar to take(1)   
      .map(
        // this.extractRailData
        res => res.json() || {}
      )
      .publishLast().refCount() // ignore duplicate API calls 
      .catch(this.initSystemError);
  }

  updateStoringOrderDetails(storingOrderView: string): Observable<any[]> {

    let headers = new Headers({ 'Content-Type': 'application/json', 'site': 'PNX', 'Accept-Language': this.lang.locale });
    let options = new RequestOptions({
      headers: headers,
    });

    return this.authHttp.put(`${this.STORING_ORDER_UPDATE_URL}`, storingOrderView, options)
      .do(console.log)
      .first() //Emit the first value, or the first to pass condition, similar to take(1)   
      .map(
        // this.extractRailData
        res => res.json() || {}
      )
      .publishLast().refCount() // ignore duplicate API calls 
      .catch(this.initSystemError);
  }

  deleteStoringOrderDetails(storingOrderView: string): Observable<any[]> {
debugger
    let headers = new Headers({ 'Content-Type': 'application/json', 'site': 'PNX', 'Accept-Language': this.lang.locale });
    let options = new RequestOptions({
      headers: headers,
    });

    return this.authHttp.post(`${this.STORING_ORDER_DELETE_URL}`, storingOrderView, options)
      .first() //Emit the first value, or the first to pass condition, similar to take(1)   
      .map(
        // this.extractRailData
        res => res.json() || {}
      )
      .publishLast().refCount() // ignore duplicate API calls 
      .catch(this.initSystemError);
  }

  getStoringOrderDetails(cntrN: String, authN: String, cntrOrgC: String): Observable<any[]> {
    let headers = new Headers({ 'Content-Type': 'application/json', 'site': 'PNX', 'Accept-Language': this.lang.locale });
    let options = new RequestOptions({
      headers: headers
    });
    let input = {
      "cntrN": (cntrN && cntrN.length > 0) ? cntrN : "",
      "authorisationSlipX": (authN && authN.length > 0) ? authN : "",
      "cntrOrgC": (cntrOrgC && cntrOrgC.length > 0) ? cntrOrgC : "",
    }
    return this.authHttp.post(`${this.STORING_ORDER_LOAD_URL}`, JSON.stringify(input), options)
      .first() //Emit the first value, or the first to pass condition, similar to take(1)   
      .map(
        // this.extractRailData
        res => res.json() || {}
      )
      .publishLast().refCount() // ignore duplicate API calls 
      .catch(this.initSystemError);
  }

  getUtilList(): Observable<any[]> {
    let headers = new Headers({ 'Content-Type': 'application/json', 'site': 'PNX', 'Accept-Language': this.lang.locale });
    let options = new RequestOptions({
      headers: headers,
    });

    return this.authHttp.get(`${this.STORING_ORDER_UTIL_LIST_URL}`, options)
          .first() //Emit the first value, or the first to pass condition, similar to take(1)   
          .map(
                //  this.extractRailData
                res => res.json() || {}
          )
          .publishLast().refCount() // ignore duplicate API calls 
          .catch(this.initSystemError);
}

  private initSystemError(err) {
    let rec = err.json();
    if (rec && (rec.error || rec.errors)) {
      return Observable.throw(rec);
    } else {
      return Observable.throw({ 'error': 'SYSTEM ERROR', 'message': null });
    }
  }

}
