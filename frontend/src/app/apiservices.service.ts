import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';
@Injectable({
  providedIn: 'root'
})
export class ApiservicesService  {
  token: string | null = null;
  private socket: Socket;
  
  constructor(private http: HttpClient, private route: Router) {
    this.socket = io('http://localhost:3000');
    this.initializeToken();
  }
  
  initializeToken(): void {
    const localtoken = localStorage.getItem('token')
    if(localtoken){
      this.token  =localtoken
    }
  }

  private baseUrl = 'http://localhost:3000/api';

  loginfun() {
    this.token = localStorage.getItem('token')

  }
  logoutfun() {
    this.token = null;
    localStorage.removeItem('token');
  }
  signinfun() {
    this.token = localStorage.getItem('token')
  }


  logindatafun(loginData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, loginData);
  }

  signindatafun(data: any): Observable<any> {
    return this.http.post('http://localhost:3000/api/register', data);
  }

  postdata(postdata: any): Observable<any> {
    const token = localStorage.getItem('token');
    console.log(token)
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`)
    return this.http.post(`${this.baseUrl}/upload`, postdata, { headers })

  }

  getdatafun(): Observable<any> {
    const token = localStorage.getItem('token');
    // console.log(token)
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`)
    return this.http.get(`${this.baseUrl}/postlist`, { headers })
  }

  // get my posts 
  getmydatafun(): Observable<any> {
    const token = localStorage.getItem('token');
    // console.log(token)
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`)
    return this.http.get(`${this.baseUrl}/myposts`, { headers })
  }

  deletepostfunc(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`)
    return this.http.delete(`${this.baseUrl}/deletestudent/${id}`, { headers })
  }


  updatepostfun(id: string, data: any): Observable<any> {
    console.log(id)
    console.log(data)

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`)
    return this.http.put(`${this.baseUrl}/updatepost/${id}`,data, { headers })
  }


  getSocket() {
    return this.socket;
  }
  // Like Post
likePost(postId: string): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.post(`${this.baseUrl}/like/${postId}`, {}, { headers });
}

// Comment Post
commentPost(postId: string, text: string): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.post(`${this.baseUrl}/comment/${postId}`, { text }, { headers });
}

// Reply to Comment
commentReply(commentId: string, text: string): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.post(`${this.baseUrl}/commentreply/${commentId}`, { text }, { headers });
}

  


}
