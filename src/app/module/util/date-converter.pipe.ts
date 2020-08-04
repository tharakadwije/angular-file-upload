import { Injectable, Pipe, PipeTransform } from '@angular/core';

import { Language, DateUtilService } from '@pc/pc-sui';

@Pipe({
  name: 'dateConverter'
})
@Injectable()
export class DateConverterPipe implements PipeTransform {

    constructor(
        private lang: Language,
        private dateUtil: DateUtilService
    ) {}
	/**
	 * 
	 * @param value 
	 * @param locale
	 */
  transform(value:Date) {
      debugger
		if (!value) return "-";
        if (value) {
            const tmp = this.dateUtil.parseDate(new Date(value));
            if (this.lang.locale && this.lang.locale == 'zh-CN') {
                return tmp[0] + '-' + tmp[1] + '-' + tmp[2];
            } else {
                return tmp[2] + '-' + tmp[1] + '-' + tmp[0];
            }
        } else {
            return '';
        }
    }
    
}
