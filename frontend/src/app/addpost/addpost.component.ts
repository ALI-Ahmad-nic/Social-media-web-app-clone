import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiservicesService } from '../apiservices.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-addpost',
  templateUrl: './addpost.component.html',
  styleUrls: ['./addpost.component.css']
})
export class AddpostComponent {
  uploadedFiles: Array<File> = [];
  signupForm: FormGroup;
  postmessage: string= ''


  constructor(private formbuilder: FormBuilder, private http: HttpClient, private apiService: ApiservicesService, private router: Router) {
    this.signupForm = formbuilder.group({
      description: ['', [Validators.required]]
    })
  }

  fileChange(element: any) {
    this.uploadedFiles = element.target.files;
    // console.log(`element : ${this.uploadedFiles}`);
    // console.log(`element : ${element}`);
    // console.log(`element.target: ${element.target}`);
    console.log(`element.target.files: ${element.target.files}`);
  }

  upload() {
    let formData = new FormData();
    for (var i = 0; i < this.uploadedFiles.length; i++) {
      formData.append("file", this.uploadedFiles[i], this.uploadedFiles[i].name);
      formData.append("description", this.signupForm.get('description')?.value);
      // console.log(`uploadedFiles[i]: ${this.uploadedFiles[i].name}`);
      // console.log(`uploadedFiles[i]: ${this.uploadedFiles[i]}`);

    }
    if (this.signupForm.valid) {
      this.apiService.postdata(formData)
        .subscribe((response) => {
          console.log('response received is ', response);
          if (response.description && response.imagePath){
           this. postmessage= "Successfully Submitted"
           this.router.navigate(['/'])
          }
        })
      
      }
  }
}
