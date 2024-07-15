import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ApiservicesService } from '../apiservices.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.css']
})
export class EditDialogComponent {
  signupForm: FormGroup;
  uploadedFiles: Array<File> = [];
  postmessage: string = ''
  constructor(public dialogref: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiservicesService,
    private formbuilder: FormBuilder) {
    this.signupForm = formbuilder.group({
      description: ['', [Validators.required]]
    })
  }
  fileChange(element: any) {
    this.uploadedFiles = element.target.files;
    // console.log(`element : ${this.uploadedFiles}`);
    // console.log(`element : ${element}`);
    // console.log(`element.target: ${element.target}`);
    // console.log(`element.target.files: ${element.target.files}`);
  }


  onNoClick(): void {
    this.dialogref.close();
  }

  onSubmit(): void {
    let formData = new FormData();
    for (let i = 0; i < this.uploadedFiles.length; i++) {
      formData.append("file", this.uploadedFiles[i], this.uploadedFiles[i].name);
    }
    formData.append("description", this.signupForm.get('description')?.value);
  
    this.apiService.updatepostfun(this.data.post._id, formData).subscribe(
      (response) => {
        console.log(response);
        this.dialogref.close(response);
      },
      (error) => {
        console.error(error);
      }
    );
  }
  
  


}
