import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { TokenValuePipe } from './token-value.pipe';
import { JsonPipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ethers, parseEther } from 'ethers';
import { BrowserProvider, Eip1193Provider } from 'ethers/types/providers';
import { SyncTokenAbi } from './synctoken-abi';
import { TokenLookupPipe } from './token-lookup.pipe';
import { SwapUiComponent } from './swap-ui/swap-ui.component';

declare global {
  interface Window {
    gtag: any;
    ethereum: Eip1193Provider & BrowserProvider;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [JsonPipe, TokenValuePipe, TokenLookupPipe, SwapUiComponent],
})
export class AppComponent {
  changeDetector = inject(ChangeDetectorRef);

  ethereum = window.ethereum;
  browserProvider = new ethers.BrowserProvider(window.ethereum);
  // chainAProvider = new ethers.JsonRpcProvider('https://rpc.ankr.com/polygon_mumbai');
  // chainBProvider = new ethers.JsonRpcProvider('https://goerli.optimism.io');
  signer: ethers.Signer | null = null;
  account = signal<string>('');
  tokens = signal<any[]>([]);
  chainName: string = '';
  showSwap = signal<boolean>(false);

  chainABalance = -1;
  chainBBalance = -1;

  chains = {
    polygon: '0x4a3c470930650260DD854967330E4E5C77b24911',
    optimism: '0xC4f04B94353c798454C008D19648350331C515C8',
  };
  costs = {
    polygon: '2',
    optimism: '.01',
  };
  // chainAContract = new ethers.Contract(this.chains.polygon, SyncTokenAbi, this.chainAProvider);
  // chainBContract = new ethers.Contract(this.chains.optimism, SyncTokenAbi, this.chainBProvider);

  chainAHash = '';
  chainBHash = '';
  axlHash = '';

  msg = '';

  constructor() {
    const router = inject(Router);
    const title = inject(Title);

    // Google Analytics
    router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((n: any) => {
      title.getTitle();
      window.gtag('config', 'G-F29DBWYW6T', { page_path: n.urlAfterRedirects });
    });

    if (!this.ethereum) {
      this.msg = 'Please install a wallet (like Coinbase Wallet) to use this application';
      return;
    }
    this.ethereum.on('chainChanged', (chainId: string) => {
      console.log('chain changed to', chainId);
      this.browserProvider = new ethers.BrowserProvider(window.ethereum);
      this.browserProvider.getNetwork().then((network) => {
        this.chainName = network.name;
      });

      // 0xa869 - Fuji

      this.changeDetector.detectChanges();
    });
    this.ethereum.on('accountsChanged', (accounts: string[]) => {});

    this.browserProvider.getNetwork().then((network) => {});
    this.connect();
    this.setupSigner();
  }

  async connect() {
    const result: Promise<string> = this.ethereum.request({ method: 'eth_requestAccounts' });
    console.log('connect result is', result);
    const accountList = await result;
    console.log('and resolves to', accountList);
    this.account.set(accountList[0]);
    this.tokens.set(await this.getTokens(this.account()));
    this.browserProvider.getNetwork().then((network) => {
      this.chainName = network.name;
    });
  }
  async getTokens(address: string): Promise<any[]> {
    const query = {
      jsonrpc: '2.0',
      id: 1,
      method: 'cdp_listBalances',
      params: [{ address, pageToken: '', pageSize: 1 }],
    };

    try {
      const response = await fetch(`http://localhost:3000/api/account/${address}`);

      if (!response.ok) {
        const errorData = await response.json(); // Try to parse error response
        throw new Error(`HTTP error! status: ${response.status}, ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('Balances:', result);
      return result; // Return the result if needed
    } catch (error) {
      console.error('Error fetching balances:', error);
      throw error; // Re-throw the error to be handled by the caller if necessary.
    }
  }
  async setupSigner() {
    this.signer = await this.browserProvider.getSigner();
  }

  swap(token: string) {
    //window.open(`https://app.uniswap.org/#/swap?inputCurrency=${token}`, '_blank');
    this.showSwap.set(true);
  }
}
