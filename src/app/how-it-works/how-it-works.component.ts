import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss']
})
export class HowItWorksComponent implements OnInit {

  constructor(public router: Router) { }

  ngOnInit(): void {
  }

  goToRegistration() {
    this.router.navigate(['/user/registration']);
  }

}
