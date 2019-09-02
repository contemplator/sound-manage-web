import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AppService } from 'app/app.service';
import { AddSoundCatrgoryReq } from 'sound-manage-server/dist/models/sound';

@Component({
  selector: 'app-add-category-modal',
  templateUrl: './add-category-modal.component.html',
  styleUrls: ['./add-category-modal.component.scss']
})
export class AddCategoryModalComponent implements OnInit {
  @Input() display: boolean;
  @Input() maxSequence: number;
  @Output() displayChange = new EventEmitter();
  @Output() add = new EventEmitter();
  form: FormGroup;

  constructor(
    private service: AppService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm(): void {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      english_name: new FormControl('', [Validators.required]),
    });
  }

  get name() { return this.form.get('name'); }
  get english_name() { return this.form.get('english_name'); }

  onAddClick(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(item => {
        this.form.get(item).markAsTouched();
      });
      return;
    }

    this.addCategory();
  }

  addCategory(): void {
    const req = new AddSoundCatrgoryReq(this.name.value, this.english_name.value, this.maxSequence + 1);
    this.service.addSoundCategory(req).subscribe(res => {
      if (res) {
        this.add.emit();
        this.initFormState();
      }
    });
  }

  initFormState(): void {
    Object.keys(this.form.controls).forEach(item => {
      const control = this.form.get(item);
      control.setValue('');
      control.markAsUntouched();
      control.markAsPristine();
    });
  }
}
