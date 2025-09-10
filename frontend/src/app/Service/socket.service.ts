import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { io, Socket } from 'socket.io-client';
@Injectable({
  providedIn: 'root'
})

export class SocketService {

  private socket: Socket;
  constructor( private toastCtrl: ToastController,) {
    this.socket = io('http://localhost:3005', {
      withCredentials: true,
      transports: ['polling']
    });
    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('connect_error', (err) => {
      console.error('Connection Error:', err);
    });


   }

  // Emit an event to the server
  emitEvent(eventName: string, data: any): void {
    this.socket.emit(eventName, data);
  }

  // Listen for an event from the server
  listenEvent(eventName: string, callback: (data: any) => void): void {
    this.socket.on(eventName, callback);
  }

  // Disconnect the socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  connect(){
    this.socket.connect();
  }


   //Preset Toast Message
   async presentToast(msg:any) {
    const toast = await this.toastCtrl.create({
      message: msg,
      cssClass: "my-toast-css",
      duration: 2000
    });
    toast.present();
  }
  
 
}
