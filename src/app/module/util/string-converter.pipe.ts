import { Injectable, Pipe, PipeTransform } from '@angular/core';

import { Language, DateUtilService } from '@pc/pc-sui';

@Pipe({
  name: 'stringConverter'
})
@Injectable()
export class StringConverterPipe implements PipeTransform {

    constructor(
    ) {}
	/**
	 * 
	 * @param value 
	 */
  transform(value:string) {
      debugger
		if (!value) return "-";
        else return value;
        
    }
    
}
