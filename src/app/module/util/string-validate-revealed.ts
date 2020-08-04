import { FormGroup, FormControl } from "@angular/forms";
import { Injectable, NgModuleFactoryLoader } from "@angular/core";

@Injectable()
export class StringValidateRevealed {
  
  public isEmoji(control: FormControl) {
    const str =control.value;
    
    var ranges = [
			'\ud83c[\udf00-\udfff]',// U+1F300 to U+1F3FF
			'\ud83d[\udc00-\ude4f]',// U+1F400 to U+1F64F
			'\ud83d[\ude80-\udeff]'	// U+1F680 to U+1F6FF
		];
		if (str.match(ranges.join('|'))) {
      //  control['startStation'].setValue(("");
       // control.setValue("");
        control.setErrors({ 'identitySpecialCharactersRevealed': true });
        return { 'identitySpecialCharactersRevealed': true };
       // return null;
		} 
			return null;
		
  }

  public isEmojiForAutoComp(control: FormControl) {
    const str =control.value;
    
    var ranges = [
      '\ud83c[\udf00-\udfff]',// U+1F300 to U+1F3FF
      '\ud83d[\udc00-\ude4f]',// U+1F400 to U+1F64F
      '\ud83d[\ude80-\udeff]'	// U+1F680 to U+1F6FF
    ];
    if (str.match(ranges.join('|'))) {
      control.setErrors({ 'identitySpecialCharactersRevealed': true });
      return { 'identitySpecialCharactersRevealed': true };
    } 
      return null;
    
  }

  public isEmojiRemoveValule(control: FormControl) {
    const str =control.value;
    
    var ranges = [
      '\ud83c[\udf00-\udfff]',// U+1F300 to U+1F3FF
      '\ud83d[\udc00-\ude4f]',// U+1F400 to U+1F64F
      '\ud83d[\ude80-\udeff]'	// U+1F680 to U+1F6FF
    ];
    if (str.match(ranges.join('|'))) {
      //  control['startStation'].setValue(("");
        control.setValue("");
        return null;
    } 
      return null;
    
  }

  public isSpecialCharacters(control: FormControl) {
    
    const str =control.value;
    var ranges = "[!@#$%^&*()`~'/_=.?:;{}|<>]";
    if (str.match(ranges) || 
        str.endsWith('\+') || 
        str.endsWith('\-') || 
        str.endsWith('\[') || 
        str.endsWith('\]')) {
        control.setErrors({ 'identitySpecialCharactersRevealed': true });
        return { 'identitySpecialCharactersRevealed': true };
		} 
      return null;
      
  }
  
  public noWhitespaceValidator(control: FormControl) {
    
    let isValid = false;
    if (!control.value)
      return null;

    control.value.split('').forEach(element => {
      if (element === ' ')
        isValid = true;
    });

    return isValid ? { 'whitespace': true } : null;
  }

  public dateRangeValidator(control: FormControl) {
    const to = control.value;
    const toDate = new Date(to);
    if (to && toDate.getFullYear() < 1970 || toDate.getFullYear() > 2050) {
      to.setValue(null);
    }
    return null;
  }
 
}
