import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {UserService} from '../core/user.service';
import {Router} from '@angular/router';
import {AuthService} from '../core/auth.service';
import { NewsService } from '../core/news.service';
import { ReactiveStreamsService } from '../core/reactive-streams.service';
import { WindowRef } from '../core/window.service';

@Component({
  selector: 'app-logged-nav',
  templateUrl: './logged-nav.component.html',
  styleUrls: ['./logged-nav.component.scss']
})
export class LoggedNavComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();
  toolbarStyle = {};
  private _logged: boolean;
  checkMedia = false;
  constructor(public newsService: NewsService, private winRef: WindowRef,
              public service: UserService, private router: Router, public authService: AuthService
              , private reactiveService: ReactiveStreamsService) { }

  @Input()
  get logged(): boolean {
    return this._logged;
  }

  set logged(value: boolean) {
    this._logged = value;
  }
  get image(): string {
    return this.service.prof_url;
  }
  get role() {
    if (this.service.dbUser) {
      return this.service.dbUser.roles[0];
    }
  }
  // navClick(link: string) {
  //   this.newsService.activeLink = link;
  //   this.newsService.callToggle.next(-this.newsService.links.indexOf(this.newsService.activeLink));
  // }
  ngOnInit() {
    this.checkMedia = this.winRef.nativeWindow.innerWidth < 600;
  }
  btnClick(url: string) {
    this.router.navigateByUrl(url, {state: {loggedID: this.service.dbUser.id}});
  }
  logout() {
    if (this.router.url === '/home') {
      this.newsService.callToggle.next(this.newsService.links.indexOf(this.newsService.activeLink));
    }
    setTimeout(() => {
      this.authService.doLogout()
      .then(() => {
        this.service.loggedUser = null;
        this.service.user = null;
        for (const tag of this.service.dbUser.tags) {
           this.reactiveService.resetUserListListeners('#' + tag);
        }
        for (const tag of this.service.dbUser.users) {
          this.reactiveService.resetUserListListeners('@' + tag);
       }
        this.service.dbUser = null;
        this.service.newsCo.clear();
        this.newsService.activeLink = this.newsService.links[0];
        this.router.navigateByUrl('/home');
      }, () => {
      });
    }, 50);
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
  }
}
