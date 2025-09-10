import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SocketService } from '../Service/socket.service'
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})

export class ChatPage implements OnInit {
  
  GroupChatMessages:any = [];
  nameForm = new FormGroup({
    name: new FormControl('')
  });
  selectedForChat:any = null;
  activePeople:any = 0;
  chatId:any;
  name:any;
  users:any = [];
  userIds = [];
  intialPush:number = 0;
  GroupChat:{ name:string ,message:any,unreadMessageCount:number} = { name:'Group chat',message:[],unreadMessageCount:0}
  selectedType:any = null;

  constructor( private datePipe: DatePipe,public alertController: AlertController, public socketService:SocketService, private route: ActivatedRoute, private router: Router) { 
    this.route.queryParams.subscribe(params => {
      if (this.router?.getCurrentNavigation()?.extras.queryParams) {
      this.name = this.router?.getCurrentNavigation()?.extras?.queryParams?.['name'];
      }
    });
  }

  ngOnInit() {

       

  }

  ionViewWillEnter(){


     //socket code start
     this.socketService.connect();

     // Listen for an event from the server
     this.socketService.listenEvent('client-total', (data) => {
       this.activePeople = data.length;
       this.userIds = data;
     });
 
     // Emit an event to the server
     this.socketService.emitEvent('get-client-total', { });

     // Listen for an event from the server
     this.socketService.listenEvent('client-id', (data) => {
       this.chatId = data;
       // Emit an event to the server
     this.socketService.emitEvent('set-users', { name:this.name?this.name:null, sender_id:this.chatId?this.chatId:null});
     });

     // Listen for an event from the server
     this.socketService.listenEvent('get-users', (data) => {

         const userExists = this.users.find((user:any) => user.receiver_id === data.receiver_id);
         if (!userExists) {
          // alert('new user')
           
           if(data.receiver_id == this.chatId){
            data.name = this.name;
            this.socketService.presentToast('you joined the chat');
            this.users.push(data);
           }else{
            this.socketService.presentToast(data.name+' joined the chat');
            this.users.push(data);

           }
           
         }
         
       // this.users = data;
     });


     this.socketService.listenEvent('get-complete-users', (data) => {
       if(this.intialPush == 0){
         this.users = this.users.concat(data);
         this.intialPush = this.intialPush +1
       }
     })

     this.socketService.listenEvent('client-disconnected', (userExists) => {
       this.users = this.users.filter((user:any) => user.receiver_id !== userExists.receiver_id);
       this.socketService.presentToast(userExists.name+' left the chat');
     })


     // Listen for an event from the server
     this.socketService.listenEvent('receive-personal-message', (data) => {
       const user = this.users.find((user:any) => user.receiver_id === data.sender_id);
       if (user) {
         if(user.message.length != 0){
           const userMsg = user.message.find((msg:any) => msg?.date != data.date);
             if (userMsg) {
              user.unreadMessageCount = user.unreadMessageCount+1;
               user.message.push(data);
             }
         }else {
          user.unreadMessageCount = user.unreadMessageCount+1;
           user.message.push(data);
         }
         
       }
       // this.chatMessages = this.chatMessages.concat(data);

     });

     // Listen for an event from the server
     this.socketService.listenEvent('sended-personal-message', (data) => {
       const user = this.users.find((user:any) => user.receiver_id === data.receiver_id);
       if (user) {
         if(user.message.length != 0){
           const userMsg = user.message.find((msg:any) => msg?.date != data.date);
             if (userMsg) {
               data.read_status = true;
               user.message.push(data);
             }
         }else {
           user.message.push(data);
         }
       }
       // this.chatMessages = this.chatMessages.concat(data);

     });


     // group message
     this.socketService.listenEvent('receive-group-message', (data) => {
       console.log(data,"receive-group-message")
           if(this.GroupChat.message.length != 0){
             const userMsg = this.GroupChat.message.find((msg:any) => msg?.date != data.date);
             if (userMsg) {
              if(data.sender_id == this.chatId){
                data.read_status = true;
                this.GroupChat.message.push(data);
              }else{
                this.GroupChat.unreadMessageCount = this.GroupChat.unreadMessageCount+1;
                this.GroupChat.message.push(data);
              }
               
             }
           }else{
              if(data.sender_id == this.chatId){
                data.read_status = true;
                this.GroupChat.message.push(data);
              }else{
                this.GroupChat.unreadMessageCount = this.GroupChat.unreadMessageCount+1;
                this.GroupChat.message.push(data);
              }
           }
     });

    
  }

  ngOnDestroy() {
    // Clean up the socket connection when the component is destroyed
    this.socketService.disconnect();
  }

  formatTimestamp(timestamp: any) {
    const now = new Date();
    const date = new Date(timestamp);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const timeFormat = 'HH:mm';
    const dateFormat = 'MMM dd';

    return date >= today
      ? this.datePipe.transform(date, timeFormat)
      : this.datePipe.transform(date, dateFormat);
  }



  SelectedForChat(person:any){
    person.unreadMessageCount = 0;
    this.selectedType = 'personal';
    this.selectedForChat = person;
  }
  backFromChat(){
    this.selectedForChat.unreadMessageCount = 0
    this.selectedForChat = null;
  }

  async back(){
    const alert = await this.alertController.create({
      cssClass: 'file-upload-alert-class',
      // header: 'Confirm',
      message: `Are you sure do you want to exit lobby? `,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            history.back()
          }
        }, {
          text: 'No',
          role: 'cancel',
          handler: () => {
            return false;
          }
        }
      ]
    });
    await alert.present();
    
  }

  sendMessage(){
    if(this.selectedType != 'group'){
      let data = {
        name: this.name,
        sender_id: this.chatId,
        receiver_id: this.selectedForChat.receiver_id,
        message: this.nameForm.get('name')?.value,
        date:Date.now(),
        read_status:false
      }
      this.nameForm.controls['name'].setValue('');
      this.socketService.emitEvent('send-personal-message', data);
    }else{

      let data = {
        name: this.name,
        sender_id: this.chatId,
        receiver_id: 'group',
        message: this.nameForm.get('name')?.value,
        date:Date.now(),
        read_status : false
      }
      this.nameForm.controls['name'].setValue('');
      this.socketService.emitEvent('send-group-message', data);

    }
    

  }

  SelectedForGroupChat(group:any){
    group.unreadMessageCount = 0;
    this.selectedType = 'group';
    this.selectedForChat = group;
    this.selectedForChat.message = this.GroupChat.message;
  }
}
