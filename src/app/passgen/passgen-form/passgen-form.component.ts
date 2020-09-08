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
  charsets: number[][] = [];

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
    this.initializeCharsets();
    const numCharsets = this.charsets.length;
    const charsetsChosenFrom = new Set<number>();
    const passwordLen = this.generatePasswordForm.get('passwordLength').value;
    let password = '';
    for (let i = 0; i < passwordLen; i++) {
      const charsetIndex = this.generateRandomInteger(0, numCharsets);
      const charset = this.charsets[charsetIndex];
      charsetsChosenFrom.add(charsetIndex);
      password += String.fromCharCode(this.chooseRandomlyAmong(charset));
    }
    let unchosenCharsets = this.findUnchosenCharsets(charsetsChosenFrom, numCharsets);
    // really stupid algorithm
    // we just replace random characters with ones from unchosen charsets until we have at least one
    // from each charset
    while (unchosenCharsets.length > 0) {
      const rndStringIndex = this.generateRandomInteger(0, password.length);
      const randomUnchosenCharset = unchosenCharsets[this.generateRandomInteger(0, unchosenCharsets.length)];
      const charset = this.charsets[randomUnchosenCharset];
      charsetsChosenFrom.add(randomUnchosenCharset);
      password = password.slice(0, rndStringIndex) +
        String.fromCharCode(
          this.chooseRandomlyAmong(charset)
        ) + password.slice(rndStringIndex + 1);
      console.log(password);
      unchosenCharsets = this.findUnchosenCharsets(charsetsChosenFrom, numCharsets);
    }
    return password;
  }

  private initializeCharsets(): void {
    this.charsets = [];
    const form = this.generatePasswordForm;
    const hasSymbols = form.get('checkboxes').get('symbols').value;
    const hasNumbers = form.get('checkboxes').get('numbers').value;
    const hasLowerCase = form.get('checkboxes').get('lowerCase').value;
    const hasUpperCase = form.get('checkboxes').get('upperCase').value;
    if (hasSymbols) {
      this.charsets.push(this.SYMBOLS);
    }
    if (hasNumbers) {
      this.charsets.push(this.NUMBERS);
    }
    if (hasLowerCase) {
      this.charsets.push(this.LOWER_CASE);
    }
    if (hasUpperCase) {
      this.charsets.push(this.UPPER_CASE);
    }
  }

  private generateRandomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  private chooseRandomlyAmong(numbers: number[]): number {
    return numbers[this.generateRandomInteger(0, numbers.length)];
  }

  private findUnchosenCharsets(chosen: Set<number>, numCharsets: number): number[] {
    const unchosen: number[] = [];
    for (let i = 0; i < numCharsets; i++) {
      if (!chosen.has(i)) {
        unchosen.push(i);
      }
    }
    return unchosen;
  }

  copyToClipboard(): void {
    this.generatedPasswordField.nativeElement.select();
    document.execCommand('copy');
  }

}
