import {AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../core/user.service';
import {matchingPasswords} from '../register/validators';
import {FirebaseUserModel, User} from '../core/user.model';
import {Subject} from 'rxjs';
import {AuthService} from '../core/auth.service';
import {IbanValidatorDirective} from '../iban-validator.directive';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

@Component({
    selector: 'app-edit-profile',
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit, AfterViewInit, OnDestroy {
   // showModal: Observable<boolean> = of(false);
    listenerFn: () => void;
    public profileForm: FormGroup;
    errorMessage = '';
    successMessage = '';
    _user: User;
    user$: FirebaseUserModel = new FirebaseUserModel();
    private _booled: boolean;
    private readonly onDestroy = new Subject<void>();

    constructor(private formBuilder: FormBuilder,
                private userService: UserService,
                private authService: AuthService) {
        this.createForm();
    }

    @Input()
    get user(): User {
        return this._user ? this._user : this.userService.dbUser;
    }

    set user(value: User) {
        this._user = value;
    }

    ngOnInit() {
        this.userService.getAccountHistory(this.userService.dbUser.id).pipe(takeUntil(this.onDestroy)).subscribe(value => {
            if (value && value.length > 0) {
                this.userService._totalBalance = +value[value.length - 1].totalBalance.toFixed(2);
            }
        });
    }

    createForm() {
        this.profileForm = this.formBuilder.group({
            name: ['', Validators.required],
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            iban: ['', [Validators.required, IbanValidatorDirective.validateIt]],
            password: ['', Validators.required],
            password2: ['', Validators.required]
        }, {validator: matchingPasswords('password', 'password2')});
    }

    trySave(value: any) {
        const summary = document.querySelector('#proInput').innerHTML;
        if (summary.trim() !== this.userService.dbUser.summary) {
            this.userService.newSummary(this.userService.dbUser.id, summary)
            .pipe(takeUntil(this.onDestroy)).subscribe(value1 => {
                    this.userService.dbUser.summary = summary;
                });
        }
        if (value.iban.trim() !== '' && value.iban.trim() !== this.userService.loggedUser.iban
        && this.profileForm.controls.iban.valid) {
            this.userService.dbUser.iban = value.iban.trim();
            this.userService.updateUser(this.userService.dbUser).pipe(takeUntil(this.onDestroy)).subscribe();
        }
        if (!this.profileForm.hasError('mismatchedPasswords')) {
            if (value.name !== this.userService.loggedUser.name) {
                this.authService.updateCurrentUser(value);
            }
            if (value.password.trim().length > 5 && value.email.trim() === this.userService.dbUser.email) {
                this.authService.updatePassword(value.email, value.password);
            } else if (value.password.trim().length > 5 && value.email.trim() !== this.userService.dbUser.email) {
                this.authService.doRegister(value);
            }
        }
    }

    ngAfterViewInit() {
        // this.showModal = of(true);
    }

    onClose() {
      //  this.showModal = of(false);
        // Allow fade out animation to play before navigating back
        // setTimeout(
        //     () => this.location.back(), // this.router.navigate(['/']),
        //     100
        // );
    }

    onDialogClick(event: UIEvent) {
        event.stopPropagation();
        event.cancelBubble = true;
    }

    ngOnDestroy() {
        if (this.listenerFn) {
            this.listenerFn();
        }
        this.onDestroy.next();
        this.onDestroy.complete();
    }

    @Input()
    get booled(): boolean {
        return this._booled;
    }

    set booled(value: boolean) {
        this._booled = value;
    }
}
