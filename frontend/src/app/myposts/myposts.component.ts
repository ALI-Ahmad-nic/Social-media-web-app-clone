import { Component, OnInit } from '@angular/core';
import { ApiservicesService } from '../apiservices.service';
@Component({
  selector: 'app-myposts',
  templateUrl: './myposts.component.html',
  styleUrls: ['./myposts.component.css']
})
export class MypostsComponent implements OnInit {

  postdata: any[] = [];
  constructor(private apiService:ApiservicesService){
  }

  ngOnInit(): void {
   this.getmyposts()

  }

  getmyposts(){
    this.apiService.getmydatafun().subscribe(response=>{
      console.log( "get post" +  response)
      this.postdata= response
     
    })
    }



    getImagePath(imagePath: string): string {
      return `http://localhost:3000/${imagePath}`;
    }

    
deletepost(id:string): void{
  this.apiService.deletepostfunc(id).subscribe(response=>{
    console.log(response)
     this.getmyposts();

  })
}



}
