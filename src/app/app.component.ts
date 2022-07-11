import { Component, Inject, Injector, PLATFORM_ID } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
//import { Cookie } from 'ng2-cookies/ng2-cookies';
// import {
//   NgcCookieConsentService, NgcInitializeEvent, NgcNoCookieLawEvent, NgcStatusChangeEvent
// } from "ngx-cookieconsent";
import { Subscription } from 'rxjs';
import { HeaderService } from './shared/services/header.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'PlayOffNations';
  headerShow: boolean = true;
  footerShow: boolean = true;
  selectedType: string = '';
  isConsented: boolean = false;

  //keep refs to subscriptions to be able to unsubscribe later
  private popupOpenSubscription: Subscription;
  private popupCloseSubscription: Subscription;
  private initializeSubscription: Subscription;
  private statusChangeSubscription: Subscription;
  private revokeChoiceSubscription: Subscription;
  private noCookieLawSubscription: Subscription;

  constructor(
    private router: Router,
    private headerService: HeaderService,
    private cookieService: CookieService,
    //private ccService: NgcCookieConsentService,
    private translateService: TranslateService
  ) {
    this.isConsented = this.cookieService.get('cookie-consent') ? true : false;
    this.headerService.switchLanguage.subscribe(res => {
      if (!window.localStorage.getItem('selectedLanguage')) {
        window.localStorage.setItem('selectedLanguage', res);
      }
    });
    //Router subscriber
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.headerService.pageName.next(event.url);
        console.log('pageName', event);

        if (event.url === '/admin/login') {
          this.headerShow = false;
          this.selectedType = 'adminLogin';
        }

        else {
          this.headerShow = true;
          this.selectedType = '';
          this.footerShow = true;
        }
        if (event.url.startsWith('/campaign/')) {
          this.headerShow = false;
          this.footerShow = false;
          this.selectedType = 'campaignMetrics';
        }
        if (event.url.startsWith('/ambassador/')) {
          this.headerShow = false;
          this.footerShow = false;
          this.selectedType = 'streamerMetrics';
        }

        if (localStorage.getItem('selectedLanguage') == 'en') {
          this.headerService.switchLanguage.next('en');
        } else {
          this.headerService.switchLanguage.next('es');
        }
      }
    });
  }

  // ngOnInit() {
  //   this.headerService.switchLanguage.subscribe(res => {
  //     this.ccService.destroy(); 
  //     if (res == 'es') {
  //       this.ccService.init({
  //         cookie: {
  //           domain: 'localhost' // or 'your.domain.com' 
  //         },
  //         position: 'bottom',
  //         theme: 'classic',
  //         //container: container,
  //         palette: {
  //           popup: {
  //             background: '#000000',
  //             text: '#ffffff'
  //           },
  //           button: {
  //             background: '#f1d600',
  //             text: '#000000'
  //           }
  //         },
  //         type: 'info',
  //         content: {
  //           header: 'Acepto galletas',
  //           message: 'Utilizamos cookies propias y de terceros para mejorar nuestros servicios, si continúas navegando, consideramos que aceptas este uso.',
  //           dismiss: 'Aceptar',
  //           deny: 'Refuse cookies',
  //           link: 'Leer más',
  //           href: 'http://localhost:4200/policies-es?policies=cookiePolicy',
  //           policy: 'Cookie Policy'
  //         }
  //       });
  //     } else {
  //       this.ccService.init({
  //         cookie: {
  //           domain: 'localhost' // or 'your.domain.com' 
  //         },
  //         position: 'bottom',
  //         theme: 'classic',
  //         //container: container,
  //         palette: {
  //           popup: {
  //             background: '#000000',
  //             text: '#ffffff'
  //           },
  //           button: {
  //             background: '#f1d600',
  //             text: '#000000'
  //           }
  //         },
  //         type: 'info',
  //         content: {
  //           header: 'Accept cookies',
  //           message: 'We use our own and third-party cookies to improve our services, if you continue browsing, we will consider that you accept this use.',
  //           dismiss: 'Accept',
  //           deny: 'Refuse cookies',
  //           link: 'Read more',
  //           href: 'http://localhost:4200/policies?policies=cookiePolicy',
  //           policy: 'Cookie Policy'
  //         }
  //       });
  //     }
  //   });

  //   var currentLang = this.translateService.getBrowserCultureLang();
  //   console.log('currentLang',currentLang);

  //   this.popupCloseSubscription = this.ccService.popupClose$.subscribe(() => {
  //     // you can use this.ccService.getConfig() to do stuff...
  //   });

  //   this.initializeSubscription = this.ccService.initialize$.subscribe(
  //     (event: NgcInitializeEvent) => {
  //       console.log('NgcInitializeEvent', event);

  //       // you can use this.ccService.getConfig() to do stuff...
  //     }
  //   );

  //   this.statusChangeSubscription = this.ccService.statusChange$.subscribe(
  //     (event: NgcStatusChangeEvent) => {
  //       // you can use this.ccService.getConfig() to do stuff...
  //       console.log('NgcStatusChangeEvent', event);
  //     }
  //   );

  //   this.revokeChoiceSubscription = this.ccService.revokeChoice$.subscribe(
  //     () => {
  //       // you can use this.ccService.getConfig() to do stuff...
  //       console.log('revokeChoice');
  //     }
  //   );

  //   this.noCookieLawSubscription = this.ccService.noCookieLaw$.subscribe(
  //     (event: NgcNoCookieLawEvent) => {
  //       // you can use this.ccService.getConfig() to do stuff...
  //       console.log('subscribe');
  //     }
  //   );
  // }

  // ngOnDestroy() {
  //   // unsubscribe to cookieconsent observables to prevent memory leaks
  //   this.popupOpenSubscription.unsubscribe();
  //   this.popupCloseSubscription.unsubscribe();
  //   this.initializeSubscription.unsubscribe();
  //   this.statusChangeSubscription.unsubscribe();
  //   this.revokeChoiceSubscription.unsubscribe();
  //   this.noCookieLawSubscription.unsubscribe();
  // }

  private getCookie(name: string) {
    let ca: Array<string> = document.cookie.split(';');
    let caLen: number = ca.length;
    let cookieName = `${name}=`;
    let c: string;

    for (let i: number = 0; i < caLen; i += 1) {
      c = ca[i].replace(/^\s+/g, '');
      if (c.indexOf(cookieName) == 0) {
        return c.substring(cookieName.length, c.length);
      }
    }
    return '';
  }

  acceptAllCookies() {
    this.isConsented = true;
    this.cookieService.set('cookie-consent', 'AcceptAll');
  }

  acceptRequiredCookies() {
    this.isConsented = true;
    this.cookieService.set('cookie-consent', 'AcceptRequired');
  }

  goToCookiePolicy() {
    let selectedLanguage = window.localStorage.getItem('selectedLanguage');
    if (selectedLanguage == 'es') {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/policies-es'], { queryParams: { policies: 'cookiePolicy' } })
      );
      window.open(url, '_blank');
    } else {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/policies'], { queryParams: { policies: 'cookiePolicy' } })
      );
      window.open(url, '_blank');
    }
  }

}
