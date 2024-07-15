import { Component,OnInit,Output, EventEmitter, Input, } from '@angular/core';
import { ApiservicesService } from '../apiservices.service';
import { MatDialog } from '@angular/material/dialog';
import { EditDialogComponent } from '../edit-dialog/edit-dialog.component';

@Component({
  selector: 'app-postlists',
  templateUrl: './postlists.component.html',
  styleUrls: ['./postlists.component.css']
})
export class PostlistsComponent implements OnInit {

  // @Input() myinputMsg!: any[];
  // @Output() myOutput: EventEmitter<string> = new EventEmitter();
  postdata: any[] = [];
  commentdata: any[] = [];
  replydata: any[] = [];
  likesdata: any[] = [];
  loggedInUserId: string = '';
  userId: string = '';


  constructor(private apiService:ApiservicesService,private dialog:MatDialog){
    this.apiService.getSocket().on('like', (data: any) => {
      this.updatePostData(data.postId, 'likes', data.likes);
    });
  
    this.apiService.getSocket().on('comment', (data: any) => {
      this.updatePostData(data.postId, 'comments', data.comments);
    });
  
    this.apiService.getSocket().on('reply', (data: any) => {
      this.updateCommentReplies(data.commentId, data.replies);
    });
  }

  ngOnInit(): void {
    this.loggedInUserId = this.getLoggedInUserId();
    console.log(typeof( this.loggedInUserId))

   this.getposts()
   this.userId = this.getUserId();
   console.log( this.userId)

  //  console.log(this.myinputMsg);
  }

//   sendValues(value:any) {
//     this.myOutput.emit(value);
// }


  getUserId(): string {
    // Fetch the user ID from the local storage or a user service
    return localStorage.getItem('userId') || '';
  }

  isLiked(post: any): boolean {
    return post.likes.some((like: any) => 
      {return like.userId === this.loggedInUserId
        // console.log(like.userId === this.loggedInUserId)
      });

  

  } 


  getLoggedInUserId(): string {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    }
    return '';
  }

  getposts(): void {
    this.apiService.getdatafun().subscribe(response => {
      this.postdata = response.map((post: { comments: any; likes: any; }) => {
        return {
          ...post,
          comments: post.comments || [],
          likes: post.likes || [],
        };
      });
    });
  } 
  

deletepost(id:string): void{
  this.apiService.deletepostfunc(id).subscribe(response=>{
    console.log(response)
     this.getposts();

  })
}


updatepost(post: any): void {
  const dialogref = this.dialog.open(EditDialogComponent, {
    width: '400px',
    panelClass: 'custom-dialog-container',
    position: { left: '40%' },
    data: { post }
  });

  
  dialogref.afterClosed().subscribe(result => {
    if (result) {
      this.getposts();
      console.log(result)
    }
  });
}



toggleLike(postId: string): void {
  this.apiService.likePost(postId).subscribe(response => {
    this.likesdata=response.likes
    const { postId, comments, likes } = response;
    this.updatePostData(postId, comments, likes);
  });
}

commentPost(postId: string, text: string): void {
  this.apiService.commentPost(postId, text).subscribe(response => {
    this.commentdata= response.comments
    const { postId, comments, likes } = response;
    this.updatePostData(postId, comments, likes);
  });
}


updatePostData(postId: string, key: string, value: any): void {
  const index = this.postdata.findIndex(post => post._id === postId);
  if (index !== -1) {
    this.postdata[index][key] = value;
  }
}


// for comment reply 
commentReply(commentId: string, text: string): void {
  this.apiService.commentReply(commentId, text).subscribe(response => {
    const { commentId, replies } = response;
    this.updateCommentReplies(commentId, replies);
  });
}


updateCommentReplies(commentId: string, replies: any): void {
  this.postdata.forEach(post => {
    const commentIndex = post.comments.findIndex((comment: any) => comment._id === commentId);
    if (commentIndex !== -1) {
      post.comments[commentIndex].replies = replies;
    }
  });
}

getImagePath(imagePath: string): string {
  return `http://localhost:3000/${imagePath}`;
}



}
