import { Component, input } from '@angular/core';
@Component({
  selector: 'app-swap-ui',
  imports: [],
  templateUrl: './swap-ui.component.html',
})
export class SwapUiComponent {
  token = input<string>('');
  account = input<string>('');
  ethereum = input<any>();
  constructor() {}
}
