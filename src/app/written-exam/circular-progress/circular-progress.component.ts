import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-circular-progress',
  standalone: true,
  imports: [],
  templateUrl: './circular-progress.component.html',
  styleUrl: './circular-progress.component.scss'
})
export class CircularProgressComponent {

  cssprop = 'circular-chart nill';
  strokes = '0 ,100';
  value!: number;

  @Input() set quesPercentage(percentage: number) {
    this.value = percentage;
  }
  ngOnChanges(): void { 
    if (Number(this.value) > 0 && Number(this.value) <= 50) {
      this.cssprop = 'circular-chart red';
      this.strokes = this.value + ' ,' + 100;
    }
    else if (Number(this.value) > 50 && Number(this.value) < 80) {
      this.cssprop = 'circular-chart yellow';
      this.strokes = this.value + ' ,' + 100;
    }
    else if (Number(this.value) > 80 && Number(this.value) <= 100) {
      this.cssprop = 'circular-chart green';
      this.strokes = this.value + ' ,' + 100;
    }
  }
}
