import { Injectable, Pipe, PipeTransform } from '@angular/core';

import { Language, DateUtilService } from '@pc/pc-sui';

@Pipe({
  name: 'numberConverter'
})
@Injectable()
export class NumberConverterPipe implements PipeTransform {

    constructor(
    ) {}
	/**
	 * 
	 * @param value 
	 */
  transform(value:string) {

    if (!value || 0 === value.length || "-" == value)
         return "0";
    else 
        return value;
        
    }
    
}
