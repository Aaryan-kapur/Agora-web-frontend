import { Component, OnInit } from '@angular/core';
import { ElectionData } from '../model/electionData.model';
import { ElectionService } from '../services/election.service';
import { VotingService } from '../services/voting.service';
import { Router } from '@angular/router';
import { BallotData } from '../model/ballotData.model';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
declare var $: any;

@Component({
  selector: 'app-rank-ballot',
  templateUrl: './rank-ballot.component.html',
  styleUrls: ['./rank-ballot.component.sass']
})
export class RankBallotComponent implements OnInit {

  msg = 'Cast Vote';
  isLoading = false;
  candidates: string[] = new Array();
  selected: string[] = new Array();
  values: number[] = new Array();
  min = 0;
  max = 100;
  step = 10;
  election = new ElectionData();
  constructor(private votingService: VotingService, private electionService: ElectionService, private router: Router) {
    if (this.votingService.getOrigin() && this.votingService.getOrigin() === 'valid') {
      console.log(votingService.getData());
      this.election = votingService.getData();
      this.candidates = votingService.getData().candidates;
      this.candidates.forEach(data => this.values.push(0));
    }
  }

  ngOnInit() {
    console.log(this.election);
  }

  getStatus(election: ElectionData): string {
    const now = new Date().getTime();
    const start = new Date(new Date(election.startingDate).toLocaleString()).getTime();
    const end = new Date(new Date(election.endingDate).toLocaleString()).getTime();
    if (now < start) {
      return 'Pending';
    } else if (now > start && now < end) {
      return 'Active';
    } else { return 'Finish'; }
  }

  add(index: number) {
    const value = this.candidates[index];
    this.candidates.splice(index, 1);
    this.selected.push(value);
  }

  isEmpty() {
    return this.selected.length < 1 ? true : false;
  }

  vote() {
    this.msg = 'Voting';
    let stringBallot = '';
    this.election.candidates.forEach((candidate: string, index: number) => {
        stringBallot = stringBallot.concat('(' + candidate + ':' + this.values[index] + ')');
    });
    const ballot = new BallotData();
    ballot.ballotInput = stringBallot;
    ballot.passCode = this.votingService.getVoterCode();

    this.electionService.vote(this.votingService.getVoterID(), ballot).subscribe((data: any) => {
      this.isLoading = false;
      this.msg = 'Vote';
      Swal({
        title: 'OK',
        text: 'Your vote was successfully counted',
        type: 'success',
        confirmButtonColor: '#FFCD00',
        showCancelButton: false,
        confirmButtonText: 'Home',
      }).then((result) => {
        this.router.navigate(['/home']);
      });
    },
      (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.msg = 'Vote';
        if (err.status === 200) {
          Swal({
            title: 'OK',
            text: 'Your vote was successfully counted',
            type: 'success',
            confirmButtonColor: '#FFCD00',
            showCancelButton: false,
            confirmButtonText: 'Home',
          }).then((result) => {
            this.router.navigate(['/home']);
          });
        } else {
          this.showNotification('danger', 'Failed to submit your vote. Please try again');
        }
      });
  }

  cancel() {
    this.showNotification('danger', 'You did not submit your vote. Remeber your voting links expires when the election ends');
    this.router.navigate(['/home']);
  }



  showNotification(notifType, message) {
    $.notify({
      icon: notifType === 'success' ? 'done' : 'notifications',
      message

    }, {
        type: notifType,
        timer: 4000,
        placement: {
          from: 'top',
          align: 'right'
        },
        template: '<div data-notify="container" class="col-xl-4 col-lg-4 col-11 col-sm-4 col-md-4 alert alert-{0} alert-with-icon" role="alert">' +
          '<button mat-button  type="button" aria-hidden="true" class="close mat-button" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
          '<i class="material-icons" data-notify="icon">notifications</i> ' +
          '<span data-notify="title">{1}</span> ' +
          '<span data-notify="message">{2}</span>' +
          '<div class="progress" data-notify="progressbar">' +
          '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
          '</div>' +
          '<a href="{3}" target="{4}" data-notify="url"></a>' +
          '</div>'
      });

  }

}
