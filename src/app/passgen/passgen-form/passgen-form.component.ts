import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-passgen-form',
  templateUrl: './passgen-form.component.html',
  styleUrls: ['./passgen-form.component.scss']
})
export class PassgenFormComponent implements OnInit {

  @ViewChild('password') generatedPasswordField: ElementRef;
  generatePasswordForm: FormGroup;
  passwordLengthValue = 16;
  submitted = false;
  generatedPassword = '';

  readonly SYMBOLS = [ 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D, 0x2E, 0x2F, 0x3A,
                       0x3B, 0x3C, 0x3D, 0x3E, 0x3F, 0x40, 0x5B, 0x5C, 0x5D, 0x5E, 0x5F, 0x60, 0x7B, 0x7C, 0x7D, 0x7E ];
  LOWER_CASE: number[] = [];
  UPPER_CASE: number[] = [];
  NUMBERS: number[] = [];
  characterPool: string[] = [];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    for (let i = 0x30; i <= 0x39; i++) {
      this.NUMBERS.push(i);
    }
    for (let i = 0x41; i <= 0x5A; i++) {
      this.UPPER_CASE.push(i);
    }
    for (let i = 0x61; i <= 0x7A; i++) {
      this.LOWER_CASE.push(i);
    }
    this.generatePasswordForm = this.fb.group({
      passwordLength: [this.passwordLengthValue, Validators.compose([
        Validators.min(16),
        Validators.max(256)
      ])],
      checkboxes: new FormGroup({
        symbols: new FormControl(true),
        numbers: new FormControl(true),
        lowerCase: new FormControl(true),
        upperCase: new FormControl(true)
      }, this.atLeastOneCheckedValidator)
    });
  }

  private atLeastOneCheckedValidator(formGroup: FormGroup): { requireCheckboxesToBeChecked: boolean } {
    const controls = formGroup.controls;
    let oneChecked = false;
    if (controls) {
      Object.keys(controls).forEach((key) => {
        const control = controls[key];
        if (control.value === true) {
          oneChecked = true;
        }
      });
      return oneChecked ? null : { requireCheckboxesToBeChecked: true };
    }
  }

  submit(): void {
    this.generatedPassword = this.generatePassword();
    this.submitted = true;
  }

  private generatePassword(): string {
    this.initializeCharacterPool();
    const passwordLen = this.generatePasswordForm.get('passwordLength').value;
    const charPoolLen = this.characterPool.length;
    let password = '';
    for (let i = 0; i < passwordLen; i++) {
      password += this.characterPool[Math.floor(Math.random() * charPoolLen)];
    }
    return password;
  }

  private initializeCharacterPool(): void {
    this.characterPool = [];
    const form = this.generatePasswordForm;
    const hasSymbols = form.get('checkboxes').get('symbols').value;
    const hasNumbers = form.get('checkboxes').get('numbers').value;
    const hasLowerCase = form.get('checkboxes').get('lowerCase').value;
    const hasUpperCase = form.get('checkboxes').get('upperCase').value;
    if (hasSymbols) {
      this.SYMBOLS.forEach((charCode) => {
        this.characterPool.push(String.fromCharCode(charCode));
      });
    }
    if (hasNumbers) {
      this.NUMBERS.forEach((charCode) => {
        this.characterPool.push(String.fromCharCode(charCode));
      });
    }
    if (hasLowerCase) {
      this.LOWER_CASE.forEach((charCode) => {
        this.characterPool.push(String.fromCharCode(charCode));
      });
    }
    if (hasUpperCase) {
      this.UPPER_CASE.forEach((charCode) => {
        this.characterPool.push(String.fromCharCode(charCode));
      });
    }
  }

  copyToClipboard(): void {
    this.generatedPasswordField.nativeElement.select();
    document.execCommand('copy');
  }

}
