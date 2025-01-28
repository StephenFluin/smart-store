import { ChangeDetectorRef, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { ethers, formatEther, parseEther } from 'ethers';
import { BrowserProvider, Eip1193Provider } from 'ethers/types/providers';
import { SyncTokenAbi } from './synctoken-abi';

declare global {
    interface Window {
        gtag: any;
        ethereum: Eip1193Provider & BrowserProvider;
    }
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent {
    ethereum = window.ethereum;
    browserProvider = new ethers.BrowserProvider(window.ethereum);
    chainAProvider = new ethers.JsonRpcProvider('https://rpc.ankr.com/polygon_mumbai');
    chainBProvider = new ethers.JsonRpcProvider('https://goerli.optimism.io');
    signer: ethers.Signer | null = null;
    account: string = '';
    chainName: string = '';

    chainABalance = -1;
    chainBBalance = -1;

    chains = {
        polygon: '0x4a3c470930650260DD854967330E4E5C77b24911',
        optimism: '0xC4f04B94353c798454C008D19648350331C515C8',
    };
    costs = {
        polygon: "2",
        optimism: ".01"
    }
    chainAContract = new ethers.Contract(this.chains.polygon, SyncTokenAbi, this.chainAProvider);
    chainBContract = new ethers.Contract(this.chains.optimism, SyncTokenAbi, this.chainBProvider);

    chainAHash = '';
    chainBHash = '';
    axlHash = '';

    msg = '';
    // Polygon Token 0x4a3c470930650260DD854967330E4E5C77b24911
    // Optimism Token 0xC4f04B94353c798454C008D19648350331C515C8

    constructor(router: Router, title: Title, public changeDetector: ChangeDetectorRef) {
        // Google Analytics
        router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((n: any) => {
            title.getTitle();
            window.gtag('config', 'G-F29DBWYW6T', { page_path: n.urlAfterRedirects });
        });


        if(!this.ethereum) {
            this.msg = 'Please install a wallet (like MetaMask) to use this application';
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

        // Get the values
        setTimeout(() => {
            this.update();
        }, 1000);
        setInterval(() => {
            this.update();
        }, 30000);
    }

    async connect() {
        const result: Promise<string> = this.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('connect result is', result);
        const accountList = await result;
        console.log('and resolves to', accountList);
        this.account = accountList[0];
        this.browserProvider.getNetwork().then((network) => {
            this.chainName = network.name;
        });
    }
    async setupSigner() {
        this.signer = await this.browserProvider.getSigner();
    }

    async update() {
        if (this.account) {
            console.log('updating!');
            this.chainABalance = parseFloat(formatEther(await this.chainAContract['balanceOf'](this.account)));
            this.chainBBalance = parseFloat(formatEther(await this.chainBContract['balanceOf'](this.account)));
        } else {
            console.log('not updating!');
        }
    }
    submitChainA(event: any) {
        event.preventDefault();
        console.log(event);
        this.submit(parseEther(event.target[0].value), 'polygon');
    }
    submitChainB(event: any) {
        event.preventDefault();
        console.log(event);
        event.target[0].value;
        this.submit(parseEther(event.target[0].value), 'optimism');
    }
    submit(value: bigint, address: 'polygon' | 'optimism') {
        console.log('submitting', value, address);
        this.msg = 'Submitting transaction...';
        const contract = new ethers.Contract(this.chains[address], SyncTokenAbi, this.signer);
        contract['update'](value, { value: parseEther(this.costs[address]) }).then((tx) => {
            console.log('tx', tx);
            if (address == 'polygon') {
                this.chainAHash = tx.hash;
            } else {
                this.chainBHash = tx.hash;
            }
            this.axlHash = tx.hash;
            this.msg = 'Transaction submitted! Transactions can take 2-7 minutes';
        })
        .catch(err => {
            this.msg = err.message;
        });
    }
}
