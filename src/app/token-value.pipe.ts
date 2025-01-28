import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'tokenValue',
})
export class TokenValuePipe implements PipeTransform {
    transform(value: any): null | string {
        // 1000000000000000000000000000 with 18 decimals should become
        // 1000000000.
        if (!value.value || !value.decimals) {
            console.log('invalid transform on', value);
            return null;
        }
        let amount = parseInt(value.valueStr, 10);
        let decimals = parseInt(value.decimals);
        console.log('rendering value for', amount, value.decimals);
        return (amount / Math.pow(10, decimals)).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }
}
