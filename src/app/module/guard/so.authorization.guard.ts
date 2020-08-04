import { Injectable, OnInit } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, NavigationExtras } from '@angular/router';

import { PcUserInfoService, PcAuthorizationService } from '@pc/pc-security';
import { LoggerService } from '@pc/pc-sui';

import { environment } from '../../../environments/environment';

const HOME_PERMISSION = '<moduleId>.<operation>';

@Injectable()
export class SOAuthorizationGuard implements OnInit, CanActivate {

    ACTION_SEARCH = [ environment.AUTH_ACTION_ENQUIRE_SO_DPTR,
                      environment.AUTH_ACTION_ENQUIRE_SO_EXT,
                      environment.AUTH_ACTION_ENQUIRE_SO_PNOPR,
                      environment.AUTH_ACTION_ENQUIRE_SO_TERMOPR]

    ACTION_CREATE = [ environment.AUTH_ACTION_CREATE_SO_EXT];

    ACTION_UPDATE = [ environment.AUTH_ACTION_UPDATE_SO_EXT];

    ACTION_SURVEY = [ environment.AUTH_ACTION_SURVEY_SO_DPTR];

    userId: string;
    orgCode: string;
    constructor(
        private router: Router,
        private logger: LoggerService,
        private pcUserInfoService: PcUserInfoService,
        private pcAuthorizationService: PcAuthorizationService,
    ) {
    }

    ngOnInit(): void {
        this.pcUserInfoService.getUserInfo('.').then(pcUserInfo => {
            this.userId = pcUserInfo.userId;
            this.orgCode = pcUserInfo.orgCode;
            this.logger.debug('User Information: ' + pcUserInfo.userId + ' / ' + pcUserInfo.orgCode);
        });
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.logger.debug('URL: %s', state.url);
            // resolve(true);
            if (state.url.startsWith('/so/search') || state.url.startsWith('/so?lang=') || state.url === '/so') {
                this.pcAuthorizationService.hasPermission(this.ACTION_SEARCH.join(',')).then((res) => {
                    if (res) {
                        console.log('111')
                        if (res.hasPermission) {
                            console.log('222')
                            resolve(true);
                        } else {
                            console.log('333')
                            reject(false);
                            this._handlerError('ENQUIRE');
                        }
                    } else {
                        console.log('444')
                        reject(false);
                        this._handlerError('ENQUIRE');
                    }
                }).catch(err => {
                    console.log('555')
                    reject(false);
                    this._handlerError('ENQUIRE');
                });
            } else if (state.url.startsWith('/so/create')) {
                this.pcAuthorizationService.hasPermission(this.ACTION_CREATE.join(',')).then((res) => {
                    if (res) {
                        if (res.hasPermission) {
                            resolve(true);
                        } else {
                            reject(false);
                            this._handlerError('CREATE');
                        }
                    } else {
                        reject(false);
                        this._handlerError('CREATE');
                    }
                }).catch(err => {
                    reject(false);
                    this._handlerError('CREATE');
                });
            } else if (state.url.startsWith('/so/update')) {
                this.pcAuthorizationService.hasPermission(this.ACTION_UPDATE.join(',')).then((res) => {
                    if (res) {
                        if (res.hasPermission) {
                            resolve(true);
                        } else {
                            reject(false);
                            this._handlerError('UPDATE');
                        }
                    } else {
                        reject(false);
                        this._handlerError('UPDATE');
                    }
                }).catch(err => {
                    reject(false);
                    this._handlerError('UPDATE');
                });
            } else {
                reject(false);
                this._handlerError('OTHER');
            }
        });
    }

    private _handlerError(module: string) {
        const link = ['/error', {
            'product': 'DEPOT - SO', 'moduleName': module, 'userId': this.userId ? this.userId : '-',
            'orgCode': this.orgCode ? this.orgCode : '-', 'message': 'User information is not available.', 'type': 'auth'
        }];
        this.router.navigate(link);
    }
}