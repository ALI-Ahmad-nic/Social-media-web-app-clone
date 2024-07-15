import { Component , OnInit} from '@angular/core';
import { ApiservicesService } from './apiservices.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
//   myInputMessage: any[] = ["California","Texas","Florida","Hawaii","Massachusetts", "Georgia",
//     "Ohio", "Washington","Virginia", "New Jersey", "Pennsylvania","Arizona","Colorado"]
// toggledata:any=null
// isVisible: boolean=false
  constructor(public apiService:ApiservicesService){}

  title = 'social-app';

ngOnInit(): void {
 
}

// GetChildData(data: any){
//   if (this.isVisible && this.toggledata === data) {
//     this.isVisible = false;
//     this.toggledata = null;
//   } else {
//     this.isVisible = true;
//     this.toggledata = data;
//   }
 
// }
}
