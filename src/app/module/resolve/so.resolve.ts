import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import { PcAuthorizationService } from "@pc/pc-security";
import { environment } from 'environments/environment';

@Injectable()
export class SOResolve {

  accessControl = {'surveyAllowed': false, 'createAllowed': false, 'updateAllowed': false, 'deleteAllowed': false };

  constructor( private pcAuthorizationService: PcAuthorizationService) {
      
  }

  resolve() {
    const actions = [
        environment.AUTH_ACTION_ENQUIRE_SO_DPTR,
        environment.AUTH_ACTION_SURVEY_SO_DPTR,
        environment.AUTH_ACTION_CREATE_SO_EXT,
        environment.AUTH_ACTION_UPDATE_SO_EXT,
        environment.AUTH_ACTION_DELETE_SO_EXT,
        environment.AUTH_ACTION_ENQUIRE_SO_EXT,
        environment.AUTH_ACTION_ENQUIRE_SO_PNOPR,
        environment.AUTH_ACTION_ENQUIRE_SO_TERMOPR,
      ];

      return this.pcAuthorizationService.hasPermission(actions.join(',')).then(rec => {

        this.accessControl['createAllowed'] = (rec.permissionResult.get(environment.AUTH_ACTION_CREATE_SO_EXT));
        this.accessControl['updateAllowed'] = (rec.permissionResult.get(environment.AUTH_ACTION_UPDATE_SO_EXT));
        this.accessControl['deleteAllowed'] = (rec.permissionResult.get(environment.AUTH_ACTION_DELETE_SO_EXT));
        this.accessControl['surveyAllowed'] = (rec.permissionResult.get(environment.AUTH_ACTION_SURVEY_SO_DPTR));
             
       return this.accessControl;

      });
  }
}