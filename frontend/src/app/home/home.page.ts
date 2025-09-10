import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router,ActivatedRoute, NavigationExtras } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  nameForm = new FormGroup({
    name: new FormControl('')
  });
  constructor(private router: Router, private route: ActivatedRoute,) {

  }

  addPersonToRoute(){

    let navigationExtras: NavigationExtras = {
      queryParams: {
        name: this.nameForm.get('name')?.value
      }
    }   
    this.router.navigate(["chat"], navigationExtras);

  }

}
