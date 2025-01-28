import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tokenLookup',
})
export class TokenLookupPipe implements PipeTransform {
  transform(value: string): string {
    const lookup: { [key: string]: string } = {
      '0xB39a56A7de783818c2319504063Dc8bDb5b3EF80': 'MyToken (MT2025)',
      '0xE4aB69C077896252FAFBD49EFD26B5D171A32410': 'Chainlink Token (LINK)',
      '0x036CbD53842c5426634e7929541eC2318f3dCF7e': 'USDC',
    };
    for (let key of Object.keys(lookup)) {
      lookup[key.toLowerCase()] = lookup[key];
    }
    if (lookup[value]) {
      return lookup[value];
    } else {
      return value;
    }
  }
}
